import React, { useState, useEffect } from "react";
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

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const loadNailTechs = async () => {
    try {
      const res = await api.get("/api/nailtechs");
      setNailTechs(res.data);
    } catch (err) {
      console.error("Error loading nail techs:", err);
    }
  };

  const loadServices = async () => {
    try {
      const res = await api.get("/api/services");
      setServices(res.data);
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  useEffect(() => {
    loadNailTechs();
    loadServices();
  }, []);

  const groupedServices = services.reduce((acc, svc) => {
    const cat = svc.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  const toggleService = (id) => {
    setNewTech((prev) => {
      const alreadySelected = prev.serviceIds.includes(id);
      const updated = alreadySelected ? prev.serviceIds.filter((sid) => sid !== id) : [...prev.serviceIds, id];
      return { ...prev, serviceIds: updated };
    });
  };

  const toggleCategory = (cat) => {
    const allIds = (groupedServices[cat] || []).map((s) => s.id);
    const allSelected = allIds.every((id) => newTech.serviceIds.includes(id));
    setNewTech((prev) => ({
      ...prev,
      serviceIds: allSelected
        ? prev.serviceIds.filter((id) => !allIds.includes(id))
        : [...new Set([...prev.serviceIds, ...allIds])],
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
        name: newTech.name,
        email: newTech.email,
        phone: newTech.phone,
        availabilityJson: JSON.stringify(newTech.availableDays),
        services: newTech.serviceIds.map((id) => ({ id })),
      };

      if (editing) {
        await api.put(`/api/nailtechs/${editing.id}`, payload);
      } else {
        await api.post("/api/nailtechs", payload);
      }

      setNewTech({ name: "", email: "", phone: "", availableDays: [], serviceIds: [] });
      setEditing(null);
      await loadNailTechs();
      onChange?.();
    } catch (err) {
      console.error("Error saving nail tech:", err);
      alert("Error saving nail technician. Check the console for details.");
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

    setNewTech({
      name: tech.name || "",
      email: tech.email || "",
      phone: tech.phone || "",
      availableDays: parsedDays,
      serviceIds: tech.services ? tech.services.map((s) => s.id) : [],
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this nail tech?")) return;
    try {
      await api.delete(`/api/nailtechs/${id}`);
      setNailTechs((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting nail tech:", err);
      alert("Couldn't delete — check backend cascade or constraints.");
    }
  };

  const getServiceSeparation = (tech) => {
    const offeredIds = tech.services?.map((s) => s.id) || [];
    const offeredByCategory = {};

    Object.keys(groupedServices).forEach((cat) => {
      const offered = (groupedServices[cat] || []).filter((s) => offeredIds.includes(s.id));
      if (offered.length > 0) offeredByCategory[cat] = offered;
    });

    const notOffered = services.filter((s) => !offeredIds.includes(s.id));
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
                <input type="checkbox" checked={newTech.availableDays.includes(day)} onChange={() => handleCheckboxChange(day)} />
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
                    {(groupedServices[cat] || []).every((s) => newTech.serviceIds.includes(s.id)) ? "Clear" : "Select All"}
                  </button>
                </div>

                <div className="service-grid">
                  {(groupedServices[cat] || []).map((svc) => (
                    <div
                      key={svc.id}
                      className={`service-chip ${newTech.serviceIds.includes(svc.id) ? "selected" : ""}`}
                      onClick={() => toggleService(svc.id)}
                    >
                      {svc.name}
                    </div>
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
                {tech.availabilityJson && (() => {
                  try {
                    const arr = JSON.parse(tech.availabilityJson);
                    return Array.isArray(arr) && arr.length > 0;
                  } catch {
                    return false;
                  }
                })() ? (
                  JSON.parse(tech.availabilityJson).map((d, i) => (
                    <span key={i} className="day-chip">{d}</span>
                  ))
                ) : (
                  <span className="no-days">—</span>
                )}
              </div>
            </div>

            <div className="tech-actions">
              <button className="view-btn" onClick={() => setSelectedTech(tech)}>
                View Details
              </button>

              {(isAdmin || isStaff) && (
                <>
                  <button className="edit-btn" type="button" onClick={() => handleEdit(tech)}>Edit</button>
                  <button className="delete-btn" type="button" onClick={() => handleDelete(tech.id)}>Delete</button>
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

            <h4>Availability</h4>
            {selectedTech.availabilityJson && (() => {
              try {
                const arr = JSON.parse(selectedTech.availabilityJson);
                return Array.isArray(arr) && arr.length > 0;
              } catch {
                return false;
              }
            })() ? (
              <div className="days-chips">
                {JSON.parse(selectedTech.availabilityJson).map((d, i) => (
                  <span key={i} className="day-chip">{d}</span>
                ))}
              </div>
            ) : (
              <p>No availability set</p>
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
                      <div className="not-offered-header" onClick={() => setShowNotOffered((prev) => !prev)}>
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

            <button className="close-btn" onClick={() => setSelectedTech(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
