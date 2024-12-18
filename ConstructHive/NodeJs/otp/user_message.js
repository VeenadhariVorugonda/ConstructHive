import express from 'express';       // Import express
import mongoose from 'mongoose';     // Import mongoose
import bodyParser from 'body-parser';// Import body-parser for parsing JSON requests
import axios from 'axios';          // Import axios for making HTTP requests

const app = express();
const PORT = 3111;

// Middleware to parse JSON
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/builder', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Database connection error:', err));

// Define MongoDB schema for Builder
const builderSchema = new mongoose.Schema({
  builder_licence: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
});

const Builder = mongoose.model('BuilderDetails', builderSchema, 'builder_details');

// POST endpoint to send request
app.post('/sendRequest', async (req, res) => {
  const { builderLicence, name, email, description } = req.body;

  // Validate if all required fields are present
  if (!builderLicence || !name || !email || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find builder details by licence
    const builder = await Builder.findOne({ builder_licence: builderLicence });
    if (!builder) {
      return res.status(404).json({ message: 'Builder not found' });
    }

    // Prepare the message parameters to send to EmailJS
    const messageParams = {
      from_name: name,
      from_email: email,
      to_email: builder.email,  // Send the message to builder's email
      subject: 'Message from potential client',
      message: description,
    };

    // Log the message parameters for debugging
    console.log("Message parameters:", messageParams);

    // Make the POST request to the EmailJS API
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
      service_id: 'service_mjglhff',    // Your EmailJS service ID
      template_id: 'template_57cabb3',  // Your EmailJS template ID
      user_id: 'ZZI2H-uoQixBWrJKU',     // Your EmailJS user ID (public key)
      template_params: messageParams,   // The message parameters
    });

    // If successful, respond with a success message
    console.log('Message sent successfully:', response.data);
    res.status(200).json({ message: 'Request sent successfully' });

  } catch (error) {
    // Handle errors (e.g., network issues, EmailJS API issues)
    console.error('Error sending email:', error);
    res.status(500).json({ message: `Error sending request: ${error.message || error}` });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
