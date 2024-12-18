const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize App
const app = express();

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for frontend access

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/builder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define Builder Schema
const builderSchema = new mongoose.Schema({
  builder_licence: { type: String, unique: true, required: true },
  name: { type: String, required: true },
});

const Builder = mongoose.model('Builder', builderSchema, 'builder_details');

// Define Post Schema
const postSchema = new mongoose.Schema({
  builder_licence: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  area: { type: Number, required: true },
  time_taken: { type: Number, required: true },
  images: { type: [String], required: true }, // Array of external image URLs
});

const Post = mongoose.model('Post', postSchema, 'builder_posts');

// Add Post Endpoint
app.post('/addPost', async (req, res) => {
  try {
    const { builder_licence, description, cost, area, time_taken, images } = req.body;

    // Validate input
    if (!builder_licence || !description || !cost || !area || !time_taken || !images || images.length === 0) {
      return res.status(400).json({ message: 'All fields are required including images.' });
    }

    // Check if builder license exists in the database
    const builderExists = await Builder.findOne({ builder_licence });
    if (!builderExists) {
      return res.status(404).json({ message: 'Builder license not found. Please check your license.' });
    }

    // Create and save the post
    const newPost = new Post({
      builder_licence,
      description,
      cost,
      area,
      time_taken,
      images, // Store the external image URLs
    });

    await newPost.save();

    res.status(201).json({ message: 'Post added successfully', post: newPost });
  } catch (error) {
    console.error('Error adding post:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Fetch posts by builder_licence
app.get('/getPostsByBuilder/:builder_licence', async (req, res) => {
  try {
    const { builder_licence } = req.params;

    // Find posts that match the builder_licence
    const posts = await Post.find({ builder_licence });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this builder' });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts by builder_licence:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});



// Root Endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Posts API');
});

// Start Server
const PORT = 3010;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));