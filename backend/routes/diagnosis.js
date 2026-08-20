const express = require('express');
const router = express.Router();
const { calculateDiagnosis } = require('../services/scoringEngine');

// In-memory diagnosis history store
const diagnosisHistory = [];

/**
 * POST /api/diagnose
 * Process self-diagnosis form payload, calculate scores and return recommended stage & package
 */
router.post('/', (req, res) => {
    try {
        const payload = req.body;
        const result = calculateDiagnosis(payload);
        
        // Save to history
        diagnosisHistory.unshift(result);
        if (diagnosisHistory.length > 20) diagnosisHistory.pop();

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error("Diagnosis error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/diagnose/history
 * Fetch past diagnosis history
 */
router.get('/history', (req, res) => {
    res.json({
        success: true,
        data: diagnosisHistory
    });
});

module.exports = router;
