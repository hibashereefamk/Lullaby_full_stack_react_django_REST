import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    // 1. Grab the uid and token from the URL
    const { uid, token } = useParams();
    
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 2. Prepare the data exactly how your Django Serializer expects it
        const data = {
            password: password,
            token: token,
            uidb64: uid
        };

        try {
            // 3. Send POST request to Django
            // specific the backend url here (e.g. localhost:8000)
            const response = await axios.patch('http://127.0.0.1:8000/api/password-reset-complete/', data);
            
            setMessage("Password reset successful! Redirecting...");
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setMessage("Error: The link is invalid or expired.");
            console.error(error);
        }
    };

    return (
        <div className='auth-container'>
            <div className='auth-form'>
            <h2>Set New Password</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>New Password:</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        minLength={6}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px' }}>
                    Reset Password
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
        </div>
    );
};

export default ResetPassword;