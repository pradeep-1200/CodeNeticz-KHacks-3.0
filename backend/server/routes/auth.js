const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
    const { email, password, type } = req.body;
    try {
        // In a real app, hash passwords. Here we compare plain text as per demo requirements/simplicity
        const user = await User.findOne({ email });

        if (user && user.password === password) {
            res.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token: "mock-jwt-token-12345"
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
