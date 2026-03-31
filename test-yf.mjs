import YahooFinance from 'yahoo-finance2';
console.log('YahooFinance constructor:', typeof YahooFinance, Object.keys(YahooFinance));

try {
  const yf = new YahooFinance();
  console.log('Instance created');
} catch(e) {
  console.log('Failed:', e.message);
}

try {
  console.log('default property:', YahooFinance.default ? typeof YahooFinance.default : 'none');
  const yf2 = new YahooFinance.default();
  console.log('Instance created via .default');
} catch(e) {
  console.log('Failed via .default:', e.message);
}
