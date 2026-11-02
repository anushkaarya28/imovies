
const express = require("express");
const Movie = require("../models/Movie");
const authMiddleware = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch movies" });
  }
});

// Get one movie
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ success: true, movie });
  } catch (error) {
    res.status(400).json({ message: "Invalid movie ID" });
  }
});

// Add movie - Admin only
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, movie });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update movie - Admin only
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ success: true, movie });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete movie - Admin only
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ success: true, message: "Movie deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
