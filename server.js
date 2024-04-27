const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Donation = require('./models/Donation');

const app = express();
const port = process.env.PORT || 80;

// Middleware to parse JSON
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/food-bridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// POST endpoint for donations
app.post('/api/donations', async (req, res) => {
  const newDonation = new Donation(req.body);
  try {
    const savedDonation = await newDonation.save();
    res.status(201).send(savedDonation);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
