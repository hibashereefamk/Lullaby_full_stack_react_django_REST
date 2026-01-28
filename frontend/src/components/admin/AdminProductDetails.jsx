import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminProductDetail.css';

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    section: '',
    is_active: true,
    variants: [],
    image: null
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return { 'Authorization': `Bearer ${token}` };
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/admin/products/${id}/`, {
        headers: getAuthHeaders()
      });
      setProduct(response.data);
    } catch (err) {
      console.error("Error fetching product:", err);
      alert("Product not found.");
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };
  const handleToggleStatus = async () => {
    const action = product.is_active ? "Deactivate" : "Activate";
    if (!window.confirm(`Are you sure you want to ${action} this product?`)) return;

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/admin/products/${id}/`, 
        { is_active: !product.is_active }, 
        { headers: getAuthHeaders() }
      );
      setProduct({ ...product, is_active: response.data.is_active });
      alert(`Product ${action}d successfully!`);
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this product?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/products/${id}/`, {
        headers: getAuthHeaders()
      });
      alert("Product deleted.");
      navigate('/admin/products');
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    }
  };
  const openEditModal = () => {
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price,
      category_id: product.category_id || '', 
      section: product.section,
      is_active: product.is_active,
      variants: product.variants || [],
      image: null 
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === 'file') setEditFormData({ ...editFormData, image: files[0] });
    else if (type === 'checkbox') setEditFormData({ ...editFormData, is_active: checked });
    else setEditFormData({ ...editFormData, [name]: value });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...editFormData.variants];
    newVariants[index][field] = value;
    setEditFormData({ ...editFormData, variants: newVariants });
  };

  const addVariant = () => {
    setEditFormData({ ...editFormData, variants: [...editFormData.variants, { size: '', stock: 0 }] });
  };

  const removeVariant = (index) => {
    const newVariants = editFormData.variants.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, variants: newVariants });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(editFormData).forEach(key => {
      if (key === 'variants') data.append('variants', JSON.stringify(editFormData.variants));
      else if (key === 'image' && editFormData.image) data.append('image', editFormData.image);
      else if (key !== 'image') data.append(key, editFormData[key]);
    });

    try {
      const response = await axios.patch(`http://127.0.0.1:8000/api/admin/products/${id}/`, data, {
        headers: getAuthHeaders()
      });
      setProduct(response.data); 
      setShowEditModal(false);
      alert("Product updated!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update.");
    }
  };

  if (loading) return <div className="detail-container">Loading details...</div>;
  if (!product) return <div className="detail-container">Product not found.</div>;

  return (
    <div className="detail-container">
      <button className="btn-back" onClick={() => navigate(-1)}>&larr; Back to List</button>
      
      <div className="detail-header">
        <h1 className="detail-title">{product.name}</h1>
        <div className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
          {product.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-image-section">
          {product.image ? (
            <img 
              src={`http://127.0.0.1:8000${product.image}`} 
              alt={product.name} 
              className="detail-image" 
            />
          ) : (
            <div className="no-image-placeholder">No Image Available</div>
          )}
        </div>
        <div className="detail-info-section">
          <div className="info-group">
            <label>Price:</label>
            <span className="price-tag">${product.price}</span>
            {product.discount_price && (
              <span className="discount-tag"> (Discount: ${product.discount_price})</span>
            )}
          </div>
          
          <div className="info-group">
            <label>Category:</label> <span>{product.category || "N/A"}</span>
          </div>

          <div className="info-group">
            <label>Section:</label> <span>{product.section}</span>
          </div>

          <div className="info-group">
            <label>Description:</label>
            <p className="description-text">{product.description}</p>
          </div>

          {/* Variants Table */}
          <div className="variants-section">
            <h3>Inventory / Variants</h3>
            <table className="variants-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((v, i) => (
                    <tr key={i}>
                      <td>{v.size}</td>
                      <td>{v.stock} units</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="2">No variants defined.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="action-buttons-row">
            <button className="btn-edit-large" onClick={openEditModal}>
               Edit Details
            </button>
            
            <button 
              className={`btn-toggle ${product.is_active ? 'btn-deactivate' : 'btn-activate'}`} 
              onClick={handleToggleStatus}
            >
              {product.is_active ? 'Deactivate Product' : 'Activate Product'}
            </button>
            
            <button className="btn-delete-large" onClick={handleDelete}>
               Delete Product
            </button>
          </div>
        </div>
      </div>

      {/* --- Edit Modal (Same Logic as List View) --- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Product</h2>
            <form onSubmit={handleEditSubmit}>
              {/* Reuse your form fields here */}
              <div className="form-group">
                <label>Name</label>
                <input name="name" className="form-input" value={editFormData.name} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-input" value={editFormData.description} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Category Id</label>
                <input name="category_id" className="form-input" value={editFormData.category_id} onChange={handleEditChange} required />
              </div>
              
              <div style={{display:'flex', gap: '10px'}}>
                <div className="form-group" style={{flex:1}}>
                    <label>Price</label>
                    <input type="number" name="price" className="form-input" value={editFormData.price} onChange={handleEditChange} required />
                </div>
                <div className="form-group" style={{flex:1}}>
                    <label>Discount</label>
                    <input type="number" name="discount_price" className="form-input" value={editFormData.discount_price} onChange={handleEditChange} />
                </div>
              </div>

              {/* Variants Section in Modal */}
              <div className="form-group">
                <label>Variants</label>
                {editFormData.variants.map((variant, index) => (
                  <div key={index} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                    <input className="form-input" placeholder="Size" value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} />
                    <input className="form-input" type="number" placeholder="Stock" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} />
                    <button type="button" onClick={() => removeVariant(index)} style={{background:'red', color:'white', border:'none'}}>X</button>
                  </div>
                ))}
                <button type="button" onClick={addVariant} style={{fontSize:'12px', color:'blue'}}>+ Add Variant</button>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductDetail;