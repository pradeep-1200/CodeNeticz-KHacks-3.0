import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/TeacherLogin.css';

import { useAuth } from '../../context/AuthContext';

export default function TeacherSignup() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const result = await register({
            name: formData.fullName, // Model expects 'name'
            email: formData.email,
            password: formData.password,
            role: "teacher"
        });

        if (result.success) {
            alert("Account created successfully! Please login with your new credentials.");
            navigate('/teacher/login');
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>Create Account</h1>
                    <p>Join the Adaptive Cognitive Learning Classroom</p>
                </div>

                <form className="login-form" onSubmit={handleSignup}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            className="form-input"
                            placeholder="Sarah Johnson"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="teacher@school.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        Sign Up
                    </button>
                </form>

                <div className="login-footer">
                    <p>Already have an account? <Link to="/teacher/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}
