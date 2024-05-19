

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isPremiumUser: {
        type: Boolean,
        default: false
    },
    totalExpense: {
        type: Number,
        default: 0
    },
    expenseReport: [{
        type: Schema.Types.ObjectId,
        ref: 'Report'
    }],
    orders : [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    forgetPasswordRequest: [{
        type: Schema.Types.ObjectId,
        ref: 'ForgotPasswordRequest'
    }],
    expenses: [{
        type: Schema.Types.ObjectId,
        ref: 'Expense'
    }]
});

module.exports = mongoose.model('User', userSchema);
