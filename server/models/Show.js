
const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true
    },
    screenNumber: {
      type: Number,
      required: true,
      min: 1
    },
    showDate: {
      type: Date,
      required: true
    },
    showTime: {
      type: String,
      required: true
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 1
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1
    },
    bookedSeats: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Show", showSchema);
