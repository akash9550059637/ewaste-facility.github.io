// server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = 'mongodb://localhost:27017/Users';

// MongoDB connection
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

const MongoClient = mongodb.MongoClient;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Handle POST request from register.html form
app.post('/register', (req, res) => {
    const userData = {
        name: req.body.name,
        contact: req.body.contact,
        email: req.body.email,
        password: req.body.password,
        // Add more fields as needed
    };

    // Connect to MongoDB
    MongoClient.connect(mongoUrl, (err, client) => {
        if (err) throw err;

        // Access the database
        const db = client.db('Users');

        // Access the collection
        const collection = db.collection('Users');

        // Insert user data into the collection
        collection.insertOne(userData, (err, result) => {
            if (err) {
                res.send('Error registering user');
            } else {
                res.send('User registered successfully');
            }
            client.close();
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
