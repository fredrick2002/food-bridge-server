const express = require('express');
const router = express.Router();
const { DonationDatas, DonorDetails } = require('../models/schemas');

// Handle donation submission
router.post('/donations', async (req, res) => {
  try {
    const donationData = new DonationDatas(req.body);
    const savedDonation = await donationData.save();

    const updatedDonor = await DonorDetails.findOneAndUpdate(
      { mobileNumber: req.body.mobileNumber },
      { $push: { donationLists: savedDonation._id } },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: 'Donation submitted successfully', _id: savedDonation._id, updatedDonor });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting donation ', error });
    console.log(error);
  }
});


module.exports = router;
