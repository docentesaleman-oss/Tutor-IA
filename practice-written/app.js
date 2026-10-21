const state = {
    Vlink: "",
    language: "en",
    history: [],
    scriptIndex: -1,
    requestInFlight: false,
    toolInFlight: false,
    loading: false,
    loadedVlink: ""
};
const input = document.getElementById("message");
const status = document.getElementById("status");
const composer = document.getElementById("composer");
const historyList = document.getElementById("history-list");
const toolResult = document.getElementById("tool-result");
const helpDialog = document.getElementById("help-dialog");

function key() {
    return "practice_written_history_" + btoa(unescape(encodeURIComponent(state.Vlink))).slice(0, 80);
}
function save() {
    if (state.Vlink) {
        localStorage.setItem(key(), JSON.stringify({
            language: state.language,
            history: state.history,
            scriptIndex: state.scriptIndex
        }));
    }
}
function cleanReply(message) {
    return String(message || "").replace(/\*\*/g, "").replace(/__/g, "")
        .split(String.fromCharCode(96)).join("").trim();
}
function fillHeader() {
    const labels = window.PRACTICE_UI_TEXT || {};
    const mapping = {
        "course-title": labels.title,
        "course-module": labels.module,
        "course-topic": labels.topic,
        "course-lesson": labels.lesson,
        "course-section": labels.section,
        "course-level": labels.level
    };
    Object.keys(mapping).forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = mapping[id] || "";
    });
    document.title = labels.title || "Written Interaction";
}
function renderHistory() {
    historyList.innerHTML = "";
    if (!state.history.length) {
        const placeholder = document.createElement("p");
        placeholder.className = "history-placeholder";
        placeholder.textContent = "Your conversation will appear here.";
        historyList.append(placeholder);
        return;
    }
    state.history.forEach(item => {
        const row = document.createElement("article");
        row.className = "history-entry " + (item.role === "tutor" ? "tutor" : "student");
        if (item.role === "tutor") {
            const avatar = document.createElement("img");
            avatar.className = "tutor-avatar";
            avatar.src = "Perfil.png";
            avatar.alt = "";
            row.append(avatar);
        }

        const bubble = document.createElement("div");
        bubble.className = "message-bubble";
        const sender = document.createElement("strong");
        sender.className = "message-sender";
        sender.textContent = item.role === "tutor" ? "AI Tutor" : "You";
        const body = document.createElement("span");
        body.className = "message-text";
        body.textContent = cleanReply(item.text);
        bubble.append(sender, body);

        if (item.time) {
            const time = document.createElement("time");
            time.className = "message-time";
            time.textContent = item.time;
            bubble.append(time);
        }
        row.append(bubble);
        historyList.append(row);
    });
    historyList.scrollTop = historyList.scrollHeight;
}
function add(role, message) {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    state.history.push({ role, text: cleanReply(message), time });
    save();
    renderHistory();
}
function setStatus(message) {
    status.textContent = message || "";
}
function clearToolResult() {
    toolResult.hidden = true;
    toolResult.innerHTML = "";
}
function insertPhrase(phrase) {
    const start = Number.isInteger(input.selectionStart) ? input.selectionStart : input.value.length;
    const end = Number.isInteger(input.selectionEnd) ? input.selectionEnd : start;
    const left = input.value.slice(0, start);
    const right = input.value.slice(end);
    const spacer = left && !/\s$/.test(left) ? " " : "";
    input.value = left + spacer + phrase + (right && !/^\s/.test(right) ? " " : "") + right;
    input.focus();
    const caret = (left + spacer + phrase).length;
    input.setSelectionRange(caret, caret);
}
function showToolResult(action, data) {
    toolResult.innerHTML = "";
    toolResult.hidden = false;
    if (action === "phrases" && Array.isArray(data.phrases) && data.phrases.length) {
        const heading = document.createElement("strong");
        heading.className = "tool-result-title";
        heading.textContent = "Choose a phrase to add it to your answer:";
        toolResult.append(heading);
        const list = document.createElement("div");
        list.className = "phrase-list";
        data.phrases.slice(0, 4).forEach(phrase => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "phrase-option";
            button.textContent = phrase;
            button.addEventListener("click", () => insertPhrase(phrase));
            list.append(button);
        });
        toolResult.append(list);
    } else {
        const text = document.createElement("p");
        text.className = "tool-result-text";
        text.textContent = data.reply || "The writing tool could not provide a response.";
        toolResult.append(text);
    }
}
async function loadPractice(vlink) {
    const requestedVlink = String(vlink || "").trim();
    if (!requestedVlink) {
        setStatus("Your practice is loading. Please wait a moment.");
        return;
    }
    if (state.loading || state.loadedVlink === requestedVlink) return;

    state.Vlink = requestedVlink;
    state.loading = true;
    try {
        const stored = JSON.parse(localStorage.getItem(key()) || "{}");
        state.language = stored.language || "en";
        state.history = Array.isArray(stored.history) ? stored.history : [];
        state.scriptIndex = Number.isInteger(stored.scriptIndex) ? stored.scriptIndex : -1;
        renderHistory();

        const response = await fetch("/practice/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Vlink: state.Vlink })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load practice.");
        if (state.scriptIndex < 0) {
            state.scriptIndex = Number.isInteger(data.openingIndex) ? data.openingIndex : -1;
        }
        if (state.history.length === 0) add("tutor", data.opening);
        else renderHistory();
        state.loadedVlink = requestedVlink;
        setStatus("");
    } catch (error) {
        if (!state.history.length) {
            historyList.innerHTML = "";
            const placeholder = document.createElement("p");
            placeholder.className = "history-placeholder";
            placeholder.textContent = "The conversation could not load. Check the activity link and try again.";
            historyList.append(placeholder);
        }
        setStatus(error.message || "I cannot load this practice right now.");
    } finally {
        state.loading = false;
    }
}
async function send(value) {
    const message = String(value || input.value).trim();
    if (!message) return;
    if (state.requestInFlight || state.toolInFlight) {
        setStatus("Please wait for the current response.");
        return;
    }
    if (!state.Vlink) {
        setStatus("The activity link is still loading.");
        return;
    }

    clearToolResult();
    add("student", message);
    input.value = "";
    setStatus("Thinking…");
    state.requestInFlight = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
        const response = await fetch("/practice/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Vlink: state.Vlink,
                message,
                language: state.language,
                history: state.history.slice(-16),
                scriptIndex: state.scriptIndex
            }),
            signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to answer.");
        state.language = data.language || state.language;
        state.scriptIndex = Number.isInteger(data.scriptIndex) ? data.scriptIndex : state.scriptIndex;
        add("tutor", data.reply);
        setStatus("");
    } catch (error) {
        setStatus(error.name === "AbortError" ? "The reply took too long. Please try again." : error.message);
    } finally {
        clearTimeout(timeout);
        state.requestInFlight = false;
    }
}
async function runWritingTool(action) {
    if (state.requestInFlight || state.toolInFlight) {
        setStatus("Please wait for the current response.");
        return;
    }
    if (!state.Vlink) {
        setStatus("The activity link is still loading.");
        return;
    }
    const draft = input.value.trim();
    if (action === "grammar" && !draft) {
        toolResult.hidden = false;
        toolResult.textContent = "Write your answer first, then I can check its grammar.";
        input.focus();
        return;
    }

    state.toolInFlight = true;
    setStatus(action === "grammar" ? "Checking your writing…" : "Preparing a writing aid…");
    const buttons = Array.from(document.querySelectorAll("[data-tool]"));
    buttons.forEach(button => button.disabled = true);
    try {
        const response = await fetch("/practice/tools", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Vlink: state.Vlink,
                action,
                draft,
                language: state.language,
                history: state.history.slice(-12),
                scriptIndex: state.scriptIndex
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "The writing tool could not respond.");
        showToolResult(action, data);
        setStatus("");
    } catch (error) {
        toolResult.hidden = false;
        toolResult.textContent = error.message || "The writing tool could not respond.";
        setStatus("");
    } finally {
        state.toolInFlight = false;
        buttons.forEach(button => button.disabled = false);
    }
}

