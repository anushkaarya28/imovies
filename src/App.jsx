
import { useState } from "react";

const movies = [
  "Interstellar",
  "Inception",
  "The Dark Knight",
  "Avatar"
];

const showTimes = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"];

const seatsList = [
  "A1", "A2", "A3", "A4",
  "B1", "B2", "B3", "B4",
  "C1", "C2", "C3", "C4"
];

function App() {
  const [movieName, setMovieName] = useState("Interstellar");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [showTime, setShowTime] = useState("10:00 AM");
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const ticketPrice = 200;
  const totalAmount = seats.length * ticketPrice;

  const toggleSeat = (seat) => {
    setSeats((previous) =>
      previous.includes(seat)
        ? previous.filter((item) => item !== seat)
        : [...previous, seat]
    );
  };

  const bookTicket = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!customerName.trim() || !email.trim() || seats.length === 0) {
      setMessage("Please fill all details and select at least one seat.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            movieName,
            customerName,
            email,
            showTime,
            seats,
            totalAmount
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      setMessage("Booking successful! Your ticket has been saved.");
      setCustomerName("");
      setEmail("");
      setSeats([]);

    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#101018",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: "25px"
    },
    container: {
      maxWidth: "850px",
      margin: "auto"
    },
    card: {
      background: "#20202d",
      padding: "25px",
      borderRadius: "15px",
      marginTop: "25px"
    },
    input: {
      width: "100%",
      padding: "12px",
      marginTop: "8px",
      marginBottom: "18px",
      boxSizing: "border-box",
      borderRadius: "8px",
      border: "1px solid #555",
      background: "#303040",
      color: "white",
      fontSize: "16px"
    },
    button: {
      padding: "13px",
      border: "none",
      borderRadius: "8px",
      background: "#e63946",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: "16px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={{ color: "#e63946", fontSize: "36px" }}>
          IMovies 🎬
        </h1>

        <p>Book your favourite movie tickets online!</p>

        <form style={styles.card} onSubmit={bookTicket}>
          <h2>Book Your Movie Ticket</h2>

          <label>Choose Movie</label>
          <select
            style={styles.input}
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
          >
            {movies.map((movie) => (
              <option key={movie} value={movie}>
                {movie}
              </option>
            ))}
          </select>

          <label>Your Name</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter your name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />

          <label>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Select Show Time</label>
          <select
            style={styles.input}
            value={showTime}
            onChange={(e) => setShowTime(e.target.value)}
          >
            {showTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>

          <h3>Select Your Seats</h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            marginBottom: "20px"
          }}>
            {seatsList.map((seat) => (
              <button
                key={seat}
                type="button"
                onClick={() => toggleSeat(seat)}
                style={{
                  padding: "14px 5px",
                  borderRadius: "8px",
                  border: "1px solid #777",
                  background: seats.includes(seat) ? "#e63946" : "#303040",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                {seat}
              </button>
            ))}
          </div>

          <h3>Ticket Price: ₹{ticketPrice}</h3>
          <h2>Total Amount: ₹{totalAmount}</h2>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              width: "100%",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>

          {message && (
            <p style={{
              marginTop: "20px",
              color: message.startsWith("Booking successful")
                ? "#55dd88"
                : "#ff7777"
            }}>
              {message}
            </p>
          )}
        </form>

        <p style={{ textAlign: "center", marginTop: "30px" }}>
          © 2026 IMovies. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

export default App;
