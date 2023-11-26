//define a User model
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  cityName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  lat: {
    type: String,
    required: true,
  },
  lng: {
    type: String,
    required: true,
  },
  fullAddress: {
    type: String,
    required: true,
  },
  startPrice: {
    type: Number,
    required: true,
  },
  endPrice: {
    type: Number,
    required: true,
  },
  authorEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
