/**
 * Demand Assessment & Two-Way (Buyer ↔ Supplier) Matching Engine
 */

const { GLOBAL_DEMAND_DATABASE, DEMAND_CATEGORIES } = require('../data/globalDemandData');
const { PROGRAM_DATABASE } = require('../data/programsData');

/**
 * 1. 해외 발주처 수요 지수 산출 (Demand Assessment Scoring)
 */
function calculateDemandScore(payload) {
    const country = payload.country || '동남아 신흥국';
    const clientOrg = payload.clientOrg || '국가 수자원청';
    const field = payload.field || 'smart_water_grid';
    const region = payload.region || 'sea';
    const urgency = payload.urgency || 'high';
    const procurementType = payload.procurementType || 'epc_turnkey';
    const financingType = payload.financingType || 'oda_edcf';
    const budgetScaleNum = Number(payload.budgetUSD) || 30; // 단위: 백만 달러 (USD Million)
    const capacity = payload.targetCapacity || '30,000 m³/day';

    // 1-1. 긴급도 및 정책 우선순위 지수 (Urgency & Priority: 0~100)
    let urgencyScore = urgency === 'high' ? 95 : (urgency === 'medium' ? 75 : 55);
    if (['sea', 'me', 'ca'].includes(region)) urgencyScore += 5; // 중점 협력 권역 가점
    urgencyScore = Math.min(100, urgencyScore);

    // 1-2. 재원 조달 타당성 지수 (Financing Viability: 0~100)
    let financingScore = 70;
    if (financingType === 'oda_edcf') financingScore = 90; // 공적 원조 연계 확실성
    else if (financingType === 'mdb_loan') financingScore = 85;
    else if (financingType === 'gcf_climate') financingScore = 80;
    else if (financingType === 'commercial') financingScore = 75;

    // 1-3. 기술 도입 준비도 (Procurement Readiness: 0~100)
    let readinessScore = 75;
    if (procurementType === 'epc_turnkey') readinessScore = 88;
    else if (procurementType === 'equipment_export') readinessScore = 92;
    else if (procurementType === 'joint_venture') readinessScore = 70;

    // 1-4. 종합 수요 지수 (Overall Demand Attractiveness Index)
    const overallDemandScore = Math.round((urgencyScore * 0.35) + (financingScore * 0.35) + (readinessScore * 0.30));

    // 매칭 추천 한국 기술 키워드 및 진출 전략
    const recommendedKoreanTech = {
        smart_water_grid: "AI 관망 유수율 제어 및 초저전력 스마트 미터링(AMI) 패키지",
        desalination: "태양광 하이브리드 고효율 SWRO 해수담수화 및 모듈형 담수 플랜트",
        industrial_wastewater: "MVR 고효율 증발농축 및 중금속/유가물질 자원화 ZLD 시스템",
        sludge_bioenergy: "혐기성 소화조 가용화 THP 및 바이오메탄 RNG 정제 에너지화",
        water_resources_flood: "위성·레이더 연계 광역 SCADA 원격 수문 자동화 및 조기경보망",
        membrane_filtration: "고내구성 세라믹/PVDF 한외여과(UF) 및 나노복합 역삼투(RO) 막",
        micro_pollutants: "AOP 고도산화 및 미세플라스틱/잔류의약물질 고효율 흡착 분해"
    }[field] || "한국형 고도 선진 수처리 솔루션";

    return {
        country,
        clientOrg,
        field,
        region,
        urgency,
        procurementType,
        financingType,
        targetCapacity: capacity,
        budgetScale: `$${budgetScaleNum}M USD (한화 약 ${(budgetScaleNum * 13.5).toFixed(0)}억 원)`,
        scores: {
            overall: overallDemandScore,
            urgency: urgencyScore,
            financing: financingScore,
            readiness: readinessScore
        },
        recommendedKoreanTech,
        grade: overallDemandScore >= 85 ? 'AAA (최우선 지원 프로젝트)' : (overallDemandScore >= 75 ? 'AA (유망 수주 프로젝트)' : 'A (중점 모니터링 프로젝트)'),
        koreaFastTrackSupport: financingType === 'oda_edcf' 
            ? "KEITI F/S 지원사업(최대 12억 원) 및 EDCF 타당성 연계 지원 최우선 추천" 
            : "수출바우처 및 현지화 실증(PoC) 패키지 지원 추천"
    };
}

