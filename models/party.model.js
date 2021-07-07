const mongoose = require('mongoose')
const { Schema } = mongoose;

const User = require('./user.model')
const Category = require('./category.model')

const partySchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref : "User"
        },
        title: {
            type: String,
            required: true
        },
        categories: [
            {
                category: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Category"
                },
                title: {
                    type: String,
                },
                menuitems: [
                    {
                        title: {
                            type: String
                        },
                        packageitem: {
                            type: Boolean,
                            default: false
                        }
                    }
                ]
            }
        ]
    },
    { timestamps: true }
);

const party = mongoose.model('Party', partySchema)

module.exports = party
