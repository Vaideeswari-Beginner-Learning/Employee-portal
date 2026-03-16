require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function inspectIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const coll = User.collection;
        
        console.log('--- USER INDEXES ---');
        const indexes = await coll.indexes();
        console.log(JSON.stringify(indexes, null, 2));

        console.log('--- USERS WITH NULL EMPLOYEE ID ---');
        const nullEmps = await User.find({ employeeId: null });
        console.log(`Found ${nullEmps.length} users with null employeeId`);
        nullEmps.forEach(u => console.log(`- ${u.email}`));

        console.log('--- REPAIRING: Dropping employeeId index if non-sparse ---');
        // If we suspect the unique index is broken or not sparse
        // await coll.dropIndex('employeeId_1');
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

inspectIndexes();
