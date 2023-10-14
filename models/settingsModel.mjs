import mongoose from "mongoose";
mongoose.set('autoCreate', false);

const SettingsSchema = new mongoose.Schema({
    referred_points: {
        type: Number,
        default: 0,
    },
    referred_person_points: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

export default mongoose.models.settings || mongoose.model("settings", SettingsSchema);