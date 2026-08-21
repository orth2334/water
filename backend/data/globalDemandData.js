/**
 * Global Water & Green Infrastructure Demand Master Database (해외 발주처 및 국가별 수요 마스터 DB)
 */

const GLOBAL_DEMAND_DATABASE = [
    {
        id: "DEMAND-2026-001",
        title: "신수도(IKN) 누산타라 스마트 정수망 & AI 누수제어",
        country: "인도네시아",
        region: "sea",
        regionName: "동남아시아",
        clientOrg: "공공사업주택부(PUPR) / 수도청",
        field: "smart_water_grid",
        fieldName: "스마트 상하수도 및 지능형 관망관리",
        issueType: "신규 행정수도 스마트 정수장 및 지능형 AI 유수율 제어망 구축",
        targetCapacity: "100,000 m³/일 (1단계)",
        budgetScale: "약 600억 원 (USD 45M)",
        procurementType: "epc_turnkey",
        procurementTypeName: "EPC 턴키 및 스마트 운영 솔루션",
        financingType: "oda_edcf",
        financingTypeName: "EDCF 차관 + 현지 재정(PPP)",
        urgency: "high",
        targetTimeline: "2026년 하반기 국제입찰 공고",
        reqSpecs: [
            "AI 기반 관망 누수 실시간 감지 및 수압 자동 제어 솔루션",
            "초저전력 스마트 미터링(AMI) 및 IoT 센서 패키지",
            "동남아 고온다습 열대기후 맞춤형 내구성 정수 모듈",
            "현지 운영인력 교육 및 3년간 O&M 기술이전"
        ],
        preferredSupplierCerts: ["pct", "global_cert", "net_nep"],
        status: "입찰 준비(RFP 기획)",
        description: "인도네시아 정부의 신수도 누산타라 1단계 필수 인프라 구축 프로젝트로, 유수율 90% 이상을 유지하기 위한 스마트 관망 제어 기술 및 한국의 선진 정수 처리 시스템 도입을 강력히 희망하고 있습니다."
    },
    {
        id: "DEMAND-2026-002",
        title: "메콩델타 고효율 해수담수화 & 농공용수 공급",
        country: "베트남",
        region: "sea",
        regionName: "동남아시아",
        clientOrg: "벤째성(Ben Tre) 인민위원회",
        field: "desalination",
        fieldName: "해수담수화 및 염분차 발전 / 수자원 확보",
        issueType: "메콩강 유량 감소 대응 분산형 고효율 RO 담수화 설비 공급",
        targetCapacity: "25,000 m³/일 (분산형 5기)",
        budgetScale: "약 370억 원 (USD 28M)",
        procurementType: "equipment_export",
        procurementTypeName: "고효율 RO 막/모듈 패키지 기자재 공급 + 시운전",
        financingType: "commercial",
        financingTypeName: "KOICA ODA 연계 상업구매",
        urgency: "high",
        targetTimeline: "2026년 3분기 시범 실증(PoC)",
        reqSpecs: [
            "에너지 회수율 95% 이상의 고효율 역삼투(SWRO) 막분리 모듈",
            "태양광(PV) 연계 하이브리드 독립 전원 구동 시스템",
            "고농도 부유물질(TSS) 및 조류 사전 전처리 DAF 시스템",
            "원격 모바일 수질 모니터링 및 자동 세정(CIP) 기능"
        ],
        preferredSupplierCerts: ["pct", "global_cert"],
        status: "타당성 조사(F/S) 완료",
        description: "메콩 델타 지역 120만 주민의 식수난 해결과 고부가가치 과수·새우 양식 용수 공급을 위해, 낮은 전력 소모로 운영 가능한 한국형 담수화 모듈 공급사를 긴급 모집 중입니다."
    },
    {
        id: "DEMAND-2026-003",
        title: "네옴(NEOM) 옥사곤 산업폐수 무방류(ZLD) 플랜트",
        country: "사우디아라비아",
        region: "me",
        regionName: "중동·북아프리카",
        clientOrg: "NEOM Co. / ENOWA (총괄법인)",
        field: "industrial_wastewater",
        fieldName: "산업폐수 무방류(ZLD) 및 유가금속 회수",
        issueType: "홍해 해양보전 산단 오폐수 100% 무방류 및 유가자원 회수",
        targetCapacity: "50,000 m³/일",
        budgetScale: "약 1,600억 원 (USD 120M)",
        procurementType: "joint_venture",
        procurementTypeName: "현지 합작법인(JV) 기반 EPC + 10년 O&M",
        financingType: "commercial",
        financingTypeName: "PIF 국부펀드 + 상업금융",
        urgency: "normal",
        targetTimeline: "2026년 4분기 PQ 사전심사 공고",
        reqSpecs: [
            "고염도/난분해성 COD 처리용 MVR 증발농축 및 결정화 설비",
            "폐수 내 리튬, 마그네슘 등 유가 희귀광물 선택적 회수 기술",
            "탄소배출 최소화 100% 신재생에너지 전력 연계 운전",
            "사우디 IKTVA(현지화 가치창출) 요건 40% 이상 충족 필수"
        ],
        preferredSupplierCerts: ["global_cert", "pct"],
        status: "국제 벤더 등록(Vendor Registration) 진행 중",
        description: "세계 최대 스마트 미래도시 NEOM의 해안 산업지구에 적용될 최첨단 ZLD 플랜트로, 최고 수준의 기술력과 현지 엔지니어링 협업 역량을 갖춘 글로벌 선도 파트너를 찾고 있습니다."
    },
    {
        id: "DEMAND-2026-004",
        title: "타슈켄트 농업 관개수로 현대화 & SCADA 자동화",
        country: "우즈베키스탄",
        region: "ca",
        regionName: "중앙아시아",
        clientOrg: "수자원부 (Ministry of Water)",
        field: "water_resources_flood",
        fieldName: "통합 수자원 관리(IWRM) 및 홍수·가뭄 조기경보",
        issueType: "아랄해 고갈 대응 노후 수로 누수 방지 및 원격 수문 자동화",
        targetCapacity: "총 연장 320km 수로 유량제어",
        budgetScale: "약 460억 원 (USD 35M)",
        procurementType: "epc_turnkey",
        procurementTypeName: "원격 수문 제어설비 + SCADA 통신망 턴키 구축",
        financingType: "mdb_loan",
        financingTypeName: "ADB / 세계은행(WB) 차관",
        urgency: "high",
        targetTimeline: "2026년 하반기 본입찰 공고",
        reqSpecs: [
            "태양광 독립전원형 초음파/레이더 수위·유량계 시스템",
            "위성통신 및 광역 무선망 연계 중앙 원격 수문개폐 제어",
            "영하 20도 ~ 영상 45도 극한 온도 환경 내구성 보장",
            "러시아어/우즈베크어 UI 지원 GIS 기반 관제 소프트웨어"
        ],
        preferredSupplierCerts: ["net_nep", "pct", "domestic_pat"],
        status: "ADB 사업 승인 완료",
        description: "중앙아시아 식량 안보의 핵심인 타슈켄트 및 페르가나 밸리 일대의 물 손실을 30% 이상 절감하기 위한 대규모 공공 프로젝트입니다."
    },
    {
        id: "DEMAND-2026-005",
        title: "세부·보홀 도서지역 마이크로그리드 해수담수화",
        country: "필리핀",
        region: "sea",
        regionName: "동남아시아",
        clientOrg: "수자원청 (LWUA) & 지방정부",
        field: "desalination",
        fieldName: "해수담수화 및 도서지역 분산형 수자원",
        issueType: "상수도 미보급 도서지역 24시간 친환경 자립형 식수 보급",
        targetCapacity: "1,500 m³/일 (10개 섬 분산)",
        budgetScale: "약 105억 원 (USD 8M)",
        procurementType: "equipment_export",
        procurementTypeName: "컨테이너형 이동식 담수화 설비 납품 및 운영 교육",
        financingType: "oda_edcf",
        financingTypeName: "KOICA 무상원조 + 지자체 펀드",
        urgency: "high",
        targetTimeline: "2026년 2분기 공급사 선정",
        reqSpecs: [
            "20ft/40ft 표준 해상 컨테이너 일체형 Plug & Play 패키지",
            "태양광-ESS 연계 24시간 자립형 담수화 운전 기술",
            "비전문가도 간편히 필터 교체 및 유지보수 가능한 직관적 설계",
            "원격 통신(LTE/위성) 기반 본사 실시간 헬스 모니터링"
        ],
        preferredSupplierCerts: ["pct", "domestic_pat"],
        status: "제안서 평가 중",
        description: "낙후된 필리핀 섬 지역 주민들에게 즉각적으로 깨끗한 식수를 보급할 수 있는 소형 컨테이너형 담수화 패키지 공급을 추진합니다."
    },
    {
        id: "DEMAND-2026-006",
        title: "보고타 하수처리 고도화 & 슬러지 바이오가스화",
        country: "콜롬비아",
        region: "la",
        regionName: "중남미·아프리카",
        clientOrg: "보고타 상수도하수공사 (EAAB)",
        field: "sludge_bioenergy",
        fieldName: "하수슬러지 감량 및 바이오가스 / 에너지화",
        issueType: "도시 하수슬러지 대량 감량 및 청정에너지 바이오가스 회수",
        targetCapacity: "하수 30만m³ / 슬러지 450톤",
        budgetScale: "약 950억 원 (USD 72M)",
        procurementType: "licensing_onm",
        procurementTypeName: "혐기성 소화조 고효율 교반/가용화 기술 라이선싱 + EPC",
        financingType: "gcf_climate",
        financingTypeName: "GCF 기후금융 + IDB 차관",
        urgency: "normal",
        targetTimeline: "2027년 상반기 입찰 공고",
        reqSpecs: [
            "열가수분해(THP) 또는 초음파 전처리를 통한 메탄가스 발생량 30% 증대",
            "슬러지 함수율 70% 이하 탈수 건조 감량화 시스템",
            "바이오가스 정제 바이오메탄(RNG) 고질화 및 배관 주입 설비",
            "탄소배출권(CDM/ITMO) 연계 인증 지원"
        ],
        preferredSupplierCerts: ["pct", "global_cert", "net_nep"],
        status: "F/S 및 환경영향평가 진행 중",
        description: "남미 최대 환경 개선 사업 중 하나인 보고타강 정화 프로젝트의 일환으로, 슬러지를 청정에너지로 전환하는 선진 한국 기술을 도입하고자 합니다."
    }
];

