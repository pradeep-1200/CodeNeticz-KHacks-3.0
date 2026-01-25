const express = require('express');
const app = express();
const classesRoutes = require('./routes/classes');

app.use(express.json());
app.use('/api/classes', classesRoutes);

console.log("Routes loaded. Testing /api/classes/student/123 placeholder...");

// Mock DB/Mongoose for route definition check (not execution)
const mongoose = require('mongoose');
mongoose.model = () => ({ find: () => ({ populate: () => ({ populate: () => ({ populate: () => [] }) }) }) });
// This is hacky, but I just want to see if the ROUTE MATCHES, not execute DB logic.
// Actually, easier to just run a real request against my verify server.

app.listen(5001, async () => {
    console.log("Test server running on 5001");
    try {
        const fetch = (await import('node-fetch')).default;
        const res = await fetch('http://localhost:5001/api/classes/student/test_id');
        console.log(`Status: ${res.status}`);
        if (res.status === 404) console.log("Route NOT found");
        else console.log("Route FOUND (might error on DB, but not 404)");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
});
