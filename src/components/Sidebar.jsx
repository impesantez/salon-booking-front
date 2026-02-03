import React from "react";
import logo from "../assets/dummy.png";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar({ currentPage, onNavigate, onLogout }) {
  const { role } = useAuth();
  const isAdminOrStaff = role === "admin" || role === "staff";
  const isViewer = !role || role === "viewer";

  const sidebarFont = '"Playfair Display", serif';

  const buttonStyle = (active) => ({
    display: "block",
    width: "100%",
    textAlign: "left",                      // ← kept left-aligned
    padding: "14px 20px",                   // ← more vertical space
    margin: "8px 0",                        // ← more separation between items
    backgroundColor: active ? "#1f392f" : "transparent",
    color: active ? "#ffffff" : "#f8f7f3",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: sidebarFont,
    fontWeight: active ? 700 : 500,         // bolder when active
    fontSize: "1.05rem",                    // ← noticeably bigger (~17px)
    letterSpacing: "0.5px",
    transition: "all 0.2s ease",
  });

  return (
    <div
      style={{
        width: "240px",                         // ← a bit wider → better with larger text
        height: "100vh",
        backgroundColor: "#2b4c3f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 12px",
        boxShadow: "3px 0 10px rgba(0,0,0,0.18)",
        justifyContent: "space-between",
        fontFamily: sidebarFont,
        color: "#f8f7f3",
      }}
    >
      {/* ===== LOGO ===== */}
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "50px" }}>
          <img 
            src={logo} 
            alt="GET NAIL'D Logo" 
            style={{ width: "160px", borderRadius: "10px" }} 
          />
        </div>

        {/* ===== MENU BUTTONS ===== */}
        <button
          style={buttonStyle(currentPage === "calendar")}
          onMouseEnter={(e) => {
            if (! (currentPage === "calendar")) {
              e.currentTarget.style.fontWeight = "700";
              e.currentTarget.style.backgroundColor = "rgba(31, 57, 47, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (! (currentPage === "calendar")) {
              e.currentTarget.style.fontWeight = "500";
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
          onClick={() => onNavigate("calendar")}
        >
          Calendar
        </button>

        <button
          style={buttonStyle(currentPage === "nailtechs")}
          onMouseEnter={(e) => {
            if (! (currentPage === "nailtechs")) {
              e.currentTarget.style.fontWeight = "700";
              e.currentTarget.style.backgroundColor = "rgba(31, 57, 47, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (! (currentPage === "nailtechs")) {
              e.currentTarget.style.fontWeight = "500";
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
          onClick={() => onNavigate("nailtechs")}
        >
          Nail Technicians
        </button>

        <button
          style={buttonStyle(currentPage === "services")}
          onMouseEnter={(e) => {
            if (! (currentPage === "services")) {
              e.currentTarget.style.fontWeight = "700";
              e.currentTarget.style.backgroundColor = "rgba(31, 57, 47, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (! (currentPage === "services")) {
              e.currentTarget.style.fontWeight = "500";
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
          onClick={() => onNavigate("services")}
        >
          Services
        </button>

        {isAdminOrStaff && (
          <button
            style={buttonStyle(currentPage === "sales")}
            onMouseEnter={(e) => {
              if (! (currentPage === "sales")) {
                e.currentTarget.style.fontWeight = "700";
                e.currentTarget.style.backgroundColor = "rgba(31, 57, 47, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (! (currentPage === "sales")) {
                e.currentTarget.style.fontWeight = "500";
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            onClick={() => onNavigate("sales")}
          >
            Sales Report
          </button>
        )}

        <button
          style={buttonStyle(currentPage === "contact")}
          onMouseEnter={(e) => {
            if (! (currentPage === "contact")) {
              e.currentTarget.style.fontWeight = "700";
              e.currentTarget.style.backgroundColor = "rgba(31, 57, 47, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (! (currentPage === "contact")) {
              e.currentTarget.style.fontWeight = "500";
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
          onClick={() => onNavigate("contact")}
        >
          Contact Us
        </button>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{ width: "100%", marginBottom: "30px", textAlign: "center" }}>
        {!isViewer && (
          <p
            style={{
              color: "#d0d0c0",
              fontSize: "1rem",               // ← bigger role text
              marginBottom: "16px",
              fontFamily: sidebarFont,
              fontWeight: "500",
              letterSpacing: "0.5px",
            }}
          >
            Role: <strong style={{ color: "#ffffff", fontWeight: "700" }}>
              {role?.toUpperCase()}
            </strong>
          </p>
        )}

        {!isViewer && (
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #a44c4c 0%, #8c3e3e 100%)",
              color: "#fff",
              border: "none",
              padding: "14px 20px",
              borderRadius: "12px",
              cursor: "pointer",
              fontFamily: sidebarFont,
              fontWeight: "700",
              fontSize: "1.05rem",            // ← matches menu size
              boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              transition: "all 0.25s ease",
              letterSpacing: "0.6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.25)";
            }}
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}