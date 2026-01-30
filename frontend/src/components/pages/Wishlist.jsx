import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, ShoppingCart, AlertCircle } from "lucide-react"; // Added AlertCircle
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom"; 
import "./Wishlist.css";
import Rating from "./Rating";
import { useShop } from "../context/WishlistContext";
import { showAlert } from "../../utils/swal";
function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();

  const { fetchCart, fetchWishlist: refreshGlobalWishlist } = useShop();
  
  const token = localStorage.getItem("access_token"); 

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const handleViewProduct = (id) => navigate(`/products/${id}`);

  const fetchLocalWishlist = () => {
    axios.get("http://127.0.0.1:8000/api/wishlist/", config)
      .then(res => {
        const items = res.data.results ? res.data.results : res.data;
        setWishlistItems(items); 
      })
      .catch(err => console.error("Error fetching wishlist:", err));
  };

  useEffect(() => {
    if (token) {
      fetchLocalWishlist();
    } else {
      showAlert("Please login to view your wishlist.");
      navigate("/login");
    }
  }, [token]);

  const removeFromWishlist = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/wishlist/${id}/`, config);
      
      setWishlistItems(prev => prev.filter(item => item.id !== id));
      
      refreshGlobalWishlist(); 

    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/cartitems/", 
        { product_id: productId, quantity: 1 }, // Changed 'product_id' to 'product' to match standard Django DRF
        config
      );
      
      if (response.status === 200 || response.status === 201) {
            showAlert("Added to cart!");
            fetchCart();
      }
    } catch (err) {
      console.error("Add to cart failed", err);
      showAlert("Failed to add to cart.");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="products-container">
        <h2 className="section-title">My Wishlist</h2>
        
        {wishlistItems.length === 0 ? (
            <div className="empty-wishlist">
                <AlertCircle size={48} color="#ccc" />
                <p className="empty-msg">Your wishlist is empty.</p>
                <button className="browse-btn" onClick={() => navigate("/")}>Browse Products</button>
            </div>
        ) : (
            <div className="product-grid">
            {wishlistItems.map(item => {
              // Safety check to ensure item.product exists
              if (!item.product) return null;

              const hasDiscount = item.product.discount_price !== null && item.product.discount_price > 0;
              const displayPrice = hasDiscount ? item.product.discount_price : item.product.price; 
              
              return (
                <div key={item.id} className="product-card wishlist-card">
                    <div className="image-wrapper" onClick={() => handleViewProduct(item.product.id)}>
                        <img 
                            className="product-image" 
                            src={item.product.image} 
                            alt={item.product.name} 
                        />
                    </div>

                    <div className="product-details">
                        <h3>{item.product.name}</h3>
                        
                        <div className="price-row">
                             <span className="prdt-price">₹{displayPrice}</span>
                             {hasDiscount && (
                                <span className="discount-price">₹{item.product.price}</span>
                             )}
                        </div>
                        
                        <Rating value={item.product.rating} text={`(${item.product.rating}k)`} />
                        
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
                                onClick={() => addToCart(item.product.id)} 
                            >
                                <ShoppingCart size={18} />
                            </button>
                        </div>
                    </div>
                </div>
              )})}
            </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;