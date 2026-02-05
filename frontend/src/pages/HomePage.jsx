import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to role-specific dashboard
        if (user) {
            if (user.role === 'clinic') {
                // Check clinic user type
                if (user.userType === 'doctor') {
                    navigate('/doctor-dashboard', { replace: true });
                } else if (user.userType === 'nurse') {
                    navigate('/nurse-dashboard', { replace: true });
                } else if (user.userType === 'receptionist') {
                    navigate('/receptionist-dashboard', { replace: true });
                }
            } else if (user.role === 'patient') {
                navigate('/patient-dashboard', { replace: true });
            } else if (user.role === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="home-container">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="nav-content">
                    <div className="nav-brand">
                        <h2>Health-One</h2>
                    </div>
                    <ul className="nav-links">
                        <li><a href="/home" className="active">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#services">Services</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="home-content">
                <div className="welcome-section">
                    <h1 className="welcome-title">
                        Welcome to Health-One Clinical App
                    </h1>

                    {user && (
                        <div className="user-info-card">
                            <h2>Hello, {user.name || user.clinicName || 'User'}! 👋</h2>
                            <div className="user-details">
                                <p><strong>Role:</strong> <span className="role-badge">{user.role}</span></p>
                                <p><strong>Email:</strong> {user.email}</p>
                                {user.role === 'clinic' && (
                                    <p><strong>User Type:</strong> {user.userType}</p>
                                )}
                                {user.role === 'admin' && (
                                    <p><strong>Company:</strong> {user.companyName}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📋</div>
                            <h3>Patient Records</h3>
                            <p>Manage and access patient medical records securely</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📅</div>
                            <h3>Appointments</h3>
                            <p>Schedule and manage patient appointments efficiently</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💊</div>
                            <h3>Prescriptions</h3>
                            <p>Create and track patient prescriptions digitally</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Analytics</h3>
                            <p>View insights and reports on clinical operations</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
