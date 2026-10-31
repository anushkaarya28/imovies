
import { useState } from "react";
import "./App.css";

const API_URL = "https://imovies-backend-lu6f.onrender.com";

const movies = [
  {
    id: 1,
    name: "Interstellar",
    genre: "Sci-Fi",
    image:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: 2,
    name: "Inception",
    genre: "Thriller",
    image:
      "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },
  {
    id: 3,
    name: "The Dark Knight",
    genre: "Action",
    image:
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    id: 4,
    name: "Avatar",
    genre: "Adventure",
    image:
      "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
  },
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
  const [messageType, setMessageType] = useState("success");
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
      setMessageType("danger");
      setMessage("Please enter your name and email.");
      return;
    }

    if (seats.length === 0) {
      setMessageType("danger");
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
      setMessageType("success");
      setSeats([]);
      setCustomerName("");
      setEmail("");
    } catch (error) {
      setMessage(
        "Booking failed. Please check your internet connection and try again."
      );
      setMessageType("danger");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-black text-white min-vh-100">
      {/* Header */}
      <header className="bg-dark py-3 shadow">
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="text-danger fw-bold mb-0">🎬 IMovies</h1>
          <span className="text-light">Your Movie, Your Experience</span>
        </div>
      </header>

      <main className="container py-5">
        {/* Movies */}
        <h2 className="text-danger fw-bold mb-4">Now Showing</h2>

        <div className="row g-4">
          {movies.map((item) => (
            <div className="col-6 col-md-4 col-lg-3" key={item.id}>
              <div
                className={`card h-100 bg-dark text-white ${
                  movie.id === item.id
                    ? "border border-danger border-3"
                    : "border-secondary"
                }`}
                onClick={() => {
                  setMovie(item);
                  setSeats([]);
                  setMessage("");
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setMovie(item);
                    setSeats([]);
                    setMessage("");
                  }
                }}
              >
                <img
                  src={item.image}
                  className="card-img-top"
                  alt={item.name}
                  style={{ height: "250px", objectFit: "cover" }}
                />

                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">{item.name}</h5>
                  <p className="text-secondary">{item.genre}</p>

                  <button
                    type="button"
                    className={`btn ${
                      movie.id === item.id
                        ? "btn-danger"
                        : "btn-outline-danger"
                    } w-100`}
                  >
                    {movie.id === item.id ? "Selected" : "Select Movie"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Section */}
        <section className="bg-dark rounded-4 p-3 p-md-4 mt-5 shadow">
          <h2 className="text-danger fw-bold mb-4">
            Book Your Tickets
          </h2>

          <p className="fs-5">
            Selected Movie: <strong>{movie.name}</strong>
          </p>

          {/* Show Time */}
          <h4 className="mt-4 mb-3">Select Show Time</h4>

          <div className="d-flex flex-wrap gap-2">
            {showTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setShowTime(time)}
                className={`btn ${
                  showTime === time
                    ? "btn-danger"
                    : "btn-outline-light"
                }`}
              >
                {time}
              </button>
            ))}
          </div>

          {/* Seats */}
          <h4 className="mt-5 mb-3">Select Your Seats</h4>

          <div className="bg-light text-dark text-center py-2 rounded-pill mx-auto mb-4"
            style={{ maxWidth: "350px" }}
          >
            SCREEN THIS WAY
          </div>

          <div
            className="d-grid gap-2 mx-auto"
            style={{
              gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
              maxWidth: "450px",
            }}
          >
            {allSeats.map((seat) => (
              <button
                key={seat}
                type="button"
                onClick={() => toggleSeat(seat)}
                className={`btn btn-sm ${
                  seats.includes(seat)
                    ? "btn-danger"
                    : "btn-outline-secondary"
                }`}
              >
                {seat}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-secondary mb-1">
              Ticket Price: ₹{price} per seat
            </p>

            <p>
              Selected Seats:{" "}
              <strong>
                {seats.length ? seats.join(", ") : "None"}
              </strong>
            </p>

            <h3 className="text-danger fw-bold">
              Total Amount: ₹{total}
            </h3>
          </div>

          {/* Customer Form */}
          <h4 className="mt-4 mb-3">Your Details</h4>

          <form
            onSubmit={bookTickets}
            className="d-grid gap-3"
            style={{ maxWidth: "500px" }}
          >
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              placeholder="Enter your full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />

            <input
              type="email"
              className="form-control bg-dark text-white border-secondary"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-danger w-100 fw-bold py-3"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`alert alert-${messageType} mt-4`}
              role="alert"
              style={{ maxWidth: "500px" }}
            >
              {message}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-center text-secondary py-4 mt-4">
        © 2026 IMovies | Movie Ticket Booking
      </footer>
    </div>
  );
}

export default App;
