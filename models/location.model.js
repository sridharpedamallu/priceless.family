const mongoose = require('mongoose')
const { Schema } = mongoose;

const locationSchema = new Schema(
    {
        zip: {
            type: Number
        },
        lat: {
            type: Number
        },
        lng: {
            type: Number
        },
        city: {
            type: String
        },
        state_id: {
            type: String
        },
        state_name: {
            type: String
        },
        county_fips: {
            type: Number
        },
        county_name: {
            type: String
        },
        timezone: {
            type: String
        },
    }
);

const location = mongoose.model('Location', locationSchema)

module.exports = location