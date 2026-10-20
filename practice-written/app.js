const state = { Vlink: "", language: "en", history: [], scriptIndex: -1, requestInFlight: false };
const stage = document.querySelector(".stage"),
    text = document.getElementById("tutor-text"),
    input = document.getElementById("message"),
    status = document.getElementById("status"),
    suggestions = document.getElementById("suggestions"),
    composer = document.getElementById("composer"),
    historyPanel = document.getElementById("history-panel"),
    historyList = document.getElementById("history-list");
function key() { return `practice_written_history_${btoa(unescape(encodeURIComponent(state.Vlink))).slice(0, 80)}`; }
function save() {
    if (state.Vlink) localStorage.setItem(key(), JSON.stringify({ language: state.language, history: state.history, scriptIndex: state.scriptIndex }));
}
function cleanReply(message) { return String(message || "").replace(/\*\*/g, "").replace(/__/g, "").replace(/`/g, "").trim(); }
function showTutor(message) { text.textContent = cleanReply(message); }
function renderHistory() {
    historyList.innerHTML = "";
    state.history.forEach(item => {
        const entry = document.createElement("article"); entry.className = `history-entry ${item.role}`;
        const label = document.createElement("strong"); label.textContent = item.role === "tutor" ? "Tutor" : "You";
        const body = document.createElement("span"); body.textContent = cleanReply(item.text);
        entry.append(label, body); historyList.append(entry);
    });
    historyList.scrollTop = historyList.scrollHeight;
}
function add(role, message) {
    const cleanMessage = cleanReply(message); state.history.push({ role, text: cleanMessage }); save(); renderHistory();
    if (role === "tutor") showTutor(cleanMessage);
}
function setSuggestions(items = []) {
    suggestions.innerHTML = "";
    items.slice(0, 3).forEach(item => {
        const button = document.createElement("button"); button.type = "button"; button.textContent = item;
        button.onclick = () => { input.value = item; input.focus(); }; suggestions.append(button);
    });
}
async function loadPractice(vlink) {
    state.Vlink = String(vlink || "").trim();
    if (!state.Vlink) { showTutor("Your practice is loading. Please wait a moment."); return; }
    try {
        const stored = JSON.parse(localStorage.getItem(key()) || "{}");
        state.language = stored.language || "en"; state.history = Array.isArray(stored.history) ? stored.history : [];
        state.scriptIndex = Number.isInteger(stored.scriptIndex) ? stored.scriptIndex : -1; renderHistory();
        const response = await fetch("/practice/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Vlink: state.Vlink }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load practice.");
        setSuggestions(data.suggestions);
        if (state.scriptIndex < 0) state.scriptIndex = Number.isInteger(data.openingIndex) ? data.openingIndex : -1;
        const last = [...state.history].reverse().find(item => item.role === "tutor");
        if (last) showTutor(last.text); else add("tutor", data.opening);
        status.textContent = "";
    } catch (error) { showTutor("I cannot load this practice right now."); status.textContent = error.message; }
}
async function send(value) {
    const message = String(value || input.value).trim();
    if (!message) return;
    if (state.requestInFlight) { status.textContent = "Please wait for the tutor's reply."; return; }
    if (!state.Vlink) { status.textContent = "The activity link is still loading."; return; }
    add("student", message); input.value = ""; status.textContent = "Thinking…"; state.requestInFlight = true;
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 45000);
    try {
        const response = await fetch("/practice/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Vlink: state.Vlink, message, language: state.language, history: state.history.slice(-16), scriptIndex: state.scriptIndex }), signal: controller.signal });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to answer.");
        state.language = data.language || state.language;
        state.scriptIndex = Number.isInteger(data.scriptIndex) ? data.scriptIndex : state.scriptIndex;
        add("tutor", data.reply); status.textContent = "";
    } catch (error) { status.textContent = error.name === "AbortError" ? "The reply took too long. Please try again." : error.message; }
    finally { clearTimeout(timeout); state.requestInFlight = false; }
}
composer.addEventListener("submit", event => { event.preventDefault(); send(); });
input.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); send(); } });
document.getElementById("help").onclick = () => document.getElementById("help-dialog").showModal();
document.getElementById("close-help").onclick = () => document.getElementById("help-dialog").close();
document.getElementById("close-practice").onclick = () => window.parent.postMessage({ type: "CLOSE_THIRD_TUTOR" }, "*");
function receive(data) { const vlink = data?.Vlink || data?.vlink || data?.datos?.Vlink || data?.datos?.vlink; if (vlink) loadPractice(vlink); }
window.recibirDatosStoryline = receive; window.cargarVlink = loadPractice;
window.addEventListener("message", event => {
    if (event.data?.type === "practice-written-vlink" || event.data?.type === "STORYLINE_CONTEXT") receive(event.data);
});
function requestPracticeVlink() {
    const queryVlink = new URLSearchParams(location.search).get("Vlink");
    if (queryVlink) loadPractice(queryVlink);
    window.parent?.postMessage({ type: "PRACTICE_WRITTEN_READY" }, "*");
    try { const player = window.parent?.GetPlayer?.(), vlink = player?.GetVar?.("Vlink"); if (vlink) loadPractice(vlink); } catch {}
}
requestPracticeVlink();
setTimeout(requestPracticeVlink, 500);
setTimeout(requestPracticeVlink, 1500);

// Prevent common page zoom gestures and keyboard shortcuts from changing the layout.
document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && ["+", "=", "-", "_", "0"].includes(event.key)) {
        event.preventDefault();
    }
});
document.addEventListener("wheel", event => {
    if (event.ctrlKey) event.preventDefault();
}, { passive: false });
document.addEventListener("gesturestart", event => event.preventDefault(), { passive: false });
document.addEventListener("gesturechange", event => event.preventDefault(), { passive: false });
document.addEventListener("touchmove", event => {
    if (event.touches.length > 1) event.preventDefault();
}, { passive: false });