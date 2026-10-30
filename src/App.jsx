
import { useState } from "react";
import "./App.css";

// Apne Render backend ka actual URL yahan paste karna
const API_URL = "https://imovies-backend-lu6f.onrender.com";

const movies = [
  { id: 1, name: "Interstellar", genre: "Sci-Fi", image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
  { id: 2, name: "Inception", genre: "Thriller", image: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg" },
  { id: 3, name: "The Dark Knight", genre: "Action", image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: 4, name: "Avatar", genre: "Adventure", image: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg" },
];

const showTimes = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"];
const allSeats = Array.from({ length: 24 }, (_, i) => {
  const row = String.fromCharCode(65 + Math.floor(i / 8));
  return `${row}${(i % 8) + 1}`;
});

function App() {
  const [movie, setMovie] = useState(movies[0]);
  const [showTime, setShowTime] = useState(showTimes[0]);
  const [seats, setSeats] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const price = 200;
  const total = seats.length * price;

  function toggleSeat(seat) {
    setSeats((previous) =>
      previous.includes(seat)
        ? previous.filter((item) => item !== seat)
        : [...previous, seat]
    );
  }

  async function bookTickets(event) {
    event.preventDefault();
    setMessage("");

    if (!customerName.trim() || !email.trim()) {
      setMessage("Please enter your name and email.");
      return;
    }

    if (seats.length === 0) {
      setMessage("Please select at least one seat.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieName: movie.name,
          customerName,
          email,
          showTime,
          seats,
          totalAmount: total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setMessage("Booking successful! Your tickets are booked.");
      setSeats([]);
      setCustomerName("");
      setEmail("");
    } catch (error) {
      setMessage(
        "Booking failed. Please check your internet connection and try again."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>🎬 IMovies</h1>
        <span style={styles.tagline}>Your Movie, Your Experience</span>
      </header>

      <main style={styles.container}>
        <h2 style={styles.heading}>Now Showing</h2>

        <div style={styles.movieGrid}>
          {movies.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setMovie(item);
                setSeats([]);
                setMessage("");
              }}
              style={{
                ...styles.movieCard,
                border:
                  movie.id === item.id
                    ? "3px solid #e50914"
                    : "2px solid #333",
              }}
            >
              <img src={item.image} alt={item.name} style={styles.poster} />
              <h3>{item.name}</h3>
              <p style={styles.genre}>{item.genre}</p>
              <button style={styles.selectButton}>
                {movie.id === item.id ? "Selected" : "Select Movie"}
              </button>
            </div>
          ))}
        </div>

        <section style={styles.bookingSection}>
          <h2>Book Your Tickets</h2>
          <p>
            Selected Movie: <strong>{movie.name}</strong>
          </p>

          <h3>Select Show Time</h3>
          <div style={styles.timeGrid}>
            {showTimes.map((time) => (
              <button
                key={time}
                onClick={() => setShowTime(time)}
                style={{
                  ...styles.timeButton,
                  background: showTime === time ? "#e50914" : "#292929",
                }}
              >
                {time}
              </button>
            ))}
          </div>

          <h3>Select Your Seats</h3>
          <div style={styles.screen}>SCREEN THIS WAY</div>

          <div style={styles.seatGrid}>
            {allSeats.map((seat) => (
              <button
                key={seat}
                onClick={() => toggleSeat(seat)}
                style={{
                  ...styles.seat,
                  background: seats.includes(seat) ? "#e50914" : "#333",
                }}
              >
                {seat}
              </button>
            ))}
          </div>

          <p style={styles.price}>Ticket Price: ₹{price} per seat</p>
          <p>Selected Seats: {seats.length ? seats.join(", ") : "None"}</p>
          <h3>Total Amount: ₹{total}</h3>

          <form onSubmit={bookTickets} style={styles.form}>
            <input
              type="text"
              placeholder="Enter your full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={styles.input}
              required
            />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />

            <button type="submit" disabled={loading} style={styles.bookButton}>
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </form>

          {message && <p style={styles.message}>{message}</p>}
        </section>
      </main>

      <footer style={styles.footer}>
        © 2026 IMovies | Movie Ticket Booking
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    background: "#1b1b1b",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  logo: { color: "#e50914", margin: 0 },
  tagline: { color: "#ccc" },
  container: { maxWidth: "1100px", margin: "auto", padding: "25px" },
  heading: { color: "#e50914" },
  movieGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
  },
  movieCard: {
    background: "#1b1b1b",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
    cursor: "pointer",
  },
  poster: { width: "100%", height: "230px", objectFit: "cover", borderRadius: "7px" },
  genre: { color: "#aaa" },
  selectButton: {
    background: "#e50914",
    color: "white",
    border: "none",
    padding: "9px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  bookingSection: {
    marginTop: "35px",
    padding: "25px",
    background: "#1b1b1b",
    borderRadius: "12px",
  },
  timeGrid: { display: "flex", gap: "10px", flexWrap: "wrap" },
  timeButton: {
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  screen: {
    background: "#ddd",
    color: "#111",
    textAlign: "center",
    padding: "10px",
    margin: "25px auto",
    maxWidth: "350px",
    borderRadius: "50% 50% 5px 5px",
  },
  seatGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(8, minmax(25px, 1fr))",
    gap: "9px",
    maxWidth: "450px",
    margin: "auto",
  },
  seat: {
    color: "white",
    border: "none",
    padding: "10px 2px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  price: { color: "#ccc", marginTop: "25px" },
  form: {
    display: "grid",
    gap: "12px",
    maxWidth: "450px",
    marginTop: "20px",
  },
  input: {
    padding: "13px",
    borderRadius: "5px",
    border: "1px solid #555",
    background: "#292929",
    color: "white",
  },
  bookButton: {
    padding: "14px",
    background: "#e50914",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  message: { color: "#4ade80", marginTop: "15px" },
  footer: {
    textAlign: "center",
    padding: "20px",
    color: "#aaa",
    background: "#1b1b1b",
    marginTop: "30px",
  },
};

export default App;
