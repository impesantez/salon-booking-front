import React, { useState, useEffect, useMemo } from "react";
import api from "../api";
import "./NailTechsPage.css";

export default function NailTechsPage({ role, onChange }) {
  const [nailTechs, setNailTechs] = useState([]);
  const [services, setServices] = useState([]);
  const [newTech, setNewTech] = useState({
    name: "",
    email: "",
    phone: "",
    availableDays: [],
    serviceIds: [],
  });
  const [editing, setEditing] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [showNotOffered, setShowNotOffered] = useState(false);

  const isAdmin = role === "admin";
  const isStaff = role === "staff";
  const isViewer = !role || role === "viewer";

  const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const loadNailTechs = async () => {
    try {
      const res = await api.get("/api/nailtechs");
      setNailTechs(res.data || []);
    } catch (err) {
      console.error("Error loading nail techs:", err?.response?.data || err);
    }
  };

  const loadServices = async () => {
    try {
      const res = await api.get("/api/services");
      setServices(res.data || []);
    } catch (err) {
      console.error("Error loading services:", err?.response?.data || err);
    }
  };

  useEffect(() => {
    loadNailTechs();
    loadServices();
  }, []);

  const groupedServices = useMemo(() => {
    return (services || []).reduce((acc, svc) => {
      const cat = svc.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(svc);
      return acc;
    }, {});
  }, [services]);

  const toggleService = (id) => {
    setNewTech((prev) => {
      const exists = prev.serviceIds.includes(id);
      return {
        ...prev,
        serviceIds: exists ? prev.serviceIds.filter((x) => x !== id) : [...prev.serviceIds, id],
      };
    });
  };

  const toggleCategory = (cat) => {
    const allIds = (groupedServices[cat] || []).map((s) => s.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => newTech.serviceIds.includes(id));

    setNewTech((prev) => ({
      ...prev,
      serviceIds: allSelected
        ? prev.serviceIds.filter((id) => !allIds.includes(id))
        : Array.from(new Set([...prev.serviceIds, ...allIds])),
    }));
  };

  const handleCheckboxChange = (day) => {
    setNewTech((prev) => {
      const updatedDays = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: updatedDays };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: (newTech.name || "").trim(),
        email: (newTech.email || "").trim(),
        phone: (newTech.phone || "").trim(),
        availabilityJson: JSON.stringify(newTech.availableDays || []),

        // ✅ manda ambos formatos para compatibilidad
        serviceIds: (newTech.serviceIds || []).map((id) => Number(id)),
        services: (newTech.serviceIds || []).map((id) => ({ id: Number(id) })),
      };

      if (!payload.name) {
        alert("Name is required");
        return;
      }

      if (editing) {
        await api.put(`/api/nailtechs/${editing.id}`, payload);
      } else {
        await api.post("/api/nailtechs", payload);
      }

      setNewTech({ name: "", email: "", phone: "", availableDays: [], serviceIds: [] });
      setEditing(null);

      await loadNailTechs();
      onChange?.();
      alert("Saved ✅");
    } catch (err) {
      console.error("Error saving nail tech:", err?.response?.data || err);
      alert(`Error saving nail technician: ${err?.response?.data || err.message}`);
    }
  };

  const handleEdit = (tech) => {
    setEditing(tech);

    let parsedDays = [];
    try {
      parsedDays = tech.availabilityJson ? JSON.parse(tech.availabilityJson) : [];
      if (!Array.isArray(parsedDays)) parsedDays = [];
    } catch {
      parsedDays = [];
    }

    // ✅ soporta tech.services o tech.serviceIds
    const idsFromServices = Array.isArray(tech.services)
      ? tech.services.map((s) => s?.id).filter(Boolean)
      : [];

    const idsFromServiceIds = Array.isArray(tech.serviceIds)
      ? tech.serviceIds
      : [];

    const merged = Array.from(new Set([...idsFromServices, ...idsFromServiceIds])).map(Number);

    setNewTech({
      name: tech.name || "",
      email: tech.email || "",
      phone: tech.phone || "",
      availableDays: parsedDays,
      serviceIds: merged,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this nail tech?")) return;
    try {
      await api.delete(`/api/nailtechs/${id}`);
      setNailTechs((prev) => prev.filter((t) => t.id !== id));
      onChange?.();
    } catch (err) {
      console.error("Error deleting nail tech:", err?.response?.data || err);
      alert("Couldn't delete — check backend constraints.");
    }
  };

  const getServiceSeparation = (tech) => {
    const offeredIds = (tech.services?.map((s) => s.id) || tech.serviceIds || []).map(Number);
    const offeredByCategory = {};

    Object.keys(groupedServices).forEach((cat) => {
      const offered = (groupedServices[cat] || []).filter((s) => offeredIds.includes(Number(s.id)));
      if (offered.length > 0) offeredByCategory[cat] = offered;
    });

    const notOffered = (services || []).filter((s) => !offeredIds.includes(Number(s.id)));
    return { offeredByCategory, notOffered };
  };

  return (
    <div className="nailtechs-container">
      <h2 className="nailtechs-title">Our Nail Technicians</h2>

      {(isAdmin || isStaff) && (
        <form className="nailtech-form" onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Name"
            value={newTech.name}
            onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newTech.email}
            onChange={(e) => setNewTech({ ...newTech, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            value={newTech.phone}
            onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })}
          />

          <div className="days-checkboxes">
            {daysOfWeek.map((day) => (
              <label key={day} className="day-option">
                <input
                  type="checkbox"
                  checked={newTech.availableDays.includes(day)}
                  onChange={() => handleCheckboxChange(day)}
                />
                {day}
              </label>
            ))}
          </div>

          <div className="service-selector">
            <h3>Services</h3>

            {Object.keys(groupedServices).map((cat) => (
              <div key={cat} className="category-block">
                <div className="category-header">
                  <h4>{cat}</h4>
                  <button type="button" onClick={() => toggleCategory(cat)}>
                    {(groupedServices[cat] || []).every((s) => newTech.serviceIds.includes(s.id))
                      ? "Clear"
                      : "Select All"}
                  </button>
                </div>

                <div className="service-grid">
                  {(groupedServices[cat] || []).map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      className={`service-chip ${newTech.serviceIds.includes(svc.id) ? "selected" : ""}`}
                      onClick={() => toggleService(svc.id)}
                    >
                      {svc.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="save-tech-btn">
            {editing ? "Update Technician" : "+ Add Technician"}
          </button>
        </form>
      )}

      <div className="nailtechs-grid">
        {nailTechs.map((tech) => (
          <div key={tech.id} className="nailtech-card">
            <h3 className="tech-name">{tech.name}</h3>

            {!isViewer && (
              <>
                <p><strong>Email:</strong> {tech.email || "—"}</p>
                <p><strong>Phone:</strong> {tech.phone || "—"}</p>
              </>
            )}

            <div className="availability-section">
              <strong>Available:</strong>
              <div className="days-chips">
                {(() => {
                  try {
                    const arr = tech.availabilityJson ? JSON.parse(tech.availabilityJson) : [];
                    if (!Array.isArray(arr) || arr.length === 0) return <span className="no-days">—</span>;
                    return arr.map((d, i) => <span key={i} className="day-chip">{d}</span>);
                  } catch {
                    return <span className="no-days">—</span>;
                  }
                })()}
              </div>
            </div>

            <div className="tech-actions">
              <button type="button" className="view-btn" onClick={() => setSelectedTech(tech)}>
                View Details
              </button>

              {(isAdmin || isStaff) && (
                <>
                  <button type="button" className="edit-btn" onClick={() => handleEdit(tech)}>Edit</button>
                  <button type="button" className="delete-btn" onClick={() => handleDelete(tech.id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTech && (
        <div className="modal-overlay" onClick={() => setSelectedTech(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedTech.name}</h3>

            {!isViewer && (
              <>
                <p><strong>Email:</strong> {selectedTech.email || "—"}</p>
                <p><strong>Phone:</strong> {selectedTech.phone || "—"}</p>
              </>
            )}

            <h4>Services</h4>
            {(() => {
              const { offeredByCategory, notOffered } = getServiceSeparation(selectedTech);
              return (
                <>
                  {Object.keys(offeredByCategory).map((cat) => (
                    <div key={cat}>
                      <h5>{cat}</h5>
                      <div className="service-tags">
                        {offeredByCategory[cat].map((s) => (
                          <span key={s.id} className="service-tag">{s.name}</span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {notOffered.length > 0 && (
                    <div className="not-offered-section">
                      <div
                        className="not-offered-header"
                        onClick={() => setShowNotOffered((prev) => !prev)}
                      >
                        <h5>Not Offered</h5>
                        <span className={`arrow ${showNotOffered ? "open" : ""}`}>▼</span>
                      </div>

                      {showNotOffered && (
                        <div className="not-offered-list">
                          {notOffered.map((s) => (
                            <span key={s.id} className="service-tag inactive">{s.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}

            <button type="button" className="close-btn" onClick={() => setSelectedTech(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
