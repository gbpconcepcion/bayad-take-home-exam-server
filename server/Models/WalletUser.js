const mongoose = require('mongoose');


//mongoose schema of a wallet user that reflects in the cloud db (wallet user contains user profile, credentials, and balance)

const WalletUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true 
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: false,
        default: 0
    },
    token: {
        type: String,
        required: false,
    },

    //a one to many relation with class Transaction (one wallet user can have multiple transactions)
    history: {
        type: [mongoose.Schema.Types.ObjectId], 
        ref: 'Transaction'
    },
    _deleted: false
});

module.exports = mongoose.model('WalletUser', WalletUserSchema);