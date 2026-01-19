import React from "react";
import { Link } from "react-router-dom";
import {Mail, Phone, MapPin } from "lucide-react";
import { FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Column 1: Brand Info */}
        <div className="footer-column">
          <h2 style={{ fontSize: "2rem", margin: 0, color: "white" }}>LULLABY</h2>
          <p style={{ marginTop: "15px", lineHeight: "1.6", color: "#E1BEE7" }}>
            Providing the softest comfort for your little ones. 
            Quality baby products designed with love and care.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/products" className="footer-link">Shop All</Link>
          <Link to="/about" className="footer-link">About Us</Link>
          <Link to="/order" className="footer-link">Track Order</Link>
        </div>

        {/* Column 3: Customer Care */}
        <div className="footer-column">
          <h3>Customer Care</h3>
          <Link to="/contact" className="footer-link">Contact Us</Link>
          <Link to="/faq" className="footer-link">Shipping & Returns</Link>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <Link to="/terms" className="footer-link">Terms & Conditions</Link>
        </div>

        {/* Column 4: Contact & Social */}
        <div className="footer-column">
          <h3>Contact Us</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px", color: "#E1BEE7" }}>
            <MapPin size={18} /> Kochi, Kerala, India
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px", color: "#E1BEE7" }}>
            <Phone size={18} /> +91 98765 43210
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", color: "#E1BEE7" }}>
            <Mail size={18} /> support@lullaby.com
          </div>

          <div className="social-icons">
            <FaTwitter size={24} color="#1DA1F2" />
            <FaFacebook size={24} color="#1877F2" />
            <FaInstagram size={24} color="#E4405F" />
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Lullaby. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;