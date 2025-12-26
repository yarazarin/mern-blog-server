const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    country: { type: String },
    region: { type: String },
    city: { type: String },
    date: { type: Date, default: Date.now },
    userAgent: { type: String },
    path: { type: String },
    referrer: { type: String },
});

module.exports = mongoose.model("Visit", visitSchema);
