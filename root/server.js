// server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;
const mongoUrl = 'mongodb://localhost:27017/Users';

// MongoDB connection
mongoose.connect(mongoUrl)
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
            res.send('User registered successfully');
            res.status(201);
        })
        .catch(err => {
            // Respond with an error message
            res.status(400).send('Error registering user');
            res.send('Error registering user:', err);
            console.log(err);
        });
});

app.post("/login",(req,res)=>{
    User.findOne({email:req.body.email}).then(user=>{
        if(user.password===req.body.password){
            res.status(200).json(user);
        }
        else{
            res.send("Incorrect credentials").status(401);
        }
    }).catch(err=>{
        res.send("server error")
        console.log(err);    
    });
})

app.get("/users",(req,res)=>{
    User.find().then(users => res.status(200).json(users));
})

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
