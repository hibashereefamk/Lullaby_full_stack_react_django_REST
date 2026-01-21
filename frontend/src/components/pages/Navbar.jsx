import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, LogIn,User, Home, Info, Package, ShoppingBag } from "lucide-react";
import { useEffect,useState } from "react";
import axios from "axios";
function Navbar() {
//   const { cart } = useContext(updateContext);
//   const { favorite } = useContext(UpdatefavContext);
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
          setUsername(res.data.name); // Store the username from backend
        } catch (err) {
          console.error("Failed to fetch user", err);
        }
      };
      fetchUser();
    }
  }, [isLoggedIn]);// Returns true if user exists


  return (
    <div
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 30px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        height: "80px",
        boxSizing: "border-box"
      }}
    >
      
      {/* LEFT SECTION: LOGO + MENU LINKS */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Logo Image */}
        <Link to="/">
          <h2 style={{fontFamily:"'Poppins', sans-serif",fontWeight: "700",fontSize: "1.8rem"}}>LULLABY</h2>
          
        </Link>

        {/* Navigation Links */}
        <Link to="/" style={linkStyle}>
          <Home size={18}/> HOME
        </Link>
        <Link to="/products" style={linkStyle}>
          <Package size={18} /> PRODUCTS
        </Link>
        <Link to="/order" style={linkStyle}>
          <ShoppingBag size={18} /> MY ORDER
        </Link>
        <Link to="/about" style={linkStyle}>
          <Info size={18} /> ABOUT
        </Link>
      </div>

      
      {/* RIGHT SECTION: ICONS + LOGIN BUTTON */}
      <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
        
        {/* Wishlist Icon */}
        <Link to="/wishlists" style={linkStyle}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Heart
              size={24} 
            //   stroke={favorite > 0 ? "red" : "black"}
            //   fill={favorite > 0 ? "red" : "none"}
            />
            {/* {favorite > 0 && (
                <span style={badgeStyle}>{favorite}</span>
            )} */}
          </div>
        </Link>

        {/* Cart Icon */}
        <Link to="/cart" style={linkStyle}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <ShoppingCart size={24} color="black" />
            {/* {cart > 0 && (
              <span style={badgeStyle}>{cart}</span>
            )} */}
          </div>
        </Link>

        {isLoggedIn ? (
          <Link to="/profile" style={linkStyle} title="My Profile">
             <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <User size={24} color="black" />
                {/* Display the username here */}
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>Profile</span>
             </div>
          </Link>
        ) : (
          <div
            style={{ border: "2px solid black", borderRadius: "5px", padding: "5px 15px", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            <span style={{ ...linkStyle, fontSize: "14px" }}>
              <LogIn size={18} /> LOGIN
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

// STYLES
const linkStyle = {
  textDecoration: "none",
  color: "black",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: "600",
  fontSize: "14px",
  fontFamily: "Arial, sans-serif"
};

const badgeStyle = {
    position: "absolute",
    top: "-8px",
    right: "-10px",
    background: "red",
    color: "white",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "10px",
    fontWeight: "bold",
};

export default Navbar;