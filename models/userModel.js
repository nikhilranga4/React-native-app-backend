const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                "Please enter a valid email",
            ],
        },
        password: {
            type: String,
            required: function () {
                return !this.isOAuth; // Password is required if not OAuth user
            },
            minlength: [6, "Password must be at least 6 characters long"],
        },
        dateOfBirth: {
            type: Date,
        },
        facebookProfileUrl: {
            type: String,
            match: [
                /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9(.?)?]/,
                "Please enter a valid Facebook profile URL",
            ],
        },
        linkedInProfileUrl: {
            type: String,
            match: [
                /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_.]+$/,
                "Please enter a valid LinkedIn profile URL",
            ],
        },
        bio: {
            type: String,
            maxlength: [500, "Bio cannot exceed 500 characters"],
        },
        isOAuth: {
            type: Boolean,
            default: false, // Used for Google/GitHub OAuth logins
        },
        provider: {
            type: String,
            enum: ["local", "google", "github"],
            default: "local",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
