const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require("cors");
// Load environment variables from .env file
dotenv.config();

// Initialize App
const app = express();
app.use(bodyParser.json());

app.use(cors());
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/builder', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

// Define Builder Schema with Unique Constraints
const builderSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        validate: {
            validator: function (value) {
                // Regular expression to check for at least one special character
                return /[!@#$%^&*(),.?":{}|<>]/.test(value);
            },
            message: 'Password must contain at least one special character',
        },
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        trim: true,
        match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number'],
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    builder_licence: {
        type: String,
        required: [true, 'Builder licence is required'],
        unique: true,
        trim: true,
        uppercase: true,
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

// Create unique indexes to enforce uniqueness at the database level
builderSchema.index({ email: 1 }, { unique: true });
builderSchema.index({ mobile: 1 }, { unique: true });
builderSchema.index({ builder_licence: 1 }, { unique: true });

// Create Builder Model
const Builder = mongoose.model('Builder', builderSchema, 'builder_details');

// Register Endpoint
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, mobile, address, builder_licence } = req.body;

        // Check if all required fields are provided
        if (!username || !email || !password || !mobile || !address || !builder_licence) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if email already exists
        const existingEmail = await Builder.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Check if mobile already exists
        const existingMobile = await Builder.findOne({ mobile });
        if (existingMobile) {
            return res.status(409).json({ message: 'Mobile number already in use' });
        }

        // Check if builder_licence already exists
        const existingLicence = await Builder.findOne({ builder_licence });
        if (existingLicence) {
            return res.status(409).json({ message: 'Builder licence already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new builder document
        const newBuilder = new Builder({
            username,
            email,
            password: hashedPassword,
            mobile,
            address,
            builder_licence
        });

        // Save the new builder to the database
        await newBuilder.save();

        res.status(201).json({ message: 'Builder registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);

        // Handle duplicate key errors (in case indexes are violated)
        if (error.code === 11000) {
            const duplicatedField = Object.keys(error.keyValue)[0];
            return res.status(409).json({ message: `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} already exists` });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validation Error', errors: messages });
        }

        res.status(500).json({ message: 'Error registering builder', error: error.message });
    }
});
// Add this after the necessary imports and before the '/register' endpoint


// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find builder by email
        const builder = await Builder.findOne({ email });
        if (!builder) {
            return res.status(404).json({ message: 'Builder not found' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, builder.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: builder._id }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Middleware to Verify JWT Token (Optional for Protected Routes)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Access token missing' });

    jwt.verify(token, process.env.JWT_SECRET || 'secretKey', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Example Protected Route
app.get("/api/builders/:email", (req, res) => {
    const { email } = req.params;
    Builder.findOne({ email })
      .then((builder) => {
        if (!builder) {
          return res.status(404).json({ message: "Builder not found" });
        }
        // Return the builder details excluding the password
        res.json({
          email: builder.email,
          username: builder.username,
          mobile: builder.mobile,
          address: builder.address,
          builder_licence: builder.builder_licence, // Include builder license
        });
      })
      .catch((error) =>
        res.status(500).json({ message: "Error fetching builder data", error })
      );
  });
  
  // Update builder details
  app.put("/api/builders/:email", (req, res) => {
    const { email } = req.params;
    const updates = req.body;
  
    Builder.findOneAndUpdate({ email }, updates, { new: true })
      .then((updatedBuilder) => {
        if (!updatedBuilder) {
          return res.status(404).json({ message: "Builder not found" });
        }
        res.json(updatedBuilder);
      })
      .catch((error) =>
        res.status(500).json({ message: "Error updating builder details", error })
      );
  });

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Builder API');
});

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