// 카테고리 정의
const DEMAND_CATEGORIES = {
    fields: [
        { key: "smart_water_grid", name: "스마트 상하수도 및 지능형 관망관리" },
        { key: "desalination", name: "해수담수화 및 염분차 발전 / 수자원 확보" },
        { key: "industrial_wastewater", name: "산업폐수 무방류(ZLD) 및 고도처리" },
        { key: "sludge_bioenergy", name: "하수슬러지 감량 및 바이오가스 / 에너지화" },
        { key: "water_resources_flood", name: "통합 수자원 관리(IWRM) 및 홍수·가뭄 조기경보" },
        { key: "membrane_filtration", name: "고도 정수처리 분리막(UF/NF/RO) 및 필터" },
        { key: "micro_pollutants", name: "미세플라스틱/잔류의약물질 등 신종오염물질 저감" }
    ],
    regions: [
        { key: "sea", name: "동남아시아 (베트남, 인도네시아, 필리핀 등)" },
        { key: "me", name: "중동 / 북아프리카 (사우디, UAE, 카타르 등)" },
        { key: "ca", name: "중앙아시아 (우즈베키스탄, 카자흐스탄 등)" },
        { key: "la", name: "중남미 / 아프리카 (콜롬비아, 르완다 등)" },
        { key: "sa", name: "서남아시아 (인도, 방글라데시 등)" },
        { key: "global", name: "북미 / 유럽 / 선진시장" }
    ],
    procurementTypes: [
        { key: "epc_turnkey", name: "EPC 턴키 (설계·조달·시공 일괄)" },
        { key: "equipment_export", name: "단품 기자재 / 모듈 패키지 납품" },
        { key: "licensing_onm", name: "기술 라이선싱 및 위탁운영(O&M)" },
        { key: "joint_venture", name: "현지 합작법인(JV) 및 PPP/BOT 투자개발" },
        { key: "consulting_fs", name: "엔지니어링 컨설팅 및 기본설계/F·S" }
    ],
    financingTypes: [
        { key: "oda_edcf", name: "정부 ODA / EDCF 유상원조" },
        { key: "mdb_loan", name: "다자개발은행(MDB) 차관 (ADB, WB, IDB 등)" },
        { key: "gcf_climate", name: "녹색기후기금(GCF) 및 탄소금융" },
        { key: "commercial", name: "발주처 자체 재정 및 민간 상업금융" }
    ]
};

module.exports = {
    GLOBAL_DEMAND_DATABASE,
    DEMAND_CATEGORIES
};
