require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAllDuplicates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const allUsers = await User.find({});
        const emailMap = {};
        const duplicates = [];

        allUsers.forEach(u => {
            const email = u.email.toLowerCase();
            if (emailMap[email]) {
                duplicates.push(email);
            }
            emailMap[email] = true;
        });

        if (duplicates.length > 0) {
            console.log('Duplicates found:', duplicates);
        } else {
            console.log('No more duplicates found.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkAllDuplicates();
