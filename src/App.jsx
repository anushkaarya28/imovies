
import { useState } from "react";
import Auth from "./components/auth.jsx";
import "./App.css";

const API_URL = "https://imovies-backend-lu6f.onrender.com";

const movies = [
  {
    id: 1,
    name: "Interstellar",
    genre: "Sci-Fi / Adventure",
    image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: 2,
    name: "Inception",
    genre: "Sci-Fi / Thriller",
    image: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },
  {
    id: 3,
    name: "The Dark Knight",
    genre: "Action / Crime",
    image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    id: 4,
    name: "Avatar",
    genre: "Sci-Fi / Fantasy",
    image: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
  },
];

const showTimes = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"];
const seatPrice = 200;
const allSeats = Array.from({ length: 24 }, (_, i) => `A${i + 1}`);

async function readResponse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Server returned an invalid response.");
  }
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [selectedMovie, setSelectedMovie] = useState(movies[0]);
  const [selectedTime, setSelectedTime] = useState(showTimes[0]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [activePage, setActivePage] = useState("home");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setCustomerName(loggedInUser.name || "");
    setEmail(loggedInUser.email || "");
    setMessage("");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setSelectedSeats([]);
    setBookings([]);
    setActivePage("home");
    setMessage("");
    setBookingsError("");
  }

  function toggleSeat(seat) {
    setSelectedSeats((previous) =>
      previous.includes(seat)
        ? previous.filter((item) => item !== seat)
        : [...previous, seat]
    );

    setMessage("");
  }

  async function loadBookings() {
    setActivePage("bookings");
    setBookingsLoading(true);
    setBookingsError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await readResponse(response);

      if (response.status === 401) {
        handleLogout();
        throw new Error("Your session has expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load bookings.");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      setBookingsError(error.message);
    } finally {
      setBookingsLoading(false);
    }
  }

  async function handleBooking(event) {
    event.preventDefault();

    if (selectedSeats.length === 0) {
      setMessage("Please select at least one seat.");
      return;
    }

    if (!customerName.trim() || !email.trim()) {
      setMessage("Please enter your name and email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieName: selectedMovie.name,
          customerName: customerName.trim(),
          email: email.trim(),
          showTime: selectedTime,
          seats: selectedSeats,
          totalAmount: selectedSeats.length * seatPrice,
        }),
      });

      const data = await readResponse(response);

      if (response.status === 401) {
        handleLogout();
        throw new Error("Your session has expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Booking failed.");
      }

      setMessage(
        `Booking successful! ${selectedSeats.length} seat(s) booked for ${selectedMovie.name}.`
      );

      setSelectedSeats([]);
    } catch (error) {
      setMessage(error.message || "Unable to complete booking.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="bg-dark text-white min-vh-100">
      <nav className="navbar navbar-dark bg-black px-3 px-md-5 py-3">
        <span
          className="navbar-brand text-danger fw-bold fs-3"
          role="button"
          onClick={() => setActivePage("home")}
        >
          🎬 IMovies
        </span>

        <div className="d-flex align-items-center gap-2 gap-md-3">
          <button
            className={`btn ${
              activePage === "home" ? "btn-danger" : "btn-outline-light"
            }`}
            onClick={() => setActivePage("home")}
          >
            Home
          </button>

          <button
            className={`btn ${
              activePage === "bookings" ? "btn-danger" : "btn-outline-light"
            }`}
            onClick={loadBookings}
          >
            My Bookings
          </button>

          <span className="text-light d-none d-lg-inline">
            Hi, {user.name}!
          </span>

          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {activePage === "home" ? (
        <main className="container py-5">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold">
              Book Your <span className="text-danger">Movie</span> Tickets
            </h1>
            <p className="text-secondary">
              Choose your favourite movie, showtime and seats.
            </p>
          </div>

          <h2 className="fw-bold mb-4">Now Showing</h2>

          <div className="row g-4 mb-5">
            {movies.map((movie) => (
              <div className="col-6 col-md-3" key={movie.id}>
                <div
                  role="button"
                  className={`card h-100 bg-black text-white ${
                    selectedMovie.id === movie.id
                      ? "border-danger border-3"
                      : "border-secondary"
                  }`}
                  onClick={() => {
                    setSelectedMovie(movie);
                    setMessage("");
                  }}
                >
                  <img
                    src={movie.image}
                    alt={movie.name}
                    className="card-img-top"
                    style={{ height: "280px", objectFit: "cover" }}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="card-body">
                    <h5 className="card-title fw-bold">{movie.name}</h5>
                    <p className="text-secondary small">{movie.genre}</p>

                    <button
                      type="button"
                      className={`btn w-100 ${
                        selectedMovie.id === movie.id
                          ? "btn-danger"
                          : "btn-outline-light"
                      }`}
                    >
                      {selectedMovie.id === movie.id ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-black border-secondary text-white mb-4">
            <div className="card-body p-4">
              <h3 className="fw-bold mb-3">Select Show Time</h3>

              <div className="d-flex flex-wrap gap-2">
                {showTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`btn ${
                      selectedTime === time
                        ? "btn-danger"
                        : "btn-outline-light"
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-black border-secondary text-white mb-4">
            <div className="card-body p-4">
              <h3 className="fw-bold mb-2">Select Your Seats</h3>

              <p className="text-secondary">
                Screen is at the top. Each seat costs ₹{seatPrice}.
              </p>

              <div
                className="bg-secondary text-center text-dark rounded py-2 mb-4 mx-auto"
                style={{ maxWidth: "450px" }}
              >
                SCREEN
              </div>

              <div
                className="d-flex flex-wrap justify-content-center gap-2 mx-auto"
                style={{ maxWidth: "480px" }}
              >
                {allSeats.map((seat) => {
                  const isSelected = selectedSeats.includes(seat);

                  return (
                    <button
                      key={seat}
                      type="button"
                      className={`btn btn-sm ${
                        isSelected ? "btn-danger" : "btn-outline-success"
                      }`}
                      style={{ width: "58px" }}
                      onClick={() => toggleSeat(seat)}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>

              <div className="d-flex justify-content-center flex-wrap gap-4 mt-4 small">
                <span>
                  <span className="text-success">●</span> Available
                </span>
                <span>
                  <span className="text-danger">●</span> Selected
                </span>
              </div>
            </div>
          </div>

          <div className="card bg-black border-secondary text-white">
            <div className="card-body p-4">
              <h3 className="fw-bold mb-4">Booking Details</h3>

              <form onSubmit={handleBooking}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Customer Name</label>
                    <input
                      className="form-control"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <hr className="border-secondary my-4" />

                <div className="d-flex justify-content-between mb-2">
                  <span>Movie</span>
                  <strong>{selectedMovie.name}</strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Show Time</span>
                  <strong>{selectedTime}</strong>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Selected Seats</span>
                  <strong>{selectedSeats.join(", ") || "None"}</strong>
                </div>

                <div className="d-flex justify-content-between fs-5 mt-3">
                  <strong>Total Amount</strong>
                  <strong className="text-danger">
                    ₹{selectedSeats.length * seatPrice}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="btn btn-danger btn-lg w-100 mt-4 fw-bold"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </button>
              </form>

              {message && (
                <div className="alert alert-info mt-3 mb-0" role="alert">
                  {message}
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <main className="container py-5">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h1 className="fw-bold">
                My <span className="text-danger">Bookings</span>
              </h1>
              <p className="text-secondary mb-0">
                Your personal movie ticket booking history.
              </p>
            </div>

            <button
              className="btn btn-outline-light"
              onClick={loadBookings}
              disabled={bookingsLoading}
            >
              Refresh
            </button>
          </div>

          {bookingsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status" />
              <p className="mt-3 text-secondary">Loading your bookings...</p>
            </div>
          ) : bookingsError ? (
            <div className="alert alert-danger">{bookingsError}</div>
          ) : bookings.length === 0 ? (
            <div className="card bg-black border-secondary text-white text-center p-5">
              <h3>No bookings yet!</h3>
              <p className="text-secondary">
                Book your favourite movie to see it here.
              </p>
              <button
                className="btn btn-danger mx-auto"
                onClick={() => setActivePage("home")}
              >
                Book a Movie
              </button>
            </div>
          ) : (
            <>
              <p className="text-secondary mb-3">
                Total bookings: {bookings.length}
              </p>

              <div className="row g-4">
                {bookings.map((booking) => (
                  <div className="col-md-6 col-lg-4" key={booking._id}>
                    <div className="card bg-black border-secondary text-white h-100">
                      <div className="card-body p-4">
                        <span className="badge bg-danger mb-3">
                          Booking Confirmed
                        </span>

                        <h4 className="fw-bold">{booking.movieName}</h4>

                        <hr className="border-secondary" />

                        <p className="mb-2">
                          <strong>Customer:</strong> {booking.customerName}
                        </p>

                        <p className="mb-2">
                          <strong>Email:</strong> {booking.email}
                        </p>

                        <p className="mb-2">
                          <strong>Show Time:</strong> {booking.showTime}
                        </p>

                        <p className="mb-2">
                          <strong>Seats:</strong>{" "}
                          {(booking.seats || []).join(", ")}
                        </p>

                        <p className="mb-2">
                          <strong>Booking Date:</strong>{" "}
                          {booking.createdAt
                            ? new Date(booking.createdAt).toLocaleDateString()
                            : "Not available"}
                        </p>

                        <div className="d-flex justify-content-between align-items-center mt-4">
                          <strong>Total Amount</strong>
                          <h4 className="text-danger mb-0">
                            ₹{booking.totalAmount}
                          </h4>
                        </div>

                        <p className="text-secondary small mt-3 mb-0">
                          Booking ID: {booking._id}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      )}

      <footer className="bg-black text-center text-secondary py-4">
        © 2026 IMovies. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
