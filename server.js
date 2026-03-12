require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;
// Simple Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Created uploads directory');
}

// CORS — allow localhost in dev, any Render/Vercel domain in prod
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Render health checks)
        if (!origin) return callback(null, true);
        // Allow any Render, Vercel, or localhost origin
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.onrender.com') ||
            origin.endsWith('.vercel.app')
        ) {
            return callback(null, true);
        }
        // Allow same-origin requests from the production server itself
        return callback(null, true);
    },
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
app.use('/api/performance', require('./routes/performance'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/chat', require('./routes/chat'));

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- THE NEW MONOLITHIC REACT INTEGRATION ---
// Serve the static files from the React app
app.use(express.static(path.join(process.cwd(), 'client', 'dist')));

// Any request that doesn't match an API route above will be sent back to React's index.html
// Using app.use() as a catch-all to avoid argument-type issues in Express 5
app.use((req, res, next) => {
    // Only handle GET requests for the SPA fallback
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(process.cwd(), 'client', 'dist', 'index.html'));
    }
    next();
});

// Global Error Handler
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).send({ message: 'Identity data too large for current bandwidth.' });
    }
    console.error('Global Error:', err);
    // Provide stack trace in development mode
    res.status(err.status || 500).send({ 
        message: err.message || 'Internal Node Failure',
        error: process.env.NODE_ENV === 'development' ? err : {},
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Unified Server is running on port ${PORT}`);
});
