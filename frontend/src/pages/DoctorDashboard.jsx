import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [loading, setLoading] = useState(true);

    // Consultation state
    const [consultation, setConsultation] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
    });

    // Prescription state (for new prescriptions during consultation)
    const [prescription, setPrescription] = useState({
        medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });

    useEffect(() => {
        fetchTodayAppointments();
        fetchAllPatients();
        fetchPrescriptions();
    }, []);

    const fetchTodayAppointments = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await axios.get('http://localhost:5000/api/appointments');
            const todayAppts = response.data.data.filter(apt =>
                apt.appointmentDate.startsWith(today) && apt.doctorId?._id === user.id
            );
            setTodayAppointments(todayAppts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setLoading(false);
        }
    };

    const fetchAllPatients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/patients');
            setAllPatients(response.data.data);
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

    const startConsultation = (appointment) => {
        setSelectedAppointment(appointment);
        setActiveTab('appointments');
    };

    const saveConsultation = async () => {
        if (!selectedAppointment) return;

        try {
            await axios.post('http://localhost:5000/api/consultations', {
                appointmentId: selectedAppointment._id,
                patientId: selectedAppointment.patientId._id,
                doctorId: user.id,
                ...consultation
            });
            alert('Consultation saved successfully!');
            setConsultation({ subjective: '', objective: '', assessment: '', plan: '' });
        } catch (error) {
            alert('Error saving consultation: ' + error.message);
        }
    };

    const savePrescription = async () => {
        if (!selectedAppointment) return;

        try {
            await axios.post('http://localhost:5000/api/prescriptions', {
                patientId: selectedAppointment.patientId._id,
                doctorId: user.id,
                appointmentId: selectedAppointment._id,
                medications: prescription.medications
            });
            alert('Prescription saved successfully!');
            fetchPrescriptions(); // Refresh list
            setPrescription({ medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
        } catch (error) {
            alert('Error saving prescription: ' + error.message);
        }
    };

    const addMedication = () => {
        setPrescription({
            ...prescription,
            medications: [...prescription.medications, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
    };

    const updateMedication = (index, field, value) => {
        const updatedMedications = [...prescription.medications];
        updatedMedications[index][field] = value;
        setPrescription({ ...prescription, medications: updatedMedications });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="doctor-dashboard">
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
                        className={activeTab === 'surgery' ? 'active' : ''}
                        onClick={() => setActiveTab('surgery')}
                    >
                        Surgery
                    </button>
                    <button
                        className={activeTab === 'patients' ? 'active' : ''}
                        onClick={() => setActiveTab('patients')}
                    >
                        Patients
                    </button>
                </div>
                <div className="navbar-actions">
                    <button onClick={toggleTheme} className="theme-toggle">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <span className="user-name">Dr. {user.userName || user.name}</span>
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
                            <h1>Welcome, Dr. {user.userName || user.name}! 👨‍⚕️</h1>
                            <p>Your medical practice dashboard</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Today's Appointments</h3>
                                <p className="stat-number">{todayAppointments.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Pending Consultations</h3>
                                <p className="stat-number">
                                    {todayAppointments.filter(apt => apt.status === 'scheduled').length}
                                </p>
                            </div>
                            <div className="stat-card">
                                <h3>Completed Today</h3>
                                <p className="stat-number">
                                    {todayAppointments.filter(apt => apt.status === 'completed').length}
                                </p>
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
                                    📅 View Appointments
                                </button>
                                <button onClick={() => setActiveTab('patients')} className="action-btn">
                                    👥 Patient Records
                                </button>
                                <button onClick={() => setActiveTab('surgery')} className="action-btn">
                                    🏥 Surgery Schedule
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
                        <h1>Today's Appointments</h1>
                        {/* ... rest of the existing appointments content ... */}
                        {loading ? (
                            <p>Loading appointments...</p>
                        ) : todayAppointments.length === 0 ? (
                            <p className="no-data">No appointments for today</p>
                        ) : (
                            <div className="appointments-grid">
                                {todayAppointments.map((appointment) => (
                                    <div key={appointment._id} className="appointment-card">
                                        <div className="apt-header">
                                            <h3>{appointment.patientId?.name || 'N/A'}</h3>
                                            <span className={`status-badge status-${appointment.status}`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                                        <p><strong>Type:</strong> {appointment.type}</p>
                                        <p><strong>Chief Complaint:</strong> {appointment.chiefComplaint || 'N/A'}</p>
                                        <button
                                            onClick={() => startConsultation(appointment)}
                                            className="btn-primary"
                                        >
                                            Start Consultation
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedAppointment && (
                            <div className="consultation-section">
                                <h2>Consultation - {selectedAppointment.patientId?.name}</h2>

                                <div className="consultation-form">
                                    <div className="form-group">
                                        <label>Subjective (Patient's Complaint)</label>
                                        <textarea
                                            value={consultation.subjective}
                                            onChange={(e) => setConsultation({ ...consultation, subjective: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Objective (Clinical Findings)</label>
                                        <textarea
                                            value={consultation.objective}
                                            onChange={(e) => setConsultation({ ...consultation, objective: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Assessment (Diagnosis)</label>
                                        <textarea
                                            value={consultation.assessment}
                                            onChange={(e) => setConsultation({ ...consultation, assessment: e.target.value })}
                                            rows="2"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Plan (Treatment Plan)</label>
                                        <textarea
                                            value={consultation.plan}
                                            onChange={(e) => setConsultation({ ...consultation, plan: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                    <button onClick={saveConsultation} className="btn-save">
                                        Save Consultation
                                    </button>
                                </div>

                                <div className="prescription-form">
                                    <h3>Create Prescription</h3>
                                    {prescription.medications.map((med, index) => (
                                        <div key={index} className="medication-row">
                                            <input
                                                type="text"
                                                placeholder="Drug Name"
                                                value={med.drugName}
                                                onChange={(e) => updateMedication(index, 'drugName', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dosage"
                                                value={med.dosage}
                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Frequency"
                                                value={med.frequency}
                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Duration"
                                                value={med.duration}
                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <button onClick={addMedication} className="btn-add">
                                        + Add Medication
                                    </button>
                                    <button onClick={savePrescription} className="btn-save">
                                        Save Prescription
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SURGERY TAB */}
                {activeTab === 'surgery' && (
                    <div className="surgery-content">
                        <h1>🏥 Surgery Schedule</h1>
                        <div className="placeholder-section">
                            <p>Surgery scheduling feature coming soon</p>
                            <small>Manage pre-op, post-op, and surgery schedules</small>
                        </div>
                    </div>
                )}

                {/* PATIENTS TAB */}
                {activeTab === 'patients' && (
                    <div className="patients-content">
                        <h1>👥 Patient Records</h1>
                        <div className="patients-grid">
                            {allPatients.length > 0 ? (
                                allPatients.slice(0, 20).map((patient) => (
                                    <div key={patient._id} className="patient-card">
                                        <h3>{patient.name}</h3>
                                        <p><strong>Email:</strong> {patient.email}</p>
                                        <p><strong>Phone:</strong> {patient.phoneNumber || 'N/A'}</p>
                                        <p><strong>Area:</strong> {patient.area || 'N/A'}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No patients found</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
