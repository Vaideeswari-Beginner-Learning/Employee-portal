require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function setupAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'support@sktechnology.in';
        const password = 'password';

        let admin = await User.findOne({ email });

        if (admin) {
            console.log('Updating existing admin credentials...');
            admin.password = password;
            admin.role = 'admin';
            admin.name = 'SK Admin';
            await admin.save();
            console.log('Admin updated successfully.');
        } else {
            console.log('Creating new admin user...');
            admin = new User({
                name: 'SK Admin',
                email: email,
                password: password,
                role: 'admin'
            });
            await admin.save();
            console.log('Admin created successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Setup failed:', err);
        process.exit(1);
    }
}

setupAdmin();
