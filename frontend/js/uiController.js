/**
 * Enhanced Frontend UI Controller Module - Handles UI State, Refined Chart.js, Modals & Events
 */

let radarChartInstance = null;
let currentDiagnosisResult = null;
let lastFetchedHistory = [];
let customApiKey = localStorage.getItem('k_green_gemini_api_key') || "";

document.addEventListener('DOMContentLoaded', async () => {
    await loadKnowledgeDirectory();
    await refreshHistoryTable();
});

/**
 * Tab Switcher
 */
function switchTab(tabName) {
    const tabs = ['wizard', 'result', 'ai', 'knowledge', 'history'];
    tabs.forEach(t => {
        const section = document.getElementById(`section-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);
        if (!section || !btn) return;

        if (t === tabName) {
            section.classList.remove('hidden');
            btn.classList.add('active-tab');
            btn.classList.remove('hover:text-slate-200');
        } else {
            section.classList.add('hidden');
            btn.classList.remove('active-tab');
            btn.classList.add('hover:text-slate-200');
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Form Submit Handler via Backend API with Refined Parameters
 */
async function handleDiagnosisSubmit(e) {
    if (e) e.preventDefault();

    const compName = document.getElementById('comp-name').value.trim() || '(주)한국스마트수자원';
    const compSize = document.getElementById('comp-size').value;
    const compFieldSelect = document.getElementById('comp-field');
    const compField = compFieldSelect.options[compFieldSelect.selectedIndex].text;
    
    // New Procurement Diagnosis Fields
    const targetRegion = document.getElementById('target-region').value;
    const techFormEl = document.querySelector('input[name="tech-form"]:checked');
    const techForm = techFormEl ? techFormEl.value : 'skid';
    
    const fundingCap = document.getElementById('funding-cap').value;
    const pbondCap = document.getElementById('pbond-cap') ? document.getElementById('pbond-cap').value : 'mid';
    const certLevel = document.getElementById('cert-level').value;

    const localNetwork = document.getElementById('local-network') ? document.getElementById('local-network').value : 'contact';
    const onmCap = document.getElementById('onm-cap') ? document.getElementById('onm-cap').value : 'custom';

    const trDomesticEl = document.querySelector('input[name="tr-domestic"]:checked');
    const trDomestic = trDomesticEl ? parseInt(trDomesticEl.value) : 2;

    const trOverseasEl = document.querySelector('input[name="tr-overseas"]:checked');
    const trOverseas = trOverseasEl ? parseInt(trOverseasEl.value) : 1;

    const goalPurpose = document.getElementById('goal-purpose').value;
    const legalCap = document.getElementById('legal-capacity').value;

    const payload = {
        compName, compSize, compField,
        targetRegion, techForm, fundingCap, certLevel,
        pbondCap, localNetwork, onmCap,
        trDomestic, trOverseas,
        goalPurpose, legalCap
    };

    // Call Backend REST API
    const result = await apiSubmitDiagnosis(payload);

    if (result) {
        currentDiagnosisResult = result;
        renderResults();
        await refreshHistoryTable();
        switchTab('result');
    } else {
        alert("백엔드 서버와 진단 통신 중 오류가 발생했습니다.");
    }
}

/**
 * Render Diagnosis Results
 */
async function renderResults() {
    if (!currentDiagnosisResult) return;
    const res = currentDiagnosisResult;

    document.getElementById('res-title-text').innerText = `${res.compName} 맞춤형 해외진출 패스트트랙`;
    document.getElementById('res-stage-badge').innerText = res.stageTitle;
    document.getElementById('res-desc-text').innerHTML = `귀사의 [<b>${res.compField}</b> / <b>${res.targetRegionName}</b>] 역량 진단 결과, <b>[${res.stageTitle}]</b> 지원 패키지가 가장 효율적입니다.`;

    // Refined Score Pills (4 Axes: 기술/인증, 해외실적, 자부담여력, 법률/행정)
    const pillsBox = document.getElementById('score-summary-pills');
    pillsBox.innerHTML = `
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 block text-[11px]">기술/인증</span><b class="text-teal-700 text-sm">${res.techScore}점</b></div>
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 block text-[11px]">해외 실적</span><b class="text-teal-700 text-sm">${res.trackScore}점</b></div>
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 block text-[11px]">자부담 여력</span><b class="text-teal-700 text-sm">${res.fundScore}점</b></div>
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 block text-[11px]">법률/행정</span><b class="text-teal-700 text-sm">${res.legalScore}점</b></div>
    `;

    // Render Radar Chart with Updated 4 Axes
    renderRadarChart(res.techScore, res.trackScore, res.fundScore, res.legalScore);

    // Roadmap Steps
    const stepContainer = document.getElementById('roadmap-step-container');
    stepContainer.innerHTML = res.roadmapSteps.map((s, idx) => `
        <div class="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-start gap-4 card-hover-effect">
            <div class="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                ${idx + 1}
            </div>
            <div class="flex-grow">
                <span class="text-xs font-bold text-teal-700 uppercase tracking-wide">${s.step}</span>
                <h4 class="text-sm font-bold text-slate-800">${s.title}</h4>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">${s.desc}</p>
            </div>
        </div>
    `).join('');

    // Program Cards
    const allPrograms = await apiFetchPrograms();
    const grid = document.getElementById('matched-programs-grid');
    document.getElementById('matched-count').innerText = res.recommendedPackage.length;

    grid.innerHTML = res.recommendedPackage.map(id => {
        const prog = allPrograms.find(p => p.id === id);
        if (!prog) return '';
        return `
            <div class="p-6 rounded-2xl border border-teal-200 bg-white flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:border-teal-400 transition-all">
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-teal-800 bg-teal-100/80 px-3 py-1 rounded-lg border border-teal-200">${prog.tag}</span>
                        <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">${prog.badge}</span>
                    </div>
                    <h4 class="text-base font-extrabold text-slate-900 tracking-tight leading-snug">${prog.title}</h4>
                    <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${prog.desc}</p>
                </div>
                <div class="pt-3 border-t border-slate-100 space-y-3">
                    <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
                        <p class="text-slate-700"><span class="font-bold text-slate-900">주관기관:</span> ${prog.agency}</p>
                        <p class="text-slate-700"><span class="font-bold text-slate-900">지원내용:</span> ${prog.budget}</p>
                    </div>
                    <button onclick="openProgramModal(${prog.id})" class="w-full bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl shadow-xs transition-all text-center flex items-center justify-center cursor-pointer">
                        상세 보기 & 신청 서류
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Chart.js Radar Chart Renderer (Updated 4 Axes: 기술/인증, 해외실적, 자부담여력, 법률/행정)
 */
function renderRadarChart(tech, track, fund, legal) {
    const canvas = document.getElementById('scoreRadarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (radarChartInstance) radarChartInstance.destroy();

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['기술/인증', '해외 실적', '자부담 여력', '법률/행정'],
            datasets: [{
                label: '기업 역량 점수',
                data: [tech, track, fund, legal],
                backgroundColor: 'rgba(13, 148, 136, 0.25)',
                borderColor: '#0d9488',
                borderWidth: 2.5,
                pointBackgroundColor: '#0f766e',
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#0f766e',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { display: false, stepSize: 25 },
                    pointLabels: {
                        font: { size: 11, family: 'Pretendard', weight: '600' },
                        color: '#334155'
                    },
                    grid: { color: '#e2e8f0' },
                    angleLines: { color: '#cbd5e1' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/**
 * Load Knowledge Directory Cards from Backend
 */
async function loadKnowledgeDirectory() {
    const stageVal = document.getElementById('knowledge-stage-filter')?.value || 'all';
    const query = document.getElementById('knowledge-search-input')?.value.trim() || '';

    const programs = await apiFetchPrograms(stageVal, query);
    const container = document.getElementById('knowledge-cards-container');
    if (!container) return;

    if (programs.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400 text-sm">해당하는 지원 프로그램이 없습니다.</div>`;
        return;
    }

    container.innerHTML = programs.map(p => `
        <div class="p-6 border border-slate-200 rounded-2xl hover:border-teal-400 transition-all bg-white shadow-sm flex flex-col justify-between space-y-4">
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-teal-800 bg-teal-100/80 px-3 py-1 rounded-lg border border-teal-200">${p.tag}</span>
                    <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">${p.badge}</span>
                </div>
                <h3 class="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                    ${p.title}
                </h3>
                <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">${p.desc}</p>
            </div>
            <div class="pt-4 border-t border-slate-100 space-y-3">
                <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
                    <p class="text-slate-700"><span class="font-bold text-slate-900">주관기관:</span> ${p.agency}</p>
                    <p class="text-slate-700"><span class="font-bold text-slate-900">지원내용:</span> ${p.budget}</p>
                </div>
                <button onclick="openProgramModal(${p.id})" class="w-full bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl shadow-xs transition-all text-center flex items-center justify-center cursor-pointer">
                    상세 보기 & 신청 서류
                </button>
            </div>
        </div>
    `).join('');
}

function filterKnowledgeCards() {
    loadKnowledgeDirectory();
}

/**
 * Open Program Modal Detail (2026 KEITI PDF Comprehensive Specification)
 */
async function openProgramModal(id) {
    const prog = await apiFetchProgramDetail(id);
    if (!prog) return;

    // Check if existing modal is open and remove
    closeProgramModal();

    const supportDetailsList = prog.supportDetails && prog.supportDetails.length > 0
        ? prog.supportDetails.map(item => `
            <li class="flex items-start gap-2">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0"></span>
                <span class="text-slate-800 text-xs sm:text-sm leading-relaxed">${item}</span>
            </li>
        `).join('')
        : `<li class="text-slate-700 text-xs sm:text-sm">${prog.desc}</li>`;

    const eligibilityList = prog.eligibility && prog.eligibility.length > 0
        ? prog.eligibility.map(item => `
            <li class="flex items-start gap-2">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 shrink-0"></span>
                <span class="text-slate-800 text-xs sm:text-sm leading-relaxed">${item}</span>
            </li>
        `).join('')
        : `<li class="text-slate-700 text-xs sm:text-sm">${prog.fit}</li>`;

    const documentsList = prog.documents && prog.documents.length > 0
        ? prog.documents.map((doc, idx) => `
            <li class="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <span class="w-5 h-5 rounded-lg bg-teal-50 text-teal-800 font-extrabold text-[11px] flex items-center justify-center shrink-0 border border-teal-200/70">${idx + 1}</span>
                <span class="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">${doc}</span>
            </li>
        `).join('')
        : `<li class="text-slate-600 text-xs sm:text-sm">공고문 참조</li>`;

    const modalHtml = `
        <div id="prog-modal" class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-6 animate-fade-in" onclick="if(event.target.id==='prog-modal') closeProgramModal()">
            <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl sm:max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
                
                <!-- Modal Top Header -->
                <div class="flex justify-between items-start border-b border-slate-200/80 pb-5">
                    <div class="space-y-1.5">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-teal-800 bg-teal-100/90 px-3 py-1 rounded-lg border border-teal-200">${prog.tag}</span>
                            <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">${prog.badge}</span>
                            ${prog.period ? `<span class="text-xs font-medium text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">${prog.period}</span>` : ''}
                        </div>
                        <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                            ${prog.title}
                        </h3>
                    </div>
                    <button onclick="closeProgramModal()" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition cursor-pointer text-lg" aria-label="닫기">
                        ✕
                    </button>
                </div>

                <!-- Key Quick Info 4-Card Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wide">주관 및 전담기관</p>
                        <p class="text-xs sm:text-sm font-black text-slate-900 mt-0.5">${prog.agency}</p>
                    </div>
                    <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wide">2026 지원예산 및 한도</p>
                        <p class="text-xs sm:text-sm font-black text-teal-800 mt-0.5">${prog.budget}</p>
                    </div>
                </div>

                <!-- Section 1: 사업 개요 및 주요 지원 내용 -->
                <div class="p-5 bg-teal-50/40 border border-teal-100 rounded-2xl space-y-3">
                    <h4 class="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span> 사업 개요 및 핵심 지원 혜택
                    </h4>
                    <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-teal-100/80">
                        ${prog.desc}
                    </p>
                    <ul class="space-y-2 pt-1">
                        ${supportDetailsList}
                    </ul>
                </div>

                <!-- Section 2: 신청 자격 및 추천 대상 -->
                <div class="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                    <h4 class="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-slate-700"></span> 추천 대상 및 신청 자격 요건
                    </h4>
                    <div class="bg-white p-3.5 rounded-xl border border-slate-200/70">
                        <p class="text-xs text-slate-500 font-bold mb-1">핵심 추천 프로필</p>
                        <p class="text-xs sm:text-sm font-semibold text-slate-800">${prog.fit}</p>
                    </div>
                    <ul class="space-y-2 pt-1">
                        ${eligibilityList}
                    </ul>
                </div>

                <!-- Section 3: 필수 신청 제출 서류 목록 -->
                <div class="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                    <h4 class="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span> 필수 제출 구비 서류 체크리스트
                    </h4>
                    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        ${documentsList}
                    </ul>
                </div>

                <!-- Section 4: 추진 절차 및 공식 문의처 -->
                <div class="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                    <h4 class="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-slate-900"></span> 사업 추진 절차 & 공식 문의처
                    </h4>
                    ${prog.process ? `
                        <div class="bg-white p-3.5 rounded-xl border border-slate-200/70">
                            <p class="text-xs text-slate-500 font-bold mb-1">추진 프로세스</p>
                            <p class="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">${prog.process}</p>
                        </div>
                    ` : ''}
                    ${prog.contact ? `
                        <div class="p-3 bg-teal-100/60 border border-teal-200 rounded-xl flex items-center justify-between">
                            <span class="text-xs font-bold text-teal-900">전담 문의처:</span>
                            <span class="text-xs sm:text-sm font-extrabold text-teal-950">${prog.contact}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Modal Bottom Action Bar -->
                <div class="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p class="text-xs text-slate-600 font-medium">
                        * 2026년 한국환경산업기술원(KEITI) 해외진출 지원사업 통합설명회 모집요강 기준
                    </p>
                    <button onclick="closeProgramModal()" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md">
                        닫기
                    </button>
                </div>

            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeProgramModal() {
    const modal = document.getElementById('prog-modal');
    if (modal) modal.remove();
}

/**
 * Gemini AI Chat Message Handler
 */
async function sendChatMessage(customPrompt = null) {
    const inputEl = document.getElementById('chat-input');
    const promptText = customPrompt || (inputEl ? inputEl.value.trim() : '');
    if (!promptText) return;

    if (!customPrompt && inputEl) inputEl.value = '';

    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    // Render User Bubble
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
                <span>백엔드 API를 경유하여 Gemini AI 응답을 생성 중입니다...</span>
            </div>
        </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Call Backend Consulting API
    const replyText = await apiSendConsultingChat(promptText, currentDiagnosisResult, customApiKey);

    // Remove Loading Indicator
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    const formattedHtml = parseMarkdownToHTML(replyText);

    chatMessages.innerHTML += `
        <div class="flex items-start gap-3 my-3">
            <div class="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">AI</div>
            <div class="chat-bubble-ai p-4 rounded-2xl max-w-[85%] text-sm text-slate-800 shadow-sm leading-relaxed">
                ${formattedHtml}
            </div>
        </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendQuickQuestion(text) {
    switchTab('ai');
    sendChatMessage(text);
}

function generateAIReport() {
    if (!currentDiagnosisResult) {
        alert("먼저 자가진단을 완료해 주세요.");
        return;
    }
    switchTab('ai');
    const prompt = `우리 기업(${currentDiagnosisResult.compName}, 분야: ${currentDiagnosisResult.compField}, 타깃권역: ${currentDiagnosisResult.targetRegionName})의 고도화 자가진단 결과를 바탕으로 해외진출 맞춤형 전략 보고서를 작성해줘.`;
    sendChatMessage(prompt);
}

function parseMarkdownToHTML(text) {
    if (!text) return "";
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-teal-800 mt-3 mb-1">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-2 border-b border-teal-100 pb-1">$1</h3>');
    html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700 my-1">$1</li>');
    html = html.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
    return html;
}

async function refreshHistoryTable() {
    const history = await apiFetchHistory();
    lastFetchedHistory = history || [];
    const container = document.getElementById('history-container');
    if (!container) return;

    // Update Summary Stats
    const totalEl = document.getElementById('stat-total-count');
    const lastDateEl = document.getElementById('stat-last-date');
    const avgScoreEl = document.getElementById('stat-avg-score');

    if (totalEl) totalEl.innerText = `${lastFetchedHistory.length}건`;
    if (lastDateEl) lastDateEl.innerText = lastFetchedHistory.length > 0 ? (lastFetchedHistory[0].timestamp || '-') : '-';
    if (avgScoreEl) {
        if (lastFetchedHistory.length > 0) {
            const avg = Math.round(lastFetchedHistory.reduce((acc, cur) => acc + (cur.totalScore || cur.techScore || 0), 0) / lastFetchedHistory.length);
            avgScoreEl.innerText = `${avg}점`;
        } else {
            avgScoreEl.innerText = '0점';
        }
    }

    if (!history || history.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-8">서버에 저장된 진단 이력이 없습니다.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
            <table class="w-full text-left text-xs border-collapse">
                <thead>
                    <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th class="p-3">일자</th>
                        <th class="p-3">기업명</th>
                        <th class="p-3">주력 분야 / 타깃 권역</th>
                        <th class="p-3">판정 단계</th>
                        <th class="p-3 text-center">역량 점수 (기술/실적/금융/법률)</th>
                        <th class="p-3 text-center">액션</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                    ${history.map((h, idx) => `
                        <tr class="hover:bg-slate-50 text-slate-700 transition">
                            <td class="p-3 text-slate-400 font-mono">${h.timestamp || '-'}</td>
                            <td class="p-3 font-bold text-slate-900">${h.compName}</td>
                            <td class="p-3">${h.compField} <span class="text-slate-400">|</span> <span class="text-teal-700 font-semibold">${h.targetRegionName || '동남아'}</span></td>
                            <td class="p-3"><span class="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-bold text-[11px]">${h.stageTitle}</span></td>
                            <td class="p-3 text-center font-mono font-semibold text-slate-600">${h.techScore} / ${h.trackScore} / ${h.fundScore || h.networkScore} / ${h.legalScore}</td>
                            <td class="p-3 text-center">
                                <button onclick="loadPastDiagnosis(${idx})" class="bg-teal-600 hover:bg-teal-500 text-white text-[11px] px-3 py-1.5 rounded-lg font-bold transition inline-flex items-center gap-1 shadow-sm">
                                    <i class="fa-solid fa-arrow-right-to-bracket"></i> 결과 로드
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadPastDiagnosis(idx) {
    if (lastFetchedHistory && lastFetchedHistory[idx]) {
        currentDiagnosisResult = lastFetchedHistory[idx];
        renderResults();
        switchTab('result');
    }
}

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
                    Gemini API Key를 입력하시면 백엔드에서 실시간 최신 모델로 답변을 생성합니다. (미입력 시 스마트 시뮬레이션 엔진이 작동합니다.)
                </p>
                <div class="space-y-3 mb-6">
                    <input type="password" id="input-gemini-key" value="${customApiKey}" placeholder="AIzaSy..." class="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none">
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
        customApiKey = input.value.trim();
        if (customApiKey) localStorage.setItem('k_green_gemini_api_key', customApiKey);
        else localStorage.removeItem('k_green_gemini_api_key');
        closeApiKeyModal();
        alert("API Key 설정이 저장되었습니다.");
    }
}
