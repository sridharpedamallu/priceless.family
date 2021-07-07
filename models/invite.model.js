const mongoose = require('mongoose')
const { Schema } = mongoose;

const User = require('./user.model')
const Party = require('./party.model')

const inviteSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref : "User"
        },
        party:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref : "Party"
        },
        partyDateTime:{
            type: Date,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        invite_message: {
            type: String,
            required: true
        },
        zoom_link: {
            type: String
        },
        preferences:[

        ],
        guests: [
            {
                guestname: {
                    type: String
                },
                rsvp_status: {
                    type: Boolean
                },
                user_response: {
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
                preference_setting: {
                    type: Number,
                    defaut: 1
                },
                choices: [],
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
                }
            }
        ]
    },
    { timestamps: true }
);

const invite = mongoose.model('Invite', inviteSchema)

module.exports = invite
