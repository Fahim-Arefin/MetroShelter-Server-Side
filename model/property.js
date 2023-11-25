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
  lan: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  priceRange: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
