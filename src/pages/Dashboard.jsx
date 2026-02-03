import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import NailTechsPage from "./NailTechsPage";
import ServicesPage from "./ServicesPage";
import SalesReportPage from "./SalesReportPage";
import ContactUsPage from "./ContactUsPage";
import AppointmentModal from "../components/AppointmentModal";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";
import "./Dashboard.css";

export default function Dashboard() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState("calendar");
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [nailTechs, setNailTechs] = useState([]);
  const [services, setServices] = useState([]);
  const [openTechs, setOpenTechs] = useState({});

  const isAdmin = role === "admin";
  const isStaff = role === "staff";
  const isAdminOrStaff = isAdmin || isStaff;
  const isViewer = !role || role === "viewer";

  const loadNailTechs = async () => {
    try {
      const res = await api.get("/api/nailtechs");
      const sorted = (res.data || []).sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      setNailTechs(sorted);
    } catch (err) {
      console.error("Error loading nail techs:", err);
    }
  };

  const loadServices = async () => {
    try {
      const res = await api.get("/api/services");
      const sorted = (res.data || []).sort((a, b) => {
        const catA = (a.category || "").toLowerCase();
        const catB = (b.category || "").toLowerCase();
        if (catA !== catB) return catA.localeCompare(catB);
        return (a.name || "").localeCompare(b.name || "");
      });
      setServices(sorted);
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await api.get("/api/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
    }
  };

  const refreshData = async () => {
    await Promise.all([loadNailTechs(), loadServices(), loadAppointments()]);
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatYMD = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const getStartOfWeek = (date) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() - copy.getDay());
    return copy;
  };

  const startOfWeek = getStartOfWeek(currentDate);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const weekdayName = (date) =>
    date.toLocaleDateString("en-US", { weekday: "long" });

  const techsAvailableThatDay = (date) => {
    const day = weekdayName(date);
    return nailTechs.filter((t) => {
      if (!t.availabilityJson) return false;
      try {
        const arr = JSON.parse(t.availabilityJson);
        return Array.isArray(arr) && arr.includes(day);
      } catch {
        return false;
      }
    });
  };

  const handleSaveAppointment = async (formData) => {
    try {
      const payload = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        nailTechId: formData.nailTechId ? Number(formData.nailTechId) : null,
        serviceIds: (formData.serviceIds || []).map((id) => Number(id)),
      };

      if (editingAppointment) {
        const res = await api.put(
          `/api/appointments/${editingAppointment.id}`,
          payload
        );
        setAppointments((prev) =>
          prev.map((a) => (a.id === editingAppointment.id ? res.data : a))
        );
      } else {
        const res = await api.post("/api/appointments", payload);
        setAppointments((prev) => [...prev, res.data]);
      }

      setShowModal(false);
      setEditingAppointment(null);

      // refresca por si backend devuelve relaciones (services/tech) en diferente shape
      await refreshData();
    } catch (err) {
      console.error("Failed saving appointment:", err);
      alert("Error saving appointment.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    try {
      await api.delete(`/api/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed deleting appointment:", err);
      alert("Error deleting appointment");
    }
  };

  const handleToggleComplete = async (appt) => {
    try {
      const res = await api.put(`/api/appointments/${appt.id}/complete`, {
        completed: !appt.completed,
      });
      const updated = res.data || { ...appt, completed: !appt.completed };
      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? updated : a))
      );
    } catch (err) {
      alert("Could not toggle completion.");
    }
  };

  const headerRangeLabel = () => {
    const end = new Date(startOfWeek.getTime() + 6 * 86400000);
    return `${startOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  };

  return (
    <div className="dash-shell">
      <div className="dash-sidebar">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={async () => {
            await logout?.();
            navigate("/dashboard");
          }}
        />
      </div>

      <div className="dash-main">
        <div className="dash-content fade-in">
          {currentPage === "nailtechs" && (
            <NailTechsPage role={role} onChange={refreshData} />
          )}

          {currentPage === "services" && (
            <ServicesPage role={role} onChange={refreshData} />
          )}

          {currentPage === "sales" && isAdminOrStaff && (
            <SalesReportPage role={role} />
          )}

          {currentPage === "contact" && <ContactUsPage />}

          {currentPage === "calendar" && (
            <>
              <div className="cal-header">
                <div className="cal-header-center">
                  <button
                    className="cal-nav-btn"
                    onClick={() => {
                      const d = new Date(currentDate);
                      d.setDate(d.getDate() - 7);
                      setCurrentDate(d);
                    }}
                    aria-label="Previous week"
                    type="button"
                  >
                    ‹
                  </button>

                  <h2 className="cal-range">{headerRangeLabel()}</h2>

                  <button
                    className="cal-nav-btn"
                    onClick={() => {
                      const d = new Date(currentDate);
                      d.setDate(d.getDate() + 7);
                      setCurrentDate(d);
                    }}
                    aria-label="Next week"
                    type="button"
                  >
                    ›
                  </button>
                </div>

                {isAdminOrStaff && (
                  <button
                    className="cal-primary-btn"
                    onClick={() => {
                      setEditingAppointment(null);
                      setShowModal(true);
                    }}
                    type="button"
                  >
                    + New Appointment
                  </button>
                )}
              </div>

              <div className="cal-grid-container">
                <div className="cal-grid-wrapper">
                  <div className="cal-grid-row">
                    {days.slice(0, 4).map((day) => {
                      const dayKey = formatYMD(day);
                      const daily = appointments.filter((a) => a.date === dayKey);
                      const availTechs = techsAvailableThatDay(day);
                      const isTechOpen = !!openTechs[dayKey];

                      return (
                        <div key={dayKey} className="cal-day">
                          <div className="cal-day-num">{day.getDate()}</div>
                          <div className="cal-day-name">
                            {day.toLocaleDateString("en-US", { weekday: "short" })}
                          </div>

                          <div className="cal-pill-wrap">
                            <button
                              className="cal-pill"
                              onClick={() =>
                                setOpenTechs((prev) => ({
                                  ...prev,
                                  [dayKey]: !prev[dayKey],
                                }))
                              }
                              type="button"
                            >
                              <span>Available Techs</span>
                              <span className={`cal-caret ${isTechOpen ? "open" : ""}`}>
                                ▾
                              </span>
                            </button>

                            <div className={`cal-pill-panel ${isTechOpen ? "open" : ""}`}>
                              {availTechs.length
                                ? availTechs.map((t) => t.name).join(", ")
                                : "No availability"}
                            </div>
                          </div>

                          <div className="cal-appts">
                            {daily.map((a) => {
                              const clientName =
                                a.client?.name || a.clientName || "Client";
                              const techName =
                                a.nailTech?.name ||
                                nailTechs.find((t) => t.id === a.nailTechId)?.name ||
                                "";
                              const serviceNames = a.services
                                ? a.services.map((s) => s.name).join(", ")
                                : "";

                              const primaryLine = isViewer
                                ? techName || "Busy"
                                : clientName;

                              const secondaryLine = isViewer
                                ? ""
                                : serviceNames + (techName ? ` • ${techName}` : "");

                              const isCompleted = !!a.completed;

                              return (
                                <div
                                  key={a.id}
                                  className={`appt-card ${isCompleted ? "completed" : ""}`}
                                >
                                  <div className="appt-title">{primaryLine}</div>

                                  {!isViewer && secondaryLine && (
                                    <div className="appt-sub">{secondaryLine}</div>
                                  )}

                                  <div className="appt-time">
                                    {a.startTime}
                                    {a.endTime ? ` - ${a.endTime}` : ""}
                                  </div>

                                  {isCompleted && (
                                    <div className="appt-badge">✓ Completed</div>
                                  )}

                                  {isAdminOrStaff && (
                                    <div className="appt-footer">
                                      <div className="appt-actions">
                                        <button
                                          className="btn btn-edit"
                                          onClick={() => {
                                            setEditingAppointment(a);
                                            setShowModal(true);
                                          }}
                                          type="button"
                                        >
                                          Edit
                                        </button>

                                        {isAdmin && (
                                          <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(a.id)}
                                            type="button"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>

                                      <label className="appt-complete">
                                        <input
                                          type="checkbox"
                                          checked={isCompleted}
                                          onChange={() => handleToggleComplete(a)}
                                        />
                                        Mark as completed
                                      </label>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="cal-grid-row">
                    {days.slice(4).map((day) => {
                      const dayKey = formatYMD(day);
                      const daily = appointments.filter((a) => a.date === dayKey);
                      const availTechs = techsAvailableThatDay(day);
                      const isTechOpen = !!openTechs[dayKey];

                      return (
                        <div key={dayKey} className="cal-day">
                          <div className="cal-day-num">{day.getDate()}</div>
                          <div className="cal-day-name">
                            {day.toLocaleDateString("en-US", { weekday: "short" })}
                          </div>

                          <div className="cal-pill-wrap">
                            <button
                              className="cal-pill"
                              onClick={() =>
                                setOpenTechs((prev) => ({
                                  ...prev,
                                  [dayKey]: !prev[dayKey],
                                }))
                              }
                              type="button"
                            >
                              <span>Available Techs</span>
                              <span className={`cal-caret ${isTechOpen ? "open" : ""}`}>
                                ▾
                              </span>
                            </button>

                            <div className={`cal-pill-panel ${isTechOpen ? "open" : ""}`}>
                              {availTechs.length
                                ? availTechs.map((t) => t.name).join(", ")
                                : "No availability"}
                            </div>
                          </div>

                          <div className="cal-appts">
                            {daily.map((a) => {
                              const clientName =
                                a.client?.name || a.clientName || "Client";
                              const techName =
                                a.nailTech?.name ||
                                nailTechs.find((t) => t.id === a.nailTechId)?.name ||
                                "";
                              const serviceNames = a.services
                                ? a.services.map((s) => s.name).join(", ")
                                : "";

                              const primaryLine = isViewer
                                ? techName || "Busy"
                                : clientName;

                              const secondaryLine = isViewer
                                ? ""
                                : serviceNames + (techName ? ` • ${techName}` : "");

                              const isCompleted = !!a.completed;

                              return (
                                <div
                                  key={a.id}
                                  className={`appt-card ${isCompleted ? "completed" : ""}`}
                                >
                                  <div className="appt-title">{primaryLine}</div>

                                  {!isViewer && secondaryLine && (
                                    <div className="appt-sub">{secondaryLine}</div>
                                  )}

                                  <div className="appt-time">
                                    {a.startTime}
                                    {a.endTime ? ` - ${a.endTime}` : ""}
                                  </div>

                                  {isCompleted && (
                                    <div className="appt-badge">✓ Completed</div>
                                  )}

                                  {isAdminOrStaff && (
                                    <div className="appt-footer">
                                      <div className="appt-actions">
                                        <button
                                          className="btn btn-edit"
                                          onClick={() => {
                                            setEditingAppointment(a);
                                            setShowModal(true);
                                          }}
                                          type="button"
                                        >
                                          Edit
                                        </button>

                                        {isAdmin && (
                                          <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(a.id)}
                                            type="button"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>

                                      <label className="appt-complete">
                                        <input
                                          type="checkbox"
                                          checked={isCompleted}
                                          onChange={() => handleToggleComplete(a)}
                                        />
                                        Mark as completed
                                      </label>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {showModal && isAdminOrStaff && (
          <AppointmentModal
            onClose={() => setShowModal(false)}
            onSave={handleSaveAppointment}
            existingData={editingAppointment}
            nailTechs={nailTechs}
            services={services}
          />
        )}
      </div>
    </div>
  );
}
