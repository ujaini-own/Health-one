import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import './PatientDashboard.css';

const PatientDashboard = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for graphs
    const healthTrendsData = [
        { name: 'Jan', bp: 120, hr: 72 },
        { name: 'Feb', bp: 122, hr: 75 },
        { name: 'Mar', bp: 118, hr: 70 },
        { name: 'Apr', bp: 125, hr: 78 },
        { name: 'May', bp: 121, hr: 74 },
        { name: 'Jun', bp: 119, hr: 71 },
    ];

    const appointmentTypeData = [
        { name: 'Checkup', value: 4 },
        { name: 'Follow-up', value: 3 },
        { name: 'Consultation', value: 2 },
        { name: 'Emergency', value: 1 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        fetchPatientData();
    }, []);

    const fetchPatientData = async () => {
        try {
            const [appointmentsRes, prescriptionsRes, labTestsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/appointments/patient/${user.id}`),
                axios.get(`http://localhost:5000/api/prescriptions/patient/${user.id}`),
                axios.get(`http://localhost:5000/api/lab-tests/patient/${user.id}`)
            ]);

            setAppointments(appointmentsRes.data.data);
            setPrescriptions(prescriptionsRes.data.data);
            setLabTests(labTestsRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching patient data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get upcoming appointments
    const upcomingAppointments = appointments.filter(apt =>
        new Date(apt.appointmentDate) >= new Date() && apt.status !== 'cancelled'
    ).slice(0, 3);

    // Get active medications from recent prescriptions
    const activeMedications = prescriptions
        .slice(0, 2)
        .flatMap(p => p.medications)
        .slice(0, 5);

    // Get pending lab tests
    const pendingLabTests = labTests.filter(test =>
        test.status === 'ordered' || test.status === 'sample-collected'
    ).slice(0, 3);

    return (
        <div className="patient-dashboard">
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
                        className={activeTab === 'clinics' ? 'active' : ''}
                        onClick={() => setActiveTab('clinics')}
                    >
                        Clinics
                    </button>
                    <button
                        className={activeTab === 'appointments' ? 'active' : ''}
                        onClick={() => setActiveTab('appointments')}
                    >
                        Appointments
                    </button>
                    <button
                        className={activeTab === 'prescriptions' ? 'active' : ''}
                        onClick={() => setActiveTab('prescriptions')}
                    >
                        My Prescriptions
                    </button>
                    <button
                        className={activeTab === 'labTests' ? 'active' : ''}
                        onClick={() => setActiveTab('labTests')}
                    >
                        Lab Tests
                    </button>
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                </div>
                <div className="navbar-actions">
                    <button onClick={toggleTheme} className="theme-toggle">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <div className="user-profile">
                        <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" />
                        <span>{user.userName || user.name}</span>
                    </div>
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
                        {/* Welcome Banner */}
                        <div className="welcome-banner">
                            <h1>Welcome back, {user.name}! 👋</h1>
                            <p>Here's your health overview for today</p>
                        </div>

                        {/* 3-Column Layout */}
                        <div className="home-grid">

                            {/* Left: Task Reminders */}
                            <div className="task-reminders">
                                <h2>📋 Task Reminders</h2>

                                <div className="reminder-section">
                                    <h3>💊 Medications to Take</h3>
                                    {activeMedications.length > 0 ? (
                                        <ul className="reminder-list">
                                            {activeMedications.map((med, index) => (
                                                <li key={index}>
                                                    <strong>{med.drugName}</strong>
                                                    <span>{med.dosage} - {med.frequency}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-data">No active medications</p>
                                    )}
                                </div>

                                <div className="reminder-section">
                                    <h3>📅 Upcoming Appointments</h3>
                                    {upcomingAppointments.length > 0 ? (
                                        <ul className="reminder-list">
                                            {upcomingAppointments.map((apt) => (
                                                <li key={apt._id}>
                                                    <strong>{new Date(apt.appointmentDate).toLocaleDateString()}</strong>
                                                    <span>{apt.appointmentTime} - Dr. {apt.doctorId?.userName}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-data">No upcoming appointments</p>
                                    )}
                                </div>

                                <div className="reminder-section">
                                    <h3>🔬 Pending Lab Tests</h3>
                                    {pendingLabTests.length > 0 ? (
                                        <ul className="reminder-list">
                                            {pendingLabTests.map((test) => (
                                                <li key={test._id}>
                                                    <strong>{test.testName}</strong>
                                                    <span className={`status-${test.status}`}>{test.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-data">No pending tests</p>
                                    )}
                                </div>
                            </div>

                            {/* Right: Health Analytics */}
                            <div className="health-analytics">
                                <h2>📊 Health Analytics</h2>

                                <div className="analytics-card">
                                    <h3>Health Overview</h3>
                                    <div className="health-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Total Appointments</span>
                                            <span className="stat-value">{appointments.length}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Prescriptions</span>
                                            <span className="stat-value">{prescriptions.length}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Lab Tests</span>
                                            <span className="stat-value">{labTests.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="analytics-card chart-container">
                                    <h3>Health Trends (Last 6 Months)</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={healthTrendsData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="bp" stroke="#8884d8" name="Blood Pressure" />
                                            <Line type="monotone" dataKey="hr" stroke="#82ca9d" name="Heart Rate" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="analytics-card chart-container">
                                    <h3>Appointment Types</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={appointmentTypeData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {appointmentTypeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* AI Chatbot */}
                        <div className="ai-chatbot-section">
                            <div className="chatbot-card">
                                <h2>🤖 AI Health Assistant</h2>
                                <p>Get instant answers to your health questions, fitness tips, and medical guidance</p>
                                <div className="chatbot-buttons">
                                    <button className="chatbot-btn">💬 Ask Health Question</button>
                                    <button className="chatbot-btn">🏋️ Personal Trainer</button>
                                    <button className="chatbot-btn">👨‍⚕️ Nurse Consultation</button>
                                    <button className="chatbot-btn">💊 Medical Suggestions</button>
                                </div>
                                <p className="chatbot-note">⚠️ AI Assistant coming soon - For emergencies, call your doctor</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CLINICS TAB */}
                {activeTab === 'clinics' && (
                    <div className="clinics-content">
                        <h1>🏥 Find Clinics Near You</h1>
                        <div className="search-section">
                            <input type="text" placeholder="Search by name or specialty..." className="search-input" />
                            <button className="search-btn">Search</button>
                        </div>
                        <div className="clinics-placeholder">
                            <p>🗺️ Clinic finder feature coming soon</p>
                            <small>Find nearby hospitals and clinics based on your location</small>
                        </div>
                    </div>
                )}

                {/* APPOINTMENTS TAB */}
                {activeTab === 'appointments' && (
                    <div className="appointments-content">
                        <h1>📅 My Appointments</h1>

                        <div className="appointments-section">
                            <h2>Upcoming Appointments</h2>
                            {upcomingAppointments.length > 0 ? (
                                <div className="appointments-grid">
                                    {upcomingAppointments.map((apt) => (
                                        <div key={apt._id} className="appointment-card">
                                            <div className="apt-header">
                                                <h3>{new Date(apt.appointmentDate).toLocaleDateString()}</h3>
                                                <span className={`status-badge status-${apt.status}`}>{apt.status}</span>
                                            </div>
                                            <p><strong>Time:</strong> {apt.appointmentTime}</p>
                                            <p><strong>Doctor:</strong> Dr. {apt.doctorId?.userName || 'N/A'}</p>
                                            <p><strong>Type:</strong> {apt.type}</p>
                                            {apt.chiefComplaint && <p><strong>Reason:</strong> {apt.chiefComplaint}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No upcoming appointments</p>
                            )}
                        </div>

                        <div className="appointments-section">
                            <h2>Appointment History</h2>
                            {appointments.filter(apt => new Date(apt.appointmentDate) < new Date()).length > 0 ? (
                                <div className="appointments-grid">
                                    {appointments
                                        .filter(apt => new Date(apt.appointmentDate) < new Date())
                                        .slice(0, 6)
                                        .map((apt) => (
                                            <div key={apt._id} className="appointment-card">
                                                <div className="apt-header">
                                                    <h3>{new Date(apt.appointmentDate).toLocaleDateString()}</h3>
                                                    <span className={`status-badge status-${apt.status}`}>{apt.status}</span>
                                                </div>
                                                <p><strong>Doctor:</strong> Dr. {apt.doctorId?.userName || 'N/A'}</p>
                                                <p><strong>Type:</strong> {apt.type}</p>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="no-data">No past appointments</p>
                            )}
                        </div>
                    </div>
                )}

                {/* PRESCRIPTIONS TAB */}
                {activeTab === 'prescriptions' && (
                    <div className="prescriptions-content">
                        <h1>💊 My Prescriptions</h1>

                        <div className="prescription-summary">
                            <div className="summary-card">
                                <h3>Total Prescriptions</h3>
                                <p className="summary-number">{prescriptions.length}</p>
                            </div>
                            <div className="summary-card">
                                <h3>Active Medications</h3>
                                <p className="summary-number">{activeMedications.length}</p>
                            </div>
                            <div className="summary-card">
                                <h3>Recent Prescription</h3>
                                <p className="summary-text">
                                    {prescriptions.length > 0
                                        ? new Date(prescriptions[0].createdAt).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="prescriptions-list">
                            {prescriptions.length > 0 ? (
                                prescriptions.map((prescription) => (
                                    <div key={prescription._id} className="prescription-card">
                                        <div className="prescription-header">
                                            <h3>Prescription</h3>
                                            <span className="prescription-date">
                                                {new Date(prescription.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="prescription-details" style={{ padding: '0 1rem 0.5rem', borderBottom: '1px solid #eee', marginBottom: '1rem' }}>
                                            <p style={{ margin: '5px 0', color: '#666' }}>
                                                <strong>Prescribed By:</strong> Dr. {prescription.doctorId?.userName || 'Unknown'}
                                                {prescription.doctorId?.clinicName && <span> ({prescription.doctorId.clinicName})</span>}
                                            </p>
                                        </div>
                                        <div className="medications-list">
                                            {prescription.medications.map((med, index) => (
                                                <div key={index} className="medication-item">
                                                    <h4>{med.drugName}</h4>
                                                    <p><strong>Dosage:</strong> {med.dosage}</p>
                                                    <p><strong>Frequency:</strong> {med.frequency}</p>
                                                    <p><strong>Duration:</strong> {med.duration}</p>
                                                    {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No prescriptions found</p>
                            )}
                        </div>
                    </div>
                )}

                {/* LAB TESTS TAB */}
                {activeTab === 'labTests' && (
                    <div className="labtests-content">
                        <h1>🔬 Lab Test Results</h1>
                        <div className="labtests-grid">
                            {labTests.length > 0 ? (
                                labTests.map((test) => (
                                    <div key={test._id} className="labtest-card">
                                        <div className="labtest-header">
                                            <h3>{test.testName}</h3>
                                            <span className={`status-badge status-${test.status}`}>{test.status}</span>
                                        </div>
                                        <p><strong>Ordered:</strong> {new Date(test.createdAt).toLocaleDateString()}</p>
                                        {test.sampleType && <p><strong>Sample:</strong> {test.sampleType}</p>}
                                        {test.results && (
                                            <div className="test-results">
                                                <h4>Results:</h4>
                                                <p>{test.results}</p>
                                            </div>
                                        )}
                                        {test.doctorComments && (
                                            <div className="doctor-comments">
                                                <h4>Doctor's Comments:</h4>
                                                <p>{test.doctorComments}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No lab tests found</p>
                            )}
                        </div>
                    </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="profile-content">
                        <h1>👤 My Profile</h1>



                        <div className="profile-sections">
                            <div className="profile-section">
                                <h2>Personal Information</h2>
                                <div className="profile-grid">
                                    <div className="profile-field">
                                        <label>Full Name</label>
                                        <p>{user.name}</p>
                                    </div>
                                    <div className="profile-field">
                                        <label>Email</label>
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="profile-field">
                                        <label>Phone Number</label>
                                        <p>{user.phoneNumber || 'Not provided'}</p>
                                    </div>
                                    <div className="profile-field">
                                        <label>Date of Birth</label>
                                        <p>Not provided</p>
                                    </div>
                                    <div className="profile-field">
                                        <label>Age</label>
                                        <p>Not provided</p>
                                    </div>
                                    <div className="profile-field">
                                        <label>Blood Group</label>
                                        <p>Not provided</p>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section">
                                <h2>Medical Information</h2>
                                <div className="profile-grid">
                                    <div className="profile-field">
                                        <label>Allergies</label>
                                        <p>None reported</p>
                                    </div>
                                    <div className="profile-field">
                                        <label>Medical History</label>
                                        <p>No history available</p>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section">
                                <h2>Emergency Contact</h2>
                                <div className="profile-grid">
                                    <div className="profile-field">
                                        <label>Contact Name</label>
                                        <p>Not provided</p>
                                    </div>
                                    <div className="profile-field">
                                        <label>Contact Phone</label>
                                        <p>Not provided</p>
                                    </div>
                                    <div className="profile-field">
                                        <label>Relationship</label>
                                        <p>Not provided</p>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section">
                                <h2>Address</h2>
                                <div className="profile-field">
                                    <p>{user.area || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard;
