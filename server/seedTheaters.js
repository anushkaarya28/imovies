
require("dotenv").config();
const mongoose = require("mongoose");
const Theater = require("./models/Theater");

const theaters = [
  {
    name: "PVR Cinemas",
    location: "Treasure Island Mall",
    city: "Indore",
    screens: 4,
    facilities: ["Parking", "Food Court", "Dolby Sound", "Recliner Seats"],
    isActive: true
  },
  {
    name: "INOX Cinemas",
    location: "C21 Mall",
    city: "Indore",
    screens: 3,
    facilities: ["Parking", "Food Court", "3D", "Dolby Sound"],
    isActive: true
  },
  {
    name: "Cinepolis",
    location: "Aashima Mall",
    city: "Bhopal",
    screens: 4,
    facilities: ["Parking", "Food Court", "Recliner Seats"],
    isActive: true
  }
];

async function seedTheaters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const count = await Theater.countDocuments();

    if (count > 0) {
      console.log("Theaters already exist. No changes made.");
      return;
    }

    await Theater.insertMany(theaters);
    console.log("3 theaters added successfully!");
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedTheaters();
