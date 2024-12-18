const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());

mongoose.connect('mongodb://localhost:27017/builder', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB', err));

const builderSchema = new mongoose.Schema({
  name: String,
  address: String,
  builder_licence: String,
  mobile: String,
  email: String,
});

const Builder = mongoose.model('Builder', builderSchema,'builder_details');

app.get('/api/cities', async (req, res) => {
  try {
    const cities = await Builder.distinct('address');
    res.json(cities);
  } catch (err) {
    res.status(500).send('Error fetching cities');
  }
});

app.get('/api/builders/:city', async (req, res) => {
  const { city } = req.params;
  try {
    console.log('Searching for builders in address:', city);

    const regex = new RegExp(city.trim(), 'i'); 
    const builders = await Builder.find({
      address: { $regex: regex }
    });
    console.log('Found builders:', builders);

    if (builders.length > 0) {
      res.json(builders); 
    } else {
      res.status(404).send('No builders found for the selected city');
    }
  } catch (err) {
    console.error('Error fetching builders:', err);
    res.status(500).send('Error fetching builders');
  }
});

const PORT = 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));