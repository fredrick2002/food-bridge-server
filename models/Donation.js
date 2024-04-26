const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  no_of_servings: Number,
  food_category: String,
  meal_type: String,
  add_info: String,
  dishes: [String],
  location: {
    address: String,
    district: String
  }
});

module.exports = mongoose.model('donordatas', donationSchema);
