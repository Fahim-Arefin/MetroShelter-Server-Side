//define a User model
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  buyerEmail: {
    type: String,
    required: true,
  },
  buyerName: {
    type: String,
    required: true,
  },
  offerAmount: {
    type: Number,
    required: true,
  },
  offerDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
