require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixDuplicateAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ email: 'admin@cctv.com' });
        console.log('Found', users.length, 'users matching admin@cctv.com');

        for (const u of users) {
            if (u.role === 'employee') {
                console.log(`Deleting incorrect employee version: ID ${u._id}`);
                await User.findByIdAndDelete(u._id);
            } else if (u.role === 'admin') {
                console.log(`Keeping correct admin version: ID ${u._id}`);
            }
        }

        // Re-check
        const remaining = await User.find({ email: 'admin@cctv.com' });
        console.log('Remaining users:', remaining.length);
        remaining.forEach(r => console.log(`ID: ${r._id}, Role: ${r.role}`));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

fixDuplicateAdmin();
