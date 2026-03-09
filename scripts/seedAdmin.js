require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
        console.log('Admin already exists:', existing.email);
        await mongoose.disconnect();
        return;
    }

    // Create admin user
    const admin = new User({
        name: 'Admin CCTV',
        email: 'admin@cctv.com',
        password: 'Admin@1234',
        role: 'admin',
        employeeId: 'ADMIN-001',
        phone: '9999999999'
    });

    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('   Email:    admin@cctv.com');
    console.log('   Password: Admin@1234');
    await mongoose.disconnect();
}

seedAdmin().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
