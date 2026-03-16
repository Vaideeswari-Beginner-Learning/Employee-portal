require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function sedCustomer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const customerEmail = 'customer@test.com';
        const existing = await User.findOne({ email: customerEmail });

        if (existing) {
            console.log('Customer already exists');
        } else {
            const customer = new User({
                name: 'Test Customer',
                email: customerEmail,
                password: 'Customer@1234',
                role: 'customer'
            });
            await customer.save();
            console.log('Customer account created:');
            console.log('Email:', customerEmail);
            console.log('Password: Customer@1234');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

sedCustomer();
