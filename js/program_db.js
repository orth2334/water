/**
 * K-Green & Water 해외진출 8대 지원프로그램 마스터 데이터베이스
 */
const PROGRAM_DATABASE = [
    {
        id: 1,
        title: "1. 해외 바이어 초청 상담회",
        tag: "해외바이어 초청",
        icon: "fa-handshake",
        badge: "수주/계약 단계",
        agency: "환경부 / KEITI",
        budget: "초청 항공료(100%), 숙박비, 통역, 1:1 상담장 임차료 지원",
        fit: "해외 바이어와 사전 협의 중이거나 수주 계약 체결 직전 단계 기업",
        desc: "해외 정부·공공기관·발주처의 핵심 결정권자를 한국으로 직접 초청하여 1:1 비즈니스 상담 및 국내 선진 수처리/환경 시설 현장 견학을 밀착 지원합니다.",
        documents: ["기업 소개서(영문)", "바이어 인적사항 및 초청 사유서", "사전 협의 증빙자료(메일, MOU 등)"],
        stageMatch: [1, 2, 3, 4]
    },
    {
        id: 2,
        title: "2. 해외 환경프로젝트 타당성 조사 (F/S)",
        tag: "타당성 조사(F/S)",
        icon: "fa-magnifying-glass-chart",
        badge: "사업 기획 단계",
        agency: "환경부 / KEITI",
        budget: "프로젝트 타당성 조사 용역비 국비 보조 (최대 2~4억원 내외)",
        fit: "해외 정부/발주처의 사업 추진 의향서를 확보하고 입찰 스펙을 선점하려는 기업",
        desc: "해외 인프라 수주 전 기술적·경제적·환경적 타당성 조사를 지원하여 국내 기술 사양(Spec)이 본 입찰에 반영되도록 사전에 시장을 기획 선점합니다.",
        documents: ["발주처 사업의향서(LOI/MOU)", "F/S 수행계획서 및 예산내역서", "기술 설명서"],
        stageMatch: [1]
    },
    {
        id: 3,
        title: "3. 개도국 환경개선 마스터플랜 (M/P)",
        tag: "마스터플랜(M/P)",
        icon: "fa-map-location-dot",
        badge: "시장 선점 단계",
        agency: "환경부 / K-water",
        budget: "개도국 상하수도/환경 종합 기본계획 수립비 전액 국비 지원",
        fit: "개도국 중앙정부 및 공수도공사와 장기적인 협력 관계를 구축하고자 하는 엔지니어링 기업/컨소시엄",
        desc: "개도국 정부의 국가 단위 환경/수자원 종합 종합계획 수립을 국비 지원하여, 한국 수처리 기술 표준 및 법 제도를 해당 국가에 직접 이식합니다.",
        documents: ["수원국 정부 요청서(Official Request)", "M/P 수립 제안서", "컨소시엄 구성 협약서"],
        stageMatch: [1]
    },
    {
        id: 4,
        title: "4. MDB 환경 프로젝트 수주 지원",
        tag: "다자개발은행(MDB)",
        icon: "fa-building-columns",
        badge: "대형 입찰 참여",
        agency: "기획재정부 / KEITI",
        budget: "MDB 입찰 제안서(RFP) 작성 자문비, 벤더 등록 및 회담 네트워킹비",
        fit: "세계은행(WB), ADB, AfDB 등 대형 국제기구 발주 사업 입찰 자격을 갖춘 중견/대기업 및 전문 엔지니어링사",
        desc: "MDB 자금 프로젝트의 숏리스트(Shortlist) 진입을 위해 영문 제안서 작성, 벤더 등록, MDB 프로젝트 매니저(PM) 1:1 회담 및 협상을 지원합니다.",
        documents: ["MDB 벤더 등록증", "해외 사업 실적 증명서", "영문 제안서 초안"],
        stageMatch: [3]
    },
    {
        id: 5,
        title: "5. 녹색기술 해외 현지실증 (Test-bed)",
        tag: "현지 실증검증",
        icon: "fa-vial-circle-check",
        badge: "기술 검증 단계",
        agency: "환경부 / KEITI / K-water",
        budget: "시범장비(Pilot Plant) 제작·운송·설치비 및 현지 수질 성능검증비 (최대 3~5억원 지원)",
        fit: "국내 성능은 검증되었으나, 해외 현지 수질/기후 조건에서의 트랙레코드(Track Record)가 필요한 기업",
        desc: "해외 현지 정수장·하수처리장·수원지에 시범 실증 장비를 직접 설치하고 6~12개월간 운용하여 해당국 정부 공인 성능 검증서를 취득하도록 지원합니다.",
        documents: ["현지 부지 제공 동의서(Host Plant Agreement)", "Pilot Plant 설계서", "성능 검증 계획서"],
        stageMatch: [1, 2]
    },
    {
        id: 6,
        title: "6. 환경기업 해외진출 전문컨설팅",
        tag: "1:1 전문자문",
        icon: "fa-scale-balanced",
        badge: "진출장벽 해소",
        agency: "KEITI / 무역협회",
        budget: "전문가(국제변호사, 회계사, 관세사) 1:1 멘토링 자문료 전액 지원",
        fit: "해외 합작법인(JV) 설립, 현지 법률 규제, 국제 특허 출원, 관세/인허가 애로사항을 겪는 기업",
        desc: "해외 진출 과정에서 발생하는 복잡한 현지 인허가, 관세, 특허, 계약서 독소조항 검토 등을 글로벌 전문 컨설턴트가 1:1 밀착 매칭하여 해결합니다.",
        documents: ["컨설팅 신청서 및 기업 애로사항 기술서", "사업자등록증"],
        stageMatch: [1, 2, 4]
    },
    {
        id: 7,
        title: "7. GCF 사업개발 및 개도국 지원",
        tag: "기후재원 연계",
        icon: "fa-seedling",
        badge: "기후재원 연계",
        agency: "환경부 / GCF 이행기구",
        budget: "GCF 사업개념서(CN) 및 사업승인제안서(SAP) 작성 자문비",
        fit: "기후변화 대응(감축/적응), 스마트 물관리, 탄소포집 등 대규모 기후재원 연계가 가능한 기술 보유 기업",
        desc: "UN 녹색기후기금(GCF) 재원을 활용할 수 있도록 사업개념서(CN) 작성, 이행기구(AE) 연계, 수원국 정부 승인서(NOL) 확보 전과정을 지원합니다.",
        documents: ["GCF 사업 개념요약서", "수원국 기후 적응 논리 근거자료", "AE 연계 의향서"],
        stageMatch: [3]
    },
    {
        id: 8,
        title: "8. 해외사무소 운영 (글로벌 거점)",
        tag: "글로벌 해외거점",
        icon: "fa-earth-americas",
        badge: "상시 밀착 지원",
        agency: "KEITI / KOTRA",
        budget: "현지 거점 사무실 입주, 미팅 룸 지원, 현지 발주 정보 및 헬프데스크 지원",
        fit: "동남아, 중동, 중앙아시아 등 거점 국가에 상시 비즈니스 창구를 개설하고 현지 네트워크를 유지하려는 기업",
        desc: "베트남, 인도네시아, 유네스코 물안보센터 등 해외 주요 거점 사무소를 통해 현지 발주 정보를 실시간 수집하고 바이어 미팅 공간을 제공합니다.",
        documents: ["해외 거점 활용 신청서", "현지 사업 계획서"],
        stageMatch: [4]
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PROGRAM_DATABASE };
}
