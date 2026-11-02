
require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("./models/Movie");

const movies = [
  {
    title: "Interstellar",
    genre: "Sci-Fi, Drama",
    language: "English",
    duration: 169,
    rating: 8.7,
    cast: ["Matthew McConaughey", "Anne Hathaway"],
    releaseDate: new Date("2014-11-07"),
    description: "A journey through space and time to save humanity.",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
  },
  {
    title: "Inception",
    genre: "Sci-Fi, Action",
    language: "English",
    duration: 148,
    rating: 8.8,
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
    releaseDate: new Date("2010-07-16"),
    description: "A skilled thief enters people's dreams to steal secrets.",
    posterUrl: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
  },
  {
    title: "The Dark Knight",
    genre: "Action, Crime",
    language: "English",
    duration: 152,
    rating: 9.0,
    cast: ["Christian Bale", "Heath Ledger"],
    releaseDate: new Date("2008-07-18"),
    description: "Batman faces the Joker in Gotham City.",
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
  },
  {
    title: "Avatar",
    genre: "Sci-Fi, Adventure",
    language: "English",
    duration: 162,
    rating: 7.9,
    cast: ["Sam Worthington", "Zoe Saldana"],
    releaseDate: new Date("2009-12-18"),
    description: "A human joins the Na'vi on the planet Pandora.",
    posterUrl: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg"
  }
];

async function seedMovies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Movie.countDocuments();

    if (count > 0) {
      console.log("Movies already exist. No changes made.");
      return;
    }

    await Movie.insertMany(movies);
    console.log("4 movies added successfully!");
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedMovies();
