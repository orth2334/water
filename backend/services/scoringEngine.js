/**
 * Enhanced Diagnosis Scoring Engine & Fast-Track Stage Recommendation Logic
 * Based on Real-World Overseas Project Bidding & Procurement Specs
 */

function calculateDiagnosis(payload) {
    const compName = payload.compName || '(주)한국스마트수자원';
    const compSize = payload.compSize || 'sme';
    const compField = payload.compField || '스마트 상수도 / 정수처리 / 관망';
    
    // Core Parameters
    const targetRegion = payload.targetRegion || 'sea';
    const techForm = payload.techForm || 'skid';
    const certLevel = payload.certLevel || 'net';
    const fundingCap = payload.fundingCap || 'mid';
    
    // Real-World Procurement Diagnosis Parameters
    const pbondCap = payload.pbondCap || 'mid';
    const localNetwork = payload.localNetwork || 'nda';
    const onmCap = payload.onmCap || 'custom';

    const trDomestic = parseInt(payload.trDomestic) || 2;
    const trOverseas = parseInt(payload.trOverseas) || 1;
    const goalPurpose = payload.goalPurpose || 'testbed';
    const legalCap = payload.legalCap || 'mid';

    // 1. Granular Scoring Formulas (0 ~ 100 per dimension)
    
    // Axis 1: Tech & Certification & O&M Score
    let sTRL = (trDomestic === 4 ? 70 : trDomestic === 3 ? 55 : trDomestic === 2 ? 40 : 20);
    
    const certScores = { none: 0, basic: 5, net: 15, pct: 20, global: 25 };
    let sCert = certScores[certLevel] || 15;

    const onmScores = { standard: 0, analysis: 5, custom: 15, remote: 20, full: 25 };
    let sOnm = onmScores[onmCap] || 15;

    let techScore = Math.min(100, sTRL + sCert + sOnm);

    // Axis 2: Overseas Track Record & Local Network Score
    let sOverseas = (trOverseas === 4 ? 60 : trOverseas === 3 ? 45 : trOverseas === 2 ? 30 : 15);
    
    const networkScores = { none: 0, contact: 10, nda: 20, mou: 30, vendor: 40 };
    let sNetwork = networkScores[localNetwork] || 20;

    let trackScore = Math.min(100, sOverseas + sNetwork);

    // Axis 3: Funding & Overseas Guarantee (P-Bond / L/C) Capacity Score
    const fundScores = { vlow: 10, low: 25, mid: 40, high: 45, vhigh: 50 };
    let sFund = fundScores[fundingCap] || 40;

    const pbondScores = { vlow: 10, low: 20, mid: 35, high: 45, vhigh: 50 };
    let sPbond = pbondScores[pbondCap] || 35;

    let fundScore = Math.min(100, sFund + sPbond);

    // Axis 4: Legal & Administrative Capacity Score
    const legalScores = { vlow: 20, low: 40, mid: 65, high: 85, vhigh: 100 };
    let legalScore = legalScores[legalCap] || 65;

    // Weighted Overall Score
    let totalScore = Math.round((techScore * 0.3) + (trackScore * 0.3) + (fundScore * 0.2) + (legalScore * 0.2));

    // Region Name Mapping
    const regionNames = {
        sea: "동남아시아 (베트남, 인도네시아, 필리핀 등)",
        me: "중동 / 북아프리카 (사우디, UAE, 카타르 등)",
        ca: "중앙아시아 (우즈베키스탄, 카자흐스탄 등)",
        la: "중남미 개도국 (브라질, 멕시코, 칠레 등)",
        sa: "서아시아 / 남아시아 (인도, 방글라데시 등)",
        global: "선진국 (미국, 유럽, 일본, 호주)"
    };
    const targetRegionName = regionNames[targetRegion] || "동남아시아 (아세안)";

    // Tech Form Name Mapping
    const techFormNames = {
        skid: "모듈형 / 스키드 / 컨테이너 패키지",
        sw: "S/W / AI 스마트 수관리 솔루션",
        component: "수처리 기자재 / 멤브레인 / 약품 단품",
        plant: "대형 토목 / 종합 공정 플랜트 (EPC)"
    };
    const techFormName = techFormNames[techForm] || "모듈형 / 스키드 패키지";

    // 2. Stage Determination & 8-Program Package Recommendation
    let stageNum = 1;
    let stageTitle = "";
    let recommendedPackage = [];
    let roadmapSteps = [];

    if (trOverseas === 1 && trDomestic <= 2) {
        stageNum = 1;
        stageTitle = "Stage 1: 기반 구축 & 기획 단계";
        recommendedPackage = [3, 2, 6]; // MP, FS, Consulting
        roadmapSteps = [
            { step: "1단계", title: `${targetRegionName} 국가 환경 마스터플랜(M/P) 참여`, desc: `${targetRegionName} 타깃 권역의 국가 상하수도기본계획 수립 시 ${techFormName} 기술 스펙을 사전 반영합니다.` },
            { step: "2단계", title: "해외 환경프로젝트 타당성 조사(F/S) 수행", desc: "국비 보조(2~4억원)를 지원받아 현지 인프라 발주 스펙에 당사 기술 사양을 선점합니다." },
            { step: "3단계", title: "해외진출 1:1 전문컨설팅 및 파트너 매칭", desc: "현지 파트너 네트워크 구축 및 발주처 결정권자 초청, 합작법인(JV) 인허가 자문을 받습니다." }
        ];
    } else if (trOverseas <= 2 && trDomestic >= 2) {
        stageNum = 2;
        stageTitle = "Stage 2: 현지 실증 & 트랙레코드 확보 단계";
        recommendedPackage = [5, 1, 6]; // Test-bed, Buyer Inbound, Consulting
        roadmapSteps = [
            { step: "1단계", title: `${targetRegionName} 현지실증(Test-bed) 시범 구축`, desc: `국비(최대 3~5억원) 지원을 받아 ${targetRegionName} 현지 시설에 ${techFormName} 장비를 설치하고 공식 수질 검증서를 취득합니다.` },
            { step: "2단계", title: "해외 바이어/발주처 초청 상담회 연계", desc: "실증 운용 중인 현장과 국내 본사에 발주처 결정권자를 초청해 1:1 기술 설명회를 거행합니다." },
            { step: "3단계", title: "현지 법률/특허 및 P-Bond 금융보증 자문", desc: "현지 파트너십 구축, 해외 이행보증(P-Bond) 발급 기관 연계 및 1:1 변호사/관세사 자문을 진행합니다." }
        ];
    } else if (goalPurpose === 'mdb_odb' || compSize === 'mid' || compSize === 'large' || fundingCap === 'high') {
        stageNum = 3;
        stageTitle = "Stage 3: 대형 프로젝트 & 재원 연계 단계";
        recommendedPackage = [4, 7, 1]; // MDB, GCF, Buyer Inbound
        roadmapSteps = [
            { step: "1단계", title: `MDB / GCF ${targetRegionName} 프로젝트 제안서 작성`, desc: "세계은행, ADB 또는 GCF 기후재원 연계를 위한 영문 제안서(RFP/CN) 구조화를 이행합니다." },
            { step: "2단계", title: "MDB 벤더 등록 및 숏리스트(Shortlist) 진입", desc: "MDB 프로젝트 매니저 및 수원국 주관 부처 고위급 인사와의 네트워킹을 추진합니다." },
            { step: "3단계", title: "본 입찰 수주 및 해외 P-Bond 금융보증 연계", desc: "수주 지원단을 활용해 현지 발주처 고위급 회담을 개최하고 이행보증(P-Bond)을 발급하여 최종 수주를 확정합니다." }
        ];
    } else {
        stageNum = 4;
        stageTitle = "Stage 4: 계약 체결 & 현지 안착 단계";
        recommendedPackage = [1, 6, 8]; // Buyer, Consulting, Overseas Hub
        roadmapSteps = [
            { step: "1단계", title: "1:1 해외 바이어/발주처 초청 상담회", desc: "계약 임박 발주처 인사를 초청하여 MOU 및 본 계약 체결식을 거행합니다." },
            { step: "2단계", title: "해외진출 전문 컨설팅 (법률/세무/O&M)", desc: "현지 법인 설립, 합작투자(JV) 계약서 검토, 현지 O&M 인력 교육 및 A/S 체계를 구축합니다." },
            { step: "3단계", title: `${targetRegionName} 거점 사무소 밀착 사후 관리`, desc: "현지 거점 사무소를 활용해 추가 발주 정보를 지속 트래킹하고 수주를 확대합니다." }
        ];
    }

    const timestamp = new Date().toLocaleDateString('ko-KR');

    return {
        compName, compField, compSize, targetRegion, targetRegionName,
        techForm, techFormName, certLevel, fundingCap,
        pbondCap, localNetwork, onmCap,
        stageNum, stageTitle,
        techScore, trackScore, fundScore, legalScore, totalScore,
        recommendedPackage, roadmapSteps, timestamp
    };
}

module.exports = { calculateDiagnosis };
