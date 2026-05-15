import React from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaxHelperProps {
  startDate: string;
  endDate: string;
}

const TaxHelper: React.FC<TaxHelperProps> = ({ startDate, endDate }) => {
  const { clientOperations, clientPortfolio } = usePortfolio();

  const handleExportCSV = () => {
    if (!startDate || !endDate) {
      toast.error('Por favor selecciona una fecha de inicio y fin.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      toast.error('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    // Filtrar operaciones por fecha y por tipo: solo SELL (Venta) o INCOME (Dividendos)
    const taxOperations = clientOperations.filter(op => {
      const opDate = new Date(op.date);
      const isWithinDateRange = opDate >= start && opDate <= end;
      
      const typeUpper = op.type.toUpperCase();
      const isTaxType = typeUpper === 'SELL' || typeUpper === 'VENTA' || typeUpper === 'INCOME' || typeUpper === 'DIVIDENDO' || typeUpper === 'DIVIDENDOS';
      
      return isWithinDateRange && isTaxType;
    });

    if (taxOperations.length === 0) {
      toast.error('No se encontraron operaciones fiscales (Ventas o Dividendos) en este rango de fechas.');
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
    link.setAttribute('download', `Reporte_Fiscal_${start.toISOString().split('T')[0]}_al_${end.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExportCSV}
      className="glass-button w-full py-2.5 flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30 mt-3 md:mt-0"
      title="Exportar Reporte Fiscal (Ventas y Dividendos)"
    >
      <Download className="w-4 h-4" />
      Exportar Fiscal
    </button>
  );
};

export default TaxHelper;
