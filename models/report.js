const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reportSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Report", reportSchema);