const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const connectDB = require('./config/dbConn');

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Import Routes
const studentRoutes = require('./routes/student');
const authRoutes = require('./routes/auth');
const materialRoutes = require('./routes/material');

// Use Routes
app.use('/api/student', studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);

app.get('/', (req, res) => {
    res.send('ACLC Backend API is running');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
