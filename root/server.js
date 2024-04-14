// server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;
const mongoUrl = 'mongodb://127.0.0.1:27017/Users'; // Updated MongoDB connection URL to use IPv4 localhost

// MongoDB connection
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }) // Added options for useNewUrlParser and useUnifiedTopology
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Import the User and Admin models
const User = require('./userModel');
const Admin = require('./adminModel'); // Importing the Admin model

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
        // Add more fields as needed
    });

    // Save the user to the database
    newUser.save()
        .then(() => {
            // Respond with a success message
            res.status(201).send('User registered successfully');
        })
        .catch(err => {
            // Respond with an error message
            console.error(err);
            res.status(400).send('Error registering user: ' + err);
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
        // Add more fields as needed
    });

    // Save the admin to the database
    newAdmin.save()
        .then(() => {
            // Respond with a success message
            res.status(201).send('Admin registered successfully');
        })
        .catch(err => {
            // Respond with an error message
            console.error(err);
            res.status(400).send('Error registering admin: ' + err);
        });
});

app.post("/login",(req,res)=>{
    User.findOne({email:req.body.email}).then(user=>{
        if(user && user.password === req.body.password){
            res.status(200).json(user);
        }
        else{
            res.status(401).send("Incorrect credentials");
        }
    }).catch(err=>{
        console.error(err);
        res.status(500).send("Server error");
    });
});

app.post("/admin/login",(req,res)=>{
    Admin.findOne({email:req.body.email}).then(admin=>{
        if(admin && admin.password === req.body.password){
            res.status(200).json(admin);
        }
        else{
            res.status(401).send("Incorrect credentials");
        }
    }).catch(err=>{
        console.error(err);
        res.status(500).send("Server error");
    });
});

app.get("/users",(req,res)=>{
    User.find().then(users => res.status(200).json(users));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
