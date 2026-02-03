import React, { useEffect, useState } from "react";
import api from "../api";
import "./SalesReportPage.css";

export default function SalesReportPage({ role }) {
  const [report, setReport] = useState([]);
  const isAuthorized = role === "admin" || role === "staff";

  useEffect(() => {
    if (isAuthorized) loadReport();
  }, [isAuthorized]);

  const loadReport = async () => {
    try {
      const res = await api.get("/api/reports/daily-sales");
      setReport(res.data || []);
    } catch (err) {
      console.error("Error loading sales report:", err);
    }
  };

  if (!isAuthorized) {
    return <p className="unauthorized">Access denied. Admins and Staff only.</p>;
  }

  return (
    <div className="sales-report-container">
      <h2 className="sales-title">Daily Sales Report</h2>
      <p className="sales-subtitle">
        Automatically calculated based on today's appointments
      </p>

      <div className="sales-table">
        <table>
          <thead>
            <tr>
              <th>Nail Technician</th>
              <th>Total Sales ($)</th>
            </tr>
          </thead>
          <tbody>
            {report.length > 0 ? (
              report.map((r, i) => (
                <tr key={i}>
                  <td>{r.nailTech}</td>
                  <td>${Number(r.totalSales || 0).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No appointments for today.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
