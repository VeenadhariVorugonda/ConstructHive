// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/builder', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define the User model (you already have this)
const BuilderSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
});
const User = mongoose.model('User', BuilderSchema, 'builder_details'); // Correct collection name

// Define the BuilderDetails model
const BuilderDetailsSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  // Any other fields specific to builder
});
const BuilderDetails = mongoose.model('BuilderDetails', BuilderDetailsSchema, 'builder_details'); // Adjust collection if needed

// Check email endpoint
app.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email exists in builder_details
    const builderEmail = await BuilderDetails.findOne({ email });
    if (builderEmail) {
      return res.json({ isInBuilderDetails: true });
    }

    // If not found in builder_details
    return res.json({ isInBuilderDetails: false });
  } catch (err) {
    console.error('Error checking email:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));