/**
 * 2. 공급자 ↔ 수요자 단일 매칭 적합도(Match Score) 계산
 */
function calculateSingleMatch(supplier, demand) {
    // supplier: { compField, targetRegion, compBizModel, compFinancing, compCert, compTrack, compName, ... }
    // demand: { field, region, procurementType, financingType, preferredSupplierCerts, id, title, country, ... }

    let techMatch = 0;       // max 35
    let regionMatch = 0;     // max 20
    let bizModelMatch = 0;   // max 20
    let financingMatch = 0;  // max 15
    let certMatch = 0;       // max 10

    const highlights = [];
    const gaps = [];

    // 1) 기술 분야 적합도 (35점)
    if (supplier.compField === demand.field) {
        techMatch = 35;
        highlights.push(`핵심 기술 분야 완전 일치 (${demand.fieldName || demand.field})`);
    } else if (
        (supplier.compField === 'smart_water_grid' && demand.field === 'water_resources_flood') ||
        (supplier.compField === 'membrane_filtration' && demand.field === 'desalination') ||
        (supplier.compField === 'industrial_wastewater' && demand.field === 'sludge_bioenergy')
    ) {
        techMatch = 25;
        highlights.push(`연관 유관 기술 분야 시너지 적용 가능`);
    } else {
        techMatch = 10;
        gaps.push(`주력 기술 분야 상이 (추가 컨소시엄 구성 권장)`);
    }

    // 2) 권역/국가 적합도 (20점)
    if (supplier.targetRegion === demand.region || supplier.targetRegion === 'global') {
        regionMatch = 20;
        highlights.push(`타깃 진출 권역 정확 일치 (${demand.regionName || demand.country})`);
    } else {
        regionMatch = 8;
        gaps.push(`희망 진출 권역과 대상 국가 차이 존재`);
    }

    // 3) 사업/조달 모델 적합도 (20점)
    if (supplier.compBizModel === demand.procurementType || supplier.compEpc === demand.procurementType) {
        bizModelMatch = 20;
        highlights.push(`선호 발주/조달 방식 일치 (${demand.procurementTypeName || demand.procurementType})`);
    } else if (
        (supplier.compBizModel === 'joint_venture' && demand.procurementType === 'epc_turnkey') ||
        (supplier.compBizModel === 'equipment_export' && demand.procurementType === 'epc_turnkey')
    ) {
        bizModelMatch = 15;
        highlights.push(`기자재 공급 및 협력 형태 참여 가능`);
    } else {
        bizModelMatch = 10;
        gaps.push(`조달 모델(EPC vs 단순 납품) 조율 필요`);
    }

    // 4) 재원/파이낸싱 적합도 (15점)
    if (supplier.compFinancing === demand.financingType) {
        financingMatch = 15;
        highlights.push(`선호 재원 조달 모델 일치 (${demand.financingTypeName || demand.financingType})`);
    } else {
        financingMatch = 10;
    }

    // 5) 인증 및 IP 충족도 (10점)
    const requiredCerts = demand.preferredSupplierCerts || ['pct', 'global_cert'];
    if (requiredCerts.includes(supplier.compCert)) {
        certMatch = 10;
        highlights.push(`발주처 요구 특허/인증 사양 충족 (${supplier.compCert.toUpperCase()})`);
    } else if (supplier.compCert && supplier.compCert !== 'none') {
        certMatch = 6;
    } else {
        certMatch = 2;
        gaps.push(`해외 특허/국제 인증 보강 필요`);
    }

    const totalMatchScore = techMatch + regionMatch + bizModelMatch + financingMatch + certMatch;

    // 추천 지원 프로그램 (정부 8대 사업 중)
    let recommendedProgram = "1. 해외 바이어 초청 상담회 (GGHK)";
    if (totalMatchScore >= 80 && demand.financingType === 'oda_edcf') {
        recommendedProgram = "2. 해외 환경프로젝트 타당성 조사 (F/S) & 8. 녹색전환 상생협력";
    } else if (totalMatchScore >= 70 && supplier.compTrack === 'domestic_multi') {
        recommendedProgram = "3. 현지실증(PoC) 및 사업화 지원";
    } else if (gaps.length > 1) {
        recommendedProgram = "6. 수출 컨설팅 및 해외 규격인증 획득 지원";
    }

    return {
        demandId: demand.id,
        demandTitle: demand.title,
        country: demand.country,
        region: demand.region,
        field: demand.field,
        fieldName: demand.fieldName,
        budgetScale: demand.budgetScale,
        clientOrg: demand.clientOrg,
        status: demand.status,
        matchScore: totalMatchScore,
        matchGrade: totalMatchScore >= 85 ? '매우 높음 (Best Match)' : (totalMatchScore >= 70 ? '높음 (High Match)' : '보통 (Moderate Match)'),
        scoreBreakdown: {
            tech: techMatch,
            region: regionMatch,
            bizModel: bizModelMatch,
            financing: financingMatch,
            cert: certMatch
        },
        highlights,
        gaps,
        recommendedProgram,
        demandObj: demand
    };
}

