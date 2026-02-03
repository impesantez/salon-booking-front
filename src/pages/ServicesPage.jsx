import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ServicesPage.css";

export default function ServicesPage({ role }) {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ category: "", name: "", price: "" });
  const [editing, setEditing] = useState(null);
  const isAdmin = role === "admin";

  const categories = [
    "Classic",
    "Gel",
    "Gel X",
    "Add Ons",
    "Waxing",
    "Acrylic/Full Set",
    "Fill (Acrylic/Hard Gel)",
    "Pink/White Full Set",
    "Fill Pink / Fill White",
    "Hard Gel",
    "Threading",
    "Deluxe Pedicure",
  ];

  const loadServices = async () => {
    try {
      const res = await axios.get("/api/services");
      setServices(res.data);
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!newService.category || !newService.name || !newService.price) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const payload = {
        category: newService.category.trim(),
        name: newService.name.trim(),
        price: parseFloat(newService.price),
      };

      if (editing) {
        await axios.put(`/api/services/${editing.id}`, payload);
      } else {
        await axios.post("/api/services", payload);
      }

      setNewService({ category: "", name: "", price: "" });
      setEditing(null);
      loadServices();
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Error saving service. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await axios.delete(`/api/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting service:", err);
      alert("Failed to delete service");
    }
  };

  const handleEdit = (service) => {
    setEditing(service);
    setNewService({
      category: service.category,
      name: service.name,
      price: service.price,
    });
  };

  const grouped = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="services-container">
      <h2 className="services-title">Get Nail'd LA Services</h2>

      {isAdmin && (
        <form className="service-form" onSubmit={handleSaveService}>
          <select
            value={newService.category}
            onChange={(e) => setNewService({ ...newService, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Service Name"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          />

          <input
            type="number"
            step="0.01"
            placeholder="Price ($)"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
          />

          <button type="submit" className="save-service-btn">
            {editing ? "Update Service" : "+ Add Service"}
          </button>
        </form>
      )}

      <div className="categories-grid">
        {categories.map((cat) => (
          <div key={cat} className="category-card luxury-category">
            <h3 className="category-title luxury-title">{cat}</h3>

            <div className="service-list">
              {(grouped[cat] || []).length > 0 ? (
                grouped[cat].map((s) => (
                  <div className="service-card luxury-service-card" key={s.id}>
                    <div className="service-info">
                      <span className="service-name">{s.name}</span>
                      <span className="service-price">
                        {s.price != null ? `$${Number(s.price).toFixed(2)}` : "$0.00"}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="service-actions">
                        <button className="edit-btn" onClick={() => handleEdit(s)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(s.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-category">No services added yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
