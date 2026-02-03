import React from "react";
import "./ContactUsPage.css";

export default function ContactUsPage() {
  return (
    <div className="contact-container">
      <h1 className="contact-title">Contact Us</h1>

      <div className="contact-card">
        <h2 className="section-title">Salon Information</h2>

        <div className="info-block">
          <p><strong>Address:</strong></p>
          <p>10864 La Grange Avenue<br />Los Angeles, CA 90025</p>
        </div>

        <div className="info-block">
          <p><strong>Phone:</strong></p>
          <p>(323) 629-7577</p>
        </div>

        {/* Social buttons – now inside the card, at the bottom */}
        <div className="social-buttons">
          <a
            href="https://www.instagram.com/getnaildla"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn instagram"
          >
            <span className="icon">📸</span> Instagram
          </a>

          <a
            href="https://www.tiktok.com/@getnaildla"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn tiktok"
          >
            <span className="icon">🎵</span> TikTok
          </a>
        </div>
      </div>

      <div className="map-container">
        <iframe
          title="Get Nail'd LA Map"
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: "12px" }}
          loading="lazy"
          allowFullScreen
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAtkrI_NnmY_jrkXjBa3w60zY0ojTUWo2E&q=Get+Nail'd+LA,10864+La+Grange+Avenue+Los+Angeles"
        ></iframe>
      </div>
    </div>
  );
}