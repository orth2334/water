/**
 * Enhanced Backend Gemini AI Consulting Service & Fallback Engine
 * Enriched with 14-Parameter Multi-Dimensional Overseas Diagnostic Context
 */

async function callGeminiConsulting(promptText, diagnosisResult, userApiKey = "") {
    let systemContext = "당신은 환경부, 한국환경산업기술원(KEITI), 한국수자원공사(K-water)의 녹색·물산업 해외진출 1:1 수석 전문 컨설턴트입니다.";

    if (diagnosisResult) {
        systemContext += ` [현재 기업 진단 현황:
- 기업명: ${diagnosisResult.compName} (규모: ${diagnosisResult.compSize})
- 주력분야: ${diagnosisResult.compField}
- 글로벌IP/인증: ${diagnosisResult.compCert}
- 사업실적: ${diagnosisResult.compTrack} (EPC/O&M 역량: ${diagnosisResult.compEpc})
- 글로벌전담인력: ${diagnosisResult.compManpower} (자부담여력: ${diagnosisResult.compFund})
- 타깃권역: ${diagnosisResult.targetRegionName} (비즈니스모델: ${diagnosisResult.compBizModel})
- 선호재원: ${diagnosisResult.compFinancing} (현지실증필요: ${diagnosisResult.compTestbed})
- 진출일정: ${diagnosisResult.compTimeline} (정책가점: ${diagnosisResult.compBonus})
- 진출단계: ${diagnosisResult.stageTitle}
- 4축 점수: 기술·지재권(${diagnosisResult.techScore}점), 실적·네트워크(${diagnosisResult.trackScore}점), 재무·자부담(${diagnosisResult.fundScore}점), 글로벌·EPC(${diagnosisResult.legalScore}점)
- 추천 8대 지원사업 ID: [${diagnosisResult.recommendedPackage.join(', ')}]]`;
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
    const compField = res ? res.compField : "스마트 녹색·물산업";
    const targetRegionName = res ? (res.targetRegionName || "동남아시아 (베트남 등)") : "동남아시아 (베트남 등)";
    const stageTitle = res ? res.stageTitle : "Stage 2: 현지 실증 & 트랙레코드 확보 단계";

    if (prompt.includes("보고서") || prompt.includes("리포트") || prompt.includes("전략")) {
        return `## [${compName}] 2026 K-녹색·물산업 해외진출 14개 다차원 맞춤형 전략 보고서

### 1. 기업 역량 진단 요약 및 타깃 시장(${targetRegionName}) 적합성
- **기업 분석**: **${compName}**은 **${compField}** 분야의 핵심 기술 경쟁력을 갖추고 있으며, 현재 진단 결과 **[${stageTitle}]**에 위치하고 있습니다.
- **타깃 권역**: **${targetRegionName}**의 강화되는 환경 규제 및 인프라 현대화 수요와 결합 시 높은 수출 경쟁력이 기대됩니다.

### 2. 4축 핵심 역량 진단 및 보완 전략
1. **기술 및 지식재산권(IP)**: 해외 진출국의 지재권 분쟁 방지 및 입찰 가점을 위해 **국제특허(PCT)** 및 타깃국 규격 인증(CE/NSF 등)을 조기 확보해야 합니다.
2. **사업 실적 및 현지 네트워크**: 현지 발주처/바이어와의 **공식 의향서(LOI/MOU)** 확보가 2026년 정부 지원사업 선정의 핵심 가점 요인입니다.
3. **재무 안정성 및 자부담 여력**: 지원사업별 민간 자부담 매칭 비율(30~50%)을 사전에 감안한 전용 예산 배정이 필요합니다.
4. **글로벌 수행 및 EPC/O&M 역량**: 영문 RFP 제안서 작성 전담 인력 보강 및 장기 O&M 원격관제 체계를 구축해 기술 평가 우위를 점해야 합니다.

### 3. 정부 8대 지원사업 최적 연계 패키지
1. **1단계**: **5. 녹색기술 해외 현지실증(Test-bed)** - 국비 최대 4.5억 원(최대 2년)을 지원받아 현지 플랜트에 시범 설치하고 공인 수질·성능 검증서 획득.
2. **2단계**: **1. 해외 바이어 초청 상담회(GGHK)** - 실증 데이터를 바탕으로 현지 핵심 의사결정권자를 국내 초청(항공료 100% 지원)하여 1:1 수주 협상.
3. **3단계**: **6. 환경기업 해외진출 전문컨설팅** - 기업당 최대 1,200만 원(자부담 0원) 전액 국비로 18개 법무·관세·컨설팅 기관을 통한 1:1 현지 법인/계약 자문 지원.

### 4. 수주 성공률 극대화를 위한 3대 실행 로드맵
- **Action 1**: 현지 공공/민간 플랜트(Host Plant)와의 부지 제공 동의서(LOI) 및 현지 파트너십 체결
- **Action 2**: 2026년 상반기 KEITI 현지실증 및 타당성조사 공고 즉시 신청서 접수
- **Action 3**: 18개 전문 자문단을 통한 영문 계약서 독소조항 사전 필터링 및 원산지 증명 획득`;
    }

    return `## [${compName}] 해외진출 1:1 전문 자문 안내\n\n문의하신 [**${prompt}**]에 대한 자문입니다.\n\n귀사의 주력 기술인 **${compField}**의 **${targetRegionName}** 진출 성공률을 극대화하기 위해, 현재 **[${stageTitle}]** 맞춤형 지원 패키지 연계를 적극 추천드립니다.`;
}

module.exports = { callGeminiConsulting };

