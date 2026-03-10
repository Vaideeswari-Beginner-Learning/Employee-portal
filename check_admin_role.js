require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAndFixAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ email: 'admin@cctv.com' });
        if (admin) {
            console.log('User found:', admin.email);
            console.log('Current Role:', admin.role);

            if (admin.role !== 'admin') {
                console.log('Fixing role to "admin"...');
                admin.role = 'admin';
                await admin.save();
                console.log('Role updated to "admin"');
            } else {
                console.log('Role is already "admin"');
            }
        } else {
            console.log('User admin@cctv.com not found. Creating new admin...');
            const newAdmin = new User({
                name: 'Admin CCTV',
                email: 'admin@cctv.com',
                password: 'Admin@1234',
                role: 'admin',
                employeeId: 'ADMIN-001',
                phone: '9999999999'
            });
            await newAdmin.save();
            console.log('New admin created successfully');
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkAndFixAdmin();
