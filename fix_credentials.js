require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixCredentials() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const usersToFix = [
            { email: 'admin@cctv.com', password: 'Admin@1234', role: 'admin', name: 'Admin CCTV' },
            { email: 'customer@test.com', password: 'Customer@1234', role: 'customer', name: 'Test Customer' }
        ];

        for (const userData of usersToFix) {
            let user = await User.findOne({ email: userData.email });
            if (user) {
                console.log(`Updating existing user: ${userData.email}`);
                user.password = userData.password;
                user.role = userData.role;
                user.name = userData.name;
            } else {
                console.log(`Creating new user: ${userData.email}`);
                user = new User(userData);
            }
            await user.save();
            console.log(`Successfully processed: ${userData.email}`);
        }

    } catch (e) {
        console.error('Error fixing credentials:', e);
    } finally {
        await mongoose.disconnect();
    }
}

fixCredentials();
