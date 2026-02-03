import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Login SOLO para admin (puerta de entrada) */}
            <Route path="/admin" element={<LoginPage />} />

            {/* Recuperar contraseña admin */}
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard (mismo para todos; cambia por role) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Raíz */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
