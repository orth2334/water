const express = require('express');
const router = express.Router();
const { PROGRAM_DATABASE } = require('../data/programsData');

/**
 * GET /api/programs
 * Fetch all 8 programs with optional filtering (?stage=1&search=water)
 */
router.get('/', (req, res) => {
    try {
        const { stage, search } = req.query;
        let result = PROGRAM_DATABASE;

        if (stage && stage !== 'all') {
            const stageNum = parseInt(stage);
            result = result.filter(p => p.stageMatch.includes(stageNum));
        }

        if (search) {
            const query = search.toLowerCase().trim();
            result = result.filter(p => 
                p.title.toLowerCase().includes(query) ||
                p.desc.toLowerCase().includes(query) ||
                p.tag.toLowerCase().includes(query)
            );
        }

        res.json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/programs/:id
 * Fetch single program detail
 */
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const prog = PROGRAM_DATABASE.find(p => p.id === id);

        if (!prog) {
            return res.status(404).json({ success: false, message: "Program not found" });
        }

        res.json({
            success: true,
            data: prog
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
