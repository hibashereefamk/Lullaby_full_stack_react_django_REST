import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, Heart, ShoppingCart, Filter } from "lucide-react";
import Navbar from "./Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import './Product.css';
import Rating from "./Rating";

// 1. Import the Context Hook
import { useWishlist } from "../context/WishlistContext"; 

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [selectedSection, setSelectedSection] = useState(""); 
  const [sortOrder, setSortOrder] = useState("");

  // 2. USE CONTEXT (This replaces the old 'user.fav' logic)
  const { toggleWishlist, isInWishlist } = useWishlist();

  const sections = [
    { id: "BOY", name: "Boy" },
    { id: "GIRL", name: "Girl" },
    { id: "BABY", name: "Baby" }
  ];

  const location = useLocation();
  const navigate = useNavigate();

  // --- 1. Fetching Logic (Same as before) ---
  useEffect(() => {
    if (location.state?.category) setSelectedCategory(location.state.category);
    if (location.state?.section) setSelectedSection(location.state.section);
  }, [location]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/categories/").then(res => {
        setCategories(res.data.results || res.data);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
        let url = "http://127.0.0.1:8000/api/products/?";
        const params = [];
        if (search) params.push(`search=${search}`);
        if (selectedCategory) params.push(`category=${selectedCategory}`);
        if (selectedSection) params.push(`section=${selectedSection}`);
        if (sortOrder === "lowToHigh") params.push("ordering=price");
        if (sortOrder === "highToLow") params.push("ordering=-price");
        
        const response = await axios.get(url + params.join("&"));
        setProducts(response.data.results || response.data);
    };
    // Debounce search slightly
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedSection, sortOrder]);


  // --- 2. Handlers ---
  const handleViewProduct = (id) => navigate(`/products/${id}`);

  // This function handles the click on the Heart
  const handleFavClick = (e, product) => {
    e.stopPropagation(); // Stop clicking the card
    toggleWishlist(product); // Let Context handle API and State
  };

  const handleAddToCart = async (e, product) => {
     e.stopPropagation();
     // ... (Your Add to Cart logic here) ...
     const token = localStorage.getItem("access_token");
     if (!token) return alert("Please login");
     try {
        await axios.post("http://127.0.0.1:8000/api/cartitems/", 
           { product_id: product.id, quantity: 1 }, 
           { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Added to cart!");
     } catch(err) { console.error(err); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <div className="main-layout">
        <aside className="sidebar">
            <div className="sidebar-header"><Filter size={20} /><h3>Filters</h3></div>
            {/* ... Filters (Gender/Category) ... */}
             <div className="filter-section">
                <h4>Gender</h4>
                <ul className="category-list">
                    <li onClick={() => setSelectedSection("")} className={!selectedSection ? "active":""}>All</li>
                    {sections.map(s => (
                        <li key={s.id} onClick={() => setSelectedSection(s.id)} className={selectedSection===s.id?"active":""}>{s.name}</li>
                    ))}
                </ul>
            </div>
        </aside>

        <div className="content-area">
            <div className="top-bar">
                <div className="search-wrapper">
                    <Search size={18} color="#666" />
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {/* ... Sort Dropdown ... */}
            </div>

            <div className="product-grid">
                {products.map(product => {
                    const hasDiscount = product.discount_price > 0;
                    
                    // 3. CHECK IF LIKED (Using Context)
                    const isLiked = isInWishlist(product.id);

                    return (
                        <div key={product.id} className="product-card" onClick={() => handleViewProduct(product.id)}>
                            <div className="image-wrapper">
                                <img className="product-image" src={product.image} alt={product.name} />

                                {/* 4. THE HEART ICON (Style matches your old project) */}
                                <div className="wishlist-icon">
                                    <Heart 
                                        size={24}
        
                                        color={isLiked ? "red" : "gray"} 
                                        
                                        fill={isLiked ? "red" : "none"} 
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => handleFavClick(e, product)}
                                    />
                                </div>

                                <div className="card-overlay">
                                    <button className="add-cart-btn" onClick={(e) => handleAddToCart(e, product)}>
                                        <ShoppingCart size={16} /> Add to Cart
                                    </button>
                                </div>
                            </div>

                            <div className="product-details">
                                <h3 className="prdt-title">{product.name}</h3>
                                <div className="price-section">
                                    <p className="prdt-price">₹{hasDiscount ? product.discount_price : product.price}</p>
                                    {hasDiscount && <span className="discount-price">₹{product.price}</span>}
                                    <Rating value={product.rating} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
}

export default Products;