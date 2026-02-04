const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            // Find the 5 most recent documents in 'clinics' collection
            const recentClinics = await mongoose.connection.db.collection('clinics')
                .find()
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray();

            console.log('\n--- Most Recent Entries in "clinics" Collection ---');
            if (recentClinics.length === 0) {
                console.log('No documents found in clinics collection.');
            } else {
                recentClinics.forEach(doc => {
                    console.log(`\nID: ${doc._id}`);
                    console.log(`Type: ${doc.userType}`);
                    console.log(`Name: ${doc.userName} (${doc.contactName})`);
                    console.log(`Email: ${doc.email}`);
                    console.log(`Created: ${doc.createdAt || doc.updatedAt}`);
                });
            }

            // Check if there are other collections we missed?
            const cols = await mongoose.connection.db.listCollections().toArray();
            console.log('\n--- All Collections ---');
            cols.forEach(c => console.log(c.name));

        } catch (e) {
            console.error('Error fetching data:', e.message);
        }

        mongoose.connection.close();
    })
    .catch(err => console.error('Connection failed:', err));
