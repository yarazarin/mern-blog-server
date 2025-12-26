// server/routes/authRoutes.js

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

let verificationCodes = new Map(); // email -> code

// Send verification code
router.post("/send-code", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(400)
                .json({ message: "User not found" });
        }

        if (!user.isEmailVerified) {
            return res
                .status(400)
                .json({ message: "Email not verified" });
        }

        const code = Math.floor(
            100000 + Math.random() * 900000
        ).toString(); // 6-digit code
        verificationCodes.set(email, code);

        await sendEmail(
            email,
            "Login Code",
            `Your login code is: ${code}`
        );

        res.json({ message: "Code sent to email" });
    } catch (err) {
        console.error("Error sending code:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(400)
                .json({ message: "User not found" });
        }

        if (verificationCodes.get(email) !== code) {
            return res
                .status(400)
                .json({ message: "Invalid code" });
        }

        verificationCodes.delete(email); // remove after use

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        res.json({ token });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
