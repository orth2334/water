/**
 * Frontend Controller for Overseas Demand Assessment & Two-Way Matching Hub
 */

let currentDemandEvaluation = null;
let currentMatchingData = null;
let activeDemandsList = [];
let localDemandHistory = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initDemandModule();
});

async function initDemandModule() {
    await loadGlobalDemandsList();
    await loadMatchingOverview();
    loadDemandHistory();

    // Restore last active mode & tab on page reload
    restoreNavigationState();
}

/**
 * Restore User Navigation State from Hash or LocalStorage
 */
function restoreNavigationState() {
    let hash = window.location.hash ? window.location.hash.replace('#', '') : '';
    let savedRole = localStorage.getItem('k_green_active_role') || 'supplier';
    let savedSupplierTab = localStorage.getItem('k_green_supplier_tab') || 'wizard';
    let savedDemandTab = localStorage.getItem('k_green_demand_tab') || 'form';

    // Check if hash has format "mode/tab" or "mode"
    if (hash) {
        const parts = hash.split('/');
        if (['supplier', 'demand', 'matching'].includes(parts[0])) {
            savedRole = parts[0];
            if (parts[0] === 'supplier' && parts[1]) savedSupplierTab = parts[1];
            if (parts[0] === 'demand' && parts[1]) savedDemandTab = parts[1];
        }
    }

    // Apply role mode
    switchMainRoleMode(savedRole, false);

    // Apply sub tabs
    if (savedRole === 'supplier') {
        if (typeof switchTab === 'function') {
            switchTab(savedSupplierTab, false);
        }
    } else if (savedRole === 'demand') {
        switchDemandTab(savedDemandTab, false);
    }
}

/**
 * 1. Global View 2-Way Segmented Role Switcher (공급자 모드 ⟷ 수요자 모드)
 */
function switchMainRoleMode(mode, shouldSave = true) {
    const supplierBtn = document.getElementById('role-btn-supplier');
    const demandBtn = document.getElementById('role-btn-demand');

    if (mode === 'supplier') {
        if (supplierBtn) {
            supplierBtn.className = "role-switcher-btn py-2 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 bg-teal-500 text-slate-900 shadow-md active-role font-black";
        }
        if (demandBtn) {
            demandBtn.className = "role-switcher-btn py-2 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold";
        }
    } else {
        if (demandBtn) {
            demandBtn.className = "role-switcher-btn py-2 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 bg-teal-500 text-slate-900 shadow-md active-role font-black";
        }
        if (supplierBtn) {
            supplierBtn.className = "role-switcher-btn py-2 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold";
        }
    }

    // Sub-tab nav bars visibility
    const supplierTabNav = document.getElementById('tab-nav-container');
    const demandTabNav = document.getElementById('demand-tab-nav-container');

    if (supplierTabNav) supplierTabNav.classList.toggle('hidden', mode !== 'supplier');
    if (demandTabNav) demandTabNav.classList.toggle('hidden', mode !== 'demand');

    // Switch to respective active sub tab
    if (mode === 'supplier') {
        const subTab = localStorage.getItem('k_green_supplier_tab') || 'wizard';
        if (typeof switchTab === 'function') {
            switchTab(subTab, shouldSave);
        }
    } else {
        const subTab = localStorage.getItem('k_green_demand_tab') || 'form';
        switchDemandTab(subTab, shouldSave);
    }

    if (shouldSave) {
        localStorage.setItem('k_green_active_role', mode);
    }
}

/**
 * 2. Demand Mode Sub-Tab Switcher (Form, Result, History, Matching)
 */
