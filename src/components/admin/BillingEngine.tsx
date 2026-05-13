import React from 'react';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { Calculator, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

export const BillingEngine: React.FC = () => {
  const { allClients } = usePortfolio();
  const { formatValue, currency, exchangeRate } = useCurrency();

  const ANNUAL_FEE_PERCENTAGE = 0.01; // 1%
  const MONTHLY_FEE_PERCENTAGE = ANNUAL_FEE_PERCENTAGE / 12;

  let totalAUM_USD = 0;
  let totalProjectedMonthly_USD = 0;

  const clientBillings = allClients.filter(c => c.role === 'client').map(client => {
    let clientAumUSD = 0;
    client.portfolio.forEach(asset => {
      const valueNative = asset.sharesOwned * asset.realTimePrice;
      const valueUSD = asset.nativeCurrency === 'USD' ? valueNative : valueNative / exchangeRate;
      clientAumUSD += valueUSD;
    });

    const monthlyFeeUSD = clientAumUSD * MONTHLY_FEE_PERCENTAGE;
    totalAUM_USD += clientAumUSD;
    totalProjectedMonthly_USD += monthlyFeeUSD;

    return {
      id: client.id,
      name: client.name,
      aumUSD: clientAumUSD,
      monthlyFeeUSD
    };
  }).sort((a, b) => b.aumUSD - a.aumUSD);

  const displayAUM = currency === 'USD' ? totalAUM_USD : totalAUM_USD * exchangeRate;
  const displayMonthlyFee = currency === 'USD' ? totalProjectedMonthly_USD : totalProjectedMonthly_USD * exchangeRate;
  const displayAnnualFee = displayMonthlyFee * 12;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-emerald-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <DollarSign className="w-5 h-5" />
            <h3 className="text-xs uppercase tracking-widest font-bold">AUM Total</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{formatValue(displayAUM)}</p>
          <p className="text-xs text-gray-500">Assets Under Management</p>
        </div>

        <div className="glass-card p-6 border-blue-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full" />
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <Calculator className="w-5 h-5" />
            <h3 className="text-xs uppercase tracking-widest font-bold">Ingreso Mensual Proyectado</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{formatValue(displayMonthlyFee)}</p>
          <p className="text-xs text-gray-500">Basado en 1% anual prorrateado</p>
        </div>

        <div className="glass-card p-6 border-purple-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full" />
          <div className="flex items-center gap-3 mb-4 text-purple-400">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-xs uppercase tracking-widest font-bold">Proyección Anual</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{formatValue(displayAnnualFee)}</p>
          <p className="text-xs text-gray-500">Ingreso recurrente estimado (ARR)</p>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 bg-white/[0.01]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Desglose de Comisiones por Cliente</h2>
            <p className="text-xs text-gray-400">Reporte de ingresos mes a mes</p>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 text-white/50 text-[10px] uppercase tracking-widest bg-white/[0.01]">
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-4 py-4 font-semibold text-right">AUM ({currency})</th>
                <th className="px-4 py-4 font-semibold text-right">Comisión Mensual</th>
                <th className="px-4 py-4 font-semibold text-right">Tasa Aplicada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clientBillings.length > 0 ? (
                clientBillings.map((cb) => {
                  const cbAum = currency === 'USD' ? cb.aumUSD : cb.aumUSD * exchangeRate;
                  const cbFee = currency === 'USD' ? cb.monthlyFeeUSD : cb.monthlyFeeUSD * exchangeRate;
                  
                  return (
                    <tr key={cb.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-white">
                        {cb.name}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-sm text-gray-300">
                        {formatValue(cbAum)}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-sm font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                        {formatValue(cbFee)}
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-gray-500 font-mono">
                        {(MONTHLY_FEE_PERCENTAGE * 100).toFixed(3)}% / mes
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    No hay clientes con AUM.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingEngine;
