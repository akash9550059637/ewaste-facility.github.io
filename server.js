const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path'); // Import path module
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3001;
const mongoUrl = 'mongodb://127.0.0.1:27017/Users';

// MongoDB connection
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Import the User and Admin and EwasteRequest models
const User = require('./userModel');
const Admin = require('./adminModel');
const Request = require('./Request');
const facilityModel = require('./facilityModel');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.userId;
        next();
    });
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (for example, register.html)
app.use(express.static('public'));

// Handle POST request from register.html form for user registration
app.post('/register', (req, res) => {
    // Create a new User instance with the data from the request body
    const newUser = new User({
        name: req.body.name,
        contact: req.body.contact,
        email: req.body.email,
        password: req.body.password,
    });

    // Save the user to the database
    newUser.save()
        .then(() => {
           // Redirect to user-home.html after successful registration
            res.redirect('https://akash9550059637.github.io/ewaste-facility.github.io/user-home.html');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error registering user: ' + err);
        });
});



// handle post request from user-home.htl to save the reuest form data in database.
app.post('/EwasteRequest', (req, res) => {
    // Extract data from the request body
    const { email, productCategory, productName, additionalInfo, location } = req.body;

    // Split the location string into latitude and longitude
    const [latitude, longitude] = location.split(',');

    // Create a new Request document using the Request model
    const newRequest = new Request({
        email,
        productCategory,
        productName,
        additionalInfo,
        location: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order of coordinates
        }
    });

    // Save the new request document to the database
    newRequest.save()
        .then(savedRequest => {
            console.log('E-waste request saved successfully:', savedRequest);
            res.status(201).send('E-waste request saved successfully');
        })
        .catch(error => {
            console.error('Error saving e-waste request:', error);
            res.status(500).send('Error saving e-waste request');
        });
});

//handle post request to save the faciity details from admin-index.html

app.post('/submit-form', (req, res) => {
  try {
    const { email, facilityName, facilityDetails, additionalDetails, location } = req.body;
    
    // Extract latitude and longitude from the location string
    const [latitude, longitude] = location.split(',');

    const facilityEntry = new FacilityModel({
      email,
      facilityName,
      facilityDetails,
      additionalDetails,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });
    
    facilityEntry.save()
      .then(savedFacilityEntry => {
        console.log('E-waste facility has been saved', savedFacilityEntry);
        res.status(201).send('E-waste facility details request saved successfully');
      })
      .catch(error => {
        console.error('Error saving e-waste request:', error);
        res.status(500).send('Error saving e-waste request'); // Corrected the status code here
      });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).send('Internal server error',error); // Corrected the status code here
  }
});





// Handle POST request for user login

app.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }).then(user => {
        if (user && user.password === req.body.password) {
            const token = jwt.sign({ userId: user._id }, 'secret_key');
            res.header('Authorization', token);
            res.redirect('https://akash9550059637.github.io/ewaste-facility.github.io/user-home.html');
        } else {
            res.status(401).send("Incorrect credentials");
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send("Server error");
    });
});


// Handle POST request from admin-register.html form for admin registration
app.post('/admin/register', (req, res) => {
    // Create a new Admin instance with the data from the request body
    const newAdmin = new Admin({
        adminName: req.body.adminName,
        contact: req.body.contact,
        email: req.body.email,
        facilityName: req.body.facilityName,
        password: req.body.password,
    });

    // Save the admin to the database
    newAdmin.save()
        .then(() => {
            // Redirect to admin-index.html after successful registration
            res.redirect('https://akash9550059637.github.io/ewaste-facility.github.io/admin-index.html');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error registering admin: ' + err);
        });
});

// Handle POST request for admin login
app.post("/admin/login", (req, res) => {
    Admin.findOne({ email: req.body.email }).then(admin => {
        if (admin && admin.password === req.body.password) {
            // Redirect to admin-index.html after successful login
            res.redirect('https://akash9550059637.github.io/ewaste-facility.github.io/admin-index.html');
        } else {
            res.status(401).send("Incorrect credentials");
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send("Server error");
    });
});

// Handle GET request to retrieve all users
app.get("/users", (req, res) => {
    User.find().then(users => res.status(200).json(users))
        .catch(err => {
            console.error(err);
            res.status(500).send("Server error");
        });
});

// Handle GET request to retrieve all admins
app.get("/admins", (req, res) => {
    Admin.find().then(admins => res.status(200).json(admins))
        .catch(err => {
            console.error(err);
            res.status(500).send("Server error");
        });
});

// Handle GET request to retrieve user-specific data
app.get("/user-data", verifyToken, (req, res) => {
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Send user-specific data from the database
            res.status(200).json(user);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Server error");
        });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
