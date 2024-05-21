const express = require('express');
const bodyParser = require('body-parser');

const { mysqlPool, mongoose } = require('./dbConfig');
const { DonationDatas, DonorDetails, ReceiverDetails } = require('./models/schemas');

const donationRoutes = require('./routes/donations');

// require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

//Donor Side Registration
app.post('/donor-reg', async (req, res) => {
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



//Receiver Registration
app.post('/receiver-reg', async (req, res) => {
  const { name, email, mobileNumber, password, typeOfOrg, orgName, licenseNumber, address, userType } = req.body;
  console.log(`SqlEntry: ${mobileNumber}`);

  try {
      // Insert data into MySQL
      mysqlPool.query('INSERT INTO user_login (mobileNumber, password, userType) VALUES (?, ?, ?)', [mobileNumber, password, userType], (error, results) => {
          if (error) {
              return res.status(500).json({ error });
          }
          // Data inserted into MySQL successfully
          // Now, insert donor data into MongoDB
          ReceiverDetails.create({
            name,
            mobileNumber,
            email,
            typeOfOrg,
            orgName,
            licenseNumber,
            address
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

  mysqlPool.query('SELECT * FROM user_login WHERE mobileNumber = ? AND password = ?', [mobileNumber,password], (error, results) => {
      if (error) {
          console.error('MySQL Error:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          if (results.length > 0) {
              const user = results[0];
              // Check if the provided password matches the stored password
              if (password === user.password) {
                  // Password matches, send user information
                  res.json({
                      userNumber: user.mobileNumber,
                      userType: user.userType
                  });
              } else {
                  // Password doesn't match, send error response
                  res.status(401).json({ error: 'Incorrect password' });
              }
          } else {
              // No user found with the provided mobile number
              res.status(404).json({ error: 'User not found' });
          }
      }
  });
});

// Endpoint to retrieve user details from MongoDB based on mobile number
app.get('/userDetails', async (req, res) => {
  const { mobileNumber, userType } = req.query;

  try {
      let userDetails;
      console.log(mobileNumber);
      // Query MongoDB to find user details based on mobile number and userType
      if (userType === '0') {
          userDetails = await DonorDetails.findOne( {mobileNumber: mobileNumber} );
      } else if (userType === '1') {
          userDetails = await ReceiverDetails.findOne( {mobileNumber: mobileNumber} );
      } else {
          return res.status(400).json({ error: 'Invalid userType' });
      }
      
      // Check if user details are found
      if (userDetails) {
          res.json(userDetails);
      } else {
          res.status(404).json({ error: 'User details not found' });
      }
  } catch (error) {
      console.error('MongoDB Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});




// // POST endpoint for donations
// app.post('/api/donations', async (req, res) => {
//   const newDonation = new DonationDatas(req.body);
//   try {
//     const savedDonation = await newDonation.save();
//     res.status(201).send(savedDonation);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

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

app.use('/api', donationRoutes);

app.get('/donationDetails', async (req, res) => {
    const { id } = req.query;
  
    try {
      const donationData = await DonationDatas.findById(id);
      if (donationData) {
        res.json(donationData);
      } else {
        res.status(404).json({ error: 'Donation data not found' });
      }
    } catch (error) {
      console.error('MongoDB Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  app.get('/updonations', async (req, res) => {
    try {
        const mobileNumber = req.params.number;
        // Find the donor details by mobile number
        const donor = await DonationDatas.findOne(mobileNumber);
        if (!donor) {
          return res.status(404).json({ message: 'Donor not found' });
        }
        res.status(200).json({ message: 'Donations retrieved successfully', donor });
      } catch (error) {
        res.status(500).json({ message: 'Error retrieving donations', error });
        console.log(error);
      }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
