
const express = require("express");
const Show = require("../models/Show");
const authMiddleware = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Get shows, optionally filtered by movie or theater
router.get("/", async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.movie) filter.movie = req.query.movie;
    if (req.query.theater) filter.theater = req.query.theater;

    const shows = await Show.find(filter)
      .populate("movie")
      .populate("theater")
      .sort({ showDate: 1 });

    res.json({ success: true, shows });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch shows" });
  }
});

// Get available seats
router.get("/:id/seats", async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const bookedSeats = show.bookedSeats || [];
    res.json({
      success: true,
      totalSeats: show.totalSeats,
      bookedSeats,
      availableCount: show.totalSeats - bookedSeats.length
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid show ID" });
  }
});

// Add show - Admin only
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const show = await Show.create(req.body);
    res.status(201).json({ success: true, show });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update show - Admin only
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json({ success: true, show });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete show - Admin only
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json({ success: true, message: "Show deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
