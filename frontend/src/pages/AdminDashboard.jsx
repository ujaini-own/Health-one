import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');

    // Data states
    const [admins, setAdmins] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [receptionists, setReceptionists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    // Form state for creating new users
    const [newUser, setNewUser] = useState({
        userType: 'doctor', // Default
        userName: '',
        contactName: '',
        email: '',
        password: '',
        clinicName: 'Health One Main',
        clinicRegistrationNumber: '',
        nmrNumber: '',
        nuid: '',
        employeeCode: ''
    });

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [isPrescriptionFormVisible, setIsPrescriptionFormVisible] = useState(false);
    const [isVitalsFormVisible, setIsVitalsFormVisible] = useState(false);
    const [isLabTestFormVisible, setIsLabTestFormVisible] = useState(false);

    const [newPrescription, setNewPrescription] = useState({
        patientId: '',
        doctorId: '',
        medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        validUntil: ''
    });

    const [newVitals, setNewVitals] = useState({
        patientId: '',
        appointmentId: '', // Optional/linked if selected
        bloodPressure: '',
        pulse: '',
        temperature: '',
        oxygenLevel: '',
        weight: '',
        height: '',
        notes: ''
    });

    const [newLabTest, setNewLabTest] = useState({
        patientId: '',
        testName: '',
        testType: 'blood' // default
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [clinicsRes, appointmentsRes, patientsRes, prescriptionsRes, adminsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/clinics'),
                axios.get('http://localhost:5000/api/appointments'),
                axios.get('http://localhost:5000/api/patients'),
                axios.get('http://localhost:5000/api/prescriptions'),
                axios.get('http://localhost:5000/api/admins')
            ]);

            const allStaff = clinicsRes.data.data || [];

            setDoctors(allStaff.filter(s => s.userType === 'doctor'));
            setNurses(allStaff.filter(s => s.userType === 'nurse'));
            setReceptionists(allStaff.filter(s => s.userType === 'receptionist'));

            setAppointments(appointmentsRes.data.data || []);
            setPatients(patientsRes.data.data || []);
            setPrescriptions(prescriptionsRes.data.data || []);
            setAdmins(adminsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleCreatePrescription = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/prescriptions', newPrescription);
            alert('Prescription Record Added Successfully!');
            setIsPrescriptionFormVisible(false);
            setNewPrescription({
                patientId: '',
                doctorId: '',
                medications: [{ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }],
                validUntil: ''
            });
            fetchData();
        } catch (error) {
            alert('Error creating prescription: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeletePrescription = async (id) => {
        if (!window.confirm('Are you sure you want to delete this prescription record?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/prescriptions/${id}`);
            alert('Prescription record deleted');
            fetchData();
        } catch (error) {
            alert('Error deleting prescription: ' + error.message);
        }
    };

    const handleAddMedication = () => {
        setNewPrescription({
            ...newPrescription,
            medications: [...newPrescription.medications, { drugName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
    };


    const handleCreateVitals = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/vitals', newVitals);
            alert('Vitals Recorded Successfully!');
            setIsVitalsFormVisible(false);
            setNewVitals({
                patientId: '',
                appointmentId: '',
                bloodPressure: '',
                pulse: '',
                temperature: '',
                oxygenLevel: '',
                weight: '',
                height: '',
                notes: ''
            });
        } catch (error) {
            alert('Error recording vitals: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCreateLabTest = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/lab-tests', newLabTest);
            alert('Lab Test Ordered Successfully!');
            setIsLabTestFormVisible(false);
            setNewLabTest({
                patientId: '',
                testName: '',
                testType: 'blood'
            });
        } catch (error) {
            alert('Error ordering lab test: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleMedicationChange = (index, field, value) => {
        const updatedMeds = [...newPrescription.medications];
        updatedMeds[index][field] = value;
        setNewPrescription({ ...newPrescription, medications: updatedMeds });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // UPDATE USER
                let url = `http://localhost:5000/api/clinics/${editingUserId}`;
                const updateData = { ...newUser };
                delete updateData.password; // Don't update password unless explicitly changed (frontend logic simplified here)

                if (newUser.userType === 'admin') {
                    url = `http://localhost:5000/api/admins/${editingUserId}`;
                    // Map back to schema fields
                    updateData.name = newUser.userName;
                    updateData.companyName = newUser.clinicName;
                    updateData.companyId = newUser.clinicRegistrationNumber;
                } else if (newUser.userType === 'patient') {
                    url = `http://localhost:5000/api/patients/${editingUserId}`;
                    updateData.name = newUser.userName;
                }

                await axios.put(url, updateData);
                alert(`${newUser.userType.toUpperCase()} updated successfully!`);

            } else {
                // CREATE USER logic (Hidden but kept for safety/logic integrity)
                if (newUser.userType === 'admin') {
                    await axios.post('http://localhost:5000/api/auth/signup/admin', {
                        name: newUser.userName,
                        email: newUser.email,
                        password: newUser.password,
                        companyName: newUser.clinicName,
                        companyId: newUser.clinicRegistrationNumber
                    });
                } else if (newUser.userType === 'patient') {
                    await axios.post('http://localhost:5000/api/auth/signup/patient', {
                        name: newUser.userName,
                        email: newUser.email,
                        password: newUser.password,
                        phoneNumber: newUser.phoneNumber,
                        area: newUser.area
                    });
                } else {
                    await axios.post('http://localhost:5000/api/clinics', newUser);
                }
                alert(`${newUser.userType.toUpperCase()} created successfully!`);
            }

            setIsFormVisible(false);
            setIsEditing(false);
            setEditingUserId(null);
            setNewUser({
                userType: 'doctor',
                userName: '',
                contactName: '',
                email: '',
                password: '',
                clinicName: 'Health One Main',
                clinicRegistrationNumber: '',
                nmrNumber: '',
                nuid: '',
                employeeCode: '',
                phoneNumber: '',
                area: ''
            });
            fetchData();
        } catch (error) {
            alert(`Error ${isEditing ? 'updating' : 'creating'} user: ` + (error.response?.data?.message || error.message));
        }
    };

    const handleEditUser = (user, type) => {
        setIsEditing(true);
        setEditingUserId(user._id);
        setIsFormVisible(true);

        // Pre-fill form
        setNewUser({
            userType: type,
            userName: user.name || user.userName || '', // Handle different naming conventions
            contactName: user.contactName || '',
            email: user.email || '',
            password: '', // Leave blank to keep existing
            clinicName: user.clinicName || user.companyName || '',
            clinicRegistrationNumber: user.clinicRegistrationNumber || user.companyId || '',
            nmrNumber: user.nmrNumber || '',
            nuid: user.nuid || '',
            employeeCode: user.employeeCode || '',
            phoneNumber: user.phoneNumber || '',
            area: user.area || ''
        });
    };

    const handleDeleteUser = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            let url = `http://localhost:5000/api/clinics/${id}`;
            if (type === 'admin') {
                url = `http://localhost:5000/api/admins/${id}`;
            } else if (type === 'patient') {
                url = `http://localhost:5000/api/patients/${id}`;
            }
            await axios.delete(url);
            alert('User deleted successfully');
            fetchData();
        } catch (error) {
            alert('Error deleting user: ' + error.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderPrescriptionForm = () => (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '1000px' }}>
                <div className="modal-header">
                    <h2>Add Prescription Record</h2>
                    <button onClick={() => setIsPrescriptionFormVisible(false)} className="close-btn">×</button>
                </div>
                <form onSubmit={handleCreatePrescription} className="create-user-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Select Patient</label>
                            <select
                                required
                                value={newPrescription.patientId}
                                onChange={(e) => setNewPrescription({ ...newPrescription, patientId: e.target.value })}
                            >
                                <option value="">-- Select Patient --</option>
                                {patients.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} (ID: {p._id.slice(-6)})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Prescribing Doctor</label>
                            <select
                                required
                                value={newPrescription.doctorId}
                                onChange={(e) => setNewPrescription({ ...newPrescription, doctorId: e.target.value })}
                            >
                                <option value="">-- Select Doctor --</option>
                                {doctors.map(d => (
                                    <option key={d._id} value={d._id}>Dr. {d.userName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="medications-section">
                        <h3>Medications</h3>
                        <div className="medication-grid-header">
                            <span>Drug Name</span>
                            <span>Dosage</span>
                            <span>Frequency</span>
                            <span>Duration</span>
                            <span>Instructions</span>
                            <span></span>
                        </div>
                        {newPrescription.medications.map((med, index) => (
                            <div key={index} className="medication-entry">
                                <input
                                    required
                                    type="text"
                                    placeholder="Drug Name"
                                    value={med.drugName}
                                    onChange={(e) => handleMedicationChange(index, 'drugName', e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 500mg"
                                    value={med.dosage}
                                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 1-0-1"
                                    value={med.frequency}
                                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 5 days"
                                    value={med.duration}
                                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Instructions"
                                    value={med.instructions}
                                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                />
                                {newPrescription.medications.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn-remove-med"
                                        onClick={() => {
                                            const updatedMeds = newPrescription.medications.filter((_, i) => i !== index);
                                            setNewPrescription({ ...newPrescription, medications: updatedMeds });
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddMedication} className="btn-add-med">
                            + Add Another Drug
                        </button>
                    </div>

                    <button type="submit" className="btn-save">Save Record</button>
                </form>
            </div>
        </div>
    );

    const renderUserForm = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEditing ? `Edit ${newUser.userType.charAt(0).toUpperCase() + newUser.userType.slice(1)}` : 'Add New Staff Member'}</h2>
                    <button onClick={() => setIsFormVisible(false)} className="close-btn">×</button>
                </div>
                <form onSubmit={handleCreateUser} className="create-user-form">
                    <div className="form-group">
                        <label>Role Type</label>
                        <select
                            value={newUser.userType}
                            onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
                        >
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="patient">Patient</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                required
                                type="text"
                                placeholder={newUser.userType === 'patient' ? "Patient Name" : "e.g. Dr. Jane Doe"}
                                value={newUser.userName}
                                onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                            />
                        </div>
                        {newUser.userType !== 'patient' && (
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Primary Contact"
                                    value={newUser.contactName}
                                    onChange={(e) => setNewUser({ ...newUser, contactName: e.target.value })}
                                />
                            </div>
                        )}
                        {newUser.userType === 'patient' && (
                            <div className="form-group">
                                <label>Area / Location</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. New York"
                                    value={newUser.area}
                                    onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                required
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                required
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {newUser.userType !== 'patient' && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Department / Clinic Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newUser.clinicName}
                                    onChange={(e) => setNewUser({ ...newUser, clinicName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Registration / ID</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Unique ID"
                                    value={newUser.clinicRegistrationNumber}
                                    onChange={(e) => setNewUser({
                                        ...newUser,
                                        clinicRegistrationNumber: e.target.value
                                    })}
                                />
                            </div>
                        </div>
                    )}

                    {newUser.userType === 'patient' && (
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                required
                                type="tel"
                                placeholder="Phone Number"
                                value={newUser.phoneNumber}
                                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                            />
                        </div>
                    )}

                    {newUser.userType === 'doctor' && (
                        <div className="form-group">
                            <label>NMR Number</label>
                            <input
                                required
                                type="text"
                                value={newUser.nmrNumber}
                                onChange={(e) => setNewUser({ ...newUser, nmrNumber: e.target.value })}
                            />
                        </div>
                    )}
                    {newUser.userType === 'nurse' && (
                        <div className="form-group">
                            <label>NUID</label>
                            <input
                                required
                                type="text"
                                value={newUser.nuid}
                                onChange={(e) => setNewUser({ ...newUser, nuid: e.target.value })}
                            />
                        </div>
                    )}
                    {newUser.userType === 'receptionist' && (
                        <div className="form-group">
                            <label>Employee Code</label>
                            <input
                                required
                                type="text"
                                value={newUser.employeeCode}
                                onChange={(e) => setNewUser({ ...newUser, employeeCode: e.target.value })}
                            />
                        </div>
                    )}

                    <button type="submit" className="btn-save">
                        {isEditing ? 'Update User' : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    );

    const renderVitalsForm = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Record Patient Vitals</h2>
                    <button onClick={() => setIsVitalsFormVisible(false)} className="close-btn">×</button>
                </div>
                <form onSubmit={handleCreateVitals} className="create-user-form">
                    <div className="form-group">
                        <label>Select Patient</label>
                        <select
                            required
                            value={newVitals.patientId}
                            onChange={(e) => setNewVitals({ ...newVitals, patientId: e.target.value })}
                        >
                            <option value="">-- Select Patient --</option>
                            {patients.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>BP (mmHg)</label>
                            <input
                                required
                                type="text"
                                placeholder="120/80"
                                value={newVitals.bloodPressure}
                                onChange={(e) => setNewVitals({ ...newVitals, bloodPressure: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Pulse (bpm)</label>
                            <input
                                required
                                type="number"
                                placeholder="72"
                                value={newVitals.pulse}
                                onChange={(e) => setNewVitals({ ...newVitals, pulse: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Temp (°F)</label>
                            <input
                                required
                                type="number"
                                step="0.1"
                                placeholder="98.6"
                                value={newVitals.temperature}
                                onChange={(e) => setNewVitals({ ...newVitals, temperature: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Oxygen (%)</label>
                            <input
                                required
                                type="number"
                                placeholder="98"
                                value={newVitals.oxygenLevel}
                                onChange={(e) => setNewVitals({ ...newVitals, oxygenLevel: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input
                                required
                                type="number"
                                step="0.1"
                                placeholder="70"
                                value={newVitals.weight}
                                onChange={(e) => setNewVitals({ ...newVitals, weight: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Height (cm)</label>
                            <input
                                required
                                type="number"
                                placeholder="170"
                                value={newVitals.height}
                                onChange={(e) => setNewVitals({ ...newVitals, height: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={newVitals.notes}
                            onChange={(e) => setNewVitals({ ...newVitals, notes: e.target.value })}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-save">Save Vitals</button>
                </form>
            </div>
        </div>
    );

    const renderLabTestForm = () => (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Order Lab Test</h2>
                    <button onClick={() => setIsLabTestFormVisible(false)} className="close-btn">×</button>
                </div>
                <form onSubmit={handleCreateLabTest} className="create-user-form">
                    <div className="form-group">
                        <label>Select Patient</label>
                        <select
                            required
                            value={newLabTest.patientId}
                            onChange={(e) => setNewLabTest({ ...newLabTest, patientId: e.target.value })}
                        >
                            <option value="">-- Select Patient --</option>
                            {patients.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Test Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. CBC, Lipid Profile"
                            value={newLabTest.testName}
                            onChange={(e) => setNewLabTest({ ...newLabTest, testName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Test Type</label>
                        <select
                            value={newLabTest.testType}
                            onChange={(e) => setNewLabTest({ ...newLabTest, testType: e.target.value })}
                        >
                            <option value="blood">Blood Test</option>
                            <option value="urine">Urine Test</option>
                            <option value="scan">Scan / X-Ray</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-save">Order Test</button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard">
            {/* Top Navigation Bar - Matching Receptionist Dashboard */}
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
                        className={activeTab === 'admins' ? 'active' : ''}
                        onClick={() => setActiveTab('admins')}
                    >
                        Admins
                    </button>
                    <button
                        className={activeTab === 'prescriptions' ? 'active' : ''}
                        onClick={() => setActiveTab('prescriptions')}
                    >
                        Prescriptions
                    </button>
                    <button
                        className={activeTab === 'doctors' ? 'active' : ''}
                        onClick={() => setActiveTab('doctors')}
                    >
                        Doctors
                    </button>
                    <button
                        className={activeTab === 'nurses' ? 'active' : ''}
                        onClick={() => setActiveTab('nurses')}
                    >
                        Nurses
                    </button>
                    <button
                        className={activeTab === 'receptionists' ? 'active' : ''}
                        onClick={() => setActiveTab('receptionists')}
                    >
                        Reception
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
                    <span className="user-name">Admin</span>
                    <button onClick={handleLogout} className="logout-button">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-main">
                {isFormVisible && renderUserForm()}
                {isPrescriptionFormVisible && renderPrescriptionForm()}
                {isVitalsFormVisible && renderVitalsForm()}
                {isLabTestFormVisible && renderLabTestForm()}

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="home-content">
                        {/* Welcome Banner - Matching Receptionist Dashboard */}
                        <div className="welcome-banner">
                            <h1>Welcome, Admin! 🛡️</h1>
                            <p>Admin Control Dashboard</p>
                        </div>

                        {/* Stats Grid - Matching Receptionist Dashboard */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Prescriptions</h3>
                                <p className="stat-number">{prescriptions.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Doctors</h3>
                                <p className="stat-number">{doctors.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Nurses</h3>
                                <p className="stat-number">{nurses.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Patients</h3>
                                <p className="stat-number">{patients.length}</p>
                            </div>
                        </div>

                        {/* Quick Actions - Matching Receptionist Dashboard */}
                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="action-buttons">
                                <button
                                    onClick={() => { setIsPrescriptionFormVisible(true); }}
                                    className="action-btn"
                                >
                                    💊 Add Prescription
                                </button>
                                <button
                                    onClick={() => { setIsVitalsFormVisible(true); }}
                                    className="action-btn"
                                >
                                    🩺 Add Vitals
                                </button>
                                <button
                                    onClick={() => { setIsLabTestFormVisible(true); }}
                                    className="action-btn"
                                >
                                    🔬 Order Lab Test
                                </button>
                                <button
                                    onClick={() => { setNewUser({ ...newUser, userType: 'doctor' }); setIsFormVisible(true); }}
                                    className="action-btn"
                                >
                                    👨‍⚕️ Add Doctor
                                </button>
                                <button
                                    onClick={() => { setNewUser({ ...newUser, userType: 'nurse' }); setIsFormVisible(true); }}
                                    className="action-btn"
                                >
                                    👩‍⚕️ Add Nurse
                                </button>
                                <button
                                    onClick={() => { setNewUser({ ...newUser, userType: 'receptionist' }); setIsFormVisible(true); }}
                                    className="action-btn"
                                >
                                    📝 Add Receptionist
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PRESCRIPTIONS TAB */}
                {activeTab === 'prescriptions' && (
                    <div className="content-section">
                        <h1>Prescription Records</h1>
                        <div className="section-header">
                            <button
                                onClick={() => setIsPrescriptionFormVisible(true)}
                                className="btn-save"
                                style={{ marginBottom: '20px' }}
                            >
                                + Add Data Entry
                            </button>
                        </div>
                        <div className="users-grid">
                            {prescriptions.map(p => (
                                <div key={p._id} className="user-card" style={{ borderLeftColor: 'var(--accent-secondary)' }}>
                                    <h3>{p.patientId?.name || 'Unknown Patient'}</h3>
                                    <p className="role-badge">Rx Record</p>
                                    <p><strong>Dr:</strong> {p.doctorId?.userName || 'N/A'}</p>
                                    <p><strong>Date:</strong> {new Date(p.createdAt).toLocaleDateString()}</p>
                                    <div style={{ marginTop: '10px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px' }}>
                                        <small><strong>Meds:</strong> {p.medications.map(m => m.drugName).join(', ')}</small>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePrescription(p._id)}
                                        className="btn-delete"
                                    >
                                        Delete Record
                                    </button>
                                </div>
                            ))}
                        </div>
                        {prescriptions.length === 0 && <p className="no-data">No prescription records found.</p>}
                    </div>
                )}

                {/* ADMINS TAB */}
                {activeTab === 'admins' && (
                    <div className="content-section">
                        <h1>Manage Admins</h1>
                        {/* 
                        <div className="section-header">
                            <button
                                onClick={() => {
                                    setNewUser({ ...newUser, userType: 'admin' });
                                    setIsFormVisible(true);
                                }}
                                className="btn-save"
                                style={{ marginBottom: '20px' }}
                            >
                                + Add New Admin
                            </button>
                        </div> 
                        */}
                        <div className="users-grid">
                            {admins.map(admin => (
                                <div key={admin._id} className="user-card" style={{ borderLeftColor: '#333' }}>
                                    <h3>{admin.name}</h3>
                                    <p className="role-badge" style={{ color: '#333', background: '#e0e0e0' }}>Admin</p>
                                    <p><strong>Email:</strong> {admin.email}</p>
                                    <p><strong>Company:</strong> {admin.companyName}</p>
                                    <button
                                        onClick={() => handleEditUser(admin, 'admin')}
                                        className="btn-edit"
                                        style={{ marginRight: '10px' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(admin._id, 'admin')}
                                        className="btn-delete"
                                    >
                                        Delete Admin
                                    </button>
                                </div>
                            ))}
                        </div>
                        {admins.length === 0 && <p className="no-data">No admins found.</p>}
                    </div>
                )}

                {/* USER MANAGEMENT TABS */}
                {['doctors', 'nurses', 'receptionists'].includes(activeTab) && (
                    <div className="content-section">
                        <h1>Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>

                        <div className="users-grid">
                            {(activeTab === 'doctors' ? doctors : activeTab === 'nurses' ? nurses : receptionists).map(staff => (
                                <div key={staff._id} className="user-card">
                                    <h3>{staff.userName}</h3>
                                    <p className="role-badge">{staff.userType}</p>
                                    <p><strong>ID:</strong> {staff.clinicRegistrationNumber}</p>
                                    <p><strong>Email:</strong> {staff.email}</p>
                                    {staff.nmrNumber && <p><strong>NMR:</strong> {staff.nmrNumber}</p>}
                                    {staff.nuid && <p><strong>NUID:</strong> {staff.nuid}</p>}

                                    <button
                                        onClick={() => handleEditUser(staff, staff.userType)}
                                        className="btn-edit"
                                        style={{ marginRight: '10px' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(staff._id, staff.userType)}
                                        className="btn-delete"
                                    >
                                        Delete User
                                    </button>
                                </div>
                            ))}
                        </div>
                        {(activeTab === 'doctors' ? doctors : activeTab === 'nurses' ? nurses : receptionists).length === 0 && (
                            <p className="no-data">No {activeTab} found.</p>
                        )}
                    </div>
                )}

                {/* PATIENTS TAB */}
                {activeTab === 'patients' && (
                    <div className="content-section">
                        <h1>All Patients</h1>
                        {/* 
                        <div className="section-header">
                            <button
                                onClick={() => {
                                    setNewUser({ ...newUser, userType: 'patient' });
                                    setIsFormVisible(true);
                                }}
                                className="btn-save"
                                style={{ marginBottom: '20px' }}
                            >
                                + Add New Patient
                            </button>
                        </div> 
                        */}
                        <div className="users-grid">
                            {patients.map(patient => (
                                <div key={patient._id} className="user-card">
                                    <h3>{patient.name}</h3>
                                    <p><strong>Email:</strong> {patient.email}</p>
                                    <p><strong>Phone:</strong> {patient.phoneNumber}</p>
                                    <p><strong>Area:</strong> {patient.area}</p>
                                    <button
                                        onClick={() => handleEditUser(patient, 'patient')}
                                        className="btn-edit"
                                        style={{ marginRight: '10px' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(patient._id, 'patient')}
                                        className="btn-delete"
                                    >
                                        Delete Patient
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
