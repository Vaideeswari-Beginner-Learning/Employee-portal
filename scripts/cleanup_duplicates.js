const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function cleanup() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const emailToFix = 'admin@cctv.com';
        
        // Find all users with this email (case-insensitive)
        const users = await User.find({ email: { $regex: new RegExp(`^${emailToFix}$`, 'i') } });
        console.log(`Found ${users.length} users matching ${emailToFix}`);

        if (users.length > 1) {
            // We want to keep the one that is NOT the corrupted ID if possible, 
            // or just pick the first one and delete others.
            // Based on previous research, 69ae82bb05eb274cb01e was the one that failed to cast.
            
            for (const user of users) {
                console.log(`Checking user: ID=${user._id}, Email=${JSON.stringify(user.email)}`);
                
                // If ID is exactly the one we identified as problematic or if it's a duplicate
                if (user._id.toString() === '69ae82bb05eb274cb01e' || users.indexOf(user) > 0) {
                    console.log(`Deleting corrupted/duplicate user: ${user._id}`);
                    await User.deleteOne({ _id: user._id });
                } else {
                    console.log(`Keeping valid user: ${user._id}`);
                }
            }
        } else {
            console.log('No duplicates found. Nothing to clean up.');
        }

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
