
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    rating: {
      type: Number,
      default: 0
    },
    cast: {
      type: [String],
      default: []
    },
    releaseDate: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    posterUrl: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
