const express = require('express');
const cors = require('cors');
const path = require('path');

const diagnosisRouter = require('./routes/diagnosis');
const programsRouter = require('./routes/programs');
const consultingRouter = require('./routes/consulting');
const demandRouter = require('./routes/demand');
const matchingRouter = require('./routes/matching');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS & JSON middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'K-Green Water Backend API is running' });
});

// API Routes
app.use('/api/diagnose', diagnosisRouter);
app.use('/api/programs', programsRouter);
app.use('/api/consulting', consultingRouter);
app.use('/api/demand', demandRouter);
app.use('/api/matching', matchingRouter);

// Serve static frontend files if available
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 K-Green & Water Backend API Server Running!`);
    console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`=================================================`);
});