/**
 * 3. 특정 공급기업 기준 글로벌 수요 매칭 랭킹 산출
 */
function evaluateSupplierMatches(supplierProfile) {
    const matches = GLOBAL_DEMAND_DATABASE.map(demand => {
        return calculateSingleMatch(supplierProfile, demand);
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches;
}

/**
 * 4. 특정 수요 프로젝트 기준 샘플 한국 공급기업 풀 매칭 랭킹 산출
 */
const SAMPLE_KOREAN_SUPPLIERS = [
    {
        id: "SUP-001",
        compName: "(주)K-스마트수자원엔지니어링",
        compSize: "mid",
        compField: "smart_water_grid",
        compCert: "pct",
        compTrack: "overseas_multi",
        compEpc: "epc_turnkey",
        compBizModel: "epc_turnkey",
        compFinancing: "oda_edcf",
        targetRegion: "sea",
        compFund: "fund_100m",
        techSummary: "AI 기반 실시간 누수 감지율 92% 이상 달성 스마트 관망 통합 관제 솔루션"
    },
    {
        id: "SUP-002",
        compName: "(주)블루워터 하이테크",
        compSize: "sme",
        compField: "desalination",
        compCert: "global_cert",
        compTrack: "overseas_single",
        compEpc: "equipment_mfg",
        compBizModel: "equipment_export",
        compFinancing: "commercial",
        targetRegion: "sea",
        compFund: "fund_50m",
        techSummary: "태양광 독립전원 연계 저전력 SWRO 모듈형 해수담수화 패키지"
    },
    {
        id: "SUP-003",
        compName: "(주)에코에너지그린테크",
        compSize: "mid",
        compField: "industrial_wastewater",
        compCert: "pct",
        compTrack: "overseas_multi",
        compEpc: "epc_turnkey",
        compBizModel: "joint_venture",
        compFinancing: "commercial",
        targetRegion: "me",
        compFund: "fund_100m",
        techSummary: "고염도 폐수 완전 무방류(ZLD) 및 희소 리튬/마그네슘 자원회수 특허 공정"
    },
    {
        id: "SUP-004",
        compName: "(주)한양수자원센싱",
        compSize: "sme",
        compField: "water_resources_flood",
        compCert: "net_nep",
        compTrack: "domestic_multi",
        compEpc: "consulting_design",
        compBizModel: "epc_turnkey",
        compFinancing: "mdb_loan",
        targetRegion: "ca",
        compFund: "fund_50m",
        techSummary: "광역 SCADA 연계 초음파 수위계 및 태양광 원격 수문 자동화 시스템"
    },
    {
        id: "SUP-005",
        compName: "(주)바이오엔바이로",
        compSize: "sme",
        compField: "sludge_bioenergy",
        compCert: "pct",
        compTrack: "domestic_multi",
        compEpc: "onm_service",
        compBizModel: "licensing_onm",
        compFinancing: "gcf_climate",
        targetRegion: "la",
        compFund: "fund_20m",
        techSummary: "열가수분해(THP) 전처리 기반 슬러지 감량 60% 및 바이오메탄 고질화 기술"
    }
];

function evaluateDemandMatches(demandProfile) {
    const matches = SAMPLE_KOREAN_SUPPLIERS.map(supplier => {
        const matchResult = calculateSingleMatch(supplier, demandProfile);
        return {
            ...matchResult,
            supplierId: supplier.id,
            compName: supplier.compName,
            compSize: supplier.compSize,
            techSummary: supplier.techSummary
        };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches;
}

module.exports = {
    calculateDemandScore,
    calculateSingleMatch,
    evaluateSupplierMatches,
    evaluateDemandMatches,
    SAMPLE_KOREAN_SUPPLIERS
};
