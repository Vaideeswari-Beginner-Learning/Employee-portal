require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function inspectDuplicates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ email: 'admin@cctv.com' });
        console.log('Inspecting', users.length, 'users matching admin@cctv.com');
        users.forEach(u => {
            console.log(JSON.stringify(u, null, 2));
        });
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

inspectDuplicates();
