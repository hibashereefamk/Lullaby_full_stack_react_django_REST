import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import './verifyOtp.css';

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60); // 60-second countdown
  const [canResend, setCanResend] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  // 1. Timer Logic: Decrements 'timer' every second
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true); // Enable button when timer hits 0
    }

    return () => clearInterval(interval); // Cleanup on unmount
  }, [timer]);

  // 2. Logic to Verify OTP (Your existing code)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/verify-otp/", {
        email,
        otp,
      });
      console.log(response.data);
      alert("OTP verified successfully!");
      navigate("/login"); // Or wherever you want to go after success
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(error.response?.data?.message || "Invalid OTP or something went wrong.");
    }
  };

  // 3. Logic to Resend OTP (Connects to your sendOTPView)
  const handleResendOtp = async () => {
    if (!canResend) return; // Prevent clicking if timer is running

    try {
      // NOTE: Make sure this URL matches your Django URL for sendOTPView
      await axios.post("http://127.0.0.1:8000/api/send-otp/", {
        email,
      });
      alert("A new OTP has been sent to your email.");
      
      // Reset the timer and disable the button again
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      console.error("Error resending OTP:", error);
      alert("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="otp-container">
      <form className="otp-form" onSubmit={handleVerifyOtp}>
        <h2>Enter OTP</h2>
        <p>We sent a code to: <strong>{email}</strong></p>
        
        <input 
          type="text" 
          placeholder="Enter 6-digit OTP" 
          value={otp}
          onChange={(e) => setOtp(e.target.value)} 
          maxLength={6} // UX: Limit input to 6 chars
        />
        
        <button type="submit">Verify</button>

        {/* Resend Section */}
        <div className="resend-container" style={{ marginTop: "15px", fontSize: "14px" }}>
          {canResend ? (
            <p>
              Didn't receive code?{" "}
              <span 
                onClick={handleResendOtp} 
                style={{ color: "blue", cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}
              >
                Resend OTP
              </span>
            </p>
          ) : (
            <p style={{ color: "gray" }}>
              Resend code in {timer}s
            </p>
          )}
        </div>

      </form>
    </div>
  );
}

export default VerifyOtp;