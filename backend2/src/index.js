const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const classroomRoutes = require('./routes/classroomRoutes');
const materialRoutes = require('./routes/materialRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/class', classroomRoutes);
app.use('/api/material', materialRoutes);
app.use('/api/assessment', assessmentRoutes);

app.get('/health', (req, res) => {
    res.send('Server Running');
});

const { protect, teacherOnly } = require('./middleware/auth');

app.get('/api/test-auth', protect, (req, res) => {
    res.json({ message: 'Authenticated successfully', user: req.user });
});

app.get('/api/test-teacher', protect, teacherOnly, (req, res) => {
    res.json({ message: 'Teacher access granted' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
