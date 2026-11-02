
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Booking = require("./models/Booking");
const User = require("./models/user");
const Movie = require("./models/Movie");
const Theater = require("./models/Theater");
const Show = require("./models/Show");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = authMiddleware.adminMiddleware;

const movieRoutes = require("./routes/movieRoutes");
const theaterRoutes = require("./routes/theaterRoutes");
const showRoutes = require("./routes/showRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://imovies-theta-indol.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "1mb" }));

// -------------------- INLINE MODELS --------------------

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
}, { timestamps: true });

watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Watchlist = mongoose.models.Watchlist ||
  mongoose.model("Watchlist", watchlistSchema);

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
}, { timestamps: true });

reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Review = mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);

// -------------------- BASIC ROUTES --------------------

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to IMovies API",
    status: "Server is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "IMovies backend is healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/shows", showRoutes);

// -------------------- BOOKING --------------------

// Create booking and reserve seats for a particular show
app.post("/api/bookings", authMiddleware, async (req, res) => {
  let reserved = false;

  try {
    const {
      showId,
      customerName,
      email,
      seats,
    } = req.body;

    if (
      !showId ||
      !mongoose.Types.ObjectId.isValid(showId) ||
      !customerName?.trim() ||
      !email?.trim() ||
      !Array.isArray(seats) ||
      seats.length === 0
    ) {
      return res.status(400).json({
        message: "Please provide valid booking details.",
      });
    }

    if (
      seats.some(seat => typeof seat !== "string") ||
      new Set(seats).size !== seats.length
    ) {
      return res.status(400).json({
        message: "Invalid or duplicate seats.",
      });
    }

    const show = await Show.findOne({
      _id: showId,
      isActive: true,
    }).populate("movie");

    if (!show || !show.movie) {
      return res.status(404).json({
        message: "Active show or movie not found.",
      });
    }

    const validSeats = seats.every(seat => {
      const match = /^A([1-9]|1[0-9]|2[0-4])$/.exec(seat);
      return match && Number(match[1]) <= show.totalSeats;
    });

    if (!validSeats) {
      return res.status(400).json({
        message: "Selected seat is invalid for this screen.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const expectedAmount = seats.length * show.ticketPrice;

    // Atomic reservation prevents two users booking the same seats.
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        isActive: true,
        bookedSeats: { $nin: seats },
      },
      {
        $addToSet: { bookedSeats: { $each: seats } },
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(409).json({
        message: "Some seats are already booked. Please refresh.",
      });
    }

    reserved = true;

    const booking = await Booking.create({
      userId: req.userId,
      showId,
      movieName: show.movie.title,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      showTime: show.showTime,
      seats,
      totalAmount: expectedAmount,
    });

    reserved = false;

    return res.status(201).json({
      message: "Booking successful!",
      booking,
    });

  } catch (error) {
    console.error("Booking error:", error);

    if (reserved && req.body.showId && Array.isArray(req.body.seats)) {
      await Show.updateOne(
        { _id: req.body.showId },
        { $pull: { bookedSeats: { $in: req.body.seats } } }
      );
    }

    return res.status(500).json({
      message: "Booking failed.",
    });
  }
});

// Get logged-in user's bookings
app.get("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to fetch bookings." });
  }
});

// -------------------- WATCHLIST --------------------

// Get watchlist
app.get("/api/watchlist", authMiddleware, async (req, res) => {
  try {
    const items = await Watchlist.find({
      userId: req.userId,
    }).populate("movieId");

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch watchlist." });
  }
});

// Add movie to watchlist
app.post("/api/watchlist/:movieId", authMiddleware, async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID." });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const item = await Watchlist.findOneAndUpdate(
      { userId: req.userId, movieId },
      { $setOnInsert: { userId: req.userId, movieId } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Movie added to watchlist.",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to add movie." });
  }
});

// Remove movie from watchlist
app.delete("/api/watchlist/:movieId", authMiddleware, async (req, res) => {
  try {
    const result = await Watchlist.deleteOne({
      userId: req.userId,
      movieId: req.params.movieId,
    });

    res.json({
      message: result.deletedCount
        ? "Movie removed from watchlist."
        : "Movie was not in watchlist.",
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to remove movie." });
  }
});

// -------------------- REVIEWS AND RATINGS --------------------

// Get reviews of a movie
app.get("/api/reviews/:movieId", async (req, res) => {
  try {
    const reviews = await Review.find({
      movieId: req.params.movieId,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      count: reviews.length,
      averageRating: Number(averageRating.toFixed(1)),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch reviews." });
  }
});

// Add or update own review
app.post("/api/reviews/:movieId", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID." });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5 ||
      typeof comment !== "string" ||
      !comment.trim() ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Rating must be 1-5 and comment is required.",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const review = await Review.findOneAndUpdate(
      { userId: req.userId, movieId },
      {
        rating: Number(rating),
        comment: comment.trim(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      message: "Review saved.",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to save review." });
  }
});

// Delete own review
app.delete("/api/reviews/:reviewId", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      userId: req.userId,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.json({ message: "Review deleted." });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete review." });
  }
});

// -------------------- ADMIN DASHBOARD --------------------

app.get(
  "/api/admin/dashboard",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [
        users,
        movies,
        theaters,
        shows,
        bookings,
        revenue,
        reviews,
      ] = await Promise.all([
        User.countDocuments(),
        Movie.countDocuments(),
        Theater.countDocuments(),
        Show.countDocuments(),
        Booking.countDocuments(),
        Booking.aggregate([
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Review.countDocuments(),
      ]);

      res.json({
        users,
        movies,
        theaters,
        shows,
        bookings,
        reviews,
        totalRevenue: revenue[0]?.total || 0,
      });
    } catch (error) {
      res.status(500).json({
        message: "Unable to load admin dashboard.",
      });
    }
  }
);

// Admin can see all bookings
app.get(
  "/api/admin/bookings",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate("userId", "name email")
        .populate("showId")
        .sort({ createdAt: -1 });

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Unable to fetch all bookings." });
    }
  }
);

// -------------------- PAYMENT / NOTIFICATION STATUS --------------------

// These endpoints report configuration only.
// Real payment and messaging need provider integration and credentials.
app.get("/api/integrations/status", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    payment: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
      ? "Credentials configured; gateway implementation still required"
      : "Not configured",
    email: process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
      ? "Credentials configured; email implementation still required"
      : "Not configured",
    sms: process.env.SMS_API_KEY
      ? "Credentials configured; SMS implementation still required"
      : "Not configured",
  });
});

// -------------------- ERROR HANDLER --------------------

app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

// -------------------- SERVER START --------------------

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing.");
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
