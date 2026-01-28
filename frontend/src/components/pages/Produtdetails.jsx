import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShoppingCart, Heart, ArrowLeft, Check } from "lucide-react";
import Navbar from "./Navbar";
import "./Produtdetails.css";
import Rating from "./Rating";
import { useShop } from "../context/WishlistContext";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
 
  
  // New state for selected size
  const [selectedSize, setSelectedSize] = useState(null);

const { toggleWishlist, isInWishlist,fetchCart } = useShop();
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
      const response = await axios.post(
        "http://127.0.0.1:8000/api/cartitems/", 
        { product_id: product.id, quantity: 1,size: selectedSize},
        config
      );
      if (response.status === 200) {
            alert(response.data.message || "Product quantity increased!");
            fetchCart()
        } else if (response.status === 201) {
            alert(`${product.name} added to cart!`);
            fetchCart()
        }
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("Failed to add to cart. Check console for details.");
    }
  };

 
 const handleFavClick = () => {
    if (product){
      toggleWishlist(product); 
    }
    
  };
 
  if (loading) return <div className="loading-container">loading .....</div>;
  if (!product) return <div className="error-msg">Product not found</div>;
 
  const displayPrice = product.discount_price ? product.discount_price : product.price;
  const hasDiscount = product.discount_price !== null && product.discount_price > 0;
 const isLiked = isInWishlist(product.id);
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="detail-container">
        
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
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
                    <Rating style={{ justifyContent: 'flex-start' }} value={product.rating} text={`(${product.rating}k reviews)`} />
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn-cart" onClick={addToCart}>
                <ShoppingCart size={20} /> Add to Cart
              </button>
              
              <button className="btn-wishlist" onClick={()=>handleFavClick()}>
                <Heart size={20} color={isLiked? "red" : "gray"} 
                                        
                                        fill={isLiked ? "red" : "none"}  /> Wishlist
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;