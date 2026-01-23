import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, LogIn, User, Home, Info, Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Navbar.css"; 

function Navbar() {
  // const { cart } = useContext(updateContext);
  // const { favorite } = useContext(UpdatefavContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const isLoggedIn = !!localStorage.getItem("access_token");

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem("access_token");
          const res = await axios.get("http://127.0.0.1:8000/api/profile/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsername(res.data.name); 
        } catch (err) {
          console.error("Failed to fetch user", err);
        }
      };
      fetchUser();
    }
  }, [isLoggedIn]);

  return (
    <div className="navbar">
      
      {/* LEFT SECTION: LOGO + MENU LINKS */}
      <div className="nav-left">
        {/* Logo Image */}
        <Link to="/" className="logo-soft">
          LULLABY
        </Link>

        {/* Navigation Links */}
        <Link to="/" className="nav-link">
           HOME
        </Link>
        <Link to="/products" className="nav-link">
           PRODUCTS
        </Link>
        <Link to="/order" className="nav-link">
           MY ORDER
        </Link>
        <Link to="/about" className="nav-link">
           ABOUT
        </Link>
      </div>

      {/* RIGHT SECTION: ICONS + LOGIN BUTTON */}
      <div className="nav-right">
        
        {/* Wishlist Icon */}
        <Link to="/wishlists" className="nav-link">
          <div className="icon-wrapper">
            <Heart size={24} stroke="black" fill="black" />
            {/* {favorite > 0 && <span className="badge">{favorite}</span>} */}
          </div>
        </Link>

        {/* Cart Icon */}
        <Link to="/cart" className="nav-link">
          <div className="icon-wrapper">
            <ShoppingCart size={24} stroke="black" fill="black" />
            {/* {cart > 0 && <span className="badge">{cart}</span>} */}
          </div>
        </Link>

        {/* Auth Check */}
        {isLoggedIn ? (
          <Link to="/profile" className="nav-link" title="My Profile">
            <div className="profile-wrapper">
              <User size={24} stroke="black" fill="black" />
              {/* Display username if you want, or just "Profile" */}
              <span className="profile-text">Profile</span>
            </div>
          </Link>
        ) : (
          <div className="login-btn" onClick={() => navigate("/login")}>
            <span className="nav-link" style={{ gap: '5px' }}>
              <LogIn size={18} /> LOGIN
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

export default Navbar;