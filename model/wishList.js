//define a User model
const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({
  authorEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
});

const WishList = mongoose.model("WishList", wishListSchema);

module.exports = WishList;
