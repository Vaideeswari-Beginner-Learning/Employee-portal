const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Auth Token detected:', token ? 'Yes (starts with ' + token.substring(0, 10) + ')' : 'No');
        if (!token) throw new Error('Token missing');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) throw new Error('User not found');

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        console.error('Auth Middleware Error:', e.message);
        res.status(401).send({ error: e.message || 'Please authenticate.' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.replace('Bearer ', '');
        console.log('Admin Auth - Raw Header:', authHeader);
        console.log('Admin Auth - Extracted Token:', token);

        if (!token || token === 'null' || token === 'undefined') {
            console.error(`[AdminAuth] Authentication failed: ${!token ? 'Missing' : 'Invalid ("' + token + '")'} token.`);
            return res.status(401).send({ error: 'Authentication failed: Invalid or missing token.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            console.error(`[AdminAuth] Authentication failed: User node ${decoded._id} not found in database.`);
            return res.status(401).send({ error: 'Authentication failed: User not found.' });
        }

        if (user.email !== 'admin@cctv.com') {
            const warnMsg = `[AdminAuth] Access denied: User ${user.email} (ID: ${user._id}) has role "${user.role}". Admin role required.\n`;
            console.warn(warnMsg);
            fs.appendFileSync('server.log', warnMsg);
            return res.status(403).send({ error: 'Access denied: Administrative clearance required.' });
        }

        console.log(`[AdminAuth] Access granted for user: ${user.email}`);


        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        console.error('Admin Auth Error:', e.message);
        res.status(401).send({ error: e.message || 'Authentication error.' });
    }
};

module.exports = { auth, adminAuth };
