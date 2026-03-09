require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS - allowing local Vite dev server specifically
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/chat', require('./routes/chat'));

// --- THE NEW MONOLITHIC REACT INTEGRATION ---
// Serve the static files from the React app
app.use(express.static(path.join(process.cwd(), 'client', 'dist')));

// Any request that doesn't match an API route above will be sent back to React's index.html
// Using app.use() as a catch-all to avoid argument-type issues in Express 5
app.use((req, res) => {
    res.sendFile(path.join(process.cwd(), 'client', 'dist', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).send({ message: 'Identity data too large for current bandwidth.' });
    }
    res.status(err.status || 500).send({ message: err.message || 'Internal Node Failure' });
});

app.listen(PORT, () => {
    console.log(`Unified Server is running on port ${PORT}`);
});
