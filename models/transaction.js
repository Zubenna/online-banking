const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const transSchema = new Schema({
    acc_number: {
        type: String,
        require: true,
        trim: true,
    },
    date: {
        type: Date,
        default: new Date(),
    },
    amount: {
        type: Number,
        require: true,
        trim: true
    },
    description: {
        type: String,
        maxLength: [100, 'Text too long'],
        required: true
    },
    comment: {
        type: String,
        maxLength: [50, 'Text too long']
    },
    trans_type: {
        type: String,
        enum: ['withdraw', 'deposit', 'transfer', 'balance'],
        require: true
    }
})

const Transaction = mongoose.model('Transaction', transSchema);
module.exports = Transaction;
