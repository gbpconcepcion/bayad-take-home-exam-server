const mongoose = require('mongoose');

//only used to have default values for response_code and response_message, db provision not used
const responseSchema = new mongoose.Schema({
    response_code: {
        type: Number,
        required: false,
        default: 200
    },
    response_message: {
        type: String,
        required: false,
        default: null
    },
    response_label: {
        type: String,
        required: false,
        default: "Success!"
    },
});

module.exports = mongoose.model('Response', responseSchema);