import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Heart, ShoppingCart, Filter } from "lucide-react";
import Navbar from "./Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import './Product.css';
import Rating from "./Rating";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // --- FILTER STATES ---
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [selectedSection, setSelectedSection] = useState(""); // Stores 'BOY', 'GIRL', 'BABY'
  const [sortOrder, setSortOrder] = useState("");
  const [priceRange, setPriceRange] = useState(10000);

  // --- SECTIONS (Matches your Django Model CHOICES) ---
  const sections = [
    { id: "BOY", name: "Boy" },
    { id: "GIRL", name: "Girl" },
    { id: "BABY", name: "Baby" }
  ];

  const location = useLocation();
  const navigate = useNavigate();

  // 1. Initialize Filters from Navigation
  useEffect(() => {
    if (location.state?.category) setSelectedCategory(location.state.category);
    if (location.state?.section) setSelectedSection(location.state.section);
  }, [location]);

  // 2. Fetch Categories
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/categories/").then(res => {
        const cleanCats = res.data.results || res.data; 
        const filtered = Array.isArray(cleanCats) ? cleanCats.filter(c => c.name !== "Uncategorized") : [];
        setCategories(filtered);
    });
  }, []);

  // 3. MAIN FETCH (Sends 'section' to Backend)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "http://127.0.0.1:8000/api/products/?";
        const params = [];

        if (search) params.push(`search=${search}`);
        if (selectedCategory) params.push(`category=${selectedCategory}`);
        
        // Matches your Django field name "section"
        if (selectedSection) params.push(`section=${selectedSection}`);

        if (sortOrder === "lowToHigh") params.push("ordering=price");
        if (sortOrder === "highToLow") params.push("ordering=-price");
        

        const finalUrl = url + params.join("&");
        console.log("Fetching URL:", finalUrl); // Debug to check if section=BOY is added
        
        const response = await axios.get(finalUrl);
        setProducts(response.data.results || response.data);

      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    const timeoutId = setTimeout(() => {
        fetchProducts();
    }, 500);

    return () => clearTimeout(timeoutId);

  }, [search, selectedCategory, selectedSection, sortOrder, priceRange]);

  // Handlers
  const handleViewProduct = (id) => navigate(`/products/${id}`);


  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); 
    
  const token = localStorage.getItem("access_token"); 

    if (!token) {
        alert("Please login first to add items to cart.");
        return;
    }

    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`, 
                "Content-Type": "application/json",
            },
        };

        const response = await axios.post(
            "http://127.0.0.1:8000/api/cartitems/", 
            { product_id: product.id, quantity: 1 }, 
            config 
        );
        if (response.status === 200) {
            alert(response.data.message || "Product quantity increased!");
        } else if (response.status === 201) {
            alert(`${product.name} added to cart!`);
        }

    } catch (error) {
        console.error("Cart error:", error.response?.data || error);
        alert("Could not add to cart. Check console for details.");
    }
  };

  const handleWishlist = async (e, product) => {
    e.stopPropagation();
    
    const token = localStorage.getItem("access_token"); 

    if (!token) {
        alert("Please login first.");
        return;
    }

    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };

        await axios.post(
            "http://127.0.0.1:8000/api/wishlist/", 
            { product_id: product.id }, 
            config
        );
        alert("Added to wishlist!");

    } catch (error) {
        console.error("Wishlist error:", error);
    }
  };
   const displayPrice = products.discount_price ? products.discount_price : products.price;
  const hasDiscount = products.discount_price !== null && products.discount_price > 0;
  return (
    <div className="page-wrapper">
      <Navbar />
      
      <div className="main-layout">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="sidebar">
            <div className="sidebar-header">
                <Filter size={20} />
                <h3>Filters</h3>
            </div>

            {/* 1. SECTION FILTER (Matches Database) */}
            <div className="filter-section">
                <h4>Gender / Section</h4>
                <ul className="category-list">
                    <li 
                        className={selectedSection === "" ? "active" : ""} 
                        onClick={() => setSelectedSection("")}
                    >
                        All
                    </li>
                    {sections.map(sec => (
                        <li 
                            key={sec.id} 
                            className={selectedSection === sec.id ? "active" : ""}
                            onClick={() => setSelectedSection(sec.id)}
                        >
                            {sec.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* 2. CATEGORY FILTER */}
            <div className="filter-section">
                <h4>Categories</h4>
                <ul className="category-list">
                    <li 
                        className={selectedCategory === "" ? "active" : ""} 
                        onClick={() => setSelectedCategory("")}
                    >
                        All Categories
                    </li>
                    {categories.map(cat => (
                        <li 
                            key={cat.id} 
                            className={selectedCategory === (cat.slug || cat.id) ? "active" : ""}
                            onClick={() => setSelectedCategory(cat.slug || cat.id)}
                        >
                            {cat.name}
                        </li>
                    ))}
                </ul>
            </div>

           
        </aside>

        {/* --- RIGHT CONTENT --- */}
        <div className="content-area">
            
            <div className="top-bar">
                 <div className="search-wrapper">
                    <Search size={18} color="#666" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)} 
                    />
                </div>
                <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="">Sort By</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                </select>
            </div>

            <div className="product-grid">
                {products.map(product => {
  const hasDiscount =
    product.discount_price !== null && product.discount_price > 0;

  const displayPrice = hasDiscount
    ? product.discount_price
    : product.price;

  return (
    <div
      key={product.id}
      className="product-card"
      onClick={() => handleViewProduct(product.id)}
    >
      <div className="image-wrapper">
        <img
          className="product-image"
          src={product.image}
          alt={product.name}
        />

        <button
          className="wishlist-btn"
          onClick={(e) => handleWishlist(e, product)}
        >
          <Heart size={18} />
        </button>

        <div className="card-overlay">
          <button
            className="add-cart-btn"
            onClick={(e) => handleAddToCart(e, product)}
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>
      </div>

      <div className="product-details">
        <h3 className="prdt-title">{product.name}</h3>

        <div className="price-section">
          <p className="prdt-price">₹{displayPrice}</p>

          {hasDiscount && (
            <span className="discount-price">
              ₹{product.price}
            </span>
          )}<Rating value={product.rating} text={`(${product.rating} k reviews)`} />
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