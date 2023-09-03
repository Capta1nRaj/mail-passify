const mongoose = require("mongoose");
mongoose.set('autoCreate', false);

const SessionsSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    userIP: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.sessions || mongoose.model("sessions", SessionsSchema)