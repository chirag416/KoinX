const Trade = require('./models/Trade');

async function getAssetBalances(timestamp) {
  try {
    // Query trades before or at the specified timestamp
    const trades = await Trade.find({ utcTime: { $lte: new Date(timestamp) } });

    // Initialize balance map with integers for precision
    const balanceMap = {};
    const precisionFactor = 100; // Multiply by 100 for two decimal places

    // Calculate asset balances (using integer multiplication)
    trades.forEach(trade => {
      const { baseCoin, buySellAmount, operation } = trade;
      const adjustedAmount = Math.round(buySellAmount * precisionFactor);

      if (!balanceMap[baseCoin]) {
        balanceMap[baseCoin] = 0;
      }

      if (operation === 'Buy') {
        balanceMap[baseCoin] += adjustedAmount;
      } else if (operation === 'Sell') {
        balanceMap[baseCoin] -= adjustedAmount;
      }
    });

    // Prepare response object with non-zero balances
    const assetBalances = {};
    Object.keys(balanceMap).forEach(asset => {
      if (balanceMap[asset] !== 0) {
        // Convert back to decimal representation after calculations
        assetBalances[asset] = balanceMap[asset] / precisionFactor;
      }
    });

    return assetBalances;
  } catch (error) {
    console.error('Error fetching asset balances:', error);
    throw new Error('Failed to fetch asset balances');
  }
}

module.exports = { getAssetBalances };
