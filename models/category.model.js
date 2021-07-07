const mongoose = require('mongoose')
const { Schema } = mongoose;

const categorySchema = new Schema(
    {
        title: {
            type: String
        }
    }
);

const category = mongoose.model('Category', categorySchema)

module.exports = category
