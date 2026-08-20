/**
 * Gemini AI Consultant & Strategic Report Generator Module
 */

let customApiKey = localStorage.getItem('k_green_gemini_api_key') || "";

function getApiKey() {
    return customApiKey.trim();
}

function saveApiKey(key) {
    customApiKey = key.trim();
    if (customApiKey) {
        localStorage.setItem('k_green_gemini_api_key', customApiKey);
    } else {
        localStorage.removeItem('k_green_gemini_api_key');
    }
}

/**
 * Format markdown text to clean HTML
 */
function parseMarkdownToHTML(text) {
    if (!text) return "";
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-teal-800 mt-3 mb-1">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-2 border-b border-teal-100 pb-1">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 mt-4 mb-2">$1</h2>');

    // Bullet points
    html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700 my-1">$1</li>');

    // Paragraph breaks
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    return html;
}

/**
 * Send Chat Message to Gemini AI API
 */
async function sendChatMessage(customPrompt = null) {
    const inputEl = document.getElementById('chat-input');
    const promptText = customPrompt || (inputEl ? inputEl.value.trim() : '');
    if (!promptText) return;

    if (!customPrompt && inputEl) inputEl.value = '';

    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    // Render User Message
    chatMessages.innerHTML += `
        <div class="flex items-start justify-end gap-3 my-3">
            <div class="chat-bubble-user p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm">
                ${promptText}
            </div>
        </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Render Loading Indicator
    const loadingId = 'ai-loading-' + Date.now();
    chatMessages.innerHTML += `
        <div class="flex items-start gap-3 my-3" id="${loadingId}">
            <div class="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">AI</div>
            <div class="chat-bubble-ai p-4 rounded-2xl text-sm text-slate-500 shadow-sm flex items-center gap-2">
                <i class="fa-solid fa-circle-notch fa-spin text-teal-600"></i>
                <span>Gemini AI가 귀사의 진단 데이터를 분석하여 맞춤형 자문을 생성 중입니다...</span>
            </div>
        </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Build System Context
    let systemContext = "당신은 한국 환경부, 한국환경산업기술원(KEITI), 한국수자원공사(K-water)의 녹색·물산업 해외진출 전문 1:1 수주 컨설턴트입니다.";
    
    if (typeof currentDiagnosisResult !== 'undefined' && currentDiagnosisResult) {
        const res = currentDiagnosisResult;
        systemContext += ` [기업 진단 현황: 기업명="${res.compName}", 분야="${res.compField}", 규모="${res.compSize}", 진출단계="${res.stageTitle}", 기술점수=${res.techScore}점, 실적점수=${res.trackScore}점, 네트워크점수=${res.networkScore}점, 법률행정점수=${res.legalScore}점, 추천지원사업ID=[${res.recommendedPackage.join(', ')}]`;
    }

    const keyToUse = getApiKey();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${keyToUse}`;

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
        
        // Remove Loading Indicator
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        let aiText = "";
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            aiText = result.candidates[0].content.parts[0].text;
        } else if (result.error) {
            console.warn("Gemini API Error:", result.error);
            aiText = generateFallbackResponse(promptText);
        } else {
            aiText = generateFallbackResponse(promptText);
        }

        const formattedHtml = parseMarkdownToHTML(aiText);

        chatMessages.innerHTML += `
            <div class="flex items-start gap-3 my-3">
                <div class="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">AI</div>
                <div class="chat-bubble-ai p-4 rounded-2xl max-w-[85%] text-sm text-slate-800 shadow-sm leading-relaxed">
                    ${formattedHtml}
                </div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (err) {
        console.warn("Fetch Exception, using smart fallback:", err);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        const fallbackText = generateFallbackResponse(promptText);
        const formattedHtml = parseMarkdownToHTML(fallbackText);

        chatMessages.innerHTML += `
            <div class="flex items-start gap-3 my-3">
                <div class="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">AI</div>
                <div class="chat-bubble-ai p-4 rounded-2xl max-w-[85%] text-sm text-slate-800 shadow-sm leading-relaxed border-l-4 border-l-teal-500">
                    ${formattedHtml}
                </div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * Smart Fallback Engine for offline / API key limit fallback
 */
function generateFallbackResponse(prompt) {
    const res = (typeof currentDiagnosisResult !== 'undefined' && currentDiagnosisResult) ? currentDiagnosisResult : null;
    const compName = res ? res.compName : "귀사";
    const compField = res ? res.compField : "녹색·물산업";
    const stageTitle = res ? res.stageTitle : "Stage 2: 현지 실증 단계";

    if (prompt.includes("보고서") || prompt.includes("리포트")) {
        return `## [${compName}] K-Green & Water 해외진출 심층 전략 컨설팅 보고서

### 1. 해외 타깃 시장 분석 및 맞춤형 진출 가이드
- **주요 대상 국`: 동남아시아(베트남, 인도네시아) 및 중동(UAE, 사우디아라비아)
- **분야 맞춤 전략**: **${compField}** 분야는 대상 국가의 수질 인허가 규제 및 현지 정수장/하수처리장 현지적합성 검증이 수주 결정을 좌우합니다.
- 현재 **[${stageTitle}]** 위치에 해당하므로, 무리한 단독 입찰보다는 **'5번 녹색기술 현지실증(Test-bed)'**으로 현지 트랙레코드를 먼저 확보한 뒤 수주로 연계하는 전략이 가장 유리합니다.

### 2. 추천 8대 지원프로그램 연계 패키지 활용법
1. **녹색기술 해외 현지실증(Test-bed)**: 국비를 통해 시범장비(Pilot Plant) 제작 및 현지 수질 성능검증서를 획득하여 해외 트랙레코드 미비점을 보완합니다.
2. **해외 바이어 초청 상담회**: 현지 성능 검증 완료 후 발주처 고위급 관계자를 한국 본사 및 선진 시공 현장에 초청해 1:1 본계약을 체결합니다.
3. **해외진출 전문컨설팅**: 계약 체결 시 현지 합작법인(JV) 설립, 관세, 특허 독소조항을 1:1 법률 자문으로 해소합니다.

### 3. 발주처 수주 성공률 극대화 3대 실행 액션
- **Action 1**: 현지 공수도공사(Host Plant)와의 부지 제공 동의서(MOU) 사전 확보
- **Action 2**: KEITI/환경부 지원 사업 신청 시 영문 기술설명서 및 시범장비 도면 정교화
- **Action 3**: 현지 에이전트 채널을 활용한 수질 기준 및 입찰 스펙 사전 모니터링`;
    }

    if (prompt.includes("베트남") || prompt.includes("Test-bed") || prompt.includes("실증")) {
        return `## 베트남 현지실증(Test-bed) 추진 시 핵심 유의사항

1. **Host Plant(현지 시설) 협약 체결**: 베트남 자원환경부(MONRE) 또는 지방 성(Province) 인민위원회 소속 정수/하수처리장과의 부지 제공 협약(MOU)이 최우선입니다.
2. **시범장비 통관 및 관세 면제**: R&D 및 시범 검증용 장비의 경우 관세 감면 혜택 신청 서류를 사전 구비해야 통관 지연을 방지할 수 있습니다.
3. **수질 분석 측정 기준 연계**: 베트남 국가 수질 표준(QCVN) 기준 항목에 맞춰 검증 측정 항목을 설계하셔야 현지 승인서로 효력을 가집니다.`;
    }

    if (prompt.includes("MDB") || prompt.includes("세계은행") || prompt.includes("숏리스트")) {
        return `## MDB (세계은행/ADB) 사업 숏리스트(Shortlist) 진입 전략

1. **MDB 벤더 등록(REOI)**: WB의 eConsultant2 및 ADB의 CMS 시스템에 귀사의 기술 실적 및 주요 인력 CV를 사전 등록해야 합니다.
2. **글로벌 컨소시엄 구축**: 중소기업 단독 진입은 진입장벽이 높으므로, 현지 엔지니어링사 또는 국내 대기업 시공사와 컨소시엄을 구성해 지분을 확보하십시오.
3. **4번 MDB 프로젝트 수주 지원 활용**: 정부 제안서 자문 지원금을 받아 영문 기술제안서를 국제 표준 규격으로 작성하는 것을 권장합니다.`;
    }

    if (prompt.includes("GCF") || prompt.includes("녹색기후기금") || prompt.includes("개념서")) {
        return `## GCF(녹색기후기금) 사업개념서(CN) 작성 핵심 포인트

1. **기후 적응/감축 논리(Rationale)**: 단순 물 산업 기술이 아닌, 대상국의 기후변화(가뭄, 홍수, 수자원 부족) 대응에 직결된다는 정량적 기후 논리가 필수입니다.
2. **수원국 정부 승인서(NOL)**: 수원국 국가지정기관(NDA)의 공식 승인(No-Objection Letter)이 선행되어야 GCF 이행기구(AE) 심사를 통과할 수 있습니다.
3. **7번 GCF 사업개발 지원 활용**: GCF 컨설팅 지원을 통해 CN(Concept Note) 파이프라인 등록을 추진하십시오.`;
    }

    return `질문하신 [${prompt}] 내용에 대한 맞춤형 자문입니다.\n\n귀사(${compName})의 주력 분야인 **${compField}**의 해외 진출 성공률을 높이기 위해, 현재 **[${stageTitle}]** 맞춤형 지원 패키지 연계를 적극 추천드립니다.\n\n추가로 필요하신 세부 입찰 규정이나 지원사업 가이드가 필요하시면 언제든 질문해 주세요!`;
}

