import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import './ReceptionistDashboard.css';

const ReceptionistDashboard = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [queue, setQueue] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(false);

    // New appointment state
    const [newAppointment, setNewAppointment] = useState({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'consultation',
        chiefComplaint: ''
    });

    useEffect(() => {
        fetchAppointments();
        fetchPatients();
        fetchPrescriptions();
        if (activeTab === 'queue') {
            fetchTodayQueue();
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

    const fetchPatients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/patients');
            setPatients(response.data.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
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

    const fetchTodayQueue = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await axios.get('http://localhost:5000/api/appointments');
            const todayAppts = response.data.data.filter(apt =>
                apt.appointmentDate.startsWith(today)
            );
            setQueue(todayAppts);
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
        setLoading(false);
    };

    const bookAppointment = async () => {
        try {
            await axios.post('http://localhost:5000/api/appointments', newAppointment);
            alert('Appointment booked successfully!');
            setNewAppointment({
                patientId: '',
                doctorId: '',
                appointmentDate: '',
                appointmentTime: '',
                type: 'consultation',
                chiefComplaint: ''
            });
            fetchAppointments();
        } catch (error) {
            alert('Error booking appointment: ' + error.message);
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
        <div className="receptionist-dashboard">
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
                        className={activeTab === 'appointments' ? 'active' : ''}
                        onClick={() => setActiveTab('appointments')}
                    >
                        Appointments
                    </button>
                    <button
                        className={activeTab === 'patients' ? 'active' : ''}
                        onClick={() => setActiveTab('patients')}
                    >
                        Patients
                    </button>
                    <button
                        className={activeTab === 'queue' ? 'active' : ''}
                        onClick={() => setActiveTab('queue')}
                    >
                        Queue
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
                            <h1>Welcome, {user.userName || user.name}! 📋</h1>
                            <p>Reception desk dashboard</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Today's Appointments</h3>
                                <p className="stat-number">{todayAppointments.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Patients</h3>
                                <p className="stat-number">{patients.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>In Queue</h3>
                                <p className="stat-number">{queue.length}</p>
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
                                <button onClick={() => setActiveTab('appointments')} className="action-btn">
                                    📅 Book Appointment
                                </button>
                                <button onClick={() => setActiveTab('patients')} className="action-btn">
                                    👥 View Patients
                                </button>
                                <button onClick={() => setActiveTab('queue')} className="action-btn">
                                    📋 Manage Queue
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

                {/* APPOINTMENTS TAB */}
                {activeTab === 'appointments' && (
                    <div className="appointments-content">
                        <h1>Appointment Management</h1>

                        <div className="booking-section">
                            <h2>Book New Appointment</h2>
                            <div className="booking-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Patient ID</label>
                                        <input
                                            type="text"
                                            value={newAppointment.patientId}
                                            onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Doctor ID</label>
                                        <input
                                            type="text"
                                            value={newAppointment.doctorId}
                                            onChange={(e) => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={newAppointment.appointmentDate}
                                            onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Time</label>
                                        <input
                                            type="time"
                                            value={newAppointment.appointmentTime}
                                            onChange={(e) => setNewAppointment({ ...newAppointment, appointmentTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            value={newAppointment.type}
                                            onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                                        >
                                            <option value="consultation">Consultation</option>
                                            <option value="follow-up">Follow-up</option>
                                            <option value="emergency">Emergency</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Chief Complaint</label>
                                    <textarea
                                        value={newAppointment.chiefComplaint}
                                        onChange={(e) => setNewAppointment({ ...newAppointment, chiefComplaint: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                                <button onClick={bookAppointment} className="btn-save">
                                    Book Appointment
                                </button>
                            </div>
                        </div>

                        <div className="appointments-list-section">
                            <h2>All Appointments</h2>
                            <div className="appointments-grid">
                                {appointments.slice(0, 12).map((apt) => (
                                    <div key={apt._id} className="appointment-card">
                                        <div className="apt-header">
                                            <h3>{apt.patientId?.name || 'N/A'}</h3>
                                            <span className={`status-badge status-${apt.status}`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                        <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                                        <p><strong>Time:</strong> {apt.appointmentTime}</p>
                                        <p><strong>Doctor:</strong> Dr. {apt.doctorId?.userName || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* PATIENTS TAB */}
                {activeTab === 'patients' && (
                    <div className="patients-content">
                        <h1>Patient Records</h1>
                        <div className="patients-grid">
                            {patients.map((patient) => (
                                <div key={patient._id} className="patient-card">
                                    <h3>{patient.name}</h3>
                                    <p><strong>Email:</strong> {patient.email}</p>
                                    <p><strong>Phone:</strong> {patient.phoneNumber || 'N/A'}</p>
                                    <p><strong>Area:</strong> {patient.area || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* QUEUE TAB */}
                {activeTab === 'queue' && (
                    <div className="queue-content">
                        <h1>Today's Queue</h1>
                        {loading ? (
                            <p>Loading queue...</p>
                        ) : queue.length === 0 ? (
                            <p className="no-data">No patients in queue</p>
                        ) : (
                            <div className="queue-list">
                                {queue.map((apt, index) => (
                                    <div key={apt._id} className="queue-item">
                                        <div className="queue-number">#{index + 1}</div>
                                        <div className="queue-details">
                                            <h3>{apt.patientId?.name || 'N/A'}</h3>
                                            <p><strong>Time:</strong> {apt.appointmentTime}</p>
                                            <p><strong>Doctor:</strong> Dr. {apt.doctorId?.userName || 'N/A'}</p>
                                        </div>
                                        <div className="queue-status">
                                            <span className={`status-badge status-${apt.status}`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceptionistDashboard;

