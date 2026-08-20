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
 * Fetch 8-Program Directory from Backend
 */
async function apiFetchPrograms(stageFilter = 'all', searchQuery = '') {
    try {
        const url = new URL(`${API_BASE_URL}/programs`, window.location.origin);
        if (stageFilter && stageFilter !== 'all') url.searchParams.append('stage', stageFilter);
        if (searchQuery) url.searchParams.append('search', searchQuery);

        const response = await fetch(url.toString());
        const json = await response.json();
        return json.success ? json.data : [];
    } catch (err) {
        console.error("API fetch programs error:", err);
        return [];
    }
}

/**
 * Fetch Single Program Detail by ID
 */
async function apiFetchProgramDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/programs/${id}`);
        const json = await response.json();
        return json.success ? json.data : null;
    } catch (err) {
        console.error("API fetch program detail error:", err);
        return null;
    }
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
