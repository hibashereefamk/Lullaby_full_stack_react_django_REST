import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, LogIn, LogOut, Home, Info, Package, ShoppingBag } from "lucide-react";


// import lullaby_logo from "../../assets/lullaby_logo.jpeg";

// import { UpdatefavContext } from "../components/whishlistcounter";
// import { updateContext } from "../components/cartcounter"; 

// FIX 1: Import the logo correctly
// If your image is in src/images/logo.png, use this:
// import logo from "../images/logo.png"; 
// If it is in src/assets/, keep it as "../assets/logo.png"

function Navbar() {
//   const { cart } = useContext(updateContext);
//   const { favorite } = useContext(UpdatefavContext);
  const navigate = useNavigate();

  // FIX 2: Check for user login status safely
  // It is better to check if the token or user object exists
  const isLoggedIn = !!localStorage.getItem("user"); // Returns true if user exists

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data
    localStorage.removeItem("token"); // Clear token if you have one
    window.location.reload(); // Refresh to update UI immediately
    // Or use navigate('/login') if you have a global auth state context
  };

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

        {/* Login / Logout Button */}
        <div
          style={{
            border: "2px solid black",
            borderRadius: "5px",
            padding: "5px 15px",
            cursor: "pointer",
            transition: "0.3s"
          }}
          onClick={isLoggedIn ? handleLogout : () => navigate("/login")}
        >
          <span style={{ ...linkStyle, fontSize: "14px" }}>
            {isLoggedIn ? <LogOut size={18} /> : <LogIn size={18} />}
            {isLoggedIn ? " LOGOUT" : " LOGIN"}
          </span>
        </div>

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