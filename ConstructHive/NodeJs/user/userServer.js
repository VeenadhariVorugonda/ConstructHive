// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');  // or use 'bcryptjs'
// const jwt = require('jsonwebtoken');
// const cors = require('cors');  // Import CORS package

// // Initialize App
// const app = express();

// // Enable CORS middleware
// app.use(cors());  // Allow cross-origin requests

// app.use(bodyParser.json());

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.log('Error connecting to MongoDB:', err));

// // Define User Schema
// const userSchema = new mongoose.Schema({
//     username: String,
//     email: String,
//     password: String,
//     mobile: String,
//     address: String,
// });

// const User = mongoose.model('User', userSchema, 'user_details');

// // Register Endpoint
// app.post('/register', async (req, res) => {  // Make this async
//     try {
//         const { username, email, password, mobile, address } = req.body;

//         // Log incoming data for debugging
//         console.log('Registration data:', req.body);

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);
//         console.log('Hashed Password:', hashedPassword);  // Log the hashed password for debugging

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             console.log('User already exists');
//             return res.status(400).json({ message: 'User with this email already exists' });
//         }

//         // Create a new user
//         const newUser = new User({ username, email, password: hashedPassword, mobile, address });
//         await newUser.save();

//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         console.log('Error during registration:', error);  // Log any registration errors
//         res.status(500).json({ message: 'Error registering user', error });
//     }
// });

// // Login Endpoint
// app.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Log incoming data for debugging
//         console.log('Login data:', req.body);

//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             console.log('User not found');
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Validate password
//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         console.log('Password Validity:', isPasswordValid);  // Log password validity check

//         if (!isPasswordValid) {
//             console.log('Invalid password');
//             return res.status(401).json({ message: 'Invalid password' });
//         }

//         // Generate JWT token
//         const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '1h' });
//         console.log('Generated Token:', token);  // Log the generated token

//         res.status(200).json({ message: 'Login successful', token });
//     } catch (error) {
//         console.log('Error during login:', error);  // Log any login errors
//         res.status(500).json({ message: 'Error logging in', error });
//     }
// });

// // Start Server
// const PORT = 5003;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));




import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';  // or 'bcryptjs'
import jwt from 'jsonwebtoken';
import cors from 'cors';
// Initialize App
const app = express();

// Enable CORS middleware
app.use(cors());  // Allow cross-origin requests

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/user', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    mobile: String,
    address: String,
});

const User = mongoose.model('User', userSchema, 'user_details');

// Register Endpoint
app.post('/register', async (req, res) => {  // Make this async
    try {
        const { username, email, password, mobile, address } = req.body;

        // Log incoming data for debugging
        console.log('Registration data:', req.body);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword);  // Log the hashed password for debugging

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create a new user
        const newUser = new User({ username, email, password: hashedPassword, mobile, address });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log('Error during registration:', error);  // Log any registration errors
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Log incoming data for debugging
        console.log('Login data:', req.body);

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password Validity:', isPasswordValid);  // Log password validity check

        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '1h' });
        console.log('Generated Token:', token);  // Log the generated token

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.log('Error during login:', error);  // Log any login errors
        res.status(500).json({ message: 'Error logging in', error });
    }
});

app.get('/api/users/:email', (req, res) => {
  const { email } = req.params;
  // Assuming 'User' is the model for your user collection in the database
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        email: user.email,
        username: user.username, // Fetching the username
        mobile: user.mobile, // Fetching the mobile number
        address: user.address, // Fetching the address
      });
    })
    .catch(error => res.status(500).json({ message: 'Error fetching user data', error }));
});


  
  

// Start Server
const PORT = 5003;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));