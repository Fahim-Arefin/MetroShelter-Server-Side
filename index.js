const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const path = require("path");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./model/user");
const Property = require("./model/property");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Review = require("./model/review");
const WishList = require("./model/wishList");
const Offer = require("./model/offer");
const cloudinary = require("cloudinary").v2;

//connection with mongoose
// -------------------------------------------------------------------------------------------------------------------
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8wioxsd.mongodb.net/MetroShelter?retryWrites=true&w=majority`
  ) //connected to farmStand database
  .then(() => {
    console.log("Mongo connnection successful: ");
  })
  .catch((e) => {
    console.log("Mongo connection failed !!");
    console.log(e);
  });

// -------------------------------------------------------------------------------------------------------------------

//middleware
// -------------------------------------------------------------------------------------------------------------------

app.use(
  cors({
    // origin: ["http://localhost:5173"],
    origin: [
      "https://metroshelter-7a7d6.web.app",
      "https://metroshelter-7a7d6.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary as storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "property", // Set your desired folder name in Cloudinary for images
    allowed_formats: ["jpg", "jpeg", "png", "gif"], // Add the allowed image formats
    // transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const fileFilter = (req, file, cb) => {
  // Check if the file's MIME type is an image type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// Varify Token middleware
const varifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.user = decoded;
    next();
  });
};

const varifyUser = async (req, res, next) => {
  const email = req.user.email;
  const user = await User.findOne({ email });
  if (user.role === "user") {
    next();
  } else {
    res.status(403).send({ message: "Forbidden Access" });
  }
};
const varifyAdmin = async (req, res, next) => {
  const email = req.user.email;
  const user = await User.findOne({ email });
  if (user.role === "admin") {
    next();
  } else {
    res.status(403).send({ message: "Forbidden Access" });
  }
};

const varifyAgent = async (req, res, next) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    if (user.role === "agent") {
      next();
    } else {
      res.status(403).send({ message: "Forbidden Access" });
    }
  } catch (error) {
    res.send(error);
  }
};

// -------------------------------------------------------------------------------------------------------------------

// server
// -------------------------------------------------------------------------------------------------------------------

app.listen(port, () => {
  console.log(`server started with port ${port}`);
});

// -------------------------------------------------------------------------------------------------------------------

// Route
// -------------------------------------------------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.send("project is running ...");
});

// Jwt Token Route

// Isuue Token
app.post("/jwt", (req, res) => {
  try {
    const body = req.body;
    // console.log(body);
    const token = jwt.sign(body, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// Delete Token
app.post("/logout", (req, res) => {
  try {
    const body = req.body;
    // console.log("logging out user...", body);
    res.clearCookie("token", { maxAge: 0 });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// User Route
// --------------------------------------------------------------------------------------------------------------

// create a user
app.post("/users", async (req, res) => {
  try {
    const body = req.body;
    const user = new User(body);
    const data = await user.save();
    res.status(201).send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get all user
app.get("/users", async (req, res) => {
  try {
    const data = await User.find({});
    res.send(data);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});
// get a user
app.get("/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const data = await User.findOne({ email });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.send({ msg: "User Deleted SuccessFully" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/users/admin/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const data = await User.findOne({ email });
    if (data.role === "admin") {
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/users/agent/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const data = await User.findOne({ email });
    if (data.role === "agent") {
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
app.get("/users/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const data = await User.findOne({ email });
    if (data.role === "user") {
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.patch("/users/role/:id", async (req, res) => {
  try {
    const body = req.body;
    const { id } = req.params;
    console.log(body);
    console.log(id);
    const data = await User.findByIdAndUpdate(req.params.id, body.updatedData);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.patch("/users/froud/:id", async (req, res) => {
  try {
    const data = await User.findByIdAndUpdate(req.params.id, { isFroud: true });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// Property Route
// --------------------------------------------------------------------------------------------------------------------

// get all property
app.get("/properties", async (req, res) => {
  try {
    const { status } = req.query;
    console.log(status);
    if (status === "verified") {
      const data = await Property.find({ status: "verified" }).sort({
        createdAt: -1,
      });
      res.send(data);
    } else {
      const data = await Property.find({}).sort({ createdAt: -1 });
      res.send(data);
    }
  } catch (error) {
    res.send(error);
  }
});

//
app.patch("/properties/advertise/:id", async (req, res) => {
  try {
    const { isAdvertise } = req.body;
    const { id } = req.params;
    const data = await Property.findByIdAndUpdate(id, { isAdvertise });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get users property
app.get("/properties/:email", varifyToken, varifyAgent, async (req, res) => {
  try {
    const { email } = req.params;
    const data = await Property.find({ authorEmail: email });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

//
app.get("/properties/show/advertise", async (req, res) => {
  try {
    const data = await Property.find({ isAdvertise: true }).sort({
      createdAt: -1,
    });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get a property
app.get("/properties/show/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Property.findById(id).populate("propertyReviews");
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// create a property
app.post("/properties", upload.single("image"), async (req, res) => {
  try {
    const body = req.body;
    const file = req.file?.path;
    // console.log(body);
    // console.log(file);
    if (!file) {
      return next(new Error("File Not Found!! Maybe invalid filterType"));
    }
    const data = { ...body, image: file };
    // console.log(data);
    const properties = new Property(data);
    const response = await properties.save();
    res.send(response);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.patch("/properties/:id", upload.single("image"), async (req, res) => {
  try {
    const body = req.body;
    const file = req.file?.path;
    const { id } = req.params;
    console.log(id);
    console.log(body);
    console.log("file", file);
    if (!file) {
      // image will not update
      const response = await Property.findByIdAndUpdate(id, body);
      res.send(response);
    } else {
      // TODO : destroy previos img

      // image update
      const data = { ...body, image: file };
      // console.log(data);
      const response = await Property.findByIdAndUpdate(id, data);
      res.send(response);
    }
  } catch (error) {
    res.send(error);
  }
});

// delete a property
app.delete("/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Property.findByIdAndDelete(id);
    res.send({ message: "Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
// --------------------------------------------------------------------------------------------------
// Review Route
// --------------------------------------------------------------------------------------------------

// create a review
app.post("/reviews", async (req, res) => {
  try {
    const body = req.body;
    const data = {
      name: body.name,
      email: body.email,
      image: body.image,
      reviewDescription: body.reviewDescription,
    };
    const { property } = body;
    const review = new Review(data);

    review.property = property;
    await review.save();

    const prop = await Property.findById(property._id);
    prop.propertyReviews.push(review);

    await prop.save();

    res.status(201).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get all reviews
app.get("/reviews", async (req, res) => {
  try {
    const data = await Review.find({})
      .populate("property")
      .sort({ createdAt: -1 });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get specific reviews
app.get("/reviews/:email", varifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    const data = await Review.find({ email }).populate("property");
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// delete a review
app.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Find the review by ID
    const review = await Review.findById(id);

    // If the review doesn't exist, return a 404 Not Found response
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review
    await review.deleteOne();
    res.send({ message: "Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
// ----------------------------------------------------------------------------------------------------

// wishList Route
// --------------------------------------------------------------------------------------------------
app.post("/wishlists", async (req, res) => {
  try {
    const body = req.body;
    const data = {
      authorEmail: body.authorEmail,
    };
    const wishlist = new WishList(data);
    wishlist.property = body.propertyData;
    await wishlist.save();
    res.status(201).send({ msg: "Successfully Created" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/wishlists/offers", async (req, res) => {
  try {
    const data = await Offer.find({})
      .populate("property")
      .sort({ createdAt: -1 });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get specific wishlist
app.get("/wishlists/:email", varifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    const data = await WishList.find({ authorEmail: email })
      .populate("property")
      .sort({ createdAt: -1 });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// delete a wishlist
app.delete("/wishlists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await WishList.findByIdAndDelete(id);
    res.send({ message: "Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.patch("/wishlists/offers/:id", async (req, res) => {
  try {
    const body = req.body;

    if (body.status === "accepted") {
      // Find the offer with the given offerId
      const offer = await Offer.findById(req.params.id);

      if (!offer) {
        console.log("Offer not found");
        res.send("Offer not found");
        return;
      }

      // Find the property associated with the offer
      const property = await Property.findById(offer.property);

      if (!property) {
        console.log("Property not found for the offer");
        res.send("Offer's property not found");
        return;
      }

      // Update all offers(reject) associated with the property
      await Offer.updateMany(
        { property: property._id },
        { $set: { status: "rejected" } }
      );

      // Now accept only the offer that is clicked / send
      await Offer.findByIdAndUpdate(req.params.id, {
        status: body.status,
      });

      console.log("Offer statuses updated successfully");
      res.send("successfully accept the offer and reject all associate offer");
    } else {
      const data = await Offer.findByIdAndUpdate(req.params.id, {
        status: body.status,
      });
      res.send(data);
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
app.patch("/wishlists/offers/:id/pay", async (req, res) => {
  try {
    const body = req.body;
    const data = await Offer.findByIdAndUpdate(req.params.id, {
      status: "bought",
      transactionId: body.transactionId,
    });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.post("/wishlists/offers", async (req, res) => {
  try {
    const { buyerEmail, offerAmount, offerDate, status, buyerName } = req.body;
    const data = { buyerEmail, offerAmount, offerDate, status, buyerName };
    const offer = new Offer(data);
    offer.property = req.body.property;
    await offer.save();
    res.send({ msg: "success" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get specific offer
app.get("/wishlists/offers/:email", varifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    const data = await Offer.find({ buyerEmail: email })
      .populate("property")
      .sort({ createdAt: -1 });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// -------------------------------------------------------------------------------------------------------------------
