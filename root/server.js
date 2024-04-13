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

// Import the User model
const User = require('./userModel');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (for example, register.html)
app.use(express.static('public'));

// Handle POST request from register.html form
app.post('/register',(req, res) => {
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
            res.status(201).send('User registered successfully'); // Changed order of setting status and sending response
        })
        .catch(err => {
            // Respond with an error message
            console.log(err);
            res.status(400).send('Error registering user: ' + err); // Modified error message to include actual error
        });
});

app.post("/login",(req,res)=>{
    User.findOne({email:req.body.email}).then(user=>{
        if(user && user.password === req.body.password){ // Added check for existence of user object
            res.status(200).json(user);
        }
        else{
            res.status(401).send("Incorrect credentials"); // Changed order of setting status and sending response
        }
    }).catch(err=>{
        console.log(err);
        res.status(500).send("Server error"); // Changed order of setting status and sending response
    });
});

app.get("/users",(req,res)=>{
    User.find().then(users => res.status(200).json(users));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
