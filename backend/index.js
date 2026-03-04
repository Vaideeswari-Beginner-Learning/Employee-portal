require('dotenv').config(); // Trigger nodemon restart
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Early Logger (Before any parsing)
app.use((req, res, next) => {
    const log = `[${new Date().toISOString()}] ${req.method} ${req.url} (Request Incoming)\n`;
    fs.appendFileSync('server.log', log);
    next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use((req, res, next) => {
    const log = `[${new Date().toISOString()}] ${req.method} ${req.url} - JSON Parsed. Body Size: ${JSON.stringify(req.body || {}).length}\n`;
    fs.appendFileSync('server.log', log);
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        const msg = `[${new Date().toISOString()}] Connected to MongoDB\n`;
        fs.appendFileSync('server.log', msg);
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        const msg = `[${new Date().toISOString()}] MongoDB Connection Error: ${err.message}\n`;
        fs.appendFileSync('server.log', msg);
        console.error('MongoDB connection error:', err);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/chat', require('./routes/chat'));

// Global Error Handler
app.use((err, req, res, next) => {
    const errorLog = `[${new Date().toISOString()}] ERROR: ${err.message} - Stack: ${err.stack}\n`;
    fs.appendFileSync('server.log', errorLog);
    if (err.type === 'entity.too.large') {
        return res.status(413).send({ message: 'Identity data too large for current bandwidth.' });
    }
    res.status(err.status || 500).send({ message: err.message || 'Internal Node Failure' });
});

app.get('/', (req, res) => {
    res.send('CCTV Portal API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
