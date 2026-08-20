/**
 * Enhanced 14-Parameter Diagnosis Scoring Engine & Fast-Track Stage Recommendation Logic
 * Based on 2026 KEITI / K-water Evaluation Criteria & Global Procurement Specs
 */

function calculateDiagnosis(payload) {
    const compName = payload.compName || '(주)한국스마트수자원';
    const compSize = payload.compSize || 'sme';
    const compField = payload.compField || 'smart_water_grid';
    const compCert = payload.compCert || 'pct';
    const compTrack = payload.compTrack || 'overseas_single';
    const compEpc = payload.compEpc || 'epc_turnkey';
    const compManpower = payload.compManpower || 'team_fluent';
    const compFund = payload.compFund || 'fund_100m';
    const targetRegion = payload.targetRegion || 'sea';
    const compBizModel = payload.compBizModel || 'equipment_export';
    const compFinancing = payload.compFinancing || 'commercial';
    const compTestbed = payload.compTestbed || 'testbed_needed';
    const compTimeline = payload.compTimeline || 'immediate';
    const goalPurpose = payload.goalPurpose || 'testbed';
    const compBonus = payload.compBonus || 'excellent_env';

    // 1. Granular 4-Axis Scoring (0 ~ 100 per axis)

    // Axis 1: 기술 및 인증 경쟁력 (Tech & Certification Score)
    const certScores = { pct: 40, global_cert: 35, net_nep: 30, domestic_pat: 20, none: 10 };
    const testbedTechScores = { commercial_ready: 40, supply_chain: 30, testbed_needed: 25 };
    const fieldTechBonus = 20; // 12대 전략 녹색·물기술 기본 가점
    let techScore = Math.min(100, (certScores[compCert] || 25) + (testbedTechScores[compTestbed] || 25) + fieldTechBonus);

    // Axis 2: 사업 실적 및 현지 파트너십 (Track Record & Network Score)
    const trackScores = { overseas_multi: 45, overseas_single: 35, domestic_multi: 25, domestic_single: 15 };
    const bonusScores = { loi_secured: 35, excellent_env: 30, trading_partner: 25, general: 15 };
    const bizModelScores = { joint_venture: 20, epc_turnkey: 20, licensing_onm: 15, equipment_export: 15 };
    let trackScore = Math.min(100, (trackScores[compTrack] || 25) + (bonusScores[compBonus] || 20) + (bizModelScores[compBizModel] || 15));

    // Axis 3: 재무 안정성 및 자부담 여력 (Finance & Resources Score)
    const fundScores = { fund_100m: 45, fund_50m: 35, fund_20m: 25, fund_zero: 15 };
    const sizeScores = { large: 35, mid: 30, sme: 25, small: 15 };
    const timelineScores = { immediate: 20, short: 15, mid_long: 10 };
    let fundScore = Math.min(100, (fundScores[compFund] || 30) + (sizeScores[compSize] || 25) + (timelineScores[compTimeline] || 15));

    // Axis 4: 글로벌 수행 및 엔지니어링 역량 (Global Execution & EPC Score)
    const manpowerScores = { team_fluent: 40, staff_basic: 30, lang_only: 20, none: 10 };
    const epcScores = { epc_turnkey: 35, onm_service: 30, equipment_mfg: 25, consulting_design: 25 };
    const financingScores = { mdb_loan: 25, gcf_climate: 25, oda_edcf: 20, commercial: 20 };
    let legalScore = Math.min(100, (manpowerScores[compManpower] || 25) + (epcScores[compEpc] || 25) + (financingScores[compFinancing] || 20));

    // Weighted Overall Score
    let totalScore = Math.round((techScore * 0.3) + (trackScore * 0.3) + (fundScore * 0.2) + (legalScore * 0.2));

    // Region & Name Mapping
    const regionNames = {
        sea: "동남아시아 (베트남, 인도네시아, 필리핀 등)",
        me: "중동 / 북아프리카 (사우디, UAE, 카타르 등)",
        ca: "중앙아시아 (우즈베키스탄, 카자흐스탄 등)",
        la: "중남미 / 아프리카 (가나, 르완다, 콜롬비아 등)",
        sa: "서남아시아 (인도, 방글라데시, 스리랑카 등)",
        global: "선진 시장 (미국, 유럽, 일본, 호주 등)"
    };
    const targetRegionName = regionNames[targetRegion] || "동남아시아 (아세안)";

    // 2. Stage Determination & Tailored 8-Program Package Recommendation
    let stageNum = 1;
    let stageTitle = "";
    let recommendedPackage = [];
    let roadmapSteps = [];

    if (compTrack === 'domestic_single' || (compTrack === 'domestic_multi' && compTestbed === 'testbed_needed' && compManpower === 'none')) {
        stageNum = 1;
        stageTitle = "Stage 1: 기반 구축 & 기획 단계";
        recommendedPackage = [3, 2, 6]; // MP, FS, Consulting
        roadmapSteps = [
            { step: "1단계", title: `${targetRegionName} ODA 마스터플랜(M/P) 참여`, desc: `${targetRegionName} 국가 상하수도 기본계획 수립에 참여하여 기술 사양 및 한국형 표준을 사전에 반영합니다.` },
            { step: "2단계", title: "해외 환경프로젝트 타당성조사(F/S) 수행", desc: "국비 보조(예비 최대 2억, 본 최대 12억)를 지원받아 현지 발주 스펙에 당사 기술을 선점합니다." },
            { step: "3단계", title: "1:1 해외진출 전문컨설팅 및 법률 자문", desc: "18개 전담 자문기관을 통해 영문 계약서 독소조항 검토, 국제특허 출원 및 현지 인허가 자문을 전액 국비로 지원받습니다." }
        ];
    } else if (compTestbed === 'testbed_needed' || compTrack === 'overseas_single' || compTrack === 'domestic_multi') {
        stageNum = 2;
        stageTitle = "Stage 2: 현지 실증 & 트랙레코드 확보 단계";
        recommendedPackage = [5, 1, 6]; // Test-bed, Buyer, Consulting
        roadmapSteps = [
            { step: "1단계", title: `${targetRegionName} 녹색기술 현지실증(Test-bed) 시범 구축`, desc: `국비 최대 4.5억 원(최대 2년)을 지원받아 ${targetRegionName} 현지 시설에 파일럿 플랜트를 설치하고 공인 성능검증서를 획득합니다.` },
            { step: "2단계", title: "해외 바이어 초청 상담회(GGHK) 연계", desc: "실증 운용 중인 현장과 국내 본사에 발주처 결정권자를 초청(항공료 100% 지원)하여 1:1 비즈니스 상담을 진행합니다." },
            { step: "3단계", title: "글로벌 공급망 진출 및 통관·특허 밀착 지원", desc: "녹색무역상사 매칭 및 FTA/RCEP 원산지 증명, 국제특허(PCT) 자문으로 수출 판로를 신속히 개척합니다." }
        ];
    } else if (compFinancing === 'mdb_loan' || compFinancing === 'gcf_climate' || goalPurpose === 'mdb' || goalPurpose === 'gcf' || compSize === 'mid' || compSize === 'large') {
        stageNum = 3;
        stageTitle = "Stage 3: 대형 프로젝트 & 재원 연계 단계";
        recommendedPackage = [4, 7, 1]; // MDB, GCF, Buyer
        roadmapSteps = [
            { step: "1단계", title: `MDB / GCF ${targetRegionName} 프로젝트 기술지원(TA) 참여`, desc: "세계은행(WB), ADB, AfDB 기술지원 사업(건당 3.2~3.7억)을 수주하여 MDB 숏리스트(Shortlist)에 진입합니다." },
            { step: "2단계", title: "MDB Task Team Leader(TTL) 및 발주처 1:1 회담", desc: "MDB 프로젝트 매니저 및 수원국 고위급 결정권자와의 1:1 회담 및 초청 워크숍을 통해 입찰 경쟁력을 선점합니다." },
            { step: "3단계", title: "기후재원(GCF) 사업제안서(SAP/FP) 연계 및 본 입찰 수주", desc: "국제 인증기구(AE) 및 수원국 정부 승인서(NOL)를 확보하여 대규모 다자개발 프로젝트를 최종 수주합니다." }
        ];
    } else {
        stageNum = 4;
        stageTitle = "Stage 4: 계약 체결 & 현지 안착 단계";
        recommendedPackage = [1, 6, 8]; // Buyer, Consulting, Overseas Hub
        roadmapSteps = [
            { step: "1단계", title: "1:1 해외 바이어/발주처 초청 상담회(GGHK)", desc: "수주 계약 직전 단계의 해외 핵심 결정권자를 국내로 초청하여 최종 공급/공사 계약 체결식을 거행합니다." },
            { step: "2단계", title: "해외진출 1:1 전문컨설팅 (법인설립 / O&M 체계)", desc: "현지 합작법인(JV) 설립, 관세·환급 최적화 및 현지 O&M 엔지니어 교육 체계를 구축합니다." },
            { step: "3단계", title: `${targetRegionName} 5개국 해외사무소 상시 비즈니스 거점 활용`, desc: "베트남, 인도네시아 등 해외 거점 사무소의 미팅룸과 실시간 발주 정보를 활용해 추가 수주를 지속 확장합니다." }
        ];
    }

    const timestamp = new Date().toLocaleDateString('ko-KR');

    return {
        compName, compSize, compField, compCert, compTrack, compEpc, compManpower, compFund,
        targetRegion, targetRegionName, compBizModel, compFinancing, compTestbed, compTimeline, goalPurpose, compBonus,
        stageNum, stageTitle,
        techScore, trackScore, fundScore, legalScore, totalScore,
        recommendedPackage, roadmapSteps, timestamp
    };
}

module.exports = { calculateDiagnosis };

