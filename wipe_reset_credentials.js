require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function wipeAndReset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const targets = ['admin@cctv.com', 'customer@test.com'];

        for (const email of targets) {
            console.log(`Cleansing all nodes for: ${email}`);
            const result = await User.deleteMany({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } });
            console.log(`Deleted ${result.deletedCount} instances.`);
        }

        const usersToCreate = [
            { 
                name: 'Admin CCTV', 
                email: 'admin@cctv.com', 
                password: 'Admin@1234', 
                role: 'admin',
                employeeId: 'ADMIN-001'
            },
            { 
                name: 'Test Customer', 
                email: 'customer@test.com', 
                password: 'Customer@1234', 
                role: 'customer'
            }
        ];

        for (const userData of usersToCreate) {
            const user = new User(userData);
            await user.save();
            console.log(`Successfully recreated: ${userData.email}`);
        }

        console.log('--- CREDENTIALS RESET COMPLETE ---');
    } catch (e) {
        console.error('CRITICAL ERROR DURING RESET:', e);
    } finally {
        await mongoose.disconnect();
    }
}

wipeAndReset();
