import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminProducts.css';

const AdminProduct = () => {
  const navigate = useNavigate();
  
  // Data State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState('http://127.0.0.1:8000/api/admin/products/');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name:'',
    description: '',
    price: '',
    discount_price: '',
    category_id: '', // Note: Backend expects category_id, not name
    section: '', // Default example
    image: null,
    is_active: true,
    variants:[{size:'',stock:0}]
  });

  // --- Auth Helper ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        navigate('/login');
        return {};
    }
    return {
      'Authorization': `Bearer ${token}`,
      // Do NOT set Content-Type here for FormData, axios sets it automatically
    };
  };

 const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: '', stock: 0 }]
    });
  };

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };
  useEffect(() => {
    fetchProducts(currentPageUrl);
  }, [currentPageUrl]);

  const fetchProducts = async (url) => {
    setLoading(true);
    try {
      const response = await axios.get(url, { headers: { 
          'Authorization': `Bearer ${localStorage.getItem("access_token")}` 
      }});
      
      // Handle Django PageNumberPagination response structure
      setProducts(response.data.results);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openAddModal = () => {
    setFormData({ name:'',description: '', price: '', discount_price: '', category_id: '', section: '', image: null, is_active: true,variants: [{ size: '', stock: 0 }], });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name:product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price,
      category_id: product.category_id || '', // Ensure we have the ID to send back
      section: product.section,
      image: null,
      variants: product.variants && product.variants.length > 0 
              ? product.variants 
              : [{ size: '', stock: 0 }],
      is_active: product.is_active
    });
    setEditId(product.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData for file upload support
    const data = new FormData();
    data.append('name', formData.name)
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('discount_price', formData.discount_price);
    data.append('category_id', formData.category_id);
    data.append('section', formData.section);
    data.append('is_active', formData.is_active);
    data.append('variants', JSON.stringify(formData.variants));
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (isEditing) {
        // PUT Request
        await axios.put(`http://127.0.0.1:8000/api/admin/products/${editId}/`, data, {
          headers: getAuthHeaders()
        });
        alert("Product updated successfully!");
      } else {
        // POST Request
        await axios.post('http://127.0.0.1:8000/api/admin/products/', data, {
          headers: getAuthHeaders()
        });
        alert("Product created successfully!");
      }
      setShowModal(false);
      fetchProducts(currentPageUrl); // Refresh list
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save product. Check inputs (Ensure Category ID exists).");
    }
  };

  const handlediactivate = async (id, currentStatus) => {
    const newStatus = !currentStatus; 

    const action = newStatus ? "activate" : "deactivate";
    
    if (!window.confirm(`Are you sure you want to ${action} this product?`)) return;

    try {
        await axios.patch(
            `http://127.0.0.1:8000/api/admin/products/${id}/`, 
            { is_active: newStatus }, 
            { headers: getAuthHeaders() }
        );

        fetchProducts(currentPageUrl);
    } catch (err) {
        console.error("Error:", err);
        alert("Failed to update status.");
    }
};

  return (
    <div className="products-container">
      <div className="page-header">
        <h1 className="page-title">Product Management</h1>
        <button className="btn-primary" onClick={openAddModal}>+ Add New Product</button>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock (Variants)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.image ? (
                      <img src={`http://127.0.0.1:8000${product.image}`} alt="Product" className="product-thumb" />
                    ) : (
                      <div style={{width: 50, height: 50, background: '#eee'}}></div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category || "No Category"}</td>
                  <td>${product.discount_price}</td>
                  <td>${product.price}</td>
                  <td>{product.total_stock}</td>
                  <td>
                    <span style={{ color: product.is_active ? 'green' : 'red', fontWeight: 'bold' }}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className='btn-admin-action'>
                    <button className="btn-view"onClick={() => navigate(`/admin/products/${product.id}`)}>View</button>
                    <button className={`btn-action ${product.is_active ? 'btn-deactive' : 'btn-active'}`}  onClick={() => handlediactivate(product.id, product.is_active)}>
                        {product.is_active ? 'Deactivate' : 'Activate'}</button>
                  </td>
                  
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan="7" className="text-center p-4">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        <button 
          className="btn-page" 
          disabled={!prevPage} 
          onClick={() => setCurrentPageUrl(prevPage)}
        >
          &larr; Previous
        </button>
        <button 
          className="btn-page" 
          disabled={!nextPage} 
          onClick={() => setCurrentPageUrl(nextPage)}
        >
          Next &rarr;
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleInputChange} />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <input type="text" name="description" className="form-input" required value={formData.description} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4" style={{display:'flex', gap:'10px'}}>
                <div className="form-group" style={{flex:1}}>
                  <label>Price</label>
                  <input type="number" name="price" className="form-input" required value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label>Discount Price</label>
                  <input type="number" name="discount_price" className="form-input" value={formData.discount_price} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Category ID</label>
                <input 
                  type="number" 
                  name="category_id" 
                  className="form-input" 
                  required 
                  placeholder="Enter Category ID"
                  value={formData.category_id} 
                  onChange={handleInputChange} 
                />
                <small style={{color: '#666'}}>Enter the ID of the category (e.g., 1, 2)</small>
              </div>

              <div className="form-group">
                <label>Section</label>
                <select name="section" className="form-input" value={formData.section} onChange={handleInputChange}>
                  <option value="">select size</option>
                  <option value="BOY">Boy</option>
                  <option value="GIRL">Girl</option>
                  <option value="BABY">Baby</option>
                </select>
              </div>

              <div className="form-group">
                <label>Image</label>
                <input type="file" name="image" className="form-input" onChange={handleInputChange} />
              </div>

              
              <div className="form-group">
                <label>Stock & Sizes</label>
                <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                  
                  {/* Headers */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', fontWeight: 'bold' }}>
                    <div style={{ flex: 1 }}>Size</div>
                    <div style={{ flex: 1 }}>Stock Quantity</div>
                    <div style={{ width: '30px' }}></div>
                  </div>

                  {/* List of Variants */}
                  {formData.variants.map((variant, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      
                      {/* Size Input (or Select) */}
                      <select 
                        className="form-input" 
                        style={{ flex: 1 }}
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        required
                      >
                        <option value="">Select Size</option>
                        <option value="6-12M">6–12 Months'</option>
                        <option value="1-2Y">3–1 Years'</option>
                        <option value="2-3Y">2–3 Years'</option>
                        <option value="3-4Y">3–4 Years'</option>
                        <option value="4-5Y">4–5 Years'</option>
                      </select>

                      {/* Stock Input */}
                      <input 
                        type="number" 
                        className="form-input" 
                        style={{ flex: 1 }}
                        placeholder="Qty"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        min="0"
                        required
                      />

                      {/* Delete Button */}
                      <button 
                        type="button" 
                        onClick={() => removeVariant(index)}
                        style={{ background: 'red', color: 'white', border: 'none', borderRadius: '4px', width: '30px', cursor: 'pointer' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {/* Add Button */}
                  <button 
                    type="button" 
                    onClick={addVariant} 
                    style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    + Add another Product variant
                  </button>
                </div>
              </div>
              <div className="form-group" style={{display:'flex', alignItems:'center'}}>
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} style={{marginRight: '10px'}} />
                <label style={{marginBottom:0}}>Is Active?</label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{isEditing ? 'Update Product' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProduct;