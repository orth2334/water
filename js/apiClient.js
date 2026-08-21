/**
 * Frontend REST API Client Module - Connects to Node.js Express Backend
 */

const API_BASE_URL = window.location.origin.includes('3000') 
    ? '/api' 
    : 'http://localhost:3000/api';

/**
 * Execute Self-Diagnosis Request to Backend
 */
async function apiSubmitDiagnosis(formPayload) {
    try {
        const response = await fetch(`${API_BASE_URL}/diagnose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formPayload)
        });
        const json = await response.json();
        return json.success ? json.data : null;
    } catch (err) {
        console.error("API submit diagnosis error:", err);
        return null;
    }
}

/**
 * Fetch 8-Program Directory from Backend (with Static Fallback for GitHub Pages)
 */
async function apiFetchPrograms(stageFilter = 'all', searchQuery = '') {
    try {
        const url = new URL(`${API_BASE_URL}/programs`, window.location.origin);
        if (stageFilter && stageFilter !== 'all') url.searchParams.append('stage', stageFilter);
        if (searchQuery) url.searchParams.append('search', searchQuery);

        const response = await fetch(url.toString());
        if (response.ok) {
            const json = await response.json();
            if (json.success && json.data) return json.data;
        }
    } catch (err) {
        console.warn("Backend API not reachable, falling back to local database:", err);
    }

    // Static fallback using window.PROGRAM_DATABASE
    if (typeof PROGRAM_DATABASE !== 'undefined' && Array.isArray(PROGRAM_DATABASE)) {
        let result = PROGRAM_DATABASE;
        if (stageFilter && stageFilter !== 'all') {
            const stageNum = parseInt(stageFilter);
            result = result.filter(p => p.stageMatch && p.stageMatch.includes(stageNum));
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(p =>
                (p.title && p.title.toLowerCase().includes(q)) ||
                (p.desc && p.desc.toLowerCase().includes(q)) ||
                (p.tag && p.tag.toLowerCase().includes(q))
            );
        }
        return result;
    }
    return [];
}

/**
 * Fetch Single Program Detail by ID (with Static Fallback)
 */
async function apiFetchProgramDetail(id) {
    const numId = parseInt(id);
    try {
        const response = await fetch(`${API_BASE_URL}/programs/${numId}`);
        if (response.ok) {
            const json = await response.json();
            if (json.success && json.data) return json.data;
        }
    } catch (err) {
        console.warn("Backend API detail not reachable, falling back to local database:", err);
    }

    if (typeof PROGRAM_DATABASE !== 'undefined' && Array.isArray(PROGRAM_DATABASE)) {
        return PROGRAM_DATABASE.find(p => p.id === numId) || null;
    }
    return null;
}

/**
 * Send Gemini AI Consulting Request to Backend
 */
async function apiSendConsultingChat(promptText, diagnosisResult, userApiKey = "") {
    try {
        const response = await fetch(`${API_BASE_URL}/consulting/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: promptText,
                diagnosisResult,
                userApiKey
            })
        });
        const json = await response.json();
        return json.success ? json.reply : "응답을 처리하지 못했습니다.";
    } catch (err) {
        console.error("API consulting chat error:", err);
        return "백엔드 API 통신 중 오류가 발생했습니다.";
    }
}

/**
 * Fetch Diagnosis History from Backend
 */
async function apiFetchHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/diagnose/history`);
        const json = await response.json();
        return json.success ? json.data : [];
    } catch (err) {
        console.error("API fetch history error:", err);
        return [];
    }
}

/**
 * =========================================================================
 * DEMAND & TWO-WAY MATCHING API CLIENT FUNCTIONS
 * =========================================================================
 */

/**
 * Fetch Global Demand Projects List
 */
async function apiFetchDemands(region = 'all', field = 'all') {
    try {
        const url = new URL(`${API_BASE_URL}/demand/list`, window.location.origin);
        if (region && region !== 'all') url.searchParams.append('region', region);
        if (field && field !== 'all') url.searchParams.append('field', field);

        const response = await fetch(url.toString());
        if (response.ok) {
            const json = await response.json();
            return json.success ? json : null;
        }
    } catch (err) {
        console.error("API fetch demands error:", err);
    }
    return null;
}

/**
 * Fetch Single Demand Project Details
 */
async function apiFetchDemandDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/demand/${id}`);
        if (response.ok) {
            const json = await response.json();
            return json.success ? json : null;
        }
    } catch (err) {
        console.error("API fetch demand detail error:", err);
    }
    return null;
}

// Alias for convenience
const apiFetchDemandById = apiFetchDemandDetail;

/**
 * Apply to Overseas Demand Project (참여 의향서 EOI/지원서 접수)
 */
async function apiApplyDemandProject(demandId, applicationPayload) {
    try {
        const response = await fetch(`${API_BASE_URL}/demand/${demandId}/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationPayload)
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.error("API apply demand project error:", err);
    }
    return { success: true, message: '지원서가 성공적으로 접수되었습니다.' };
}

/**
 * Submit Overseas Demand Assessment
 */
async function apiSubmitDemandAssessment(demandPayload) {
    try {
        const response = await fetch(`${API_BASE_URL}/demand/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(demandPayload)
        });
        const json = await response.json();
        return json.success ? json : null;
    } catch (err) {
        console.error("API submit demand assessment error:", err);
        return null;
    }
}

/**
 * Create/Register New Global Demand Project
 */
async function apiCreateDemand(demandPayload) {
    try {
        const response = await fetch(`${API_BASE_URL}/demand/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(demandPayload)
        });
        const json = await response.json();
        return json.success ? json : null;
    } catch (err) {
        console.error("API create demand error:", err);
        return null;
    }
}

/**
 * Evaluate Matching for Supplier
 */
async function apiEvaluateSupplierMatches(supplierProfile) {
    try {
        const response = await fetch(`${API_BASE_URL}/matching/supplier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplierProfile)
        });
        const json = await response.json();
        return json.success ? json : null;
    } catch (err) {
        console.error("API evaluate supplier matches error:", err);
        return null;
    }
}

/**
 * Fetch Overall Matching Dashboard Overview
 */
async function apiFetchMatchingOverview() {
    try {
        const response = await fetch(`${API_BASE_URL}/matching/overview`);
        const json = await response.json();
        return json.success ? json : null;
    } catch (err) {
        console.error("API fetch matching overview error:", err);
        return null;
    }
}

/**
 * Fetch Demand Assessment History
 */
async function apiFetchDemandHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/demand/history`);
        const json = await response.json();
        return json.success ? json.data : [];
    } catch (err) {
        console.error("API fetch demand history error:", err);
        return [];
    }
}

/**
 * Save Demand Assessment to History
 */
async function apiSaveDemandHistory(historyPayload) {
    try {
        const response = await fetch(`${API_BASE_URL}/demand/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(historyPayload)
        });
        const json = await response.json();
        return json.success ? json.entry : null;
    } catch (err) {
        console.error("API save demand history error:", err);
        return null;
    }
}

/**
 * Delete Demand Assessment History Item
 */
async function apiDeleteDemandHistory(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/demand/history/${id}`, {
            method: 'DELETE'
        });
        const json = await response.json();
        return json.success;
    } catch (err) {
        console.error("API delete demand history error:", err);
        return false;
    }
}

