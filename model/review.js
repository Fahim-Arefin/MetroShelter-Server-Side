//define a User model
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  reviewDescription: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
});

// Set up a pre-hook to delete the review reference from the associated property
reviewSchema.pre("findOneAndDelete", { document: true }, async function () {
  try {
    // Access the review document about to be deleted
    const deletedReview = this;

    // Find the associated property and update it to remove the reference to the review
    await mongoose
      .model("Property")
      .findOneAndUpdate(
        { _id: deletedReview.property },
        { $pull: { propertyReviews: deletedReview._id } }
      );

    console.log(`Deleted review with ID: ${deletedReview._id}`);
  } catch (error) {
    console.error(error);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
