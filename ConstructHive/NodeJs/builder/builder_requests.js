const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/builder'; // Replace 'builder' with your database name
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schema and Model for builder_requests
const builderRequestSchema = new mongoose.Schema({
  builderLicence: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  postIds: { type: [String], required: true }, // Store related post IDs
});

const BuilderRequest = mongoose.model('builder_requests', builderRequestSchema);

// POST API to handle requests
app.post('/sendRequest', async (req, res) => {
  try {
    const { builderLicence, name, email, message, postIds } = req.body;

    // Validation
    if (!builderLicence || !name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save to database
    const newRequest = new BuilderRequest({ builderLicence, name, email, message, postIds });
    await newRequest.save();

    res.status(201).json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
const PORT = 3011;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});