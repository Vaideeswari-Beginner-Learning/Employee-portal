require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const admin = new User({
            name: 'System Admin',
            email: 'admin@cctv.com',
            password: 'admin123@password',
            phone: '1234567890',
            role: 'admin',
            employeeId: 'ADM001'
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@cctv.com');
        console.log('Password: admin123@password');
        process.exit(0);
    } catch (e) {
        console.error('Error seeding admin:', e);
        process.exit(1);
    }
};

seedAdmin();
