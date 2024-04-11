const express = require('express');
const mongoose = require('mongoose');
const User = require('./userModel');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Users', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
