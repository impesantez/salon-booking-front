import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "./LoginForm.css";

// Si quieres que /admin SOLO acepte el admin, pon aquí el email admin:
const ADMIN_EMAIL = "linhtranmakeup@gmail.com";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // ✅ OPCIONAL: si quieres que esta pantalla /admin sea SOLO para el admin:
      const normalized = email.toLowerCase().trim();
      if (normalized !== ADMIN_EMAIL) {
        alert("Only the admin account can log in here.");
        await signOut(auth);
        return;
      }

      // ✅ Si pasó, lo mandas al dashboard (mismo dashboard con más opciones por role)
      navigate("/dashboard", { replace: true });
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
