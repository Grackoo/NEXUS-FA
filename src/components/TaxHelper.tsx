import React from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { Download } from 'lucide-react';

const TaxHelper: React.FC = () => {
  const { clientOperations, clientPortfolio } = usePortfolio();

  const handleExportCSV = () => {
    // Filtrar operaciones: solo SELL (Venta) o INCOME (Dividendos)
    const taxOperations = clientOperations.filter(op => {
      const typeUpper = op.type.toUpperCase();
      return typeUpper === 'SELL' || typeUpper === 'VENTA' || typeUpper === 'INCOME' || typeUpper === 'DIVIDENDO' || typeUpper === 'DIVIDENDOS';
    });

    if (taxOperations.length === 0) {
      alert('No se encontraron operaciones fiscales (Ventas o Dividendos) para exportar.');
      return;
    }

    // Cabeceras del CSV
    const headers = ['Fecha', 'Activo', 'Tipo de Operacion', 'Monto', 'Moneda', 'ID Pedido', 'Estimacion Ganancia Capital'];
    
    // Crear filas del CSV
    const rows = taxOperations.map(op => {
      // Determinar el monto total de la operación
      const totalAmount = op.shares * op.price; 
      
      const typeUpper = op.type.toUpperCase();
      const isSell = typeUpper === 'SELL' || typeUpper === 'VENTA';
      const isDividend = typeUpper === 'INCOME' || typeUpper === 'DIVIDENDO' || typeUpper === 'DIVIDENDOS';

      let capitalGain = 'N/A';

      if (isSell) {
        // Buscar costo promedio en el portafolio actual
        const asset = clientPortfolio.find(a => a.ticker === op.ticker);
        if (asset) {
          const opCurrency = op.currency || op.originalCurrency || 'USD';
          const avgPrice = opCurrency === 'MXN' ? asset.avgPurchasePriceMXN : asset.avgPurchasePriceUSD;
          
          if (avgPrice > 0) {
            // Ganancia de capital = (Precio de Venta - Precio Promedio de Compra) * Acciones
            const gain = (op.price - avgPrice) * op.shares;
            capitalGain = gain.toFixed(2);
          }
        }
      } else if (isDividend) {
        // El monto total del dividendo es ganancia directa
        capitalGain = totalAmount.toFixed(2);
      }
      
      return [
        new Date(op.date).toLocaleDateString(),
        op.ticker,
        op.type,
        totalAmount.toFixed(2),
        op.currency || op.originalCurrency || 'USD',
        op.orderId || op.id || 'N/A',
        capitalGain
      ].map(field => `"${field}"`).join(',');
    });

    // Combinar cabeceras y filas
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Fiscal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExportCSV}
      className="glass-button secondary flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs"
      title="Exportar Reporte Fiscal (Ventas y Dividendos)"
    >
      <Download className="w-3.5 h-3.5" />
      Exportar Fiscal
    </button>
  );
};

export default TaxHelper;
