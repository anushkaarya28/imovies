
import { useEffect, useState } from "react";

const API = "https://imovies-backend-lu6f.onrender.com";

export default function AdminManagement() {
  const token = localStorage.getItem("token");

  const [tab, setTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const emptyForms = {
    movies: {
      title: "", genre: "", language: "", duration: "",
      rating: "0", cast: "", releaseDate: "", description: "", posterUrl: ""
    },
    theaters: {
      name: "", location: "", city: "", screens: "1",
      facilities: ""
    },
    shows: {
      movie: "", theater: "", screenNumber: "1",
      showDate: "", showTime: "", ticketPrice: "200", totalSeats: "24"
    }
  };

  async function request(path, method = "GET", body) {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  }

  async function loadAll() {
    try {
      const [m, t, s] = await Promise.all([
        request("/api/movies"),
        request("/api/theaters"),
        request("/api/shows")
      ]);

      setMovies(m.movies || m);
      setTheaters(t.theaters || t);
      setShows(s.shows || s);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function startEdit(item) {
    setEditingId(item._id);

    if (tab === "movies") {
      setForm({
        ...item,
        cast: (item.cast || []).join(", "),
        releaseDate: item.releaseDate
          ? new Date(item.releaseDate).toISOString().slice(0, 10)
          : ""
      });
    } else if (tab === "theaters") {
      setForm({
        ...item,
        facilities: (item.facilities || []).join(", ")
      });
    } else {
      setForm({
        ...item,
        movie: item.movie?._id || item.movie || "",
        theater: item.theater?._id || item.theater || "",
        showDate: item.showDate
          ? new Date(item.showDate).toISOString().slice(0, 10)
          : ""
      });
    }
  }

  function prepareBody() {
    const body = { ...form };

    if (tab === "movies") {
      body.duration = Number(body.duration);
      body.rating = Number(body.rating || 0);
      body.cast = body.cast.split(",").map(x => x.trim()).filter(Boolean);
    }

    if (tab === "theaters") {
      body.screens = Number(body.screens);
      body.facilities = body.facilities.split(",").map(x => x.trim()).filter(Boolean);
    }

    if (tab === "shows") {
      body.screenNumber = Number(body.screenNumber);
      body.ticketPrice = Number(body.ticketPrice);
      body.totalSeats = Number(body.totalSeats);
      body.showDate = new Date(`${body.showDate}T00:00:00`);
    }

    return body;
  }

  async function saveItem(e) {
    e.preventDefault();
    try {
      const path = `/api/${tab}${editingId ? `/${editingId}` : ""}`;
      await request(path, editingId ? "PUT" : "POST", prepareBody());
      setMessage(editingId ? "Updated successfully!" : "Added successfully!");
      setEditingId(null);
      setForm(emptyForms[tab]);
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteItem(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await request(`/api/${tab}/${id}`, "DELETE");
      setMessage("Deleted successfully!");
      await loadAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const items = tab === "movies" ? movies : tab === "theaters" ? theaters : shows;

  function fields() {
    if (tab === "movies") {
      return [
        ["title", "Movie Title"], ["genre", "Genre"], ["language", "Language"],
        ["duration", "Duration (minutes)", "number"],
        ["rating", "Rating", "number"], ["cast", "Cast (comma separated)"],
        ["releaseDate", "Release Date", "date"],
        ["posterUrl", "Poster Image URL"], ["description", "Description"]
      ];
    }

    if (tab === "theaters") {
      return [
        ["name", "Theater Name"], ["location", "Location"],
        ["city", "City"], ["screens", "Number of Screens", "number"],
        ["facilities", "Facilities (comma separated)"]
      ];
    }

    return [
      ["movie", "Movie", "movie"],
      ["theater", "Theater", "theater"],
      ["screenNumber", "Screen Number", "number"],
      ["showDate", "Show Date", "date"],
      ["showTime", "Show Time (e.g. 06:00 PM)"],
      ["ticketPrice", "Ticket Price", "number"],
      ["totalSeats", "Total Seats", "number"]
    ];
  }

  function displayName(item) {
    if (tab === "movies") return item.title;
    if (tab === "theaters") return `${item.name} - ${item.city}`;
    return `${item.movie?.title || "Movie"} - ${item.theater?.name || "Theater"} - ${item.showTime}`;
  }

  return (
    <div className="container py-4 text-white">
      <h2 className="mb-3">Manage IMovies</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {["movies", "theaters", "shows"].map(value => (
          <button
            key={value}
            className={`btn ${tab === value ? "btn-danger" : "btn-outline-light"}`}
            onClick={() => {
              setTab(value);
              setEditingId(null);
              setForm(emptyForms[value]);
              setMessage("");
            }}
          >
            {value.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card bg-dark text-white border-secondary p-3 mb-4">
        <h4>{editingId ? "Edit" : "Add"} {tab.slice(0, -1)}</h4>

        <form onSubmit={saveItem}>
          <div className="row">
            {fields().map(([key, label, type]) => (
              <div className="col-md-6 mb-3" key={key}>
                <label className="form-label">{label}</label>

                {type === "movie" || type === "theater" ? (
                  <select
                    className="form-select"
                    required
                    value={form[key] || ""}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  >
                    <option value="">Select {label}</option>
                    {(type === "movie" ? movies : theaters).map(item => (
                      <option key={item._id} value={item._id}>
                        {type === "movie" ? item.title : item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-control"
                    type={type || "text"}
                    required={!["rating"].includes(key)}
                    value={form[key] ?? ""}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>

          <button className="btn btn-danger me-2" type="submit">
            {editingId ? "Update" : "Add"} {tab.slice(0, -1)}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForms[tab]);
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <h4>Existing {tab}</h4>

      {items.map(item => (
        <div
          key={item._id}
          className="card bg-black border-secondary text-white p-3 mb-2"
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <strong>{displayName(item)}</strong>
            <div>
              <button
                className="btn btn-sm btn-outline-warning me-2"
                onClick={() => startEdit(item)}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => deleteItem(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && <p>No records found.</p>}
    </div>
  );
}
