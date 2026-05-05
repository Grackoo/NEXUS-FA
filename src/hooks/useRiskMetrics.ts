import { useMemo } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';

export const useRiskMetrics = () => {
  const { clientPortfolio, clientOperations } = usePortfolio();

  const metrics = useMemo(() => {
    if (clientPortfolio.length === 0) {
      return {
        sharpeRatio: 0,
        maxDrawdown: 0,
        volatility: 0,
        beta: 1,
      };
    }

    // Since we don't have daily historical data from the API, we will estimate
    // these metrics based on the portfolio's current composition and typical asset class risks.
    // In a real production app, this would be computed server-side with historical data.
    
    let totalValue = 0;
    let weightedVolatility = 0;
    let weightedBeta = 0;

    // Typical approximations for volatility and beta per asset type
    const riskProfiles: Record<string, { vol: number, beta: number }> = {
      'Renta Variable': { vol: 0.18, beta: 1.1 },
      'Criptomonedas': { vol: 0.65, beta: 2.0 },
      'Renta Fija': { vol: 0.04, beta: 0.1 },
      'Divisas': { vol: 0.08, beta: 0.0 },
      'Liquidez': { vol: 0.01, beta: 0.0 }
    };

    clientPortfolio.forEach(asset => {
      const value = asset.sharesOwned * asset.realTimePrice;
      totalValue += value;

      const profile = riskProfiles[asset.type] || { vol: 0.15, beta: 1.0 };
      weightedVolatility += profile.vol * value;
      weightedBeta += profile.beta * value;
    });

    const portfolioVolatility = totalValue > 0 ? weightedVolatility / totalValue : 0;
    const portfolioBeta = totalValue > 0 ? weightedBeta / totalValue : 1;

    // Simulate Sharpe Ratio
    // Assuming Risk-Free Rate = 4.5% (0.045)
    // Approximate return based on cost basis vs current
    let totalCostBasis = 0;
    clientPortfolio.forEach(asset => {
      const avgPrice = asset.avgPurchasePriceUSD || asset.avgPurchasePriceMXN || asset.realTimePrice;
      totalCostBasis += asset.sharesOwned * avgPrice;
    });

    let portfolioReturn = 0;
    if (totalCostBasis > 0) {
       portfolioReturn = (totalValue - totalCostBasis) / totalCostBasis;
    }

    // Annualize the return roughly (assuming average hold time of 1 year for the simulation)
    const riskFreeRate = 0.045;
    let sharpeRatio = portfolioVolatility > 0 ? (portfolioReturn - riskFreeRate) / portfolioVolatility : 0;
    
    // Simulate Max Drawdown (usually correlated with volatility)
    // A simple heuristic: Max Drawdown ≈ Volatility * 1.5 in a normal year
    let maxDrawdown = portfolioVolatility * 1.5;

    // Cap values for display sanity
    if (sharpeRatio > 5) sharpeRatio = 5;
    if (sharpeRatio < -5) sharpeRatio = -5;
    if (maxDrawdown > 1) maxDrawdown = 0.99;

    return {
      sharpeRatio,
      maxDrawdown,
      volatility: portfolioVolatility,
      beta: portfolioBeta,
    };

  }, [clientPortfolio, clientOperations]);

  return metrics;
};
