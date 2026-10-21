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

document.querySelector(".stage").append(toolResult);

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
function uiText(key) {
    const language = String(state.language || "en").toLowerCase().split("-")[0];
    const labels = {
        en: ["Get a hint", "Useful phrases", "Check my grammar", "Write your answer…", "Choose a phrase to add it to your answer:", "Write your answer first, then I can check its grammar.", "Your practice is loading. Please wait a moment.", "The activity link is still loading.", "Thinking…", "Please wait for the current response.", "Checking your writing…", "Preparing a writing aid…", "Your conversation will appear here.", "The conversation could not load. Check the activity link and try again."],
        es: ["Dame una pista", "Frases útiles", "Revisar mi gramática", "Escribe tu respuesta…", "Elige una frase para añadirla a tu respuesta:", "Escribe tu respuesta primero para poder revisar la gramática.", "La práctica se está cargando. Espera un momento.", "El enlace de la actividad todavía se está cargando.", "Pensando…", "Espera a que termine la respuesta actual.", "Revisando tu escritura…", "Preparando una ayuda para escribir…", "La conversación aparecerá aquí.", "No se pudo cargar la conversación. Revisa el enlace de la actividad."],
        de: ["Gib mir einen Hinweis", "Nützliche Sätze", "Grammatik prüfen", "Schreibe deine Antwort…", "Wähle einen Satz für deine Antwort:", "Schreibe zuerst deine Antwort, dann prüfe ich die Grammatik.", "Die Übung wird geladen. Bitte warte kurz.", "Der Aktivitätenlink wird noch geladen.", "Ich denke nach…", "Bitte warte auf die aktuelle Antwort.", "Deinen Text prüfen…", "Schreibhilfe wird vorbereitet…", "Dein Gespräch erscheint hier.", "Das Gespräch konnte nicht geladen werden. Prüfe den Aktivitätenlink."],
        fr: ["Donne-moi un indice", "Expressions utiles", "Vérifier ma grammaire", "Écris ta réponse…", "Choisis une expression à ajouter à ta réponse :", "Écris d’abord ta réponse pour que je puisse vérifier la grammaire.", "Chargement de l’exercice. Patiente un instant.", "Le lien de l’activité est en cours de chargement.", "Réflexion…", "Attends la réponse en cours.", "Vérification de ton texte…", "Préparation d’une aide à l’écriture…", "La conversation apparaîtra ici.", "Impossible de charger la conversation. Vérifie le lien de l’activité."],
        pt: ["Dê-me uma dica", "Frases úteis", "Verificar minha gramática", "Escreva sua resposta…", "Escolha uma frase para adicionar à sua resposta:", "Escreva sua resposta primeiro para eu verificar a gramática.", "Carregando a atividade. Aguarde um momento.", "O link da atividade ainda está carregando.", "Pensando…", "Aguarde a resposta atual.", "Verificando seu texto…", "Preparando uma ajuda para escrever…", "A conversa aparecerá aqui.", "Não foi possível carregar a conversa. Verifique o link da atividade."],
        it: ["Dammi un suggerimento", "Frasi utili", "Controlla la grammatica", "Scrivi la tua risposta…", "Scegli una frase da aggiungere alla risposta:", "Scrivi prima la risposta, poi posso controllarne la grammatica.", "Caricamento dell’attività. Attendi un momento.", "Il link dell’attività è ancora in caricamento.", "Sto pensando…", "Attendi la risposta corrente.", "Controllo del testo…", "Preparazione di un aiuto alla scrittura…", "La conversazione apparirà qui.", "Impossibile caricare la conversazione. Controlla il link dell’attività."],
        zh: ["给我提示", "实用短语", "检查语法", "写下你的回答…", "选择一个短语添加到回答中：", "请先写下回答，我再帮你检查语法。", "正在加载练习，请稍候。", "活动链接仍在加载。", "思考中…", "请等待当前回复完成。", "正在检查你的写作…", "正在准备写作帮助…", "对话会显示在这里。", "无法加载对话。请检查活动链接。"],
        ru: ["Подсказка", "Полезные фразы", "Проверить грамматику", "Напишите ответ…", "Выберите фразу, чтобы добавить её в ответ:", "Сначала напишите ответ, затем я проверю грамматику.", "Загрузка упражнения. Подождите немного.", "Ссылка на упражнение ещё загружается.", "Думаю…", "Дождитесь текущего ответа.", "Проверяю ваш текст…", "Готовлю помощь с письмом…", "Здесь появится беседа.", "Не удалось загрузить беседу. Проверьте ссылку на упражнение."],
        ko: ["힌트 받기", "유용한 표현", "문법 확인", "답변을 작성하세요…", "답변에 추가할 표현을 선택하세요:", "먼저 답변을 작성하면 문법을 확인해 드릴게요.", "연습을 불러오는 중입니다. 잠시 기다려 주세요.", "활동 링크를 불러오는 중입니다.", "생각 중…", "현재 답변이 끝날 때까지 기다려 주세요.", "작성한 문장을 확인하는 중…", "작성 도구를 준비하는 중…", "대화가 여기에 표시됩니다.", "대화를 불러오지 못했습니다. 활동 링크를 확인하세요."],
        ar: ["أعطني تلميحًا", "عبارات مفيدة", "تحقق من القواعد", "اكتب إجابتك…", "اختر عبارة لإضافتها إلى إجابتك:", "اكتب إجابتك أولًا لأتحقق من القواعد.", "جارٍ تحميل التدريب. انتظر قليلًا.", "ما زال رابط النشاط قيد التحميل.", "جارٍ التفكير…", "انتظر حتى تكتمل الإجابة الحالية.", "جارٍ مراجعة كتابتك…", "جارٍ إعداد مساعدة للكتابة…", "ستظهر المحادثة هنا.", "تعذر تحميل المحادثة. تحقق من رابط النشاط."]
    };
    const index = { hint: 0, phrases: 1, grammar: 2, placeholder: 3, choosePhrase: 4, needDraft: 5, loading: 6, waiting: 7, thinking: 8, wait: 9, checking: 10, preparing: 11, empty: 12, loadError: 13 }[key];
    return (labels[language] || labels.en)[index];
}
function applyUiLanguage() {
    document.querySelector('[data-tool="hint"]').lastChild.textContent = " " + uiText("hint");
    document.querySelector('[data-tool="phrases"]').lastChild.textContent = " " + uiText("phrases");
    document.querySelector('[data-tool="grammar"]').lastChild.textContent = " " + uiText("grammar");
    input.placeholder = uiText("placeholder");
}
function renderHistory() {
    historyList.innerHTML = "";
    if (!state.history.length) {
        const placeholder = document.createElement("p");
        placeholder.className = "history-placeholder";
        placeholder.textContent = uiText("empty");
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
        heading.textContent = uiText("choosePhrase");
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
        setStatus(uiText("loading"));
        return;
    }
    if (state.loading || state.loadedVlink === requestedVlink) return;

    state.Vlink = requestedVlink;
    state.loading = true;
    try {
        const stored = JSON.parse(localStorage.getItem(key()) || "{}");
        state.language = stored.language || "en";
        applyUiLanguage();
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
            placeholder.textContent = uiText("loadError");
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
        setStatus(uiText("wait"));
        return;
    }
    if (!state.Vlink) {
        setStatus(uiText("waiting"));
        return;
    }

    clearToolResult();
    add("student", message);
    input.value = "";
    setStatus(uiText("thinking"));
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
        applyUiLanguage();
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
        setStatus(uiText("wait"));
        return;
    }
    if (!state.Vlink) {
        setStatus(uiText("waiting"));
        return;
    }
    const draft = input.value.trim();
    if (action === "grammar" && !draft) {
        toolResult.hidden = false;
        toolResult.textContent = uiText("needDraft");
        input.focus();
        return;
    }

    state.toolInFlight = true;
    setStatus(action === "grammar" ? uiText("checking") : uiText("preparing"));
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
applyUiLanguage();
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