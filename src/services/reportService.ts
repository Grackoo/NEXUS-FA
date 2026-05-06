import type { ClientWithPortfolio, Operation } from '../contexts/PortfolioContext';

export interface ReportData {
  clientName: string;
  clientId: string;
  reportDate: string;
  totals: {
    netWorthUSD: string;
    netWorthMXN: string;
  };
  allocation: {
    assetType: string;
    valueMXN: string;
    percentage: string;
  }[];
  recentOperations: {
    date: string;
    ticker: string;
    type: string;
    shares: number;
    price: string;
    total: string;
    thesis: string;
  }[];
}

/**
 * Recopila y estructura los datos financieros del cliente para la generación de un reporte PDF.
 * Esta función prepara los datos crudos del contexto para que puedan ser consumidos directamente
 * por librerías como jspdf, html2pdf, o para generar una vista de impresión (window.print()).
 * 
 * @param client - Los datos completos del cliente activo y su portafolio.
 * @param operations - El historial de operaciones del cliente.
 * @param totalUSD - El valor total del portafolio en USD.
 * @param totalMXN - El valor total del portafolio en MXN.
 * @param exchangeRate - El tipo de cambio actual.
 * @returns ReportData estructurado y formateado.
 */
export const prepareReportData = (
  client: ClientWithPortfolio | null | undefined,
  operations: Operation[],
  totalUSD: number,
  totalMXN: number,
  exchangeRate: number
): ReportData | null => {
  if (!client) return null;

  // 1. Formateador de moneda (Helper interno para el reporte)
  const formatCurrency = (val: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // 2. Procesar asignación de activos (Allocation)
  const allocationMap = new Map<string, number>();
  client.portfolio.forEach(asset => {
    const priceMXN = asset.nativeCurrency === 'USD' ? asset.realTimePrice * exchangeRate : asset.realTimePrice;
    const valueMXN = asset.sharesOwned * priceMXN;
    
    if (valueMXN > 0) {
      allocationMap.set(asset.type, (allocationMap.get(asset.type) || 0) + valueMXN);
    }
  });

  const allocationArray = Array.from(allocationMap.entries())
    .map(([type, val]) => ({
      assetType: type,
      valueMXN: formatCurrency(val, 'MXN'),
      percentage: totalMXN > 0 ? ((val / totalMXN) * 100).toFixed(1) + '%' : '0%'
    }))
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  // 3. Procesar las últimas 10 operaciones más relevantes
  const sortedOps = [...operations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map(op => ({
      date: new Date(op.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }),
      ticker: op.ticker,
      type: op.type === 'Buy' ? 'Compra' : 'Venta',
      shares: op.shares,
      price: formatCurrency(op.price, op.currency),
      total: formatCurrency(op.totalMXN, 'MXN'),
      thesis: op.thesis || 'Sin tesis registrada.'
    }));

  // 4. Retornar el objeto estructurado
  return {
    clientName: client.name,
    clientId: client.id,
    reportDate: new Date().toLocaleDateString('es-MX', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }),
    totals: {
      netWorthUSD: formatCurrency(totalUSD, 'USD'),
      netWorthMXN: formatCurrency(totalMXN, 'MXN')
    },
    allocation: allocationArray,
    recentOperations: sortedOps
  };
};

/**
 * Función de utilidad para desencadenar la impresión nativa del navegador.
 * En el futuro, esto puede integrarse con html2canvas y jspdf.
 */
export const triggerPrintReport = () => {
  window.print();
};
