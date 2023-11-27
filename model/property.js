//define a User model
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

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
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
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
  authorName: {
    type: String,
    required: true,
  },
  authorImg: {
    type: String,
    required: true,
  },
  authorEmail: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

propertySchema.post("findOneAndDelete", async function (deletedJob) {
  try {
    const parts = deletedJob.image.split("/");
    const publicIdWithFolder = parts.slice(-2).join("/").split(".")[0];

    await cloudinary.uploader.destroy(publicIdWithFolder);
    console.log(
      `Deleted image with public ID: ${publicIdWithFolder} from Cloudinary`
    );
  } catch (error) {
    console.log(error);
  }
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
