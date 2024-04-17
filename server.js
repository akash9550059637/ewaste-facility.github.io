const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path'); // Import path module

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

// Import the User and Admin models
const User = require('./userModel');
const Admin = require('./adminModel');

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
            res.status(201).send('User registered successfully');
        })
        .catch(err => {
            console.error(err);
            res.status(400).send('Error registering user: ' + err);
        });
});

// Handle POST request for user login
app.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }).then(user => {
        if (user && user.password === req.body.password) {
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

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
