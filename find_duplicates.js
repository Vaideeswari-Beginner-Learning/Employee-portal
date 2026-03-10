require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function debugAllUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ email: /admin@cctv.com/i });
        console.log('Found', users.length, 'users matching admin@cctv.com');
        users.forEach(u => {
            console.log(`ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debugAllUsers();
