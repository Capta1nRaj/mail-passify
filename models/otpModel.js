const mongoose = require("mongoose");
mongoose.set('autoCreate', false);

const otpSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
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

otpSchema.index({ userName: 1 }); // Creating a index on inviteCode

module.exports = mongoose.models.OTP || mongoose.model("OTP", otpSchema)