/**
 * Trigger AI Strategic Report Generation
 */
function generateAIReport() {
    if (typeof currentDiagnosisResult === 'undefined' || !currentDiagnosisResult) {
        alert("먼저 자가진단을 완료해 주세요.");
        return;
    }
    if (typeof switchTab === 'function') switchTab('ai');
    
    const prompt = `우리 기업(${currentDiagnosisResult.compName}, 주력분야: ${currentDiagnosisResult.compField})의 자가진단 결과를 바탕으로 해외진출 맞춤형 전략 보고서를 작성해줘. 추천 단계: ${currentDiagnosisResult.stageTitle}. 다음 항목을 포함해줘: 1) 타깃 해외 시장 분석, 2) 추천 8대 지원 프로그램 활용법, 3) 발주처 수주 성공률을 높이기 위한 세부 실행 가이드.`;
    
    sendChatMessage(prompt);
}

/**
 * Open API Key Settings Modal
 */
function openApiKeyModal() {
    const modalHtml = `
        <div id="api-key-modal" class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <i class="fa-solid fa-key text-teal-600"></i> Gemini API Key 설정
                    </h3>
                    <button onclick="closeApiKeyModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                <p class="text-xs text-slate-600 mb-4">
                    보유하신 Gemini API Key를 입력하시면 실시간 최신 모델이 질문에 실시간 답변합니다. (미입력 시 기본 스마트 시뮬레이션 엔진이 작동합니다.)
                </p>
                <div class="space-y-3 mb-6">
                    <input type="password" id="input-gemini-key" value="${getApiKey()}" placeholder="AIzaSy..." class="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none">
                </div>
                <div class="flex justify-end gap-2">
                    <button onclick="closeApiKeyModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">취소</button>
                    <button onclick="handleSaveApiKey()" class="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow">저장하기</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    if (modal) modal.remove();
}

function handleSaveApiKey() {
    const input = document.getElementById('input-gemini-key');
    if (input) {
        saveApiKey(input.value);
        closeApiKeyModal();
        alert("API Key 설정이 저장되었습니다.");
    }
}
