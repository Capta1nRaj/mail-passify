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
    },
    userVerified: {
        type: Boolean,
        default: false,
    },
    OTP: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        expires: 300
    },
}, {
    timestamps: true
});

SessionsSchema.index({ userEmail: 1 }); // Creating a index on userEmail

module.exports = mongoose.models.sessions || mongoose.model("sessions", SessionsSchema)