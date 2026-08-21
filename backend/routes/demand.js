const express = require('express');
const router = express.Router();
const { GLOBAL_DEMAND_DATABASE, DEMAND_CATEGORIES } = require('../data/globalDemandData');
const { calculateDemandScore, evaluateDemandMatches } = require('../services/demandScoringEngine');

// In-memory array for added demands
let currentDemands = [...GLOBAL_DEMAND_DATABASE];
let demandHistoryList = [];

/**
 * GET /api/demand/history
 * 수요 진단 이력 목록 조회
 */
router.get('/history', (req, res) => {
    res.json({
        success: true,
        data: demandHistoryList
    });
});

/**
 * POST /api/demand/history
 * 수요 진단 이력 저장
 */
router.post('/history', (req, res) => {
    try {
        const item = req.body;
        const historyEntry = {
            id: `DHIST-${Date.now()}`,
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
            ...item
        };
        demandHistoryList.unshift(historyEntry);
        if (demandHistoryList.length > 50) demandHistoryList.pop();

        res.json({
            success: true,
            entry: historyEntry
        });
    } catch (err) {
        console.error('Error saving demand history:', err);
        res.status(500).json({ success: false, error: '수요 이력 저장 중 오류가 발생했습니다.' });
    }
});

/**
 * DELETE /api/demand/history/:id
 * 수요 진단 이력 삭제
 */
router.delete('/history/:id', (req, res) => {
    const id = req.params.id;
    demandHistoryList = demandHistoryList.filter(h => h.id !== id);
    res.json({ success: true, message: '삭제되었습니다.' });
});

/**
 * GET /api/demand/list
 * 글로벌 수요 프로젝트 목록 및 카테고리 반환
 */
router.get('/list', (req, res) => {
    try {
        const { region, field } = req.query;
        let filtered = [...currentDemands];

        if (region && region !== 'all') {
            filtered = filtered.filter(item => item.region === region);
        }
        if (field && field !== 'all') {
            filtered = filtered.filter(item => item.field === field);
        }

        res.json({
            success: true,
            total: filtered.length,
            categories: DEMAND_CATEGORIES,
            demands: filtered
        });
    } catch (err) {
        console.error('Error fetching demands:', err);
        res.status(500).json({ success: false, error: '수요 목록 조회 중 오류가 발생했습니다.' });
    }
});

/**
 * GET /api/demand/:id
 * 특정 수요 프로젝트 상세 조회
 */
router.get('/:id', (req, res) => {
    const demand = currentDemands.find(d => d.id === req.params.id);
    if (!demand) {
        return res.status(404).json({ success: false, error: '해당 수요 프로젝트를 찾을 수 없습니다.' });
    }
    const matchedSuppliers = evaluateDemandMatches(demand);
    res.json({
        success: true,
        demand,
        matchedSuppliers
    });
});

/**
 * POST /api/demand/:id/apply
 * 특정 수요 프로젝트에 한국 기업 참여 지원(EOI/LOI) 접수
 */
router.post('/:id/apply', (req, res) => {
    try {
        const demandId = req.params.id;
        const appData = req.body;
        
        const applicationRecord = {
            applicationId: `APP-${Date.now()}`,
            demandId,
            companyName: appData.companyName || '(주)한국스마트수자원',
            appliedDate: new Date().toISOString(),
            status: '접수 완료 (서류 검토 및 패스트트랙 매칭 중)',
            contactPerson: appData.contactPerson || '해외사업팀장',
            phone: appData.phone || '02-1234-5678',
            email: appData.email || 'global@smartwater.kr'
        };

        res.json({
            success: true,
            message: `[${appData.companyName || '귀사'}]의 [${demandId}] 프로젝트 참여 의향서가 성공적으로 접수되었습니다.`,
            application: applicationRecord
        });
    } catch (err) {
        console.error('Error applying to demand project:', err);
        res.status(500).json({ success: false, error: '프로젝트 지원 신청 중 오류가 발생했습니다.' });
    }
});

/**
 * POST /api/demand/evaluate
 * 해외 발주처 수요 측정 및 분석
 */
router.post('/evaluate', (req, res) => {
    try {
        const payload = req.body;
        const evaluation = calculateDemandScore(payload);
        const matchedSuppliers = evaluateDemandMatches({ ...payload, ...evaluation });

        res.json({
            success: true,
            evaluation,
            matchedSuppliers
        });
    } catch (err) {
        console.error('Error evaluating demand:', err);
        res.status(500).json({ success: false, error: '수요 진단 계산 중 오류가 발생했습니다.' });
    }
});

/**
 * POST /api/demand/create
 * 새 수요 프로젝트 등록
 */
router.post('/create', (req, res) => {
    try {
        const payload = req.body;
        const evaluation = calculateDemandScore(payload);
        
        const newDemand = {
            id: `DEMAND-CUSTOM-${Date.now().toString().slice(-4)}`,
            title: payload.title || `${payload.country || '해외'} ${evaluation.recommendedKoreanTech} 도입 사업`,
            country: payload.country || '해외 국가',
            region: payload.region || 'sea',
            regionName: DEMAND_CATEGORIES.regions.find(r => r.key === payload.region)?.name || '기타 권역',
            clientOrg: payload.clientOrg || '발주처',
            field: payload.field || 'smart_water_grid',
            fieldName: DEMAND_CATEGORIES.fields.find(f => f.key === payload.field)?.name || '스마트 상하수도',
            issueType: payload.issueType || '현지 수자원 인프라 고도화 및 오염 정화',
            targetCapacity: payload.targetCapacity || '10,000 m³/day',
            budgetScale: `$${payload.budgetUSD || 20}M USD (한화 약 ${((Number(payload.budgetUSD) || 20) * 13.5).toFixed(0)}억 원)`,
            procurementType: payload.procurementType || 'epc_turnkey',
            procurementTypeName: DEMAND_CATEGORIES.procurementTypes.find(p => p.key === payload.procurementType)?.name || 'EPC',
            financingType: payload.financingType || 'oda_edcf',
            financingTypeName: DEMAND_CATEGORIES.financingTypes.find(f => f.key === payload.financingType)?.name || 'ODA',
            urgency: payload.urgency || 'high',
            targetTimeline: payload.targetTimeline || '2026-2027년 중',
            reqSpecs: payload.reqSpecs && payload.reqSpecs.length ? payload.reqSpecs : [
                "고효율 친환경 수처리 공법 적용",
                "유지관리(O&M) 자동화 및 원격 모니터링 기능",
                "국제 공인 수질 기준(WHO/ISO) 충족"
            ],
            preferredSupplierCerts: ["pct", "global_cert"],
            status: "수요처 신규 등록",
            description: payload.description || "해외 수요처에서 직접 등록한 맞춤형 물·환경 프로젝트 수요입니다."
        };

        currentDemands.unshift(newDemand);
        const matchedSuppliers = evaluateDemandMatches(newDemand);

        res.json({
            success: true,
            createdDemand: newDemand,
            evaluation,
            matchedSuppliers
        });
    } catch (err) {
        console.error('Error creating demand:', err);
        res.status(500).json({ success: false, error: '수요 등록 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
