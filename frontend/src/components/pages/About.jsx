import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect } from "react";
import { Heart, ShieldCheck, Smile, Truck, Star } from "lucide-react";
import "./About.css";

function About() {
  useEffect(() => {
    document.title = "LULLABY | about us";
  }, []);
  return (
    <div className="about-page">
      <Navbar />

      <div className="about-header">
        <div className="header-content">
            <span className="brand-tag">EST. 2024</span>
            <h1 className="header-title">We are Lullaby.</h1>
            <p className="header-subtitle">
              We believe parenting should be a joy, not a worry. 
              Creating safe, soft, and sustainable essentials for your little miracle.
            </p>
        </div>
        <div className="circle-bg"></div>
      </div>
      <div className="stats-container">
        <div className="stat-item">
            <span className="stat-number">10k+</span>
            <span className="stat-label">Happy Moms</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
            <span className="stat-number">24h</span>
            <span className="stat-label">Fast Shipping</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Cotton Safe</span>
        </div>
      </div>
      <div className="story-wrapper">
        <div className="story-image-container">
             <div className="image-backdrop"></div>
             <img 
               src="https://static.vecteezy.com/system/resources/thumbnails/041/385/377/small/ai-generated-caucasian-mother-and-her-baby-at-meadow-photo.jpeg" 
               alt="Mother and Baby" 
               className="story-img"
             />
             <div className="floating-badge">
                <Star size={16} fill="#FFD54F" stroke="#FFD54F" />
                <span>Top Rated</span>
             </div>
        </div>

        <div className="story-content">
          <h4 className="section-eyebrow">OUR JOURNEY</h4>
          <h2 className="section-title">Born from a Mother's Love</h2>
          <p className="text-body">
            LULLABY wasn't started in a boardroom; it started in a nursery. 
            When we couldn't find products that met our standards for safety 
            and style, we decided to make them ourselves.
          </p>
          <p className="text-body">
            From our humble beginnings in Kerala, we strictly use <strong>non-toxic dyes</strong>, 
            <strong>organic fabrics</strong>, and <strong>ethical manufacturing</strong>. 
            Because your baby deserves the softest touch.
          </p>
        </div>
      </div>

      <div className="values-wrapper">
        <div className="values-header">
            <h2>Why Parents Trust Us</h2>
            <div className="underline"></div>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-box purple">
                <ShieldCheck size={32} />
            </div>
            <h3>Certified Safe</h3>
            <p> rigorous quality checks to ensure 100% safety for newborns.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box gold">
                <Heart size={32} />
            </div>
            <h3>Made with Love</h3>
            <p>Soft, organic cotton and breathable fabrics for all-day comfort.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box pink">
                <Truck size={32} />
            </div>
            <h3>Next Day Dispatch</h3>
            <p>We ship within 24 hours because babies grow fast.</p>
          </div>

          <div className="feature-card">
            <div className="icon-box blue">
                <Smile size={32} />
            </div>
            <h3>Community First</h3>
            <p>Join over 10,000 parents in the Lullaby family.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default About;