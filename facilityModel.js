// models/facilityModel.js

const mongoose = require('mongoose');

const facilityModelSchema = new mongoose.Schema({
  email: { type: String, required: true },
  facilityName: { type: String, required: true },
  facilityDetails: { type: String, required: true },
  additionalDetails: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

const facilityModel = mongoose.model('facilityModel', facilityModelSchema);

module.exports = facilityModel;
