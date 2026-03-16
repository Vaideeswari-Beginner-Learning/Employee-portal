require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function forceReset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const coll = User.collection;
        
        console.log('--- DROPPING CONFLICTING INDEXES ---');
        try {
            await coll.dropIndex('employeeId_1');
            console.log('Dropped employeeId_1 index');
        } catch (e) {
            console.log('employeeId_1 index not found or already dropped');
        }

        const targets = ['admin@cctv.com', 'customer@test.com'];
        for (const email of targets) {
            console.log(`Cleansing: ${email}`);
            await User.deleteMany({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } });
        }

        const usersToCreate = [
            { 
                name: 'Admin CCTV', 
                email: 'admin@cctv.com', 
                password: 'Admin@1234', 
                role: 'admin',
                employeeId: 'ADMIN-FIXED'
            },
            { 
                name: 'Test Customer', 
                email: 'customer@test.com', 
                password: 'Customer@1234', 
                role: 'customer',
                employeeId: 'CUST-FIXED' // Give it a placeholder to avoid null issues for now
            }
        ];

        for (const userData of usersToCreate) {
            const user = new User(userData);
            await user.save();
            console.log(`Successfully created: ${userData.email}`);
        }

        console.log('--- SYSTEM RESTORED ---');
    } catch (e) {
        console.error('SYSTEM RESTORE FAILED:', e);
    } finally {
        await mongoose.disconnect();
    }
}

forceReset();
