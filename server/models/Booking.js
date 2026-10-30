
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    movieName: {
      type: String,
      required: true
    },

    customerName: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    showTime: {
      type: String,
      required: true
    },

    seats: {
      type: [String],
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
