// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// app.use(bodyParser.json());
// app.use(cors());

// //findone //grt//filter 


// mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.log(err));


// const UserSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     name: String,
// });

// const User = mongoose.model('User', UserSchema, 'user_details');


// app.post('/verify-email', async (req, res) => {
//     const { email } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (user) {
//             res.status(200).json({ exists: true });
//         } else {
//             res.status(404).json({ exists: false });
//         }
//     } catch (error) {
//         res.status(500).json({ error: 'Server error' });
//     }
// });


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define User schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    otp: String,
});

const User = mongoose.model('User', UserSchema, 'user_details');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password', // Use the generated app password here if you have 2FA enabled
    },
});


// Email verification route
app.post('/verify-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            await user.save();

            const mailOptions = {
                from: 'your-email@gmail.com',
                to: email,
                subject: 'OTP for Verification',
                text: `Your OTP for verification is ${otp}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                    res.status(500).json({ error: 'Error sending email' });
                } else {
                    console.log('Email sent:', info.response);
                    res.status(200).json({ message: 'OTP sent successfully' });
                }
            });
        } else {
            res.status(404).json({ message: 'Email not found' });
        }
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
