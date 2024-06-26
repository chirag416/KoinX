const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    userId: { type: Number },
    utcTime: { type: Date },
    operation: { type: String },
    baseCoin: { type: String },
    buySellAmount: { type: Number },
    price: { type: Number }
});

module.exports = mongoose.model('Trade', tradeSchema);
