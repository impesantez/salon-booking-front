import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./LoginForm.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("Incorrect login");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form luxury-login">
        <h2>Admin Sign In</h2>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="luxury-btn">
          Login
        </button>

        <p className="forgot-password-wrapper">
          <span
            className="forgot-password"
            onClick={() => navigate("/admin/forgot-password")}
          >
            Forgot password?
          </span>
        </p>
      </form>
    </div>
  );
}
