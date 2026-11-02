
require("dotenv").config();

const mongoose = require("mongoose");
const Movie = require("./models/Movie");
const Theater = require("./models/Theater");
const Show = require("./models/Show");

async function seedShows() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingShows = await Show.countDocuments();

    if (existingShows > 0) {
      console.log("Shows already exist. No changes made.");
      return;
    }

    const movies = await Movie.find();
    const theaters = await Theater.find({ isActive: true });

    if (movies.length === 0 || theaters.length === 0) {
      console.log("Please add movies and theaters first.");
      return;
    }

    const showTimes = ["10:00 AM", "1:00 PM", "4:00 PM"];

    // Create shows for the next 7 days
    const shows = [];

    for (const movie of movies) {
      for (const theater of theaters) {
        for (const time of showTimes) {
          for (let day = 0; day < 7; day++) {
            const showDate = new Date();
            showDate.setDate(showDate.getDate() + day);
            showDate.setHours(0, 0, 0, 0);

            shows.push({
              movie: movie._id,
              theater: theater._id,
              screenNumber: 1,
              showDate,
              showTime: time,
              ticketPrice: 200,
              totalSeats: 24,
              bookedSeats: [],
              isActive: true
            });
          }
        }
      }
    }

    await Show.insertMany(shows);

    console.log(`${shows.length} shows added successfully!`);
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedShows();
