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
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).send({ error: 'Auth required' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            console.error(`[AdminAuth] User not found for ID: ${decoded._id}`);
            return res.status(401).send({ error: 'User not found' });
        }

        console.log(`[AdminAuth] Checking access for ${user.email} (Role: ${user.role})`);

        if (user.role.toLowerCase() !== 'admin') {
            console.warn(`[AdminAuth] Access denied for ${user.email}: Role is ${user.role}, not Admin`);
            return res.status(403).send({ error: 'Administrative clearance required.' });
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Authentication error.' });
    }
};

const managerAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).send({ error: 'Auth required' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            return res.status(403).send({ error: 'User not found.' });
        }

        const role = user.role.toLowerCase();
        console.log(`[AuthDebug] User: ${user.email}, Role: ${role}`);
        if (role !== 'admin' && role !== 'manager') {
            console.log(`[AuthDebug] 403: Role ${role} is not admin or manager`);
            return res.status(403).send({ error: 'Managerial or Administrative clearance required.' });
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Authentication error.' });
    }
};

module.exports = { auth, adminAuth, managerAuth };
