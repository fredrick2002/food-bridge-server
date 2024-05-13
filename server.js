const express = require('express');
const bodyParser = require('body-parser');

const { mysqlPool, mongoose } = require('./dbConfig');
const { DonationDatas, DonorDetails } = require('./models/schemas');

// require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

//Donor Side Registration
app.post('/donor-register', async (req, res) => {
  const { name, email, mobileNumber, password, userType } = req.body;
  console.log(`SqlEntry: ${mobileNumber}`);

  try {
      // Insert data into MySQL
      mysqlPool.query('INSERT INTO user_login (mobileNumber, password, userType) VALUES (?, ?, ?)', [mobileNumber, password, userType], (error, results) => {
          if (error) {
              return res.status(500).json({ error });
          }
          // Data inserted into MySQL successfully
          // Now, insert donor data into MongoDB
          DonorDetails.create({
              name,
              email,
              mobileNumber,
              donationLists: [], // Empty donation lists array
          })
          .then(donor => {
              // Respond with success message and inserted donor data
              res.json({ message: 'User registered successfully', data: results, donor });
          })
          .catch(error => {
              console.error('Error:', error);
              res.status(500).json({ error: 'Internal Server Error' });
          });
      });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});




//Login Endpoint
app.get('/user', (req, res) => {
  const { mobileNumber, password } = req.query;

  mysqlPool.query('SELECT * FROM user_login WHERE mobileNumber = ? AND password = ?', [mobileNumber, password], (error, results) => {
      if (error) {
          console.error('MySQL Error:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          if (results.length > 0) {
              const user = results[0];
              res.json({
                  userId: user.userId,
                  userType: user.userType
              });
          } else {
              res.status(404).json({ error: 'User not found' });
          }
      }
  });
});



// POST endpoint for donations
app.post('/api/donations', async (req, res) => {
  const newDonation = new DonationDatas(req.body);
  try {
    const savedDonation = await newDonation.save();
    res.status(201).send(savedDonation);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Donor Registration Endpoint
app.post('/register', async (req, res) => {
  const { name, email, mobileNumber } = req.body;

  try {
      // Insert donor data into MongoDB
      const donordetail = await Donor.create({
          name,
          email,
          mobileNumber,
          donationLists: [], // Empty donation lists array
      });

      // Respond with success message
      res.json({ message: 'Donor registered successfully', donordetail });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/donations', async (req, res) => {
  const { district } = req.query;
  try {
    const donations = await DonationDatas.find({"location.district": district});
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
