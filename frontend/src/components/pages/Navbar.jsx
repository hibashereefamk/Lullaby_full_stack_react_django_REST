import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Navbar.css"; 
import { useShop } from "../context/WishlistContext";

function Navbar() {
  const navigate = useNavigate();
  const { wishlistCount,cartCount } = useShop();
  
  const [username, setUsername] = useState("");
  
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const profileRes = await axios.get("http://127.0.0.1:8000/api/profile/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsername(profileRes.data.name); 

        } catch (err) {
          console.error("Failed to fetch user data", err);
        }
      };
      fetchData();
      
    } 
    else {
      
      setUsername("");
    }
  }, [token]); 
  return (
    <div className="navbar">
      
      <div className="nav-left">
        <Link to="/" className="logo-soft">LULLABY</Link>

        <Link to="/" className="nav-link">HOME</Link>
        <Link to="/products" className="nav-link">PRODUCTS</Link>
        <Link to="/order" className="nav-link">MY ORDER</Link>
        <Link to="/about" className="nav-link">ABOUT</Link>
      </div>
      <div className="nav-right">
        
        <Link to="/wishlists" className="nav-link">
          <div className="icon-display">
            <Heart size={24} stroke="black" fill="black" />
            {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
          </div>
        </Link>

        {/* Cart Icon */}
        <Link to="/cart" className="nav-link">
          <div className="icon-display">
            <ShoppingCart size={24} stroke="black" fill="black" />
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </div>
        </Link>

        {/* AUTH CHECK: Shows 'Login' for new users, 'Profile' for logged in users */}
        {token ? (
          <Link to="/profile" className="nav-link" title="My Profile">
            <div className="profile-wrapper">
              <User size={24} stroke="black" fill="black" />
              <span className="profile-text">{username || "Profile"}</span>
            </div>
          </Link>
        ) : (
          <div className="login-btn" onClick={() => navigate("/login")} style={{cursor: 'pointer'}}>
            <span className="nav-link" style={{ gap: '5px', display: 'flex', alignItems: 'center' }}>
              <LogIn size={18} /> LOGIN
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

export default Navbar;