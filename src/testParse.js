const rows = [
  { Ticker: 'AAPL', Live_Price: '$270.71 USD' },
  { Ticker: 'NVDA', Live_Price: '$3,708.01 MXN' },
  { Ticker: 'BTC', Live_Price: '$76,445.00 USD' },
  { Ticker: 'VOO', Live_Price: '$11,379.79 MXN' }
];

const safeParseFloat = (val) => {
  const cleaned = (val || '0').toString().replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

rows.forEach(r => {
  console.log(r.Ticker, safeParseFloat(r.Live_Price));
});
