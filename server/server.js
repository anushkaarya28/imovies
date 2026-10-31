
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Booking = require("./models/Booking");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://imovies-theta-indol.vercel.app"
  ]
}));

app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to IMovies API");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "IMovies backend is running!"
  });
});

// Create booking - Login required
app.post("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const {
      movieName,
      showTime,
      seats,
      totalAmount
    } = req.body;

    if (!movieName || !showTime || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Movie, show time and seats are required."
      });
    }

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount !== seats.length * 200
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount."
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again."
      });
    }

    const booking = new Booking({
      userId: user._id,
      movieName,
      customerName: user.name,
      email: user.email,
      showTime,
      seats,
      totalAmount
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      success: true,
      message: "Ticket booked successfully!",
      booking: savedBooking
    });

  } catch (error) {
    console.error("Booking error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create booking."
    });
  }
});

// Get only the logged-in user's bookings
app.get("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.userId
    }).sort({
      createdAt: -1
    });

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error("Fetch bookings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch bookings."
    });
  }
});

// Server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`IMovies server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
