const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Report = require('./models/Report');
const db = require('./data/db');

dotenv.config();

const fixReports = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const reports = await Report.find();
        console.log(`Found ${reports.length} reports. Updating...`);

        for (let report of reports) {
            // Reset to baseline
            report.improvementData = db.reports.improvementData;
            report.afterStats = db.reports.afterStats; // Should match beforeStats (40, 65, 50)
            report.submissionHistory = [];
            report.problemStats = db.reports.problemStats;

            await report.save();
        }

        console.log("All reports updated to baseline state.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixReports();
