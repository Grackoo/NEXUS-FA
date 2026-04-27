import React, { useState } from 'react';
import { X, Calculator, RefreshCcw, AlertTriangle } from 'lucide-react';
import { usePortfolio, type Operation } from '../contexts/PortfolioContext';
import { submitOperation, deletePosition } from '../services/sheetsService';
import { useCurrency } from '../contexts/CurrencyContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operationToEdit: Operation | null;
  operationIndex: number;
}

const EditSingleOperationModal: React.FC<Props> = ({ isOpen, onClose, operationToEdit, operationIndex }) => {
  const { clientOperations, refreshPortfolio } = usePortfolio();
  const { exchangeRate } = useCurrency();

  // Local state
  const [type, setType] = useState(operationToEdit?.type === 'Sell' || operationToEdit?.type === 'Venta' ? 'Sell' : 'Buy');
  const [shares, setShares] = useState<number | string>(operationToEdit?.shares ?? '');
  const [price, setPrice] = useState<number | string>(operationToEdit?.price ?? '');
  const [commission, setCommission] = useState<number | string>(operationToEdit?.commission ?? 0);
  const [date, setDate] = useState<string>(
    operationToEdit?.date 
      ? new Date(operationToEdit.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when operationToEdit changes
  React.useEffect(() => {
    if (operationToEdit) {
      setType(operationToEdit.type === 'Sell' || operationToEdit.type === 'Venta' ? 'Sell' : 'Buy');
      setShares(operationToEdit.shares);
      setPrice(operationToEdit.price);
      setCommission(operationToEdit.commission);
      try {
        setDate(new Date(operationToEdit.date).toISOString().split('T')[0]);
      } catch (e) {
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [operationToEdit]);

  if (!isOpen || !operationToEdit) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    try {
      const numShares = parseFloat(shares.toString()) || 0;
      const numPrice = parseFloat(price.toString()) || 0;
      const numCommission = parseFloat(commission.toString()) || 0;

      const totalTrans = (numShares * numPrice) + numCommission;
      const calculatedTotalMXN = operationToEdit.currency === 'USD' ? totalTrans * exchangeRate : totalTrans;

      // 1. Fetch all operations for this exact ticker and client
      const allOpsForTicker = clientOperations
        .filter(op => op.ticker === operationToEdit.ticker)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Maintain the exact same sort order as UI
      
      // 2. Wipe the existing history
      await deletePosition(operationToEdit.clientId, operationToEdit.ticker, operationToEdit.assetType);

      // 3. Re-submit all operations, substituting the edited one
      for (let i = 0; i < allOpsForTicker.length; i++) {
        const op = allOpsForTicker[i];
        
        if (i === operationIndex) {
          // Submit the EDITED operation
          await submitOperation({
            clientId: op.clientId,
            type: type,
            assetType: op.assetType,
            ticker: op.ticker,
            shares: numShares,
            price: numPrice,
            commission: numCommission,
            originalCurrency: op.currency,
            Cliente_ID: op.clientId,
            Tipo_Operacion: type,
            Ticker: op.ticker,
            Tipo_Activo: op.assetType,
            Cantidad: numShares,
            Precio: numPrice,
            Comision: numCommission,
            Comisión: numCommission,
            Moneda: op.currency,
            Total_MXN: calculatedTotalMXN,
            date: date
          });
        } else {
          // Submit the ORIGINAL operation
          const originalTotalTrans = (op.shares * op.price) + op.commission;
          const originalTotalMXN = op.currency === 'USD' ? originalTotalTrans * exchangeRate : originalTotalTrans;
          
          await submitOperation({
            clientId: op.clientId,
            type: op.type,
            assetType: op.assetType,
            ticker: op.ticker,
            shares: op.shares,
            price: op.price,
            commission: op.commission,
            originalCurrency: op.currency,
            Cliente_ID: op.clientId,
            Tipo_Operacion: op.type,
            Ticker: op.ticker,
            Tipo_Activo: op.assetType,
            Cantidad: op.shares,
            Precio: op.price,
            Comision: op.commission,
            Comisión: op.commission,
            Moneda: op.currency,
            Total_MXN: originalTotalMXN,
            date: op.date
          });
        }
      }

      // Wait a moment for Google Sheets to process
      setTimeout(async () => {
        await refreshPortfolio();
        setIsSubmitting(false);
        onClose();
      }, 3000);
      
    } catch (e) {
      console.error('Failed to update individual operation:', e);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay animate-fade-in z-[100]">
      <div className="glass-card w-full max-w-md p-0 overflow-hidden relative">
        {isSubmitting && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <RefreshCcw className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-white font-semibold">Reconstruyendo historial...</p>
            <p className="text-gray-400 text-xs mt-2 text-center px-6">Por favor no cierres esta ventana. Estamos actualizando la base de datos de forma segura.</p>
          </div>
        )}
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Editar Operación Individual
            </h2>
            <p className="text-xs text-gray-400 mt-1">Activo: <span className="text-white font-semibold">{operationToEdit.ticker}</span></p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button
              onClick={() => setType('Buy')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                type === 'Buy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-transparent border-transparent text-gray-500 hover:text-white'
              }`}
            >
              COMPRAR
            </button>
            <button
              onClick={() => setType('Sell')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                type === 'Sell' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-transparent border-transparent text-gray-500 hover:text-white'
              }`}
            >
              VENDER
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase">Cantidad</label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase">Precio Unitario ({operationToEdit.currency})</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase">Comisión</label>
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3 mt-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-500/80 leading-relaxed">
              <strong>Aviso Técnico:</strong> Guardar estos cambios tomará unos segundos adicionales, ya que el sistema debe reconstruir el historial completo de este activo para aplicar tu modificación de forma segura.
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !shares || !price}
            className="w-full mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] disabled:opacity-50"
          >
            Guardar Edición de Operación
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSingleOperationModal;
