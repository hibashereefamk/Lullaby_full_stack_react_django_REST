import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import axios from "axios"; 
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./Home.css"; 
import Footer from "./Footer";


function Home() {
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [currentSlide, setCurrentSlide] = useState(0);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promoRes = await axios.get("http://127.0.0.1:8000/api/promotions/");
        setPromotions(promoRes.data.results || promoRes.data);
        
        
        const catRes = await axios.get("http://127.0.0.1:8000/api/categories/");
        setCategories(catRes.data.results || catRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  
  useEffect(() => {
    if (promotions.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [promotions]);

  return (
    <div className="home-container">
      <Navbar />


      <div className="hero-container">
        {promotions.length > 0 ? (
          promotions.map((promo, index) => (
            <div
              key={promo.id}
             
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
    
              style={{ backgroundImage: `url(${promo.image})`, }} 
            >
              <div className="hero-overlay">
                <h1 className="hero-title">Welcome to lullaby</h1>
                <Link to="/products">
                  <button className="hero-button">
                    Shop Now <ArrowRight size={18} />
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="hero-slide active" style={{ backgroundColor: "#ddd" }}>
             <h2 style={{ marginLeft: "10%" }}>Loading offers...</h2>
          </div>
        )}
        
      
        <div className="dots-container">
          {promotions.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`dot ${index === currentSlide ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
      <div className="promo-bar">
      <div className="promo-content">
        <span className="promo-text">
          🎉 <strong>Big Sale!</strong> Get 50% OFF on all Winter Wear. Use Code: <strong>WINTER50</strong>
        </span>
       <Link to="/products"> <button className="promo-btn" >Shop Now</button></Link>
      </div>
    </div>

      
      <div className="section-container">
        <h2 className="section-heading"></h2>
        <div className="category-grid">
          {categories.length > 0 ? (
            categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
                <div className="category-card">
                  {/* --- DISCOUNT BADGE START --- */}
      {cat.discount_percentage > 0 && (
        <div className="discount-badge">
          {cat.discount_percentage}% OFF
        </div>
      )}
                  <img src={cat.image} alt={cat.name} className="category-image" />
                  <div className="category-label">{cat.name}</div>
                </div>
              </Link>
            ))
          ) : (
            <p>Loading categories...</p>
          )}   
        </div>
      </div>
      <Footer/>

    </div>
  );
}

export default Home;