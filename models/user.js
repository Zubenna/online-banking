const mongoose = require('mongoose');
const Transaction = require('./transaction');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    first_name: {
        type: String,
        require: true,
        uppercase: true,
        trim: true,
        maxLength: [15, 'Name too long']
    },
    middle_name: {
        type: String,
        uppercase: true,
        trim: true,
        maxLength: [15, 'Name too long'],
        default: null
    },
    last_name: {
        type: String,
        require: true,
        uppercase: true,
        trim: true,
        maxLength: [15, 'Name too long']
    },
    username: {
        type: String,
        require: true,
        uppercase: true,
        trim: true,
        maxLength: [15, 'Name too long'],
        minLenght: [6, 'username too short'],
        unique: [true, 'Username already exist'],
    },
    email: {
        type: String,
        require: true,
        uppercase: true,
        trim: true,
        maxLength: [25, 'Email too long'],
        unique: [true, 'Email already exist'],
    },
    address: {
        type: String,
        require: true,
        lowercase: true,
        trim: true,
        maxLength: [100, 'Address too long'],
    },
    password: {
        type: String,
        require: true,
        trim: true,
    },
    token: {
        type: String
    },
    image: {
        type: String,
        default: null,
        required: [true, 'Upload your picture please']
    },
    balance: {
        type: Number,
        default: 0.0,
    },
    phone_number: {
        type: String,
        required: [true, 'Please enter your mobile number'],
        unique: [true, 'Number already in use']
    },
    created: {
        type: Date,
        required: true,
        default: Date.now
    },
    records: [{
       type: mongoose.Schema.Types.ObjectId, ref:"Transaction" 
    }]
});

const User = mongoose.model('bank', userSchema);
module.exports = User;