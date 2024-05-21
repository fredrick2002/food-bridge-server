const mongoose = require('mongoose');

const donationDataSchema = new mongoose.Schema({
  name: String,
  mobileNumber: Number,
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
  donationLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DonationDatas' }], 
});

const receiverDetailsSchema = new mongoose.Schema({
  name: String,
  mobileNumber: Number,
  email: String,
  typeOfOrg: String,
  orgName: String,
  licenseNumber: String,
  address: String
});

module.exports = {
  DonationDatas: mongoose.model('donordatas', donationDataSchema),
  DonorDetails: mongoose.model('donordetails', donorDetailsSchema),
  ReceiverDetails: mongoose.model('receiverdetails',receiverDetailsSchema)
};
