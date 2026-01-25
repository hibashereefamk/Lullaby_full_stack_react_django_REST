import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Package, Heart, LogOut, Camera } from "lucide-react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [addressId, setAddressId] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

 
  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      // 1. Fetch User Profile
      const userRes = await axios.get(`${BASE_URL}/api/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // 2. Fetch User Addresses
      const addressRes = await axios.get(`${BASE_URL}/api/addresses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get the most relevant address (Default or First)
      const results = addressRes.data.results || addressRes.data; // Handle pagination if exists
      const defaultAddr = Array.isArray(results) ? (results.find(addr => addr.is_default) || results[0]) : null;

      setProfile(userRes.data);
      if (defaultAddr) setAddressId(defaultAddr.id);
      
      // 3. Fill the Form
      // Priority for Phone: User Profile -> Address -> Empty
      const phoneToDisplay = userRes.data.phone_number || defaultAddr?.phone_number || "";
      
      // Priority for Name: Address Name -> User Name -> Username
      const nameToDisplay = defaultAddr?.full_name || userRes.data.name || userRes.data.username || "";

      setFormData({
        ...userRes.data,
        bio: userRes.data.bio || "",
        phone_number: phoneToDisplay,
        // Address Fields
        full_name: nameToDisplay, 
        street_address: defaultAddr?.street_address || "",
        city: defaultAddr?.city || "",
        state: defaultAddr?.state || "",
        postal_code: defaultAddr?.postal_code || "",
        country: defaultAddr?.country || "India",
        address_type: defaultAddr?.address_type || "home",
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data", err);
      // If server error (500) but we haven't loaded profile yet
      if (err.response?.status === 500 && !profile) {
          alert("Server Error: Could not load data. Please check backend logs.");
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // --- STEP 1: Update User Profile (Bio, Phone, Image) ---
      const profileData = new FormData();
      profileData.append("bio", formData.bio || "");
      profileData.append("phone_number", formData.phone_number || "");
      
      // Only append name if your User model supports 'name' field
      if (formData.full_name) profileData.append("name", formData.full_name);

      if (imageFile) {
        profileData.append("profile_picture", imageFile);
      }

      const userUpdateRes = await axios.patch(
        `${BASE_URL}/api/profile/`,
        profileData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
          } 
        }
      );
      
      // Update local profile state immediately
      setProfile(userUpdateRes.data);

      // --- STEP 2: Update Address ---
      // Ensure we have enough data to create an address
      if (formData.street_address && formData.city && formData.postal_code) {
          const addressPayload = {
            full_name: formData.full_name, // Use the editable name
            phone_number: formData.phone_number,
            street_address: formData.street_address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            address_type: formData.address_type,
            is_default: true
          };

          if (addressId) {
            
            await axios.patch(
                `${BASE_URL}/api/addresses/${addressId}/`,
                addressPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
          } else {
             // CREATE new address
             const newAddrRes = await axios.post(
                `${BASE_URL}/api/addresses/`,
                addressPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAddressId(newAddrRes.data.id);
          }
      }

      setIsEditing(false);
      alert("Profile updated successfully!");
      
      // Re-fetch to confirm everything matches
      fetchData(); 

    } catch (err) {
      console.error("Error updating profile", err);
      // Helper to show backend validation errors
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Failed to update.";
      alert(`Update Failed: ${errorMsg}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <div className="loading">Loading Profile...</div>;
  if (!profile) return <div className="profile-container" style={{padding: "50px", textAlign: "center"}}><h2>Profile not found.</h2></div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="profile-container">

        <div className="profile-header">
          <div className="header-left">
            <div className="profile-avatar-container">
                <div className="profile-avatar">
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" />
                ) : profile.profile_picture ? (
                    <img src={`${BASE_URL}${profile.profile_picture}`} alt="Profile" />
                ) : (
                    <div className="avatar-placeholder">{profile.username && profile.username[0].toUpperCase()}</div>
                )}
                </div>
                {isEditing && (
                    <div className="avatar-edit-icon" onClick={() => fileInputRef.current.click()}>
                        <Camera size={16} />
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: "none" }} accept="image/*" />
            </div>

            <div className="profile-info">
              <h1>{profile.username}</h1>
              <p className="join-date">
                <Calendar size={14} /> Member since {new Date(profile.date_joined).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="profile-actions-group">
            <button className="action-btn" onClick={() => navigate('/order')}><Package size={18} /> My Orders</button>
            <button className="action-btn" onClick={() => navigate('/wishlists')}><Heart size={18} /> My Wishlist</button>
            <button className={`edit-btn ${isEditing ? "cancel" : ""}`} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
            </button>
             <button className="action-btn logout-btn" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </div>
        </div>

        <div className="profile-content">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={formData.bio || ""} onChange={handleChange} />
              </div>

              <div className="form-grid">
                {/* ADDED: Full Name Field */}
                <div className="form-group">
                  <label>Full Name (Receiver)</label>
                  <input type="text" name="full_name" value={formData.full_name || ""} onChange={handleChange} placeholder="Full Name" />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone_number" value={formData.phone_number || ""} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                  <label>Street Address</label>
                  <input type="text" name="street_address" value={formData.street_address || ""} onChange={handleChange} placeholder="Street Address" />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={formData.city || ""} onChange={handleChange} placeholder="City" />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" value={formData.state || ""} onChange={handleChange} placeholder="State" />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input type="text" name="postal_code" value={formData.postal_code || ""} onChange={handleChange} placeholder="Zip Code" />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" name="country" value={formData.country || ""} onChange={handleChange} placeholder="Country" />
                </div>
                 <div className="form-group">
                  <label>Address Type</label>
                  <select name="address_type" value={formData.address_type || "home"} onChange={handleChange} style={{padding: "10px", width: "100%"}}>
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="save-btn"><Save size={18} /> Save Changes</button>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-card"><User className="icon" /><div><label>Name</label><p>{formData.full_name || profile.username}</p></div></div>
              <div className="detail-card"><Mail className="icon" /><div><label>Email</label><p>{profile.email}</p></div></div>
              <div className="detail-card"><Phone className="icon" /><div><label>Phone</label><p>{profile.phone_number || "Not set"}</p></div></div>
              <div className="detail-card"><MapPin className="icon" />
                <div>
                  <label>Address</label>
                  <p>
                    {formData.street_address ? 
                      `${formData.street_address}, ${formData.city}, ${formData.state} - ${formData.postal_code}` 
                      : "No address set"}
                  </p>
                </div>
              </div>
              <div className="detail-card full-width"><User className="icon" /><div><label>Bio</label><p>{profile.bio || "No bio added yet."}</p></div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;