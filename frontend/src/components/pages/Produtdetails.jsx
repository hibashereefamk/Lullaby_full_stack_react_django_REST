import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, Heart, ArrowLeft, Check } from "lucide-react";
import Navbar from "./Navbar";
import "./Produtdetails.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New state for selected size
  const [selectedSize, setSelectedSize] = useState(null);

  // 1. Fetch Product Data
  useEffect(() => {
    // Note: Ensure this matches your URL from urls.py (e.g., /api/productdetails/ or /api/products/)
    axios.get(`http://127.0.0.1:8000/api/productdetails/${id}/`) 
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id]);

  // 2. Add to Cart Handler
  const addToCart = async () => {

    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Please login first.");
        navigate("/login");
        return;
    }

    // Validate Size Selection (Only if variants exist)
    if (product.variants && product.variants.length > 0 && !selectedSize) {
        alert("Please select a size first.");
        return;
    }

    try {
      const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
      };

      // Use the correct endpoint /api/cartitems/
      await axios.post(
        "http://127.0.0.1:8000/api/cartitems/", 
        { product_id: product.id, quantity: 1 },
        config
      );
      if (response.status === 200) {
            alert(response.data.message || "Product quantity increased!");
        } else if (response.status === 201) {
            alert(`${product.name} added to cart!`);
        }
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("Failed to add to cart. Check console for details.");
    }
  };

  // 3. Add to Wishlist Handler
  const addToWishlist = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Please login first.");
        return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/wishlist/", 
        { product_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to Wishlist!");
    } catch (err) {
      console.error("Add to wishlist failed", err);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!product) return <div className="error-msg">Product not found</div>;

  // Price Calculation Logic
  const displayPrice = product.discount_price ? product.discount_price : product.price;
  const hasDiscount = product.discount_price !== null && product.discount_price > 0;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="detail-container">
        
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} /> Back
        </button>

        <div className="product-detail-card">
          {/* Left: Image */}
          <div className="detail-image-wrapper">
            <img className="main-img" src={product.image} alt={product.name} />
          </div>

          {/* Right: Info */}
          <div className="detail-info">
           
            
            <h1 className="product-title">{product.name}</h1>
            
            {/* Price Section */}
            <div className="price-block">
                <span className="current-price">₹{displayPrice}</span>
                {hasDiscount && (
                    <span className="original-price-red">₹{product.price}</span>
                )}
            </div>

            <p className="description">{product.description}</p>

            {/* Variants / Size Selector */}
            {product.variants && product.variants.length > 0 && (
                <div className="size-section">
                    <h3>Select Size</h3>
                    <div className="size-grid">
                        {product.variants.map((variant) => (
                            <button 
                                key={variant.id}
                                disabled={variant.stock <= 0}
                                className={`size-btn ${selectedSize === variant.size ? 'active' : ''} ${variant.stock === 0 ? 'disabled' : ''}`}
                                onClick={() => setSelectedSize(variant.size)}
                            >
                                <span className="size-label">{variant.size}</span>
                                {variant.stock <= 0 ?(<span className="stock-msg out"> Out of Stock</span>): variant.stock < 10 ? (
                                  <span className="stock-msg low"> Only {variant.stock} left!</span>
                                ):null}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn-cart" onClick={addToCart}>
                <ShoppingCart size={20} /> Add to Cart
              </button>
              
              <button className="btn-wishlist" onClick={addToWishlist}>
                <Heart size={20} /> Wishlist
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;