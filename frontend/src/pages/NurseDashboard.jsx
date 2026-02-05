import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import './NurseDashboard.css';

const NurseDashboard = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [labSamples, setLabSamples] = useState([]);

    // Vitals state
    const [vitals, setVitals] = useState({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        pulseRate: '',
        temperature: '',
        oxygenLevel: '',
        weight: '',
        height: '',
        notes: ''
    });

    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        fetchAppointments();
        fetchPrescriptions();
        if (activeTab === 'patientRecords') {
            fetchLabSamples();
        }
    }, [activeTab]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/appointments');
            setAppointments(response.data.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchPrescriptions = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/prescriptions');
            setPrescriptions(response.data.data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        }
    };

    const fetchLabSamples = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/lab-tests');
            const pending = response.data.data.filter(test => test.status === 'ordered');
            setLabSamples(pending);
        } catch (error) {
            console.error('Error fetching lab tests:', error);
        }
        setLoading(false);
    };

    const recordVitals = async () => {
        if (!selectedPatient) {
            alert('Please select a patient first');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/vitals', {
                patientId: selectedPatient,
                ...vitals
            });
            alert('Vitals recorded successfully!');
            setVitals({
                bloodPressureSystolic: '',
                bloodPressureDiastolic: '',
                pulseRate: '',
                temperature: '',
                oxygenLevel: '',
                weight: '',
                height: '',
                notes: ''
            });
        } catch (error) {
            alert('Error recording vitals: ' + error.message);
        }
    };

    const collectSample = async (testId) => {
        try {
            await axios.patch(`http://localhost:5000/api/lab-tests/${testId}/collect-sample`);
            alert('Sample collected successfully!');
            fetchLabSamples();
        } catch (error) {
            alert('Error collecting sample: ' + error.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const todayAppointments = appointments.filter(apt => {
        const today = new Date().toISOString().split('T')[0];
        return apt.appointmentDate.startsWith(today);
    });

    return (
        <div className="nurse-dashboard">
            {/* Top Navigation Bar */}
            <nav className="top-navbar">
                <div className="navbar-brand">
                    <h2>Health One</h2>
                </div>
                <div className="navbar-menu">
                    <button
                        className={activeTab === 'home' ? 'active' : ''}
                        onClick={() => setActiveTab('home')}
                    >
                        Home
                    </button>
                    <button
                        className={activeTab === 'prescriptions' ? 'active' : ''}
                        onClick={() => setActiveTab('prescriptions')}
                    >
                        Prescriptions
                    </button>
                    <button
                        className={activeTab === 'patientRecords' ? 'active' : ''}
                        onClick={() => setActiveTab('patientRecords')}
                    >
                        Patient Records
                    </button>
                    <button
                        className={activeTab === 'followups' ? 'active' : ''}
                        onClick={() => setActiveTab('followups')}
                    >
                        Follow-ups
                    </button>
                </div>
                <div className="navbar-actions">
                    <button onClick={toggleTheme} className="theme-toggle">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <span className="user-name">{user.userName || user.name}</span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="dashboard-main">

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="home-content">
                        <div className="welcome-banner">
                            <h1>Welcome, {user.userName || user.name}! 💉</h1>
                            <p>Your nursing dashboard</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Today's Appointments</h3>
                                <p className="stat-number">{todayAppointments.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Pending Lab Samples</h3>
                                <p className="stat-number">{labSamples.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Prescriptions</h3>
                                <p className="stat-number">{prescriptions.length}</p>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="action-buttons">
                                <button onClick={() => setActiveTab('prescriptions')} className="action-btn">
                                    💊 View Prescriptions
                                </button>
                                <button onClick={() => setActiveTab('patientRecords')} className="action-btn">
                                    📋 Record Vitals
                                </button>
                                <button onClick={() => setActiveTab('patientRecords')} className="action-btn">
                                    🔬 Collect Lab Samples
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PRESCRIPTIONS TAB (Read Only) */}
                {activeTab === 'prescriptions' && (
                    <div className="content-section">
                        <h1 style={{ color: 'var(--accent-primary)', marginBottom: '30px', fontSize: '32px' }}>Prescription Records</h1>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {prescriptions.map(p => (
                                <div key={p._id} style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-primary)' }}>
                                    <h3 style={{ color: 'var(--accent-primary)', margin: '0 0 12px 0', fontSize: '18px' }}>{p.patientId?.name || 'Unknown Patient'}</h3>
                                    <p style={{ color: 'var(--text-secondary)', margin: '6px 0', fontSize: '14px' }}><strong>Dr:</strong> {p.doctorId?.userName || 'N/A'}</p>
                                    <p style={{ color: 'var(--text-secondary)', margin: '6px 0', fontSize: '14px' }}><strong>Date:</strong> {new Date(p.createdAt).toLocaleDateString()}</p>
                                    <div style={{ marginTop: '10px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px' }}>
                                        <small style={{ color: 'var(--text-primary)' }}><strong>Meds:</strong> {p.medications.map(m => m.drugName).join(', ')}</small>
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <span style={{ padding: '4px 10px', background: 'var(--accent-light)', color: 'var(--accent-primary)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Read Only</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {prescriptions.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '40px', textAlign: 'center', background: 'var(--bg-primary)', borderRadius: '12px' }}>No prescription records found.</p>}
                    </div>
                )}

                {/* PATIENT RECORDS TAB */}
                {activeTab === 'patientRecords' && (
                    <div className="patient-records-content">
                        <h1>Patient Records</h1>

                        <div className="vitals-section">
                            <h2>Record Vitals</h2>
                            <div className="vitals-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Patient ID</label>
                                        <input
                                            type="text"
                                            placeholder="Enter patient ID"
                                            value={selectedPatient || ''}
                                            onChange={(e) => setSelectedPatient(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Blood Pressure (Systolic)</label>
                                        <input
                                            type="number"
                                            value={vitals.bloodPressureSystolic}
                                            onChange={(e) => setVitals({ ...vitals, bloodPressureSystolic: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Blood Pressure (Diastolic)</label>
                                        <input
                                            type="number"
                                            value={vitals.bloodPressureDiastolic}
                                            onChange={(e) => setVitals({ ...vitals, bloodPressureDiastolic: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Pulse Rate</label>
                                        <input
                                            type="number"
                                            value={vitals.pulseRate}
                                            onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Temperature (°F)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={vitals.temperature}
                                            onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Oxygen Level (%)</label>
                                        <input
                                            type="number"
                                            value={vitals.oxygenLevel}
                                            onChange={(e) => setVitals({ ...vitals, oxygenLevel: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={vitals.weight}
                                            onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Height (cm)</label>
                                        <input
                                            type="number"
                                            value={vitals.height}
                                            onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button onClick={recordVitals} className="btn-save">
                                    Save Vitals
                                </button>
                            </div>
                        </div>

                        <div className="lab-samples-section">
                            <h2>Pending Lab Sample Collection</h2>
                            {loading ? (
                                <p>Loading...</p>
                            ) : labSamples.length === 0 ? (
                                <p className="no-data">No pending samples</p>
                            ) : (
                                <div className="samples-grid">
                                    {labSamples.map((test) => (
                                        <div key={test._id} className="sample-card">
                                            <h3>{test.testName}</h3>
                                            <p><strong>Patient:</strong> {test.patientId?.name || 'N/A'}</p>
                                            <p><strong>Sample Type:</strong> {test.sampleType || 'N/A'}</p>
                                            <button onClick={() => collectSample(test._id)} className="btn-collect">
                                                Collect Sample
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* FOLLOW-UPS TAB */}
                {activeTab === 'followups' && (
                    <div className="followups-content">
                        <h1>📅 Follow-ups</h1>
                        <div className="placeholder-section">
                            <p>Follow-up management feature coming soon</p>
                            <small>Track post-consultation care and patient recovery</small>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NurseDashboard;
