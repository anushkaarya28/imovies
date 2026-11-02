
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Booking = require("./models/Booking");
const User = require("./models/user");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const movieRoutes = require("./routes/movieRoutes");
const theaterRoutes = require("./routes/theaterRoutes");
const showRoutes = require("./routes/showRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://imovies-theta-indol.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/shows", showRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to IMovies API",
    status: "Server is running",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "IMovies backend is healthy",
  });
});

// Create Booking
app.post("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const {
      movieName,
      customerName,
      email,
      showTime,
      seats,
      totalAmount,
    } = req.body;

    if (
      !movieName ||
      !customerName ||
      !email ||
      !showTime ||
      !Array.isArray(seats) ||
      seats.length === 0
    ) {
      return res.status(400).json({
        message: "Please provide all booking details.",
      });
    }

    const expectedAmount = seats.length * 200;

    if (Number(totalAmount) !== expectedAmount) {
      return res.status(400).json({
        message: "Invalid total amount.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const booking = new Booking({
      userId: req.userId,
      movieName,
      customerName,
      email,
      showTime,
      seats,
      totalAmount: expectedAmount,
    });

    await booking.save();

    res.status(201).json({
      message: "Booking successful!",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);

    res.status(500).json({
      message: "Failed to create booking.",
    });
  }
});

// Get Logged-in User Bookings
app.get("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Fetch bookings error:", error);

    res.status(500).json({
      message: "Failed to fetch bookings.",
    });
  }
});


const { adminMiddleware } = require("./middleware/authMiddleware");

// Admin Dashboard
app.get(
  "/api/admin/dashboard",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalBookings = await Booking.countDocuments();

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalBookings,
        },
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({
        message: "Failed to load admin dashboard.",
      });
    }
  }
);

// Admin: View All Bookings
app.get(
  "/api/admin/bookings",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const bookings = await Booking.find()
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.error("Admin bookings error:", error);
      res.status(500).json({
        message: "Failed to fetch all bookings.",
      });
    }
  }
);


// Server startup
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`IMovies server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();
