
import { useState } from "react";
import "./App.css";

const movies = [
  {
    id: 1,
    title: "Interstellar",
    genre: "Sci-Fi · Adventure",
    rating: "8.7",
    image:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: 2,
    title: "Inception",
    genre: "Action · Sci-Fi",
    rating: "8.8",
    image:
      "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },
  {
    id: 3,
    title: "The Dark Knight",
    genre: "Action · Crime",
    rating: "9.0",
    image:
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    id: 4,
    title: "Avatar",
    genre: "Fantasy · Adventure",
    rating: "7.9",
    image:
      "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
  },
];

export default function App() {
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showtime, setShowtime] = useState("6:30 PM");
  const [seats, setSeats] = useState([]);

  const visibleMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSeat = (seat) => {
    setSeats((current) =>
      current.includes(seat)
        ? current.filter((item) => item !== seat)
        : [...current, seat]
    );
  };

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#">
          i<span>MOVIES</span>
        </a>
        <nav>
          <a href="#movies">Movies</a>
          <a href="#about">About</a>
        </nav>
        <a className="nav-button" href="#movies">Book tickets</a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">YOUR NEXT MOVIE NIGHT STARTS HERE</p>
            <h1>Stories worth<br />watching.</h1>
            <p className="hero-copy">
              Discover amazing movies. Pick your seats.
              Make it a night to remember.
            </p>
            <a className="primary-button" href="#movies">
              Explore movies <span>↗</span>
            </a>
          </div>
          <div className="hero-note">
            <span className="live-dot" /> YOUR CINEMA, YOUR WAY
          </div>
        </section>

        <section className="movies-section" id="movies">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NOW SHOWING</p>
              <h2>Find your film<span>.</span></h2>
            </div>
            <input
              className="search"
              placeholder="Search movies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="movie-grid">
            {visibleMovies.map((movie) => (
              <article className="movie-card" key={movie.id}>
                <button
                  className="poster-button"
                  onClick={() => {
                    setSelectedMovie(movie);
                    setSeats([]);
                  }}
                  aria-label={`Book ${movie.title}`}
                >
                  <img src={movie.image} alt={movie.title} />
                  <span className="poster-rating">★ {movie.rating}</span>
                  <span className="poster-action">BOOK NOW ↗</span>
                </button>
                <div className="movie-info">
                  <div>
                    <h3>{movie.title}</h3>
                    <p>{movie.genre}</p>
                  </div>
                  <button
                    className="round-button"
                    onClick={() => {
                      setSelectedMovie(movie);
                      setSeats([]);
                    }}
                    aria-label={`Select ${movie.title}`}
                  >
                    ↗
                  </button>
                </div>
              </article>
            ))}
            {visibleMovies.length === 0 && (
              <p>No movies found. Try another title.</p>
            )}
          </div>
        </section>

        <section className="booking-section" id="booking">
          <p className="eyebrow">SIMPLE. QUICK. CINEMATIC.</p>
          <h2>Your seat. Your story.</h2>
          <p>Choose a movie above to start your demo booking.</p>
          {selectedMovie && (
            <div className="booking-panel">
              <button
                className="close-button"
                onClick={() => setSelectedMovie(null)}
              >
                Close ✕
              </button>
              <h3>{selectedMovie.title}</h3>
              <p>Select a showtime</p>
              <div className="showtimes">
                {["12:30 PM", "3:30 PM", "6:30 PM", "9:30 PM"].map((time) => (
                  <button
                    key={time}
                    className={showtime === time ? "time active" : "time"}
                    onClick={() => setShowtime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <p>Select your seats</p>
              <div className="screen">SCREEN THIS WAY</div>
              <div className="seat-grid">
                {Array.from({ length: 30 }, (_, index) => {
                  const seat = `S${index + 1}`;
                  return (
                    <button
                      key={seat}
                      className={`seat ${seats.includes(seat) ? "chosen" : ""}`}
                      onClick={() => toggleSeat(seat)}
                      aria-label={seat}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="booking-total">
                <div>
                  <p>{seats.length} seat(s) · {showtime}</p>
                  <strong>₹{seats.length * 200}</strong>
                </div>
                <button
                  className="primary-button"
                  disabled={seats.length === 0}
                  onClick={() =>
                    alert(
                      `Demo booking confirmed!\nMovie: ${selectedMovie.title}\nShow: ${showtime}\nSeats: ${seats.join(", ")}\nTotal: ₹${seats.length * 200}`
                    )
                  }
                >
                  Confirm demo booking
                </button>
              </div>
              <p className="demo-note">
                Demo only: bookings are not saved to a server.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer id="about">
        <a className="logo" href="#">i<span>MOVIES</span></a>
        <p>Made for movie lovers. © {new Date().getFullYear()} IMovies</p>
      </footer>
    </div>
  );
}
