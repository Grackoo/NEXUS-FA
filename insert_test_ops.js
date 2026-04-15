const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDHJhTsmvrbnBFwcLMaIzJg594iLR3258V0t2hE9bCJ98_dTCpjQu12nf8YA2M3ZvQJQ/exec';

const operations = [
  { clientId: 'VRH-1', type: 'Buy', assetType: 'Stocks', ticker: 'AAPL', shares: 10, price: 175.50, commission: 1.5, originalCurrency: 'USD' },
  { clientId: 'VRH-1', type: 'Buy', assetType: 'ETFs', ticker: 'VOO', shares: 5, price: 450.25, commission: 2.0, originalCurrency: 'USD' },
  { clientId: 'VRH-1', type: 'Buy', assetType: 'Crypto', ticker: 'BTC', shares: 0.05, price: 65000.00, commission: 15.0, originalCurrency: 'USD' },
  { clientId: 'VRH-1', type: 'Buy', assetType: 'Renta Fija', ticker: 'CETES28', shares: 1000, price: 10.00, commission: 0, originalCurrency: 'MXN' },
  { clientId: 'VRH-1', type: 'Buy', assetType: 'FIBRAs', ticker: 'FMTY14', shares: 500, price: 11.50, commission: 5.0, originalCurrency: 'MXN' },
  { clientId: 'VRH-1', type: 'Buy', assetType: 'Commodities', ticker: 'GLD', shares: 2, price: 215.00, commission: 1.0, originalCurrency: 'USD' },
  { clientId: 'VRH-1', type: 'Buy', assetType: 'Forex', ticker: 'EUR/USD', shares: 1000, price: 1.08, commission: 0.5, originalCurrency: 'USD' }
];

async function run() {
  for (const op of operations) {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...op,
          date: new Date().toISOString().split('T')[0]
        }),
      });
      console.log(`✅ Registrado: ${op.ticker} (${op.assetType})`);
    } catch (e) {
      console.log(`❌ Falla en: ${op.ticker} - ${e.message}`);
    }
  }
}

run();
