const mongoose = require('mongoose')
const { Schema } = mongoose;

const User = require('./user.model')

const forgotPasswordSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref : "User"
        },
        email: {
            type: String,
            required: true
        },
        otp: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const forgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema)

module.exports = forgotPassword
