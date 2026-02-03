import React, { useState, useEffect, useMemo } from "react";
import "./AppointmentModal.css";

export default function AppointmentModal({
  onClose,
  onSave,
  existingData,
  nailTechs,
  services,
}) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    date: "",
    startTime: "",
    endTime: "",
    nailTechId: "",
    serviceIds: [], // strings (para el <select multiple>)
  });

  // Set fecha default si es nueva cita
  useEffect(() => {
    if (!existingData) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      setFormData((prev) => ({ ...prev, date: `${y}-${m}-${d}` }));
    }
  }, [existingData]);

  // Cargar datos al editar
  useEffect(() => {
    if (existingData) {
      const nailTechId =
        existingData.nailTech?.id ??
        existingData.nailTechId ??
        ""; // fallback

      // services puede venir como array de objetos o ids
      const existingServiceIds =
        (existingData.services?.map((s) => s?.id) ||
          existingData.serviceIds ||
          []).filter(Boolean);

      setFormData({
        clientName: existingData.client?.name || existingData.clientName || "",
        clientEmail:
          existingData.client?.email || existingData.clientEmail || "",
        clientPhone:
          existingData.client?.phone || existingData.clientPhone || "",
        date: existingData.date || "",
        startTime: existingData.startTime || "",
        endTime: existingData.endTime || "",
        nailTechId: nailTechId ? String(nailTechId) : "",
        serviceIds: existingServiceIds.map((id) => String(id)),
      });
    }
  }, [existingData]);

  // Helper: sacar IDs permitidos desde el objeto tech, sea cual sea el formato
  const extractTechServiceIds = (tech) => {
    if (!tech) return [];

    // 1) tech.services = [{id:...}, ...] o [id, id]
    if (Array.isArray(tech.services)) {
      return tech.services
        .map((s) => (typeof s === "object" && s !== null ? s.id : s))
        .filter((x) => x !== undefined && x !== null)
        .map(String);
    }

    // 2) tech.serviceIds = [1,2,3]
    if (Array.isArray(tech.serviceIds)) {
      return tech.serviceIds.filter(Boolean).map(String);
    }

    // 3) tech.serviceIds = "1,2,3"
    if (typeof tech.serviceIds === "string" && tech.serviceIds.trim()) {
      return tech.serviceIds
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .map(String);
    }

    return [];
  };

  // IDs permitidos de servicios según tech seleccionada
  const allowedServiceIds = useMemo(() => {
    if (!formData.nailTechId) return null; // sin tech => mostrar todos
    const tech = nailTechs.find((t) => String(t.id) === String(formData.nailTechId));
    const ids = extractTechServiceIds(tech);
    return ids; // [] => tech no tiene servicios asignados
  }, [formData.nailTechId, nailTechs]);

  // Servicios filtrados por tech (si hay)
  const filteredServices = useMemo(() => {
    if (allowedServiceIds === null) return services; // no tech seleccionado => todos
    return services.filter((s) => allowedServiceIds.includes(String(s.id)));
  }, [services, allowedServiceIds]);

  // Agrupar por categoría
  const groupedServices = useMemo(() => {
    return filteredServices.reduce((acc, svc) => {
      const cat = svc.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(svc);
      return acc;
    }, {});
  }, [filteredServices]);

  // Cuando cambia la tech, eliminar servicios que ya no son permitidos
  useEffect(() => {
    if (allowedServiceIds === null) return;
    setFormData((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.filter((id) =>
        allowedServiceIds.includes(String(id))
      ),
    }));
  }, [allowedServiceIds]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const diffMinutes = (start, end) => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.clientName || !formData.date || !formData.startTime || !formData.endTime) {
      alert("Please fill all required fields.");
      return;
    }

    if (!formData.serviceIds.length) {
      alert("Please select at least one service.");
      return;
    }

    const minutes = diffMinutes(formData.startTime, formData.endTime);
    if (minutes !== null && minutes <= 60 && formData.serviceIds.length > 3) {
      const ok = window.confirm(
        "It looks like several services were selected for a short appointment. Are you sure the end time is correct?"
      );
      if (!ok) return;
    }

    const fixedPayload = {
      ...formData,
      nailTechId: formData.nailTechId ? Number(formData.nailTechId) : null,
      serviceIds: formData.serviceIds.map((id) => Number(id)),
    };

    onSave(fixedPayload);
  };

  // Texto de servicios seleccionados (solo de los existentes)
  const selectedServiceNames = useMemo(() => {
    const selectedSet = new Set(formData.serviceIds.map(String));
    return services
      .filter((s) => selectedSet.has(String(s.id)))
      .map((s) => s.name)
      .join(", ");
  }, [formData.serviceIds, services]);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>{existingData ? "Edit Appointment" : "New Appointment"}</h2>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <label>Client Name</label>
          <input
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            required
          />

          <label>Client Email (for confirmations)</label>
          <input
            type="email"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleChange}
            placeholder="client@example.com"
          />

          <label>Client Phone</label>
          <input
            name="clientPhone"
            value={formData.clientPhone}
            onChange={handleChange}
            placeholder="Optional"
          />

          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <label>Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />

          <label>
            End Time <span style={{ color: "#a44c4c" }}>*</span>
          </label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />

          <label>Nail Technician</label>
          <select
            name="nailTechId"
            value={formData.nailTechId}
            onChange={handleChange}
            required
          >
            <option value="">Select a Nail Tech</option>
            {nailTechs.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>

          <label>Services</label>
          <select
            multiple
            name="serviceIds"
            size="8"
            value={formData.serviceIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(
                (o) => o.value
              );
              setFormData((prev) => ({ ...prev, serviceIds: selected }));
            }}
            className="service-select"
          >
            {Object.keys(groupedServices).length === 0 && (
              <optgroup label="No services available for this technician">
                <option disabled>—</option>
              </optgroup>
            )}

            {Object.keys(groupedServices).map((cat) => (
              <optgroup key={cat} label={cat}>
                {groupedServices[cat].map((svc) => (
                  <option key={svc.id} value={String(svc.id)}>
                    {svc.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <small className="selected-services">
            {formData.serviceIds.length > 0
              ? `Selected: ${selectedServiceNames}`
              : "No services selected"}
          </small>

          <div className="modal-buttons">
            <button className="save-btn" type="submit">
              {existingData ? "Save Changes" : "Save Appointment"}
            </button>
            <button className="cancel-btn" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
