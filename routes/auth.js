const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.trim();
        console.log(`[LoginRequest] Attempting login for: ${normalizedEmail}`);
        const user = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } });

        if (!user) {
            console.warn(`[LoginRequest] Authentication failed: User ${email} not found.`);
            return res.status(401).send({ error: 'Invalid login credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.warn(`[LoginRequest] Authentication failed: Password mismatch for ${email}.`);
            return res.status(401).send({ error: 'Invalid login credentials' });
        }

        console.log(`[LoginRequest] Authentication successful for: ${email}`);

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        res.send({ user, token });
    } catch (e) {
        console.error("Login route error:", e);
        res.status(400).send({ error: e.message || 'An error occurred', stack: e.stack });
    }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email?.trim();
        const user = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } });

        if (!user) {
            // For security, do not reveal if a user exists or not
            return res.status(200).send({ message: 'If that email exists, a reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 900000; // 15 minutes
        await user.save();

        // Use the front end port from the origin or default to 5173
        const originUrl = req.headers.origin || 'http://localhost:5173';
        const resetUrl = `${originUrl}/reset-password/${token}`;

        // Brevo SMTP transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"SK Technology Portal" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: user.email,
            subject: '🔐 Reset Your Password – SK Technology Employee Portal',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; padding: 40px 20px;">
                    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                        <div style="text-align: center; margin-bottom: 32px;">
                            <div style="background: #eff6ff; width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                <span style="font-size: 28px;">🔐</span>
                            </div>
                            <h2 style="color: #0f172a; margin: 0; font-size: 24px;">Password Reset Request</h2>
                        </div>
                        <p style="color: #475569; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
                        <p style="color: #475569; line-height: 1.6;">We received a request to reset your password for the SK Technology Employee Portal. Click the button below to set a new password. This link will expire in <strong>15 minutes</strong>.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; letter-spacing: 0.5px;">Reset My Password</a>
                        </div>
                        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a></p>
                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[INFO] Password reset email sent to ${user.email} via Brevo`);

        res.status(200).send({
            message: 'A password reset link has been sent to your email address.'
        });


    } catch (e) {
        console.error("Forgot password error:", e);

        // Check if it's an authentication error from the SMTP server
        if (e.code === 'EAUTH' || (e.message && e.message.includes('Invalid login'))) {
            return res.status(400).send({ message: 'Failed to send email. Brevo SMTP credentials in .env are incorrect. Please check EMAIL_USER and EMAIL_PASS.' });
        }

        res.status(500).send({ message: 'Error processing request' });
    }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ error: 'Password reset token is invalid or has expired.' });
        }

        user.password = password; // Will be hashed by pre-save middleware
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        // Issue a new JWT so the frontend can auto-login the user
        const authToken = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

        res.send({
            message: 'Password has been successfully reset.',
            token: authToken,
            user
        });

    } catch (e) {
        console.error("Reset password error:", e);
        res.status(500).send({ message: 'Error resetting password' });
    }
});

module.exports = router;
