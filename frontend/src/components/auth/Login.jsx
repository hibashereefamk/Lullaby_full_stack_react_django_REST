import React, { useState } from "react";
import "./Register.css";
import axios from'axios';
import { useNavigate ,Link} from "react-router-dom";


function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
const navigate=useNavigate()
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log(formData);
    try{
      const response = await axios.post("http://127.0.0.1:8000/api/login/", formData
      );
      localStorage.setItem("access_token",response.data.access);
      localStorage.setItem('refresh_token',response.data.refresh);
      localStorage.setItem('role',response.data.role);

      console.log(response.data);
      alert("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
     if (error.response.status === 403 && error.response.data.message === "Email not verified") {
            alert("Please verify your email first.");
      }else if (error.response.status === 401) {
            alert("Invalid email or password.");
        } else {
        alert("Something went wrong. Is the backend server running?");
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
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
        <div style={{ margin: '10px 0', textAlign: 'right' }}>
                    <Link to="/request-reset" style={{ color: 'blue', textDecoration: 'none' }}>
                        Forgot Password?
                    </Link>
        </div>
        <button type="submit">Login</button>
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <p>
            Don't have an account? 
            <Link to="/register" style={{ marginLeft: "5px", color: "#007bff" }}>
              Register
            </Link>
          </p>
        </div>

      </form>
    </div>
  );
}

export default Login;

