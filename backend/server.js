const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const patientRecordRoutes = require('./routes/patientRecords');
const appointmentRoutes = require('./routes/appointments');
const vitalsRoutes = require('./routes/vitals');
const consultationRoutes = require('./routes/consultations');
const prescriptionRoutes = require('./routes/prescriptions');
const labTestRoutes = require('./routes/labTests');
const billingRoutes = require('./routes/billing');
const medicationLogRoutes = require('./routes/medicationLogs');
const communicationRoutes = require('./routes/communications');
const clinicRoutes = require('./routes/clinics');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient-records', patientRecordRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/medication-logs', medicationLogRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/patients', require('./routes/patients'));
app.use('/api/admins', require('./routes/admins'));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Health-One Clinical App API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
