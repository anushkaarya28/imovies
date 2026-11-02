
import { useEffect, useState, useCallback } from "react";
import Auth from "./components/auth.jsx";
import "./App.css";

const API_URL = "https://imovies-backend-lu6f.onrender.com";
const SEATS = Array.from({ length: 24 }, (_, i) => `A${i + 1}`);

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid server response.");
  }

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);

  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [bookings, setBookings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const [activePage, setActivePage] = useState("home");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [adminStats, setAdminStats] = useState(null);

  const seatPrice = selectedShow?.ticketPrice || 200;

  const loadMovies = useCallback(async () => {
    try {
      const data = await apiRequest("/api/movies");
      const list = Array.isArray(data) ? data : data.movies || [];

      setMovies(list);

      if (list.length > 0) {
        setSelectedMovie((previous) =>
          list.find((movie) => movie._id === previous?._id) || list[0]
        );
      }
    } catch (error) {
      setMessage(error.message);
    }
  }, []);

  const loadShows = useCallback(async (movieId) => {
    if (!movieId) return;

    setSelectedShow(null);
    setSelectedSeats([]);
    setBookedSeats([]);
    setShows([]);

    try {
      const data = await apiRequest(
        `/api/shows?movie=${movieId}`
      );

      const list = Array.isArray(data) ? data : data.shows || [];
      setShows(list);
    } catch (error) {
      setMessage(error.message);
    }
  }, []);

  const loadSeats = useCallback(async (showId) => {
    if (!showId) return;

    try {
      const data = await apiRequest(`/api/shows/${showId}/seats`);
      setBookedSeats(data.bookedSeats || []);
      setSelectedSeats([]);
    } catch (error) {
      setMessage(error.message);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || "");
      setEmail(user.email || "");
      loadMovies();
    }
  }, [user, loadMovies]);

  useEffect(() => {
    if (selectedMovie?._id) {
      loadShows(selectedMovie._id);
    }
  }, [selectedMovie, loadShows]);

  async function handleSelectShow(show) {
    setSelectedShow(show);
    setSelectedSeats([]);
    setMessage("");
    await loadSeats(show._id);
  }

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
    setMovies([]);
    setBookings([]);
    setWatchlist([]);
    setSelectedSeats([]);
    setActivePage("home");
  }

  function toggleSeat(seat) {
    if (bookedSeats.includes(seat)) return;

    setSelectedSeats((previous) =>
      previous.includes(seat)
        ? previous.filter((item) => item !== seat)
        : [...previous, seat]
    );

    setMessage("");
  }

  async function handleBooking(event) {
    event.preventDefault();

    if (!selectedShow) {
      setMessage("Please select a show first.");
      return;
    }

    if (selectedSeats.length === 0) {
      setMessage("Please select at least one seat.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          showId: selectedShow._id,
          customerName: customerName.trim(),
          email: email.trim(),
          seats: selectedSeats,
        }),
      });

      setMessage(data.message || "Booking successful!");
      setSelectedSeats([]);

      await loadSeats(selectedShow._id);
      await loadBookings();
    } catch (error) {
      setMessage(error.message);
      await loadSeats(selectedShow._id);
    } finally {
      setLoading(false);
    }
  }

  async function loadBookings() {
    setPageLoading(true);
    setActivePage("bookings");

    try {
      const data = await apiRequest("/api/bookings");
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPageLoading(false);
    }
  }

  async function loadWatchlist() {
    setPageLoading(true);
    setActivePage("watchlist");

    try {
      const data = await apiRequest("/api/watchlist");
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPageLoading(false);
    }
  }

  async function toggleWatchlist(movieId) {
    const exists = watchlist.some(
      (item) => (item.movieId?._id || item.movieId) === movieId
    );

    try {
      if (exists) {
        await apiRequest(`/api/watchlist/${movieId}`, {
          method: "DELETE",
        });
        setMessage("Removed from watchlist.");
      } else {
        await apiRequest(`/api/watchlist/${movieId}`, {
          method: "POST",
          body: JSON.stringify({}),
        });
        setMessage("Added to watchlist.");
      }

      const data = await apiRequest("/api/watchlist");
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadReviews(movieId) {
    if (!movieId) return;

    try {
      const data = await apiRequest(`/api/reviews/${movieId}`);
      setReviews(data.reviews || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitReview(event) {
    event.preventDefault();

    if (!selectedMovie) return;

    try {
      await apiRequest(`/api/reviews/${selectedMovie._id}`, {
        method: "POST",
        body: JSON.stringify({
          rating: Number(reviewRating),
          comment: reviewText,
        }),
      });

      setReviewText("");
      setMessage("Review submitted successfully!");
      await loadReviews(selectedMovie._id);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadAdminDashboard() {
    setActivePage("admin");
    setPageLoading(true);

    try {
      const data = await apiRequest("/api/admin/dashboard");
      setAdminStats(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPageLoading(false);
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

        <div className="d-flex align-items-center flex-wrap gap-2">
          <button
            className={`btn ${activePage === "home" ? "btn-danger" : "btn-outline-light"}`}
            onClick={() => setActivePage("home")}
          >
            Home
          </button>

          <button
            className="btn btn-outline-light"
            onClick={loadBookings}
          >
            My Bookings
          </button>

          <button
            className="btn btn-outline-light"
            onClick={loadWatchlist}
          >
            Watchlist
          </button>

          <button
            className="btn btn-outline-warning"
            onClick={loadAdminDashboard}
          >
           Admin Dashboard
          </button>

          <span className="d-none d-md-inline">
            Hi, {user.name}!
          </span>

          <button
            className="btn btn-outline-danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {message && (
        <div className="container mt-3">
          <div className="alert alert-info">{message}</div>
        </div>
      )}

      {activePage === "home" && (
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

          {movies.length === 0 ? (
            <div className="alert alert-warning">
              No movies available. Please add movies from the admin panel.
            </div>
          ) : (
            <div className="row g-4 mb-5">
              {movies.map((movie) => (
                <div className="col-6 col-md-3" key={movie._id}>
                  <div
                    role="button"
                    className={`card h-100 bg-black text-white ${
                      selectedMovie?._id === movie._id
                        ? "border-danger border-3"
                        : "border-secondary"
                    }`}
                    onClick={() => {
                      setSelectedMovie(movie);
                      setSelectedShow(null);
                      setMessage("");
                      loadReviews(movie._id);
                    }}
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="card-img-top"
                      style={{ height: "280px", objectFit: "cover" }}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="card-body">
                      <h5 className="fw-bold">{movie.title}</h5>
                      <p className="text-secondary small">
                        {movie.genre || "Movie"}
                      </p>

                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleWatchlist(movie._id);
                        }}
                      >
                        ♡ Watchlist
                      </button>

                      <p className="small text-success mt-2 mb-0">
                        {selectedMovie?._id === movie._id
                          ? "Selected"
                          : "Select movie"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedMovie && (
            <>
              <div className="card bg-black border-secondary text-white mb-4">
                <div className="card-body p-4">
                  <h3 className="fw-bold mb-3">
                    Available Shows - {selectedMovie.title}
                  </h3>

                  {shows.length === 0 ? (
                    <p className="text-warning">
                      No shows available for this movie.
                    </p>
                  ) : (
                    <div className="row g-3">
                      {shows.map((show) => (
                        <div className="col-md-4" key={show._id}>
                          <button
                            className={`btn w-100 p-3 ${
                              selectedShow?._id === show._id
                                ? "btn-danger"
                                : "btn-outline-light"
                            }`}
                            onClick={() => handleSelectShow(show)}
                          >
                            <strong>{show.showTime}</strong>
                            <br />
                            <small>
                              {show.theater?.name || "Theater"}
                            </small>
                            <br />
                            <small>
                              ₹{show.ticketPrice} per seat
                            </small>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedShow && (
                <>
                  <div className="card bg-black border-secondary text-white mb-4">
                    <div className="card-body p-4">
                      <h3 className="fw-bold mb-2">Select Your Seats</h3>

                      <p className="text-secondary">
                        {selectedShow.theater?.name} | Screen{" "}
                        {selectedShow.screenNumber}
                      </p>

                      <p className="text-secondary">
                        Each seat costs ₹{seatPrice}.
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
                        {SEATS.slice(
                          0,
                          Math.min(selectedShow.totalSeats || 24, 24)
                        ).map((seat) => {
                          const isBooked = bookedSeats.includes(seat);
                          const isSelected = selectedSeats.includes(seat);

                          return (
                            <button
                              key={seat}
                              type="button"
                              disabled={isBooked}
                              className={`btn btn-sm ${
                                isBooked
                                  ? "btn-secondary"
                                  : isSelected
                                  ? "btn-danger"
                                  : "btn-outline-success"
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
                        <span className="text-success">Available</span>
                        <span className="text-danger">Selected</span>
                        <span className="text-secondary">Booked</span>
                      </div>

                      <button
                        className="btn btn-outline-light btn-sm mt-3"
                        onClick={() => loadSeats(selectedShow._id)}
                      >
                        Refresh Seat Availability
                      </button>
                    </div>
                  </div>

                  <div className="card bg-black border-secondary text-white mb-5">
                    <div className="card-body p-4">
                      <h3 className="fw-bold mb-4">Booking Details</h3>

                      <form onSubmit={handleBooking}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">
                              Customer Name
                            </label>
                            <input
                              className="form-control"
                              value={customerName}
                              onChange={(e) =>
                                setCustomerName(e.target.value)
                              }
                              required
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">
                              Email Address
                            </label>
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

                        <p>
                          <strong>Movie:</strong> {selectedMovie.title}
                        </p>
                        <p>
                          <strong>Show:</strong> {selectedShow.showTime}
                        </p>
                        <p>
                          <strong>Seats:</strong>{" "}
                          {selectedSeats.join(", ") || "None"}
                        </p>

                        <h4 className="text-danger">
                          Total: ₹{selectedSeats.length * seatPrice}
                        </h4>

                        <button
                          type="submit"
                          className="btn btn-danger btn-lg w-100 mt-3"
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Confirm Booking"}
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}

              <div className="card bg-black border-secondary text-white">
                <div className="card-body p-4">
                  <h3 className="fw-bold mb-3">Movie Reviews</h3>

                  <form onSubmit={submitReview}>
                    <label className="form-label">Your Rating</label>
                    <select
                      className="form-select mb-3"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                    >
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} / 5
                        </option>
                      ))}
                    </select>

                    <textarea
                      className="form-control mb-3"
                      placeholder="Write your review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    />

                    <button className="btn btn-danger" type="submit">
                      Submit Review
                    </button>
                  </form>

                  <hr className="border-secondary" />

                  {reviews.map((review) => (
                    <div key={review._id} className="mb-3">
                      <strong>
                        {review.userId?.name || "User"}
                      </strong>
                      <span className="text-warning ms-2">
                        {"★".repeat(review.rating)}
                      </span>
                      <p className="text-secondary mb-0">
                        {review.comment}
                      </p>
                    </div>
                  ))}

                  {reviews.length === 0 && (
                    <p className="text-secondary">No reviews yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      )}

      {activePage === "bookings" && (
        <main className="container py-5">
          <h1 className="fw-bold mb-4">
            My <span className="text-danger">Bookings</span>
          </h1>

          {pageLoading ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-secondary">No bookings yet.</p>
          ) : (
            <div className="row g-4">
              {bookings.map((booking) => (
                <div className="col-md-6 col-lg-4" key={booking._id}>
                  <div className="card bg-black border-secondary text-white h-100">
                    <div className="card-body p-4">
                      <span className="badge bg-danger mb-3">
                        Booking Confirmed
                      </span>
                      <h4>{booking.movieName}</h4>
                      <hr />
                      <p>Customer: {booking.customerName}</p>
                      <p>Show: {booking.showTime}</p>
                      <p>Seats: {(booking.seats || []).join(", ")}</p>
                      <h4 className="text-danger">
                        ₹{booking.totalAmount}
                      </h4>
                      <small className="text-secondary">
                        Booking ID: {booking._id}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {activePage === "watchlist" && (
        <main className="container py-5">
          <h1 className="fw-bold mb-4">My Watchlist</h1>

          {pageLoading ? (
            <p>Loading...</p>
          ) : watchlist.length === 0 ? (
            <p className="text-secondary">Your watchlist is empty.</p>
          ) : (
            <div className="row g-4">
              {watchlist.map((item) => {
                const movie = item.movieId;

                if (!movie || typeof movie !== "object") return null;

                return (
                  <div className="col-6 col-md-3" key={item._id}>
                    <div className="card bg-black text-white h-100">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="card-img-top"
                      />
                      <div className="card-body">
                        <h5>{movie.title}</h5>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => toggleWatchlist(movie._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      
{activePage === "admin" && (
  <main className="container py-5">
    <h1 className="fw-bold mb-4">Admin Dashboard</h1>

    {pageLoading ? (
      <p>Loading dashboard...</p>
    ) : adminStats?.stats ? (
      <div className="row g-3">
        <div className="col-6 col-md-4">
          <div className="card bg-black border-secondary text-white p-4">
            <h5 className="text-secondary">Total Users</h5>
            <h2 className="text-danger">
              {adminStats.stats.totalUsers}
            </h2>
          </div>
        </div>

        <div className="col-6 col-md-4">
          <div className="card bg-black border-secondary text-white p-4">
            <h5 className="text-secondary">Total Bookings</h5>
            <h2 className="text-danger">
              {adminStats.stats.totalBookings}
            </h2>
          </div>
        </div>
      </div>
    ) : (
      <p>No dashboard data available.</p>
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
