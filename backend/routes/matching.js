const express = require('express');
const router = express.Router();
const { GLOBAL_DEMAND_DATABASE } = require('../data/globalDemandData');
const { 
    evaluateSupplierMatches, 
    evaluateDemandMatches, 
    calculateSingleMatch,
    SAMPLE_KOREAN_SUPPLIERS 
} = require('../services/demandScoringEngine');

/**
 * POST /api/matching/supplier
 * 한국 공급기업 프로필 기준으로 글로벌 수요 매칭 분석
 */
router.post('/supplier', (req, res) => {
    try {
        const supplierProfile = req.body;
        const matches = evaluateSupplierMatches(supplierProfile);
        
        // 상위 추천 매칭 & 평균 매칭 점수
        const topMatches = matches.slice(0, 3);
        const avgMatchScore = Math.round(matches.reduce((acc, cur) => acc + cur.matchScore, 0) / matches.length);

        res.json({
            success: true,
            supplierName: supplierProfile.compName || '한국 신청 기업',
            avgMatchScore,
            totalDemandsEvaluated: matches.length,
            topMatches,
            allMatches: matches
        });
    } catch (err) {
        console.error('Error evaluating supplier matching:', err);
        res.status(500).json({ success: false, error: '공급자 매칭 계산 중 오류가 발생했습니다.' });
    }
});

/**
 * POST /api/matching/demand
 * 해외 수요 프로젝트 기준으로 한국 공급기업 풀 매칭 분석
 */
router.post('/demand', (req, res) => {
    try {
        const demandProfile = req.body;
        const matches = evaluateDemandMatches(demandProfile);
        const topMatches = matches.slice(0, 3);

        res.json({
            success: true,
            demandTitle: demandProfile.title || demandProfile.country,
            topMatches,
            allMatches: matches
        });
    } catch (err) {
        console.error('Error evaluating demand matching:', err);
        res.status(500).json({ success: false, error: '수요처 매칭 계산 중 오류가 발생했습니다.' });
    }
});

/**
 * GET /api/matching/overview
 * 전체 수요-공급 현황 대시보드 데이터 (글로벌 맵, 분야별 통계, 공급기업 풀 등)
 */
router.get('/overview', (req, res) => {
    try {
        // 분야별 수요-공급 카운트
        const fieldStats = [
            { key: "smart_water_grid", name: "스마트 상하수도·관망", demandCount: 14, supplierCount: 38, avgBudget: "$42M" },
            { key: "desalination", name: "해수담수화·염분차", demandCount: 18, supplierCount: 22, avgBudget: "$55M" },
            { key: "industrial_wastewater", name: "산업폐수 ZLD·고도처리", demandCount: 21, supplierCount: 29, avgBudget: "$80M" },
            { key: "sludge_bioenergy", name: "슬러지 감량·바이오에너지", demandCount: 11, supplierCount: 19, avgBudget: "$65M" },
            { key: "water_resources_flood", name: "수자원관리·홍수가뭄", demandCount: 16, supplierCount: 24, avgBudget: "$38M" }
        ];

        // 권역별 수요 프로젝트 통계
        const regionStats = [
            { region: "sea", name: "동남아시아 (아세안)", count: 32, badge: "최대 수요처", growth: "+24%" },
            { region: "me", name: "중동 / 북아프리카", count: 28, badge: "대형 플랜트 중심", growth: "+31%" },
            { region: "ca", name: "중앙아시아", count: 12, badge: "농업·관개 시급", growth: "+18%" },
            { region: "la", name: "중남미 / 아프리카", count: 15, badge: "기후금융 연계", growth: "+15%" }
        ];

        res.json({
            success: true,
            totalGlobalDemands: 87,
            totalKoreanSuppliers: 132,
            activeMatchSuccessRate: "89.4%",
            fieldStats,
            regionStats,
            recentDemands: GLOBAL_DEMAND_DATABASE,
            sampleSuppliers: SAMPLE_KOREAN_SUPPLIERS
        });
    } catch (err) {
        console.error('Error fetching matching overview:', err);
        res.status(500).json({ success: false, error: '통합 매칭 현황 조회 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