fillHeader();
renderHistory();
composer.addEventListener("submit", event => {
    event.preventDefault();
    send();
});
input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        send();
    }
});
document.querySelectorAll("[data-tool]").forEach(button => {
    button.addEventListener("click", () => runWritingTool(button.dataset.tool));
});
document.getElementById("help").onclick = () => helpDialog.showModal();
document.getElementById("close-help").onclick = () => helpDialog.close();
document.getElementById("close-practice").onclick = () => {
    window.parent.postMessage({ type: "CLOSE_THIRD_TUTOR" }, "*");
};
function receive(data) {
    const vlink = data?.Vlink || data?.vlink || data?.datos?.Vlink || data?.datos?.vlink;
    if (vlink) loadPractice(vlink);
}
window.recibirDatosStoryline = receive;
window.cargarVlink = loadPractice;
window.addEventListener("message", event => {
    if (event.data?.type === "practice-written-vlink" || event.data?.type === "STORYLINE_CONTEXT") {
        receive(event.data);
    }
});
function requestPracticeVlink() {
    const queryVlink = new URLSearchParams(location.search).get("Vlink");
    if (queryVlink) loadPractice(queryVlink);
    window.parent?.postMessage({ type: "PRACTICE_WRITTEN_READY" }, "*");
    try {
        const player = window.parent?.GetPlayer?.();
        const vlink = player?.GetVar?.("Vlink");
        if (vlink) loadPractice(vlink);
    } catch {}
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