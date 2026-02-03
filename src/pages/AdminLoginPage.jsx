import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState("viewer"); // 👈 Valor por defecto
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);

    if (user) {
      const email = user.email.toLowerCase().trim();
      let assignedRole = "viewer";

      switch (email) {
        case "linhtranmakeup@gmail.com":
          assignedRole = "admin";
          break;
        case "getnaildla@gmail.com":
        case "impesantez@puce.edu.ec":
        case "isabepesantez@gmail.com":
          assignedRole = "staff";
          break;
        default:
          assignedRole = "viewer";
      }

      console.log("✅ Logged in as:", email, "→ role:", assignedRole);
      setRole(assignedRole);
    } else {
      setRole("viewer");
    }

    setLoading(false);
  });

  return unsub;
}, []);



  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setRole("viewer");
  };

  return (
    <AuthContext.Provider value={{ currentUser, role, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
