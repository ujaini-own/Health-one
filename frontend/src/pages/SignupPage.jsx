import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './SignupPage.css';

const SignupPage = () => {
    const [selectedRole, setSelectedRole] = useState('patient');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // Patient form state
    const [patientData, setPatientData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        area: ''
    });

    // Clinic form state
    const [clinicData, setClinicData] = useState({
        clinicName: '',
        userName: '',
        contactName: '',
        email: '',
        password: '',
        clinicRegistrationNumber: '',
        userType: 'doctor',
        nmrNumber: '',
        nuid: '',
        employeeCode: ''
    });

    // Admin form state
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        password: '',
        companyName: '',
        companyId: ''
    });

    const handlePatientChange = (e) => {
        setPatientData({ ...patientData, [e.target.name]: e.target.value });
    };

    const handleClinicChange = (e) => {
        setClinicData({ ...clinicData, [e.target.name]: e.target.value });
    };

    const handleAdminChange = (e) => {
        setAdminData({ ...adminData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            let response;
            const API_URL = 'http://localhost:5000/api/auth';

            if (selectedRole === 'patient') {
                response = await axios.post(`${API_URL}/signup/patient`, patientData);
            } else if (selectedRole === 'clinic') {
                response = await axios.post(`${API_URL}/signup/clinic`, clinicData);
            } else if (selectedRole === 'admin') {
                response = await axios.post(`${API_URL}/signup/admin`, adminData);
            }

            if (response.data.success) {
                setSuccess(response.data.message);
                login(response.data.user, response.data.token);

                // Redirect based on role
                setTimeout(() => {
                    if (response.data.user.role === 'admin') {
                        navigate('/admin-dashboard');
                    } else if (response.data.user.role === 'doctor' || (response.data.user.role === 'clinic' && response.data.user.userType === 'doctor')) {
                        navigate('/doctor-dashboard');
                    } else if (response.data.user.role === 'nurse' || (response.data.user.role === 'clinic' && response.data.user.userType === 'nurse')) {
                        navigate('/nurse-dashboard');
                    } else if (response.data.user.role === 'receptionist' || (response.data.user.role === 'clinic' && response.data.user.userType === 'receptionist')) {
                        navigate('/receptionist-dashboard');
                    } else if (response.data.user.role === 'patient') {
                        navigate('/patient-dashboard');
                    } else {
                        navigate('/home');
                    }
                }, 1000);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error
                ? `${err.response.data.message}: ${err.response.data.error}`
                : (err.response?.data?.message || 'Registration failed. Please try again.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h1 className="signup-title">Create Account</h1>
                <p className="signup-subtitle">Join Health-One Clinical App</p>

                {/* Role Selection Tabs */}
                <div className="role-tabs">
                    <button
                        className={`role-tab ${selectedRole === 'patient' ? 'active' : ''}`}
                        onClick={() => setSelectedRole('patient')}
                    >
                        Patient
                    </button>
                    <button
                        className={`role-tab ${selectedRole === 'clinic' ? 'active' : ''}`}
                        onClick={() => setSelectedRole('clinic')}
                    >
                        Clinic
                    </button>
                    <button
                        className={`role-tab ${selectedRole === 'admin' ? 'active' : ''}`}
                        onClick={() => setSelectedRole('admin')}
                    >
                        Admin
                    </button>
                </div>

                {/* Error and Success Messages */}
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Dynamic Forms Based on Selected Role */}
                <form onSubmit={handleSubmit} className="signup-form">

                    {/* PATIENT FORM */}
                    {selectedRole === 'patient' && (
                        <>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={patientData.name}
                                    onChange={handlePatientChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={patientData.email}
                                    onChange={handlePatientChange}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={patientData.password}
                                    onChange={handlePatientChange}
                                    required
                                    minLength="6"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={patientData.phoneNumber}
                                    onChange={handlePatientChange}
                                    required
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Area</label>
                                <input
                                    type="text"
                                    name="area"
                                    value={patientData.area}
                                    onChange={handlePatientChange}
                                    required
                                    placeholder="Enter your area/location"
                                />
                            </div>
                        </>
                    )}

                    {/* CLINIC FORM */}
                    {selectedRole === 'clinic' && (
                        <>
                            <div className="form-group">
                                <label>Clinic Name</label>
                                <input
                                    type="text"
                                    name="clinicName"
                                    value={clinicData.clinicName}
                                    onChange={handleClinicChange}
                                    required
                                    placeholder="Enter clinic name"
                                />
                            </div>

                            <div className="form-group">
                                <label>User Name</label>
                                <input
                                    type="text"
                                    name="userName"
                                    value={clinicData.userName}
                                    onChange={handleClinicChange}
                                    required
                                    placeholder="Enter your username"
                                />
                            </div>

                            <div className="form-group">
                                <label>Contact Name</label>
                                <input
                                    type="text"
                                    name="contactName"
                                    value={clinicData.contactName}
                                    onChange={handleClinicChange}
                                    required
                                    placeholder="Enter contact person name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={clinicData.email}
                                    onChange={handleClinicChange}
                                    required
                                    placeholder="Enter clinic email"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={clinicData.password}
                                    onChange={handleClinicChange}
                                    required
                                    minLength="6"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div className="form-group">
                                <label>Clinic Registration Number</label>
                                <input
                                    type="text"
                                    name="clinicRegistrationNumber"
                                    value={clinicData.clinicRegistrationNumber}
                                    onChange={handleClinicChange}
                                    required
                                    placeholder="Enter registration number"
                                />
                            </div>

                            <div className="form-group">
                                <label>User Type</label>
                                <select
                                    name="userType"
                                    value={clinicData.userType}
                                    onChange={handleClinicChange}
                                    required
                                >
                                    <option value="doctor">Doctor</option>
                                    <option value="nurse">Nurse</option>
                                    <option value="receptionist">Receptionist</option>
                                </select>
                            </div>

                            {/* Conditional Fields Based on User Type */}
                            {clinicData.userType === 'doctor' && (
                                <div className="form-group">
                                    <label>NMR Number</label>
                                    <input
                                        type="text"
                                        name="nmrNumber"
                                        value={clinicData.nmrNumber}
                                        onChange={handleClinicChange}
                                        required
                                        placeholder="Enter NMR number"
                                    />
                                </div>
                            )}

                            {clinicData.userType === 'nurse' && (
                                <div className="form-group">
                                    <label>NUID</label>
                                    <input
                                        type="text"
                                        name="nuid"
                                        value={clinicData.nuid}
                                        onChange={handleClinicChange}
                                        required
                                        placeholder="Enter NUID"
                                    />
                                </div>
                            )}

                            {clinicData.userType === 'receptionist' && (
                                <div className="form-group">
                                    <label>Hospital Employee Code</label>
                                    <input
                                        type="text"
                                        name="employeeCode"
                                        value={clinicData.employeeCode}
                                        onChange={handleClinicChange}
                                        required
                                        placeholder="Enter employee code"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* ADMIN FORM */}
                    {selectedRole === 'admin' && (
                        <>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={adminData.name}
                                    onChange={handleAdminChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={adminData.email}
                                    onChange={handleAdminChange}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={adminData.password}
                                    onChange={handleAdminChange}
                                    required
                                    minLength="6"
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={adminData.companyName}
                                    onChange={handleAdminChange}
                                    required
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Company ID</label>
                                <input
                                    type="text"
                                    name="companyId"
                                    value={adminData.companyId}
                                    onChange={handleAdminChange}
                                    required
                                    placeholder="Enter company ID"
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
