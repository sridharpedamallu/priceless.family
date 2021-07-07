const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        fullname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        emailconfirmed: {
            type: Boolean,
            default: false,
            required: true
        },
        guests: [
            {
                guestname: {
                    type: String
                },
                email: {
                    type: String,
                },
                country_code: {
                    type: String,
                    default: 'us'
                },
                isd: {
                    type: String,
                    default: '1'
                },
                phone: {
                    type: String,
                },
                address_line1: {
                    type: String,
                },
                address_line2: {
                    type: String,
                },
                city: {
                    type: String,
                },
                postcode: {
                    type: String,
                },
                choices: []
            }
        ]
    },
    { timestamps: true }
);

const user = mongoose.model('User', userSchema)

module.exports = user