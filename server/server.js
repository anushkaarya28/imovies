
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Booking = require("./models/Booking");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
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

// Create booking
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      movieName,
      customerName,
      email,
      showTime,
      seats,
      totalAmount
    } = req.body;

    const booking = new Booking({
      movieName,
      customerName,
      email,
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
      message: error.message
    });
  }
});

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({
      createdAt: -1
    });

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