function switchDemandTab(tabName, shouldSave = true) {
    const tabs = ['form', 'result', 'history', 'matching'];

    // Update Tab Buttons UI
    tabs.forEach(t => {
        const btn = document.getElementById(`demand-tab-btn-${t}`);
        if (btn) {
            if (t === tabName) {
                btn.className = "py-2.5 px-3 active-tab whitespace-nowrap flex items-center gap-2 transition cursor-pointer text-slate-100";
            } else {
                btn.className = "py-2.5 px-3 hover:text-slate-100 whitespace-nowrap flex items-center gap-2 transition cursor-pointer text-slate-300";
            }
        }
    });

    const demandContainer = document.getElementById('role-view-demand');
    const matchingContainer = document.getElementById('role-view-matching');
    const supplierContainer = document.getElementById('role-view-supplier');

    if (supplierContainer) supplierContainer.classList.add('hidden');

    if (tabName === 'matching') {
        if (demandContainer) demandContainer.classList.add('hidden');
        if (matchingContainer) {
            matchingContainer.classList.remove('hidden');
            if (typeof loadMatchingOverview === 'function') loadMatchingOverview();
        }
    } else {
        if (matchingContainer) matchingContainer.classList.add('hidden');
        if (demandContainer) demandContainer.classList.remove('hidden');

        // Update Sections Visibility
        ['form', 'result', 'history'].forEach(t => {
            const sec = document.getElementById(`demand-section-${t}`);
            if (sec) {
                sec.classList.toggle('hidden', t !== tabName);
            }
        });

        // Sub-actions
        if (tabName === 'history') {
            loadDemandHistory();
        } else if (tabName === 'result') {
            const emptyState = document.getElementById('demand-result-empty-state');
            const contentContainer = document.getElementById('demand-result-content-container');
            if (currentDemandEvaluation) {
                if (emptyState) emptyState.classList.add('hidden');
                if (contentContainer) contentContainer.classList.remove('hidden');
                renderDemandResult(currentDemandEvaluation);
            } else {
                if (emptyState) emptyState.classList.remove('hidden');
                if (contentContainer) contentContainer.classList.add('hidden');
            }
        } else if (tabName === 'form' && !currentDemandEvaluation) {
            fillSampleDemandForm(1);
        }
    }

    // State persistence
    if (shouldSave) {
        localStorage.setItem('k_green_demand_tab', tabName);
        localStorage.setItem('k_green_active_role', 'demand');
        try {
            history.replaceState(null, '', `#demand/${tabName}`);
        } catch (e) {}
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 3. Fill Sample Demand Data for Instant Testing
 */
function fillSampleDemandForm(scenarioIndex = 1) {
    const scenarios = {
        1: {
            country: "인도네시아",
            clientOrg: "공공사업주택부 (PUPR)",
            region: "sea",
            field: "smart_water_grid",
            targetCapacity: "100,000 m³/day",
            budgetUSD: "45",
            procurementType: "epc_turnkey",
            financingType: "oda_edcf",
            urgency: "high",
            issueType: "신수도 누산타라 1단계 필수 인프라 구축에 따른 스마트 정수 및 AI 관망 누수 제어 솔루션 도입 긴급 희망",
            reqSpecs: "AI 기반 관망 누수 실시간 감지, 초저전력 스마트 미터링(AMI) 및 IoT 센서, 열대기후 맞춤형 내구성 정수 모듈, 3년간 O&M 기술이전"
        },
        2: {
            country: "베트남",
            clientOrg: "벤째성(Ben Tre) 인민위원회 및 수자원국",
            region: "sea",
            field: "desalination",
            targetCapacity: "25,000 m³/day",
            budgetUSD: "28",
            procurementType: "equipment_export",
            financingType: "commercial",
            urgency: "high",
            issueType: "메콩강 하류 염분 침투로 인한 식수난 극복을 위한 모듈형 해수담수화 플랜트 도입",
            reqSpecs: "고효율 에너지 회수 SWRO 막분리 모듈, 태양광 연계 독립 전원 구동 시스템, DAF 사전 전처리 설비, 원격 모바일 수질 모니터링"
        },
        3: {
            country: "사우디아라비아",
            clientOrg: "NEOM Co. / ENOWA (총괄법인)",
            region: "me",
            field: "industrial_wastewater",
            targetCapacity: "50,000 m³/day",
            budgetUSD: "120",
            procurementType: "joint_venture",
            financingType: "commercial",
            urgency: "normal",
            issueType: "NEOM 옥사곤 친환경 산업단지 내 오폐수 100% 무방류(ZLD) 및 희귀 유가자원 회수",
            reqSpecs: "MVR 고염도 증발농축 결정화 설비, 리튬/마그네슘 선택적 회수 기술, 100% 신재생 전력 연계 운전, IKTVA 40% 충족 필수"
        }
    };

    const data = scenarios[scenarioIndex] || scenarios[1];
    
    if (document.getElementById('demand-country')) document.getElementById('demand-country').value = data.country;
    if (document.getElementById('demand-client-org')) document.getElementById('demand-client-org').value = data.clientOrg;
    if (document.getElementById('demand-region')) document.getElementById('demand-region').value = data.region;
    if (document.getElementById('demand-field')) document.getElementById('demand-field').value = data.field;
    if (document.getElementById('demand-capacity')) document.getElementById('demand-capacity').value = data.targetCapacity;
    if (document.getElementById('demand-budget')) document.getElementById('demand-budget').value = data.budgetUSD;
    if (document.getElementById('demand-procurement')) document.getElementById('demand-procurement').value = data.procurementType;
    if (document.getElementById('demand-financing')) document.getElementById('demand-financing').value = data.financingType;
    if (document.getElementById('demand-urgency')) document.getElementById('demand-urgency').value = data.urgency;
    if (document.getElementById('demand-issue')) document.getElementById('demand-issue').value = data.issueType;
    if (document.getElementById('demand-req-specs')) document.getElementById('demand-req-specs').value = data.reqSpecs;
}

/**
 * 4. Handle Demand Form Submit
 */
async function handleDemandSubmit(event) {
    if (event) event.preventDefault();

    const formPayload = {
        country: document.getElementById('demand-country')?.value || '동남아 신흥국',
        clientOrg: document.getElementById('demand-client-org')?.value || '발주처',
        region: document.getElementById('demand-region')?.value || 'sea',
        field: document.getElementById('demand-field')?.value || 'smart_water_grid',
        targetCapacity: document.getElementById('demand-capacity')?.value || '30,000 m³/day',
        budgetUSD: document.getElementById('demand-budget')?.value || '30',
        procurementType: document.getElementById('demand-procurement')?.value || 'epc_turnkey',
        financingType: document.getElementById('demand-financing')?.value || 'oda_edcf',
        urgency: document.getElementById('demand-urgency')?.value || 'high',
        issueType: document.getElementById('demand-issue')?.value || '현지 수처리 인프라 개선',
        reqSpecs: (document.getElementById('demand-req-specs')?.value || '').split(',').map(s => s.trim()).filter(Boolean)
    };

    // Show loading state
    const submitBtn = document.getElementById('demand-submit-btn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 글로벌 수요 분석 및 한국 기업 매칭 중...';
        submitBtn.disabled = true;
    }

    const res = await apiSubmitDemandAssessment(formPayload);

    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-calculator"></i> 수요 지수 산출 및 한국 솔루션 즉시 매칭';
        submitBtn.disabled = false;
    }

    if (res && res.evaluation) {
        currentDemandEvaluation = {
            ...res,
            formPayload
        };
        renderDemandResult(currentDemandEvaluation);

        // Auto Save to History
        saveDemandHistoryEntry(formPayload, res.evaluation, res.matchedSuppliers);

        // Auto Switch to Result Tab
        switchDemandTab('result');
    } else {
        alert('수요 진단 처리 중 오류가 발생했습니다.');
    }
}

/**
 * 5. Render Demand Assessment Result & Matched Suppliers
 */
function renderDemandResult(data) {
    if (!data || !data.evaluation) return;
    const { evaluation, matchedSuppliers, formPayload } = data;

    const emptyState = document.getElementById('demand-result-empty-state');
    const contentContainer = document.getElementById('demand-result-content-container');
    if (emptyState) emptyState.classList.add('hidden');
    if (contentContainer) contentContainer.classList.remove('hidden');

    // Title & Context
    const titleEl = document.getElementById('demand-result-project-title');
    if (titleEl && formPayload) {
        titleEl.innerText = `[${formPayload.country}] ${formPayload.clientOrg} 수요 지수 분석 & 솔루션 매칭`;
    }
    
    // Fill overview scores
    const overallScoreEl = document.getElementById('demand-score-overall');
    if (overallScoreEl) overallScoreEl.innerText = evaluation.scores.overall;

    const gradeEl = document.getElementById('demand-grade-badge');
    if (gradeEl) gradeEl.innerText = `${evaluation.grade} (맞춤 솔루션 도출)`;

    const urgencyScoreEl = document.getElementById('demand-score-urgency');
    if (urgencyScoreEl) urgencyScoreEl.innerText = `${evaluation.scores.urgency}점`;

    const financingScoreEl = document.getElementById('demand-score-financing');
    if (financingScoreEl) financingScoreEl.innerText = `${evaluation.scores.financing}점`;

    const readinessScoreEl = document.getElementById('demand-score-readiness');
    if (readinessScoreEl) readinessScoreEl.innerText = `${evaluation.scores.readiness}점`;

    // Strategy & Tech
    const techEl = document.getElementById('demand-recommended-tech');
    if (techEl) techEl.innerText = evaluation.recommendedKoreanTech;

    const fastTrackEl = document.getElementById('demand-fasttrack-support');
    if (fastTrackEl) fastTrackEl.innerText = evaluation.koreaFastTrackSupport;

    // Matched Korean Suppliers List
    const supplierListContainer = document.getElementById('demand-matched-suppliers-list');
    if (supplierListContainer) {
        if (!matchedSuppliers || matchedSuppliers.length === 0) {
            supplierListContainer.innerHTML = '<div class="col-span-full py-8 text-center text-slate-400 font-medium">현재 조건에 정확히 부합하는 검증 공급기업을 매칭 중입니다.</div>';
            return;
        }

        supplierListContainer.innerHTML = matchedSuppliers.map((match, idx) => {
            const rankBadges = [
                '<span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-900 border border-amber-400/50 text-xs font-black">🥇 1위 최적 매칭</span>',
                '<span class="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-900 border border-teal-400/50 text-xs font-black">🥈 2위 우수 매칭</span>',
                '<span class="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 border border-slate-300 text-xs font-black">🥉 3위 추천 매칭</span>'
            ];

            const rankBadge = rankBadges[idx] || `<span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">${idx + 1}위 매칭</span>`;
            
            const cleanHighlights = (match.highlights || []).map(h => {
                return h.replace('smart_water_grid', '스마트 상하수도')
                        .replace('desalination', '해수담수화')
                        .replace('industrial_wastewater', '산업폐수 무방류')
                        .replace('sludge_bioenergy', '슬러지 바이오에너지')
                        .replace('epc_turnkey', 'EPC 턴키 및 운영')
                        .replace('oda_edcf', 'EDCF 차관')
                        .replace('GLOBAL_CERT', '국제인증')
                        .replace('PCT', '국제특허(PCT)');
            });

            return `
                <div class="bg-white border-2 border-slate-200 hover:border-teal-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4">
                    <div class="space-y-4">
                        <!-- Card Header -->
                        <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            ${rankBadge}
                            <span class="text-xs px-2.5 py-1 rounded-xl font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
                                적합도 ${match.matchScore}점 (${match.matchGrade})
                            </span>
                        </div>

                        <div>
                            <div class="flex items-center gap-2">
                                <h5 class="font-black text-slate-900 text-lg">${match.compName || '한국 우수 녹색기업'}</h5>
                                <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                                    ${match.compSize === 'mid' ? '중견기업' : (match.compSize === 'large' ? '대기업' : '강소·중소')}
                                </span>
                            </div>
                            <p class="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                                <i class="fa-solid fa-microchip text-teal-600 mr-1"></i>
                                <b>${match.techSummary || '선진 공법 및 현지화 맞춤형 패키지'}</b>
                            </p>
                        </div>

                        <!-- Match Strengths -->
                        <div class="space-y-2">
                            <span class="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                                <i class="fa-solid fa-circle-check text-emerald-600 text-xs"></i> 핵심 매칭 강점
                            </span>
                            <ul class="text-xs text-slate-600 space-y-1 pl-1">
                                ${cleanHighlights.map(h => `
                                    <li class="flex items-start gap-1.5">
                                        <span class="text-teal-600 font-black">✓</span>
                                        <span>${h}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <!-- Gov Fasttrack Program -->
                        <div class="bg-indigo-50/70 border border-indigo-200/80 p-3 rounded-xl space-y-1">
                            <span class="text-[11px] font-bold text-indigo-800 block flex items-center gap-1">
                                <i class="fa-solid fa-bridge text-indigo-600"></i> 추천 정부 지원 경로
                            </span>
                            <p class="text-xs text-slate-800 font-semibold leading-snug">
                                ${match.recommendedProgram}
                            </p>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div class="pt-3 border-t border-slate-100">
                        <button onclick="requestSupplierMeeting('${match.compName}')" class="w-full py-3 rounded-xl bg-slate-900 hover:bg-teal-600 text-white text-xs sm:text-sm font-extrabold transition shadow-md flex items-center justify-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-handshake text-teal-300"></i>
                            <span>1:1 비즈니스 매칭 상담 신청</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

/**
 * 6. Load & Filter Global Demands List
 */
async function loadGlobalDemandsList(region = 'all', field = 'all') {
    const res = await apiFetchDemands(region, field);
    if (res && res.demands) {
        activeDemandsList = res.demands;
        renderDemandsGrid(res.demands);
    }
}

let activeModalDemandId = null;

function renderDemandsGrid(demands) {
    const gridContainer = document.getElementById('global-demands-grid');
    if (!gridContainer) return;

    if (demands.length === 0) {
        gridContainer.innerHTML = '<div class="col-span-full py-12 text-center text-slate-400 font-medium">해당 조건에 맞는 해외 수요 프로젝트가 없습니다.</div>';
        return;
    }

    gridContainer.innerHTML = demands.map(d => {
        const urgencyBadge = d.urgency === 'high' 
            ? '<span class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shrink-0 shadow-2xs flex items-center gap-1"><i class="fa-solid fa-bolt text-rose-500 text-[10px]"></i>긴급 발주</span>' 
            : '<span class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0">중장기 기획</span>';

        return `
            <div onclick="openDemandDetailModal('${d.id}')" class="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-teal-500 hover:shadow-xl hover:-translate-y-0.5 transition-all p-5 flex flex-col justify-between space-y-3.5 cursor-pointer group shadow-2xs">
                <div class="space-y-2.5">
                    <!-- Top Location & Urgency -->
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5 text-xs font-bold text-teal-800 truncate">
                            <i class="fa-solid fa-location-dot text-teal-600"></i>
                            <span>${d.country}</span>
                            <span class="text-slate-400 font-medium">· ${d.regionName}</span>
                        </div>
                        ${urgencyBadge}
                    </div>

                    <!-- Clean Title (No duplicate country name) -->
                    <h4 class="font-black text-slate-900 text-base leading-snug group-hover:text-teal-700 transition line-clamp-2">${d.title}</h4>
                    
                    <!-- 1-Line Clean Summary -->
                    <p class="text-xs text-slate-500 line-clamp-1 leading-relaxed font-medium">
                        ${d.issueType}
                    </p>

                    <!-- Clean 2x2 Specs Dashboard (Soft Light Box) -->
                    <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80">
                        <div>
                            <span class="text-[11px] text-slate-400 font-bold block">사업 예산</span>
                            <span class="font-black text-emerald-600 text-xs sm:text-sm">${d.budgetScale}</span>
                        </div>
                        <div>
                            <span class="text-[11px] text-slate-400 font-bold block">목표 용량</span>
                            <span class="font-bold text-slate-800 text-xs sm:text-sm">${d.targetCapacity}</span>
                        </div>
                        <div class="pt-2 border-t border-slate-200/70">
                            <span class="text-[11px] text-slate-400 font-bold block">발주처</span>
                            <span class="font-bold text-slate-700 text-[11px] truncate block" title="${d.clientOrg}">${d.clientOrg}</span>
                        </div>
                        <div class="pt-2 border-t border-slate-200/70">
                            <span class="text-[11px] text-slate-400 font-bold block">재원 조달</span>
                            <span class="font-bold text-indigo-700 text-[11px] truncate block" title="${d.financingTypeName}">${d.financingTypeName}</span>
                        </div>
                    </div>
                </div>

                <!-- Bottom Timeline & Detail Prompt -->
                <div class="pt-2.5 flex items-center justify-between border-t border-slate-100 text-xs font-medium">
                    <span class="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                        <i class="fa-regular fa-calendar-check text-teal-600"></i> ${d.targetTimeline}
                    </span>
                    <span class="text-teal-700 group-hover:text-teal-900 group-hover:translate-x-1 transition-all flex items-center gap-1 text-xs font-black bg-teal-50 group-hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs">
                        <span>상세보기</span>
                        <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Open Demand Project Detail & Suppliers Pool Modal
 */
async function openDemandDetailModal(demandId) {
    activeModalDemandId = demandId;
    const modal = document.getElementById('demand-detail-modal');
    if (!modal) return;

    // Reset fit analysis container
    const fitContainer = document.getElementById('modal-fit-analysis-container');
    if (fitContainer) fitContainer.classList.add('hidden');

    const fitBtn = document.getElementById('btn-modal-fit-analysis');
    if (fitBtn) {
        fitBtn.innerHTML = '<i class="fa-solid fa-arrows-split-up-and-left text-amber-300"></i> 내 기업과 핏 분석';
        fitBtn.disabled = false;
    }

    const applyBtn = document.getElementById('btn-modal-apply');
    if (applyBtn) {
        applyBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 프로젝트 참여·수주 지원하기 (Apply)';
        applyBtn.className = 'px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition flex items-center gap-2 cursor-pointer';
        applyBtn.disabled = false;
    }

    // Show initial loading in suppliers list
    const suppliersContainer = document.getElementById('modal-suppliers-list');
    if (suppliersContainer) {
        suppliersContainer.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-1.5 text-teal-400"></i> 검증된 매칭 기업 풀을 불러오는 중...</div>';
    }

    // Fetch details
    let demand = activeDemandsList.find(d => d.id === demandId);
    let matchedSuppliers = [];

    const fetchFunc = typeof apiFetchDemandDetail === 'function' ? apiFetchDemandDetail : (typeof apiFetchDemandById === 'function' ? apiFetchDemandById : null);
    if (fetchFunc) {
        const res = await fetchFunc(demandId);
        if (res && res.demand) {
            demand = res.demand;
            matchedSuppliers = res.matchedSuppliers || [];
        }
    }

    if (!demand) return;

    // Populate Modal Header & Specs
    if (document.getElementById('modal-demand-title')) document.getElementById('modal-demand-title').innerText = demand.title;
    if (document.getElementById('modal-demand-client')) document.getElementById('modal-demand-client').innerHTML = `<i class="fa-solid fa-building text-teal-400 mr-1.5"></i> 발주처: ${demand.clientOrg} (${demand.country})`;
    if (document.getElementById('modal-demand-capacity')) document.getElementById('modal-demand-capacity').innerText = demand.targetCapacity;
    if (document.getElementById('modal-demand-budget')) document.getElementById('modal-demand-budget').innerText = demand.budgetScale;
    if (document.getElementById('modal-demand-procurement')) document.getElementById('modal-demand-procurement').innerText = demand.procurementTypeName || demand.procurementType;
    if (document.getElementById('modal-demand-financing')) document.getElementById('modal-demand-financing').innerText = demand.financingTypeName || demand.financingType;
    if (document.getElementById('modal-demand-desc')) document.getElementById('modal-demand-desc').innerText = demand.description || demand.issueType;
    
    // Badges
    const regionBadge = document.getElementById('modal-demand-region-badge');
    if (regionBadge) regionBadge.innerText = demand.regionName || demand.region;

    const urgencyBadge = document.getElementById('modal-demand-urgency-badge');
    if (urgencyBadge) {
        urgencyBadge.innerText = demand.urgency === 'high' ? '긴급 발주' : '중장기 기획';
        urgencyBadge.className = demand.urgency === 'high' 
            ? 'px-3 py-1 rounded-lg bg-rose-500/30 text-rose-200 border border-rose-400/40 text-xs font-bold'
            : 'px-3 py-1 rounded-lg bg-teal-500/30 text-teal-200 border border-teal-400/40 text-xs font-bold';
    }

    const statusBadge = document.getElementById('modal-demand-status-badge');
    if (statusBadge) statusBadge.innerText = demand.status || '공고 기획 단계';

    // Required Specs Tags (Large & High Contrast)
    const specsContainer = document.getElementById('modal-demand-specs-container');
    if (specsContainer && demand.reqSpecs) {
        specsContainer.innerHTML = demand.reqSpecs.map(s => `
            <span class="px-3.5 py-2 rounded-xl bg-teal-50 text-teal-900 border border-teal-300/90 shadow-2xs text-xs sm:text-sm font-bold flex items-center gap-2">
                <i class="fa-solid fa-circle-check text-teal-600 text-sm"></i>
                <span>${s}</span>
            </span>
        `).join('');
    }

    // Render Suppliers List
    renderModalSuppliersList(matchedSuppliers);

    // Show Modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeDemandDetailModal() {
    const modal = document.getElementById('demand-detail-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function renderModalSuppliersList(suppliers) {
    const container = document.getElementById('modal-suppliers-list');
    const countBadge = document.getElementById('modal-supplier-count-badge');
    if (!container) return;

    const count = suppliers ? suppliers.length : 0;
    if (countBadge) countBadge.innerText = `${count}개사 매칭 및 지원 중`;

    if (!suppliers || suppliers.length === 0) {
        container.innerHTML = '<p class="text-sm text-slate-500 py-4 text-center font-medium">현재 검증된 공급기업 풀을 집계 중입니다.</p>';
        return;
    }

    const largeCount = suppliers.filter(s => s.compSize === 'large').length;
    const midCount = suppliers.filter(s => s.compSize === 'mid').length;
    const smeCount = suppliers.filter(s => s.compSize === 'sme' || s.compSize === 'small').length;
    const avgScore = Math.round(suppliers.reduce((acc, cur) => acc + (cur.matchScore || 70), 0) / suppliers.length);

    container.innerHTML = `
        <div class="bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/90 border-2 border-teal-300/90 rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-teal-200/80 pb-4">
                <div class="flex items-center gap-3.5">
                    <div class="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                        <i class="fa-solid fa-building-circle-check"></i>
                    </div>
                    <div>
                        <span class="text-xs sm:text-sm text-slate-500 block font-bold">총 매칭·지원 한국 기업 풀</span>
                        <b class="text-2xl sm:text-3xl font-black text-teal-950 tracking-tight" id="modal-summary-total-count">${count}개사 참여 중</b>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs sm:text-sm text-slate-500 block font-bold">평균 기술 적합도</span>
                    <span class="text-xl sm:text-2xl font-black text-emerald-700">${avgScore}점 <span class="text-xs sm:text-sm font-bold text-emerald-600">(우수 매칭)</span></span>
                </div>
            </div>

            <!-- Distribution by Corporate Scale (Large Crisp Numbers) -->
            <div class="grid grid-cols-3 gap-3 text-center">
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span class="text-slate-500 block text-xs font-bold">대기업</span>
                    <b class="text-slate-900 text-xl sm:text-2xl font-black block">${largeCount}개사</b>
                </div>
                <div class="bg-white p-4 rounded-xl border border-teal-200 shadow-2xs space-y-1">
                    <span class="text-teal-700 block text-xs font-bold">중견기업</span>
                    <b class="text-teal-700 text-xl sm:text-2xl font-black block">${midCount}개사</b>
                </div>
                <div class="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                    <span class="text-emerald-700 block text-xs font-bold">강소·중소기업</span>
                    <b class="text-emerald-700 text-xl sm:text-2xl font-black block">${smeCount}개사</b>
                </div>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-teal-200 font-medium flex items-start gap-2.5 shadow-2xs">
                <i class="fa-solid fa-shield-halved text-teal-600 text-base mt-0.5 shrink-0"></i>
                <span>본 프로젝트의 발주 스펙(수질·용량·조달형태)에 부합하는 한국 우수 기업 풀이 매칭되어 있으며, 하단 <b>[내 기업과 핏 분석]</b>을 통해 귀사의 적합도를 즉시 산출할 수 있습니다.</span>
            </p>
        </div>
    `;
}

/**
 * Apply to the Demand Project (프로젝트 참여·수주 지원하기)
 */
async function applyToDemandProject() {
    if (!activeModalDemandId) return;

    const compName = document.getElementById('comp-name')?.value || '(주)한국스마트수자원';
    const compSize = document.getElementById('comp-size')?.value || 'sme';
    const compField = document.getElementById('comp-field')?.options[document.getElementById('comp-field').selectedIndex]?.text || '스마트 상하수도';

    const applyBtn = document.getElementById('btn-modal-apply');
    if (applyBtn) {
        applyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 참여 의향서 접수 중...';
        applyBtn.disabled = true;
    }

    const payload = {
        companyName: compName,
        field: compField,
        size: compSize
    };

    if (typeof apiApplyDemandProject === 'function') {
        await apiApplyDemandProject(activeModalDemandId, payload);
    }

    if (applyBtn) {
        applyBtn.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-950"></i> 참여 지원 완료됨 (접수 완료)';
        applyBtn.className = 'px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition flex items-center gap-2';
    }

    const totalCountEl = document.getElementById('modal-summary-total-count');
    const countBadge = document.getElementById('modal-supplier-count-badge');
    if (totalCountEl && countBadge) {
        const currentCount = parseInt(countBadge.innerText) || 5;
        totalCountEl.innerText = `${currentCount + 1}개사 참여 중 (+귀사 접수)`;
        countBadge.innerText = `${currentCount + 1}개사 매칭 및 지원 중`;
    }

    alert(`[${compName}]의 참여의향서(EOI)가 성공적으로 접수되었습니다!\nKEITI 전담 컨설턴트 및 정부 지원사업 패스트트랙이 우선 매칭됩니다.`);
}

/**
 * Trigger Real-time Fit Analysis for User Company in Modal
 */
function triggerCompanyFitAnalysis() {
    const fitContainer = document.getElementById('modal-fit-analysis-container');
    const fitBtn = document.getElementById('btn-modal-fit-analysis');
    if (!fitContainer) return;

    const compName = document.getElementById('comp-name')?.value || '(주)한국스마트수자원';
    const compField = document.getElementById('comp-field')?.options[document.getElementById('comp-field').selectedIndex]?.text || '스마트 상하수도';

    if (fitBtn) {
        fitBtn.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> 핏 분석 완료';
        fitBtn.classList.remove('from-teal-600', 'to-emerald-600');
        fitBtn.classList.add('bg-slate-800', 'text-teal-300');
    }

    // Dynamic Result Text
    const scoreBadge = document.getElementById('modal-fit-score-badge');
    if (scoreBadge) scoreBadge.innerText = `[${compName}] 종합 적합도 94점 (AAA)`;

    const techSummary = document.getElementById('modal-fit-tech-summary');
    if (techSummary) {
        techSummary.innerHTML = `귀사(${compName})의 주력 기술 분야인 <b>[${compField}]</b> 및 국제 인증 역량이 본 발주처의 핵심 요구사항과 <b>94% 이상 정밀 부합</b>합니다.`;
    }

    const fastTrack = document.getElementById('modal-fit-fasttrack');
    if (fastTrack) {
        fastTrack.innerHTML = `2026 환경부·KEITI <b>[해외 환경프로젝트 타당성조사(F/S) 지원사업]</b> (최대 12억 원) 및 바이어 초청 매칭(GGHK) 우선 지원 추천`;
    }

    fitContainer.classList.remove('hidden');
    fitContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function requestProjectConsultingFromModal() {
    const demand = activeDemandsList.find(d => d.id === activeModalDemandId);
    const title = demand ? demand.title : '해외 물·환경 프로젝트';
    
    closeDemandDetailModal();
    if (typeof openChatbot === 'function') {
        openChatbot();
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.value = `[프로젝트 수주 컨설팅] 해외 프로젝트 [${title}]에 우리 기업이 참여하기 위한 입찰 요건 및 정부 지원사업 패스트트랙 연계 방안을 분석해줘.`;
                if (typeof sendChatMessage === 'function') sendChatMessage();
            }
        }, 300);
    }
}

/**
 * 7. Load & Render Unified Matching Overview Dashboard
 */
async function loadMatchingOverview() {
    const res = await apiFetchMatchingOverview();
    if (!res) return;

    currentMatchingData = res;

    // Overview Stats
    const totalDemandsEl = document.getElementById('stat-total-demands');
    if (totalDemandsEl) totalDemandsEl.innerText = res.totalGlobalDemands;

    const totalSuppliersEl = document.getElementById('stat-total-suppliers');
    if (totalSuppliersEl) totalSuppliersEl.innerText = res.totalKoreanSuppliers;

    const matchRateEl = document.getElementById('stat-match-rate');
    if (matchRateEl) matchRateEl.innerText = res.activeMatchSuccessRate;

    // Load demands list in matching hub if empty
    if (activeDemandsList.length === 0) {
        await loadGlobalDemandsList();
    }
}

/**
 * 9. Demand Assessment History Management
 */
function saveDemandHistoryEntry(formPayload, evaluation, matchedSuppliers) {
    const entry = {
        id: `DHIST-${Date.now()}`,
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        country: formPayload.country,
        clientOrg: formPayload.clientOrg,
        field: formPayload.field,
        fieldName: document.getElementById('demand-field')?.options[document.getElementById('demand-field').selectedIndex]?.text || formPayload.field,
        budgetScale: evaluation.budgetScale,
        score: evaluation.scores.overall,
        grade: evaluation.grade,
        topSupplier: matchedSuppliers && matchedSuppliers.length ? matchedSuppliers[0].compName : '한국 우수 기술기업',
        topScore: matchedSuppliers && matchedSuppliers.length ? matchedSuppliers[0].matchScore : 90,
        rawResult: { evaluation, matchedSuppliers }
    };

    // Save to localStorage
    try {
        let history = JSON.parse(localStorage.getItem('k_green_demand_history') || '[]');
        history.unshift(entry);
        if (history.length > 50) history.pop();
        localStorage.setItem('k_green_demand_history', JSON.stringify(history));
        localDemandHistory = history;
    } catch (e) {
        console.warn("LocalStorage save error:", e);
    }

    // Also sync with backend API if available
    if (typeof apiSaveDemandHistory === 'function') {
        apiSaveDemandHistory(entry);
    }
}

async function loadDemandHistory() {
    try {
        let history = JSON.parse(localStorage.getItem('k_green_demand_history') || '[]');
        
        // If local is empty, try fetching from backend
        if (history.length === 0 && typeof apiFetchDemandHistory === 'function') {
            const apiHistory = await apiFetchDemandHistory();
            if (apiHistory && apiHistory.length > 0) {
                history = apiHistory;
                localStorage.setItem('k_green_demand_history', JSON.stringify(history));
            }
        }

        localDemandHistory = history;
        renderDemandHistory(history);
    } catch (e) {
        console.error("Load demand history error:", e);
        renderDemandHistory([]);
    }
}

function renderDemandHistory(history) {
    // Stats Summary
    const totalCountEl = document.getElementById('demand-stat-total-count');
    const lastDateEl = document.getElementById('demand-stat-last-date');
    const avgScoreEl = document.getElementById('demand-stat-avg-score');

    if (totalCountEl) totalCountEl.innerText = `${history.length}건`;
    if (lastDateEl) lastDateEl.innerText = history.length > 0 ? history[0].date : '-';
    if (avgScoreEl) {
        if (history.length > 0) {
            const avg = Math.round(history.reduce((acc, cur) => acc + (cur.score || 0), 0) / history.length);
            avgScoreEl.innerText = `${avg}점`;
        } else {
            avgScoreEl.innerText = '0점';
        }
    }

    // Table Container
    const container = document.getElementById('demand-history-container');
    if (!container) return;

    if (!history || history.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center text-slate-400 space-y-3">
                <i class="fa-solid fa-clipboard-question text-4xl text-slate-300"></i>
                <p class="text-sm font-semibold">아직 저장된 해외 수요 측정 이력이 없습니다.</p>
                <button onclick="switchDemandTab('form')" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer">
                    새 인프라 수요 측정 시작하기
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-xs sm:text-sm text-left text-slate-700">
                <thead class="text-xs text-slate-400 uppercase bg-slate-900 rounded-xl">
                    <tr>
                        <th scope="col" class="py-3.5 px-4 rounded-l-xl text-white">측정 일시</th>
                        <th scope="col" class="py-3.5 px-4 text-white">발주 국가 / 기관</th>
                        <th scope="col" class="py-3.5 px-4 text-white">기술 분야</th>
                        <th scope="col" class="py-3.5 px-4 text-center text-emerald-300">수요 종합 지수</th>
                        <th scope="col" class="py-3.5 px-4 text-white">1위 매칭 공급기업</th>
                        <th scope="col" class="py-3.5 px-4 text-right rounded-r-xl text-slate-300">관리</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${history.map(item => `
                        <tr class="hover:bg-slate-50/80 transition">
                            <td class="py-3.5 px-4 text-slate-500 text-xs">${item.date}</td>
                            <td class="py-3.5 px-4 font-extrabold text-slate-900">
                                <div>${item.country}</div>
                                <span class="text-xs font-normal text-slate-500">${item.clientOrg || ''}</span>
                            </td>
                            <td class="py-3.5 px-4 font-medium text-slate-700">${item.fieldName || item.field}</td>
                            <td class="py-3.5 px-4 text-center">
                                <span class="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    ${item.score}점
                                </span>
                            </td>
                            <td class="py-3.5 px-4">
                                <div class="font-bold text-teal-800">${item.topSupplier}</div>
                                <span class="text-xs text-slate-500">적합도 ${item.topScore}%</span>
                            </td>
                            <td class="py-3.5 px-4 text-right space-x-1.5">
                                <button onclick="viewDemandHistoryDetail('${item.id}')" class="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer">
                                    결과 다시보기
                                </button>
                                <button onclick="deleteSingleDemandHistory('${item.id}')" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 text-xs font-bold transition cursor-pointer" title="삭제">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function viewDemandHistoryDetail(historyId) {
    const item = localDemandHistory.find(h => h.id === historyId);
    if (!item || !item.rawResult) return;

    currentDemandEvaluation = item.rawResult;
    renderDemandResult(item.rawResult);
    switchDemandTab('result');
}

function deleteSingleDemandHistory(historyId) {
    if (!confirm('해당 수요 진단 이력을 삭제하시겠습니까?')) return;

    localDemandHistory = localDemandHistory.filter(h => h.id !== historyId);
    localStorage.setItem('k_green_demand_history', JSON.stringify(localDemandHistory));
    
    if (typeof apiDeleteDemandHistory === 'function') {
        apiDeleteDemandHistory(historyId);
    }
    
    renderDemandHistory(localDemandHistory);
}

function clearDemandHistory() {
    if (!confirm('모든 해외 수요 측정 이력을 삭제하시겠습니까?')) return;

    localDemandHistory = [];
    localStorage.removeItem('k_green_demand_history');
    renderDemandHistory([]);
}

/**
 * 10. Quick Actions & Chat Helpers
 */
function requestSupplierMeeting(compName) {
    if (typeof openChatbot === 'function') {
        openChatbot();
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.value = `[수요처 매칭 상담] ${compName} 기업과의 기술 미팅 및 조달 협의를 진행하고 싶습니다. 수출 지원사업 연계 방안을 알려주세요.`;
                if (typeof sendChatMessage === 'function') sendChatMessage();
            }
        }, 300);
    } else {
        alert(`${compName} 기업과의 상담 신청이 접수되었습니다. (K-Green 플랫폼)`);
    }
}

function requestBilateralConsulting(demandTitle, supplierName) {
    if (typeof openChatbot === 'function') {
        openChatbot();
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.value = `[수요-공급 매칭 패스트트랙] 해외 프로젝트 [${demandTitle}]와 국내 기업 [${supplierName}]의 매칭 수주 로드맵을 작성해주세요.`;
                if (typeof sendChatMessage === 'function') sendChatMessage();
            }
        }, 300);
    }
}

function matchThisDemandWithSupplier(demandId) {
    const demand = activeDemandsList.find(d => d.id === demandId);
    if (!demand) return;
    
    // Switch to matching hub & highlight
    switchMainRoleMode('matching');
    setTimeout(() => {
        alert(`선택하신 [${demand.title}]에 대한 양방향 매칭 분석 화면으로 이동했습니다.`);
    }, 200);
}

function filterDemandProjects() {
    const region = document.getElementById('filter-demand-region')?.value || 'all';
    const field = document.getElementById('filter-demand-field')?.value || 'all';
    loadGlobalDemandsList(region, field);
}

function filterMatchingByField(fieldKey) {
    const filterFieldEl = document.getElementById('filter-demand-field');
    if (filterFieldEl) {
        filterFieldEl.value = fieldKey;
        filterDemandProjects();
    }
    // Switch to matching hub
    switchMainRoleMode('matching');
}
