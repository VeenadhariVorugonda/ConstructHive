// Import necessary modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const PORT = 3010;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/builder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schema and Model
const RequestSchema = new mongoose.Schema({
  builderLicence: String,
  name: String,
  email: String,
  message: String,
  postIds: [String],
});

const Request = mongoose.model('Request', RequestSchema , 'builder_requests');

// Route to fetch requests by builder licence
app.get('/getRequestsByLicence/:builderLicence', async (req, res) => {
  const { builderLicence } = req.params;

  try {
    const requests = await Request.find({ builderLicence });

    if (requests.length === 0) {
      return res.status(404).json({ message: 'No requests found for this builder licence' });
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
