/**
 * Core Application Engine - Diagnosis Algorithm, Radar Chart, Roadmap & UI Controllers
 */

let radarChartInstance = null;
let currentDiagnosisResult = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initKnowledgeBase();
    loadSampleDiagnosis();
    renderHistoryTable();
});

/**
 * Tab Navigation Controller
 */
function switchTab(tabName) {
    const tabs = ['wizard', 'result', 'ai', 'knowledge'];
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
 * Handle Self-Diagnosis Form Submission
 */
function handleDiagnosisSubmit(e) {
    if (e) e.preventDefault();

    const compName = document.getElementById('comp-name').value.trim() || '(주)한국스마트수자원';
    const compSize = document.getElementById('comp-size').value;
    const compFieldSelect = document.getElementById('comp-field');
    const compField = compFieldSelect.options[compFieldSelect.selectedIndex].text;
    
    const trDomesticEl = document.querySelector('input[name="tr-domestic"]:checked');
    const trDomestic = trDomesticEl ? parseInt(trDomesticEl.value) : 2;

    const trOverseasEl = document.querySelector('input[name="tr-overseas"]:checked');
    const trOverseas = trOverseasEl ? parseInt(trOverseasEl.value) : 1;

    const goalPurpose = document.getElementById('goal-purpose').value;
    const networkLevel = document.getElementById('network-level').value;
    const legalCap = document.getElementById('legal-capacity').value;

    // 1. Scoring Logic (0 ~ 100)
    let techScore = (trDomestic === 3 ? 90 : trDomestic === 2 ? 65 : 40);
    let trackScore = (trOverseas === 3 ? 95 : trOverseas === 2 ? 60 : 30);
    let networkScore = (networkLevel === 'strong' ? 90 : networkLevel === 'contact' ? 60 : 35);
    let legalScore = (legalCap === 'high' ? 90 : legalCap === 'mid' ? 65 : 35);

    // 2. Stage Determination & Program Package Matching
    let stageNum = 1;
    let stageTitle = "";
    let recommendedPackage = [];
    let roadmapSteps = [];

    if (trOverseas === 1 && trDomestic <= 2) {
        stageNum = 1;
        stageTitle = "Stage 1: 기반 구축 & 기획 단계";
        recommendedPackage = [3, 2, 6]; // MP, FS, Consulting
        roadmapSteps = [
            { step: "1단계", title: "마스터플랜(M/P) 및 타당성조사(F/S) 참여", desc: "해외 국가의 환경기본계획 및 프로젝트 F/S에 참여하여 한국 기술 스펙을 선점합니다." },
            { step: "2단계", title: "해외 현지실증(Test-bed) 시범 구축", desc: "국비 지원을 받아 현지 정수장/하수처리장에 시범 장비를 설치하고 검증서를 획득합니다." },
            { step: "3단계", title: "바이어 초청(Inbound) 및 본계약 체결", desc: "검증된 실적을 바탕으로 발주처 핵심 결정권자를 한국으로 초청해 1:1 최종 수주 계약을 체결합니다." }
        ];
    } else if (trOverseas <= 2 && trDomestic >= 2) {
        stageNum = 2;
        stageTitle = "Stage 2: 현지 실증 & 트랙레코드 확보 단계";
        recommendedPackage = [5, 1, 6]; // Test-bed, Buyer Inbound, Consulting
        roadmapSteps = [
            { step: "1단계", title: "해외 현지실증(Test-bed) 시범 설치", desc: "현지 시설(Host Plant)에 시범 설치하여 현지 수질/기후에 맞는 공식 성능 검증서를 취득합니다." },
            { step: "2단계", title: "해외 바이어 초청 상담회 연계", desc: "실증 운용 중인 현장과 한국 본사를 바이어가 방문하도록 초청 경비를 지원받습니다." },
            { step: "3단계", title: "전문컨설팅을 통한 현지 법인/JV 설립", desc: "계약 체결 시 현지 법률, 인허가, 관세 애로사항을 1:1 전문가 자문으로 해소합니다." }
        ];
    } else if (goalPurpose === 'mdb_odb' || compSize === 'mid' || compSize === 'large') {
        stageNum = 3;
        stageTitle = "Stage 3: 대형 프로젝트 & 재원 연계 단계";
        recommendedPackage = [4, 7, 1]; // MDB, GCF, Buyer Inbound
        roadmapSteps = [
            { step: "1단계", title: "MDB / GCF 사업 제안서(RFP/CN) 구조화", desc: "국제기구 표준 양식에 맞춘 영문 제안서 작성 자문 및 승인 절차를 이행합니다." },
            { step: "2단계", title: "MDB 벤더 등록 및 숏리스트(Shortlist) 진입", desc: "MDB 프로젝트 매니저 및 수원국 발주처 핵심 인사와의 네트워킹을 추진합니다." },
            { step: "3단계", title: "본 입찰 참여 및 글로벌 컨소시엄 구축", desc: "수주 지원단을 활용해 현지 발주처 고위급 회담을 개최하고 최종 수주를 확정합니다." }
        ];
    } else {
        stageNum = 4;
        stageTitle = "Stage 4: 계약 체결 & 현지 안착 단계";
        recommendedPackage = [1, 6, 8]; // Buyer, Consulting, Overseas Hub
        roadmapSteps = [
            { step: "1단계", title: "1:1 해외 바이어 초청 상담회", desc: "계약 임박 발주처 인사를 초청하여 MOU 및 본 계약 체결식을 거행합니다." },
            { step: "2단계", title: "해외진출 전문 컨설팅 (법률/세무)", desc: "현지 법인 설립, 합작투자(JV) 계약서 검토 및 특허권 보호 자문을 받습니다." },
            { step: "3단계", title: "해외 거점 사무소 밀착 사후 관리", desc: "현지 거점 사무소를 활용해 추가 발주 정보를 지속 트래킹하고 수주를 확대합니다." }
        ];
    }

    const timestamp = new Date().toLocaleDateString('ko-KR');

    currentDiagnosisResult = {
        compName, compField, compSize, stageNum, stageTitle,
        techScore, trackScore, networkScore, legalScore,
        recommendedPackage, roadmapSteps, timestamp
    };

    // Save to LocalStorage history
    saveDiagnosisHistory(currentDiagnosisResult);

    // Render Results
    renderResults();
    switchTab('result');
}

/**
 * Render Diagnosis Results Page
 */
function renderResults() {
    if (!currentDiagnosisResult) return;
    const res = currentDiagnosisResult;

    document.getElementById('res-title-text').innerText = `${res.compName} 맞춤형 해외진출 패스트트랙`;
    document.getElementById('res-stage-badge').innerText = res.stageTitle;
    document.getElementById('res-desc-text').innerHTML = `귀사의 [<b>${res.compField}</b>] 분야 역량 진단 결과, <b>[${res.stageTitle}]</b> 지원 패키지가 가장 효율적입니다.`;

    // Render Score Pills
    const pillsBox = document.getElementById('score-summary-pills');
    pillsBox.innerHTML = `
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 block text-[11px]">기술성(TRL)</span><b class="text-teal-700 text-sm">${res.techScore}점</b></div>
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 block text-[11px]">해외 실적</span><b class="text-teal-700 text-sm">${res.trackScore}점</b></div>
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 block text-[11px]">네트워크</span><b class="text-teal-700 text-sm">${res.networkScore}점</b></div>
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span class="text-slate-400 block text-[11px]">법률/행정</span><b class="text-teal-700 text-sm">${res.legalScore}점</b></div>
    `;

    // Render Radar Chart
    renderRadarChart(res.techScore, res.trackScore, res.networkScore, res.legalScore);

    // Render Roadmap Steps
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

    // Render Matched Program Cards
    const grid = document.getElementById('matched-programs-grid');
    document.getElementById('matched-count').innerText = res.recommendedPackage.length;
    
    grid.innerHTML = res.recommendedPackage.map(id => {
        const prog = PROGRAM_DATABASE.find(p => p.id === id);
        if (!prog) return '';
        return `
            <div class="p-5 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/40 to-emerald-50/20 flex flex-col justify-between space-y-4 card-hover-effect">
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] bg-teal-700 text-white font-bold px-2.5 py-0.5 rounded-full">${prog.badge}</span>
                        <i class="fa-solid ${prog.icon} text-teal-600 text-lg"></i>
                    </div>
                    <h4 class="text-sm font-bold text-slate-900">${prog.title}</h4>
                    <p class="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">${prog.desc}</p>
                </div>
                <div class="pt-3 border-t border-teal-100 space-y-2">
                    <div class="text-[11px] text-teal-800 font-medium">
                        <i class="fa-solid fa-coins text-teal-600 mr-1"></i> ${prog.budget}
                    </div>
                    <button onclick="openProgramModal(${prog.id})" class="w-full text-center text-xs text-teal-700 hover:text-teal-900 font-semibold bg-white py-1.5 rounded-lg border border-teal-200 transition">
                        상세 가이드 보기 <i class="fa-solid fa-chevron-right text-[10px] ml-1"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render Chart.js Radar Chart
 */
function renderRadarChart(tech, track, net, legal) {
    const canvas = document.getElementById('scoreRadarChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (radarChartInstance) radarChartInstance.destroy();

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['기술성(TRL)', '해외 실적', '현지 네트워크', '법률/행정'],
            datasets: [{
                label: '기업 역량 점수',
                data: [tech, track, net, legal],
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
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) { return `${context.label}: ${context.raw}점`; }
                    }
                }
            }
        }
    });
}

/**
 * Knowledge Base Program Directory Initialization & Filter
 */
function initKnowledgeBase() {
    const container = document.getElementById('knowledge-cards-container');
    if (!container) return;

    renderKnowledgeCards(PROGRAM_DATABASE);
}

function renderKnowledgeCards(programs) {
    const container = document.getElementById('knowledge-cards-container');
    if (!container) return;

    if (programs.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400 text-sm">검색 결과에 해당하는 지원 프로그램이 없습니다.</div>`;
        return;
    }

    container.innerHTML = programs.map(p => `
        <div class="p-6 border border-slate-200 rounded-2xl hover:border-teal-400 transition bg-white shadow-sm flex flex-col justify-between space-y-4 card-hover-effect">
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">${p.tag}</span>
                    <span class="text-xs text-slate-500 font-medium">${p.badge}</span>
                </div>
                <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                    <i class="fa-solid ${p.icon} text-teal-600"></i> ${p.title}
                </h3>
                <p class="text-xs text-slate-600 leading-relaxed">${p.desc}</p>
            </div>
            <div class="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <p class="text-slate-600"><b>주관기관:</b> ${p.agency}</p>
                <p class="text-slate-600"><b>지원내용:</b> ${p.budget}</p>
                <button onclick="openProgramModal(${p.id})" class="w-full mt-2 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold py-2 rounded-xl border border-slate-200 hover:border-teal-200 transition">
                    상세 보기 & 신청 서류
                </button>
            </div>
        </div>
    `).join('');
}

function filterKnowledgeCards() {
    const query = document.getElementById('knowledge-search-input')?.value.toLowerCase().trim() || '';
    const stageVal = document.getElementById('knowledge-stage-filter')?.value || 'all';

    const filtered = PROGRAM_DATABASE.filter(p => {
        const matchesQuery = p.title.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query) || p.tag.toLowerCase().includes(query);
        const matchesStage = stageVal === 'all' || p.stageMatch.includes(parseInt(stageVal));
        return matchesQuery && matchesStage;
    });

    renderKnowledgeCards(filtered);
}

/**
 * Program Detail Modal View
 */
function openProgramModal(id) {
    const prog = PROGRAM_DATABASE.find(p => p.id === id);
    if (!prog) return;

    const modalHtml = `
        <div id="prog-modal" class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                    <div>
                        <span class="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">${prog.tag}</span>
                        <h3 class="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
                            <i class="fa-solid ${prog.icon} text-teal-600"></i> ${prog.title}
                        </h3>
                    </div>
                    <button onclick="closeProgramModal()" class="text-slate-400 hover:text-slate-600 p-1"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>
                
                <div class="space-y-4 text-xs sm:text-sm">
                    <div>
                        <h4 class="font-bold text-slate-800 mb-1">사업 주요 내용</h4>
                        <p class="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">${prog.desc}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <h4 class="font-bold text-slate-800 mb-1">전담 기관</h4>
                            <p class="text-teal-700 font-semibold">${prog.agency}</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <h4 class="font-bold text-slate-800 mb-1">적용 Stage</h4>
                            <p class="text-slate-700">Stage ${prog.stageMatch.join(', ')}</p>
                        </div>
                    </div>

                    <div>
                        <h4 class="font-bold text-slate-800 mb-1">지원 예산 및 항목</h4>
                        <p class="text-slate-700 font-medium">${prog.budget}</p>
                    </div>

                    <div>
                        <h4 class="font-bold text-slate-800 mb-1">추천 대상 기업</h4>
                        <p class="text-slate-600">${prog.fit}</p>
                    </div>

                    <div>
                        <h4 class="font-bold text-slate-800 mb-1">필수 신청 구비 서류</h4>
                        <ul class="list-disc ml-5 space-y-1 text-slate-600">
                            ${prog.documents.map(d => `<li>${d}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <button onclick="closeProgramModal()" class="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition">닫기</button>
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
 * LocalStorage Diagnosis History Manager
 */
function saveDiagnosisHistory(res) {
    try {
        let history = JSON.parse(localStorage.getItem('k_green_diagnosis_history') || '[]');
        history.unshift(res);
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem('k_green_diagnosis_history', JSON.stringify(history));
        renderHistoryTable();
    } catch (e) {
        console.warn("LocalStorage save error:", e);
    }
}

function renderHistoryTable() {
    const container = document.getElementById('history-container');
    if (!container) return;

    try {
        const history = JSON.parse(localStorage.getItem('k_green_diagnosis_history') || '[]');
        if (history.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">저장된 이전 진단 기록이 없습니다.</p>`;
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr class="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                            <th class="p-2.5">일자</th>
                            <th class="p-2.5">기업명</th>
                            <th class="p-2.5">주력 분야</th>
                            <th class="p-2.5">판정 단계</th>
                            <th class="p-2.5 text-center">점수(기술/실적/네트워크/법률)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${history.map(h => `
                            <tr class="hover:bg-slate-50 text-slate-700">
                                <td class="p-2.5 text-slate-400">${h.timestamp || '-'}</td>
                                <td class="p-2.5 font-bold">${h.compName}</td>
                                <td class="p-2.5">${h.compField}</td>
                                <td class="p-2.5"><span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-semibold text-[11px]">${h.stageTitle}</span></td>
                                <td class="p-2.5 text-center font-mono">${h.techScore} / ${h.trackScore} / ${h.networkScore} / ${h.legalScore}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (e) {
        console.warn("History parse error:", e);
    }
}

/**
 * Load Sample Default Diagnosis for initial clean preview
 */
function loadSampleDiagnosis() {
    const compNameInput = document.getElementById('comp-name');
    if (compNameInput && !compNameInput.value) {
        compNameInput.value = "(주)K-스마트수자원";
    }
}
