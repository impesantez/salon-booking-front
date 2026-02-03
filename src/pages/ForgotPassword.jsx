import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please share your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("A link has been sent to your email.");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("An account does not exist with that email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("An error occurred, try again.");
      }
    }
  };

  return (
    <div className="wrapper">
      <div className="form-container">
        <h1 className="heading">Reset password</h1>
        <p className="subtext">
          Share your email so we can send you a link to reset your password.
        </p>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="button">
            Send link
          </button>
        </form>

        <p className="bottom-text">
          Remember your password? <Link to="/admin">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
