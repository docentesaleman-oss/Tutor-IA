const state = {
    Vlink: "",
    language: "en",
    history: [],
    lastTutorMessage: "",
    voiceMode: false,
    waitingForTutor: false,
    scriptIndex: -1
};

const stage = document.querySelector(".stage"),
    text = document.getElementById("tutor-text"),
    input = document.getElementById("message"),
    status = document.getElementById("status"),
    suggestions = document.getElementById("suggestions"),
    mic = document.getElementById("microphone"),
    voiceLabel = document.getElementById("voice-label"),
    composer = document.getElementById("composer"),
    historyPanel = document.getElementById("history-panel"),
    historyList = document.getElementById("history-list");

let recognition = null;

function key() {
    return `practice_history_${btoa(
        unescape(encodeURIComponent(state.Vlink))
    ).slice(0, 80)}`;
}

function save() {
    if (state.Vlink)
        localStorage.setItem(
            key(),
            JSON.stringify({
                language: state.language,
                history: state.history,
                scriptIndex: state.scriptIndex
            })
        );
}

function cleanReply(message) {
    return String(message || "")
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/`/g, "")
        .trim();
}

function showTutor(message) {
    state.lastTutorMessage = cleanReply(message);
    text.textContent = state.lastTutorMessage;
}

function renderHistory() {
    historyList.innerHTML = "";

    state.history.forEach(item => {
        const entry = document.createElement("article");
        entry.className = `history-entry ${item.role}`;

        const label = document.createElement("strong");
        label.textContent = item.role === "tutor" ? "Tutor" : "You";

        const body = document.createElement("span");
        body.textContent = cleanReply(item.text);

        entry.append(label, body);
        historyList.append(entry);
    });

    historyList.scrollTop = historyList.scrollHeight;
}

function add(role, message) {
    const cleanMessage = cleanReply(message);

    state.history.push({
        role,
        text: cleanMessage
    });

    save();
    renderHistory();

    if (state.history.length > 1)
        historyPanel.hidden = false;

    if (role === "tutor")
        showTutor(cleanMessage);
}

function setSuggestions(items = []) {
    suggestions.innerHTML = "";

    items.slice(0, 3).forEach(item => {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = item;
        button.onclick = () => send(item, false);

        suggestions.append(button);
    });
}

function closeWriter() {
    composer.hidden = true;
    stage.classList.remove("is-writing");
}

function speechLocale() {
    return ({
        en: "en-US",
        es: "es-ES",
        de: "de-DE",
        fr: "fr-FR",
        pt: "pt-BR",
        it: "it-IT",
        zh: "zh-CN",
        ru: "ru-RU",
        ar: "ar-SA",
        ko: "ko-KR"
    })[state.language] || "en-US";
}

function speakTutorReply(message) {
    return new Promise(resolve => {
        speechSynthesis.cancel();

        const locale = speechLocale();
        const languageCode = locale.slice(0, 2).toLowerCase();

        const voice = speechSynthesis
            .getVoices()
            .find(item =>
                item.lang.toLowerCase().startsWith(languageCode)
            );

        const utterance = new SpeechSynthesisUtterance(
            cleanReply(message)
        );

        utterance.lang = voice?.lang || locale;

        if (voice)
            utterance.voice = voice;

        utterance.onend = resolve;
        utterance.onerror = resolve;

        speechSynthesis.speak(utterance);
    });
}

function startListening() {
    if (!recognition || !state.voiceMode || state.waitingForTutor)
        return;

    try {
        recognition.lang = speechLocale();
        recognition.start();
    } catch {}
}

function stopVoiceMode() {
    state.voiceMode = false;
    state.waitingForTutor = false;

    try {
        recognition?.stop();
    } catch {}

    speechSynthesis.cancel();

    mic.classList.remove("is-listening");
    voiceLabel.textContent = "Press to speak";
}

async function loadPractice(vlink) {
    state.Vlink = String(vlink || "").trim();

    if (!state.Vlink) {
        showTutor("Your practice is loading. Please wait a moment.");
        return;
    }

    try {
        const stored = JSON.parse(
            localStorage.getItem(key()) || "{}"
        );

        state.language = stored.language || "en";
        state.history = Array.isArray(stored.history)
            ? stored.history
            : [];
        state.scriptIndex = Number.isInteger(stored.scriptIndex) ? stored.scriptIndex : -1;

        renderHistory();

        const response = await fetch("/practice/content", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Vlink: state.Vlink
            })
        });

        const data = await response.json();

        if (!response.ok)
            throw new Error(
                data.error || "Unable to load practice."
            );

        setSuggestions(data.suggestions);


        if (state.scriptIndex < 0)
            state.scriptIndex = Number.isInteger(data.openingIndex) ? data.openingIndex : -1;
        const last = [...state.history]
            .reverse()
            .find(item => item.role === "tutor");

        if (last)
            showTutor(last.text);
        else
            add("tutor", data.opening);

        status.textContent = "";
    } catch (error) {
        showTutor("I cannot load this practice right now.");
        status.textContent = error.message;
    }
}

async function send(value, replyWithVoice = false) {
    const message = String(value || input.value).trim();

    if (!message)
        return;

    if (!state.Vlink) {
        status.textContent = "The activity link is still loading.";
        return;
    }

    add("student", message);

    input.value = "";
    closeWriter();

    status.textContent = "Thinking…";
    state.waitingForTutor = replyWithVoice;

    try {
        const response = await fetch("/practice/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Vlink: state.Vlink,
                message,
                language: state.language,
                history: state.history.slice(-8),
                scriptIndex: state.scriptIndex
            })
        });

        const data = await response.json();

        if (!response.ok)
            throw new Error(
                data.error || "Unable to answer."
            );

        state.language = data.language || state.language;

        state.scriptIndex = Number.isInteger(data.scriptIndex) ? data.scriptIndex : state.scriptIndex;
        add("tutor", data.reply);

        status.textContent = "";

        if (replyWithVoice) {
            await speakTutorReply(data.reply);
            state.waitingForTutor = false;
            startListening();
        }
    } catch (error) {
        status.textContent = error.message;
        state.waitingForTutor = false;

        if (replyWithVoice)
            startListening();
    }
}

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

document.getElementById("write").onclick = () => {
    const opening = composer.hidden;

    composer.hidden = !opening;
    stage.classList.toggle("is-writing", opening);

    if (opening)
        input.focus();
};

document.getElementById("close-writer").onclick = closeWriter;

document.getElementById("help").onclick = () =>
    document.getElementById("help-dialog").showModal();

document.getElementById("close-help").onclick = () =>
    document.getElementById("help-dialog").close();

document.getElementById("listen").onclick = () =>
    speakTutorReply(state.lastTutorMessage);

document.getElementById("history-toggle").onclick = () => {
    historyPanel.hidden = !historyPanel.hidden;

    if (!historyPanel.hidden)
        renderHistory();
};

document.getElementById("close-history").onclick = () =>
    historyPanel.hidden = true;

const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (Recognition) {
    recognition = new Recognition();

    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
        mic.classList.add("is-listening");
        voiceLabel.textContent = "Listening…";
        status.textContent = "";
    };

    recognition.onresult = event => {
        if (!state.voiceMode)
            return;

        state.waitingForTutor = true;
        voiceLabel.textContent = "Sending your answer…";

        send(
            event.results[0][0].transcript,
            true
        );
    };

    recognition.onerror = event => {
        if (event.error !== "aborted")
            status.textContent =
                event.error === "not-allowed"
                    ? "Microphone permission is required."
                    : "I could not hear that. Please try again.";
    };

    recognition.onend = () => {
        mic.classList.remove("is-listening");

        if (
            state.voiceMode &&
            !state.waitingForTutor
        )
            setTimeout(startListening, 250);
        else if (!state.voiceMode)
            voiceLabel.textContent = "Press to speak";
    };

    mic.onclick = async () => {
        if (state.voiceMode) {
            stopVoiceMode();
            return;
        }

        try {
            if (navigator.mediaDevices?.getUserMedia) {
                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });

                stream.getTracks().forEach(track =>
                    track.stop()
                );
            }

            state.voiceMode = true;
            voiceLabel.textContent = "Listening…";

            startListening();
        } catch {
            status.textContent =
                "Microphone permission is required.";
        }
    };
} else {
    mic.onclick = () =>
        status.textContent =
            "Speech recognition is not available in this browser.";
}

document.getElementById("close-practice").onclick = () => {
    window.parent.postMessage({ type: "CLOSE_SECOND_TUTOR" }, "*");
};

function receive(data) {
    const vlink =
        data?.Vlink ||
        data?.vlink ||
        data?.datos?.Vlink ||
        data?.datos?.vlink;

    if (vlink)
        loadPractice(vlink);
}

window.recibirDatosStoryline = receive;
window.cargarVlink = loadPractice;

window.addEventListener("message", event => {
    if (
        event.data?.type === "practice-vlink" ||
        event.data?.type === "STORYLINE_CONTEXT"
    )
        receive(event.data);
});

window.addEventListener("DOMContentLoaded", () => {
    const vlink =
        new URLSearchParams(location.search).get("Vlink");

    if (vlink)
        loadPractice(vlink);
    else
        showTutor(
            "Hi! Your guided conversation will begin in a moment."
        );
});


