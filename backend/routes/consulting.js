const express = require('express');
const router = express.Router();
const { callGeminiConsulting } = require('../services/geminiService');

/**
 * POST /api/consulting/chat
 * Handle AI consulting request
 */
router.post('/chat', async (req, res) => {
    try {
        const { prompt, diagnosisResult, userApiKey } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt text is required" });
        }

        const aiResponse = await callGeminiConsulting(prompt, diagnosisResult, userApiKey);

        res.json({
            success: true,
            reply: aiResponse
        });
    } catch (err) {
        console.error("Consulting chat error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
