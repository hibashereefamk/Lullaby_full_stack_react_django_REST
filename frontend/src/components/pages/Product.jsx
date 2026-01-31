import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Heart, ShoppingCart, Filter,ChevronDown } from "lucide-react";
import Navbar from "./Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import './Product.css';
import Rating from "./Rating";
import { showAlert } from "../../utils/swal";


import { useShop } from "../context/WishlistContext"; 

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(); 
  const [selectedSection, setSelectedSection] = useState(""); 
  const [sortOrder, setSortOrder] = useState("");
  
  const { toggleWishlist, isInWishlist,fetchCart } = useShop();

  const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

  const sections = [
    { id: "BOY", name: "Boy" },
    { id: "GIRL", name: "Girl" },
    { id: "BABY", name: "Baby" }
  ];

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "LULLABY | products";
  }, []);
  useEffect(() => {
    if (location.state?.category) setSelectedCategory(location.state.category);
    if (location.state?.section) setSelectedSection(location.state.section);
  }, [location]);

 useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/categories/');
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : data.results); 
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedSection, sortOrder]);


  
  
  useEffect(() => {
    const fetchProducts = async () => {
        try {
          
            const params = {
                page: currentPage,
                search: search,
                category: selectedCategory,
                section: selectedSection,
            };

            
            if (sortOrder === "lowToHigh") params.ordering = "price";
            if (sortOrder === "highToLow") params.ordering = "-price";

            const response = await axios.get('http://127.0.0.1:8000/api/products/', { params });

            
            if (response.data.results) {
                setProducts(response.data.results);
                
               
                const totalCount = response.data.count;
                setTotalPages(Math.ceil(totalCount / pageSize));
            } else {
                
                setProducts(response.data);
            }
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [currentPage, search, selectedCategory, selectedSection, sortOrder]);



  const handleViewProduct = (id) => navigate(`/products/${id}`);

  
  const handleFavClick = (e, product) => {
    e.stopPropagation(); 
    toggleWishlist(product); 
  };

  const handleAddToCart = async (e, product) => {
     e.stopPropagation();

     const token = localStorage.getItem("access_token");
     if (!token) return showAlert("Please login");
     try {
        await axios.post("http://127.0.0.1:8000/api/cartitems/", 
           { product_id: product.id, quantity: 1 }, 
           { headers: { Authorization: `Bearer ${token}` } }
        );
        showAlert("Added to cart!");
        fetchCart();
        
     } catch(err) { console.error(err); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <div className="main-layout">
        <aside className="sidebar">
            <div className="sidebar-header"><Filter size={20} /><h3>Filters</h3></div>
             <div className="filter-section">
                <h4>Gender</h4>
                <ul className="category-list">
                    <li onClick={() => setSelectedSection("")} className={!selectedSection ? "active":""}>All</li>
                    {sections.map(s => (
                        <li key={s.id} onClick={() => setSelectedSection(s.id)} className={selectedSection===s.id?"active":""}>{s.name}</li>
                    ))}
                </ul>
                <h4>Categories of products</h4>
                <ul className="category-list">
                    <li onClick={() => setSelectedCategory("")} className={!selectedCategory ? "active":""}>All</li>
                    {categories.map(s => (
                        <li key={s.id} onClick={() => setSelectedCategory(s.id)} className={selectedCategory ===s.id?"active":""}>{s.name}</li>
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
                
                
            <div className="relative">
              <select 
                className="sort-button"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="default">Sort by</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
              <ChevronDown size={18} color="#666" />
            </div>
            </div>

            <div className="product-grid">
                {products.map(product => {
                    const hasDiscount = product.discount_price > 0;
                    const isLiked = isInWishlist(product.id);

                    return (
                        <div key={product.id} className="product-card" onClick={() => handleViewProduct(product.id)}>
                            <div className="image-wrapper">
                                <img className="product-image" src={product.image} alt={product.name} />
                                
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
                                    <Rating value={product.rating} text={product.rating ? `${product.rating}k reviews`:''}/>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
      <div className="pagination-controls">
                <button 
                    onClick={handlePrev} 
                    disabled={currentPage === 1}
                    className="page-btn"
                >
                    Previous
                </button>

                <span className="page-info">
                    Page {currentPage} of {totalPages}
                </span>

                <button 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages}
                    className="page-btn"
                >
                    Next
                </button>
            </div>
    </div>
  );
}

export default Products;