const mongoose = require('mongoose');

//mongoose schema of a transactionclass that reflects in the cloud db (a class used to define the kind of transaction a user makes)
const TransactionTypeSchema = new mongoose.Schema({
    type_definition: {
        type: String,
        required: true,
        default: null
    },

    // one to many relation with class Transaction (a Transaction class can classify multiple transactions)
    classed_transactions: {
        type: [mongoose.Schema.Types.ObjectId], 
        ref: 'Transaction'
    },
    _deleted: false
}
);

module.exports = mongoose.model('TransactionClass', TransactionTypeSchema);