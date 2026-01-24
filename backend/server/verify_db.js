const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Report = require('./models/Report');

dotenv.config();

const verify = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const user = await User.findOne();
        if (!user) {
            console.log("No user found.");
        } else {
            console.log("User found:", user.name, user._id);
            const report = await Report.findOne({ userId: user._id }).populate('userId');
            if (!report) {
                console.log("No report found for user:", user._id);
            } else {
                console.log("Report found.");
                if (report.userId) {
                    console.log("Report populated correctly. User Name:", report.userId.name);
                } else {
                    console.log("Report userId field is missing or failed populate.");
                    console.log("Report doc:", report);
                }

                if (report.submissionHistory && report.submissionHistory.length > 0) {
                    console.log("Submission History present, count:", report.submissionHistory.length);
                } else {
                    console.log("Submission History MISSING.");
                }
            }
        }
        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

verify();
