import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, ShoppingCart } from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom"; 
import "./Wishlist.css";

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();

  // 1. Get Token
  const token = localStorage.getItem("access_token"); 

  // 2. Config
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    if (token) {
      fetchWishlist();
    } else {
      alert("Please login to view your wishlist.");
      navigate("/login");
    }
  }, [token]);

  const fetchWishlist = () => {
    axios.get("http://127.0.0.1:8000/api/wishlist/", config)
      .then(res => {
        console.log("Wishlist Data:", res.data); // Debugging
        setWishlistItems(res.data);
      })
      .catch(err => console.error("Error fetching wishlist:", err));
  };

  const removeFromWishlist = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/wishlist/${id}/`, config);
      setWishlistItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/cartitems/", 
        { product_id: productId, quantity: 1 }, 
        config
      );
      if (response.status === 200) {
            alert(response.data.message || "Product quantity increased!");
        } else if (response.status === 201) {
            alert(`${product.name} added to cart!`);
        }
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("Failed to add to cart.");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="products-container">
        <h2 className="section-title">My Wishlist</h2>
        
        {wishlistItems.length === 0 ? (
            <div className="empty-wishlist">
                <p className="empty-msg">Your wishlist is empty.</p>
            </div>
        ) : (
            <div className="product-grid">
            {wishlistItems.map(item => (
                <div key={item.id} className="product-card wishlist-card">
                    {/* Image Area */}
                    <div className="image-wrapper">
                        {/* FIX: Use item.product.image */}
                        <img 
                            className="product-image" 
                            src={item.product.image} 
                            alt={item.product.name} 
                        />
                    </div>

                    {/* Details Area */}
                    <div className="product-details">
                        {/* FIX: Use item.product.name */}
                        <h3>{item.product.name}</h3>
                        
                        {/* FIX: Use item.product.price */}
                        <p className="product-price">₹{item.product.price}</p>
                        
                        <div className="card-actions">
                            <button 
                                className="icon-btn delete" 
                                title="Remove"
                                onClick={() => removeFromWishlist(item.id)} 
                            >
                                <Trash2 size={18} />
                            </button>
                            
                            <button 
                                className="icon-btn cart" 
                                title="Add to Cart"
                                // FIX: Use item.product.id
                                onClick={() => addToCart(item.product.id)} 
                            >
                                <ShoppingCart size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;