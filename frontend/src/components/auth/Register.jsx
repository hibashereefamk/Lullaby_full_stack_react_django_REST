import React, { useState } from "react";
import "./Register.css"
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number:"",
    password:"",
    confirm_password:"",
  });
   const navigate=useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log(formData);
    try{
      const response = await axios.post("http://127.0.0.1:8000/api/register/", formData);
      console.log(response.data);
      alert("registraction successfully")
      // navigate("/otp-verify", { state: { email: formData.email } });
      navigate('/login')

    }catch(error){
      console.log('error:',error);
      if (error.response && error.response.data){
        alert('Registration failed:'+JSON.stringify(error.response.data))

      }else{
        alert('something went wrong.Is the backend server running');

      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone_number"
          placeholder="Phone Number"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="confirm Password"
          onChange={handleChange}
          required
        />

        <button type="submit">Register</button>
      <div style={{ textAlign: "center", marginTop: "15px" }}>
          <p>
            Don you have an account? 
            <Link to="/login" style={{ marginLeft: "5px", color: "#007bff" }}>
              Login
            </Link>
          </p>
        </div>
        {/* --- NEW CODE ENDS HERE --- */}

      </form>
    </div>
  );
}

export default Register;
