const Trade = require('./models/Trade');

async function getAssetBalances(timestamp) {
  try {

    const trades = await Trade.find({ utcTime: { $lte: new Date(timestamp) } });

    
    const balanceMap = {};
    const precisionFactor = 100;

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
