
const express = require("express");
const Theater = require("../models/Theater");
const authMiddleware = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all active theaters
router.get("/", async (req, res) => {
  try {
    const theaters = await Theater.find({ isActive: true });
    res.json({ success: true, theaters });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch theaters" });
  }
});

// Add theater - Admin only
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json({ success: true, theater });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update theater - Admin only
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const theater = await Theater.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!theater) return res.status(404).json({ message: "Theater not found" });
    res.json({ success: true, theater });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete theater - Admin only
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);
    if (!theater) return res.status(404).json({ message: "Theater not found" });
    res.json({ success: true, message: "Theater deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
