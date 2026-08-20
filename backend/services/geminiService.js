/**
 * Enhanced Backend Gemini AI Consulting Service & Fallback Engine
 */

async function callGeminiConsulting(promptText, diagnosisResult, userApiKey = "") {
    let systemContext = "당신은 한국 환경부, 한국환경산업기술원(KEITI), 한국수자원공사(K-water)의 녹색·물산업 해외진출 전문 1:1 수주 컨설턴트입니다.";

    if (diagnosisResult) {
        systemContext += ` [현재 기업 진단 현황: 기업명="${diagnosisResult.compName}", 주력분야="${diagnosisResult.compField}", 타깃권역="${diagnosisResult.targetRegionName || '동남아'}", 기술형태="${diagnosisResult.techFormName || '모듈형'}", 해외이행보증="${diagnosisResult.pbondCap || 'mid'}", 현지네트워크="${diagnosisResult.localNetwork || 'contact'}", O&M체계="${diagnosisResult.onmCap || 'custom'}", 진출단계="${diagnosisResult.stageTitle}", 점수(기술/O&M/인증=${diagnosisResult.techScore}점, 실적/네트워크=${diagnosisResult.trackScore}점, 자부담/P-Bond=${diagnosisResult.fundScore}점, 법률행정=${diagnosisResult.legalScore}점), 추천지원사업ID=[${diagnosisResult.recommendedPackage.join(', ')}]`;
    }

    const apiKey = userApiKey.trim() || process.env.GEMINI_API_KEY || "";

    if (!apiKey) {
        return generateBackendFallbackResponse(promptText, diagnosisResult);
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: { parts: [{ text: systemContext }] }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            return generateBackendFallbackResponse(promptText, diagnosisResult);
        }
    } catch (err) {
        console.warn("Backend Gemini API call error:", err);
        return generateBackendFallbackResponse(promptText, diagnosisResult);
    }
}

function generateBackendFallbackResponse(prompt, res) {
    const compName = res ? res.compName : "귀사";
    const compField = res ? res.compField : "녹색·물산업";
    const targetRegionName = res ? (res.targetRegionName || "동남아시아 (아세안)") : "동남아시아 (아세안)";
    const techFormName = res ? (res.techFormName || "스키드/모듈형") : "스키드/모듈형";
    const stageTitle = res ? res.stageTitle : "Stage 2: 현지 실증 단계";

    if (prompt.includes("보고서") || prompt.includes("리포트")) {
        return `## [${compName}] K-Green & Water 해외 수주 고도화 전략 컨설팅 보고서

### 1. 해외 타깃 권역(${targetRegionName}) 및 기술형태(${techFormName}) 맞춤 분석
- **최우선 진출 권역**: **${targetRegionName}**
- **기술 형태 맞춤 전략**: **${compField}** 분야의 **${techFormName}** 장비는 현지 수질 특성에 맞춘 시범 실증(Pilot Test) 설치가 용이하며, 빠른 수질 데이터 확보가 가능합니다.
- 현재 **[${stageTitle}]** 상태에 맞추어 **'5번 녹색기술 현지실증(Test-bed)'** 사업을 통해 트랙레코드를 먼저 획득하는 것이 수주 성공률을 극대화하는 최적 전략입니다.

### 2. 해외 수주 3대 핵심 역량 (네트워크 / P-Bond 금융보증 / O&M 체계) 진단
1. **현지 파트너 및 발주처 네트워크**: 현지 에이전트 및 수공사/발주처 채널 확충을 위해 **'1번 해외 바이어 초청 상담회'** 및 **'8번 해외사무소 거점'** 연계가 필수적입니다.
2. **해외 이행보증(P-Bond / L/C) 금융 연계**: 본입찰 및 계약 수주 시 **한국무역보험공사 / 수출입은행 연계 해외보증 지원 프로그램**을 활용해 P-Bond 발급 허들을 극복해야 합니다.
3. **현지 환경 커스텀 & O&M 유지관리**: 현지 수질/환경 커스텀 설계 지원 및 현지 인력 A/S 교육 체계를 구비해 기술 평가점수를 높여야 합니다.

### 3. 추천 8대 지원프로그램 연계 패키지 활용법
1. **녹색기술 해외 현지실증(Test-bed)**: 국비(최대 3~5억원) 지원을 받아 ${targetRegionName} 현지 시설에 ${techFormName} 시범장비를 설치하고 공식 성능 검증서를 취득합니다.
2. **해외 바이어/발주처 초청 상담회**: 현지 성능 검증 완료 후 발주처 고위급 관계자를 한국 본사 및 선진 시공 현장에 초청해 1:1 본계약을 체결합니다.
3. **해외진출 전문컨설팅**: 현지 합작법인(JV) 설립, P-Bond 금융, 관세, 특허 독소조항을 1:1 법률/행정 자문으로 해소합니다.

### 4. 발주처 수주 성공률 극대화 3대 실행 액션
- **Action 1**: 현지 공수도공사(Host Plant)와의 부지 제공 동의서(MOU) 사전 확보 및 현지 에이전트 협약
- **Action 2**: KEITI/환경부 지원 사업 신청 시 해외 이행보증(P-Bond) 연계 금융 계획 제시
- **Action 3**: 현지 맞춤형 수질 커스터마이징 기술 도면 및 O&M 유지보수 매뉴얼 정교화`;
    }

    if (prompt.includes("베트남") || prompt.includes("Test-bed") || prompt.includes("실증")) {
        return `## ${targetRegionName} 현지실증(Test-bed) 및 수주 추진 시 핵심 유의사항

1. **Host Plant(현지 시설) 협약 체결**: 현지 정수/하수처리장과의 부지 제공 협약(MOU)이 최우선입니다.
2. **시범장비 통관 및 관세 면제**: R&D 및 시범 검증용 ${techFormName} 장비의 관세 감면 서류를 사전 구비해야 통관 지연을 방지할 수 있습니다.
3. **해외 이행보증(P-Bond) 사전 협의**: 입찰 및 계약 체결 시 P-Bond 발급 조건(수출보험공사/수은)을 사전에 확인하십시오.
4. **수질 분석 측정 기준 연계**: 해당국 국가 수질 표준 기준 항목에 맞춰 검증 측정 항목을 설계하셔야 현지 승인서로 효력을 가집니다.`;
    }

    return `질문하신 [${prompt}] 내용에 대한 맞춤형 자문입니다.\n\n귀사(${compName})의 주력 분야인 **${compField}** (${techFormName})의 **${targetRegionName}** 진출 성공률을 높이기 위해, 현재 **[${stageTitle}]** 맞춤형 지원 패키지 연격을 적극 추천드립니다.`;
}

module.exports = { callGeminiConsulting };
