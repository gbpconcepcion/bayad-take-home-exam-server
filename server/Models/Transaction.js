const mongoose = require('mongoose');

//mongoose schema of atransaction that reflects in the cloud db (contains information about user transactions)
const TransactionSchema = new mongoose.Schema({
    transaction_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransactionClass'
    },
    transactor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WalletUser'
    },
    amount: {
        type: Number,
        required: false,
        default: 0
    },
    transaction_date: {
        type: Date,
        required: false,
        default: Date.now
    },
    status: {
        type: Number,
        enum: [0,1]
    },
    _deleted: false
});


module.exports = mongoose.model('Transaction', TransactionSchema);