
import { useState } from "react";

const API_URL = "https://imovies-backend-lu6f.onrender.com";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const endpoint = isLogin ? "login" : "register";
    const requestURL = `${API_URL}/api/auth/${endpoint}`;

    console.log("API REQUEST URL:", requestURL);

    try {
      const response = await fetch(requestURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          isLogin
            ? { email: email.trim(), password }
            : { name: name.trim(), email: email.trim(), password }
        ),
      });

      console.log("RESPONSE STATUS:", response.status);
      console.log("RESPONSE CONTENT TYPE:", response.headers.get("content-type"));

      const responseText = await response.text();

      console.log("SERVER RESPONSE:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        throw new Error(
          "Server returned HTML instead of JSON. Check the API URL and backend."
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (isLogin) {
        if (!data.token || !data.user) {
          throw new Error("Login response is missing user or token.");
        }

        localStorage.setItem("imoviesToken", data.token);
        localStorage.setItem("imoviesUser", JSON.stringify(data.user));

        onLogin(data.user);
      } else {
        setMessage("Registration successful! Please login.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (error) {
      console.error("AUTH ERROR:", error);

      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to backend. Check that localhost:5000 is running."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div
        className="card bg-dark text-white border-secondary shadow-lg w-100"
        style={{ maxWidth: "430px" }}
      >
        <div className="card-body p-4 p-md-5">
          <h1 className="text-danger text-center fw-bold mb-2">
            🎬 IMovies
          </h1>

          <h3 className="text-center mb-4">
            {isLogin ? "Welcome Back!" : "Create Your Account"}
          </h3>

          <div className="d-flex gap-2 mb-4">
            <button
              type="button"
              className={`btn w-50 ${
                isLogin ? "btn-danger" : "btn-outline-light"
              }`}
              onClick={() => {
                setIsLogin(true);
                setMessage("");
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={`btn w-50 ${
                !isLogin ? "btn-danger" : "btn-outline-light"
              }`}
              onClick={() => {
                setIsLogin(false);
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-danger w-100 fw-bold py-2 mt-2"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          {message && (
            <div className="alert alert-info mt-3 mb-0">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
