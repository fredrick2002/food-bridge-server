const mongoose = require('mongoose');

const donationDataSchema = new mongoose.Schema({
  name: String,
  mobileNumber: String,
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

const donorDetailsSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobileNumber: Number,
  donationLists: Array, // Array of donation lists
});

module.exports = {
  DonationDatas: mongoose.model('donordatas', donationDataSchema),
  DonorDetails: mongoose.model('donordetails', donorDetailsSchema)
};
