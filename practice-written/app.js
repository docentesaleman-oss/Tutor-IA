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
function uiText(key) {
    const language = String(state.language || "en").toLowerCase().split("-")[0];
    const translations = {
        en: { hint: "Get a hint", phrases: "Useful phrases", grammar: "Check my grammar", placeholder: "Write your answer…", choosePhrase: "Choose a phrase to add it to your answer:", needDraft: "Write your answer first, then I can check its grammar.", loading: "Your practice is loading. Please wait a moment.", waiting: "The activity link is still loading.", thinking: "Thinking…", wait: "Please wait for the current response.", checking: "Checking your writing…", preparing: "Preparing a writing aid…", empty: "Your conversation will appear here.", loadError: "The conversation could not load. Check the activity link and try again." },
        es: { hint: "Dame una pista", phrases: "Frases útiles", grammar: "Revisar mi gramática", placeholder: "Escribe tu respuesta…", choosePhrase: "Elige una frase para añadirla a tu respuesta:", needDraft: "Escribe tu respuesta primero para poder revisar la gramática.", loading: "La práctica se está cargando. Espera un momento.", waiting: "El enlace de la actividad todavía se está cargando.", thinking: "Pensando…", wait: "Espera a que termine la respuesta actual.", checking: "Revisando tu escritura…", preparing: "Preparando una ayuda para escribir…", empty: "La conversación aparecerá aquí.", loadError: "No se pudo cargar la conversación. Revisa el enlace de la actividad." },
        de: { hint: "Gib mir einen Hinweis", phrases: "Nützliche Sätze", grammar: "Grammatik prüfen", placeholder: "Schreibe deine Antwort…", choosePhrase: "Wähle einen Satz für deine Antwort:", needDraft: "Schreibe zuerst deine Antwort, dann prüfe ich die Grammatik.", loading: "Die Übung wird geladen. Bitte warte kurz.", waiting: "Der Aktivitätenlink wird noch geladen.", thinking: "Ich denke nach…", wait: "Bitte warte auf die aktuelle Antwort.", checking: "Deinen Text prüfen…", preparing: "Schreibhilfe wird vorbereitet…", empty: "Dein Gespräch erscheint hier.", loadError: "Das Gespräch konnte nicht geladen werden. Prüfe den Aktivitätenlink." },
        fr: { hint: "Donne-moi un indice", phrases: "Expressions utiles", grammar: "Vérifier ma grammaire", placeholder: "Écris ta réponse…", choosePhrase: "Choisis une expression à ajouter à ta réponse :", needDraft: "Écris d’abord ta réponse pour que je puisse vérifier la grammaire.", loading: "Chargement de l’exercice. Patiente un instant.", waiting: "Le lien de l’activité est en cours de chargement.", thinking: "Réflexion…", wait: "Attends la réponse en cours.", checking: "Vérification de ton texte…", preparing: "Préparation d’une aide à l’écriture…", empty: "La conversation apparaîtra ici.", loadError: "Impossible de charger la conversation. Vérifie le lien de l’activité." },
        pt: { hint: "Dê-me uma dica", phrases: "Frases úteis", grammar: "Verificar minha gramática", placeholder: "Escreva sua resposta…", choosePhrase: "Escolha uma frase para adicionar à sua resposta:", needDraft: "Escreva sua resposta primeiro para eu verificar a gramática.", loading: "Carregando a atividade. Aguarde um momento.", waiting: "O link da atividade ainda está carregando.", thinking: "Pensando…", wait: "Aguarde a resposta atual.", checking: "Verificando seu texto…", preparing: "Preparando uma ajuda para escrever…", empty: "A conversa aparecerá aqui.", loadError: "Não foi possível carregar a conversa. Verifique o link da atividade." },
        it: { hint: "Dammi un suggerimento", phrases: "Frasi utili", grammar: "Controlla la grammatica", placeholder: "Scrivi la tua risposta…", choosePhrase: "Scegli una frase da aggiungere alla risposta:", needDraft: "Scrivi prima la risposta, poi posso controllarne la grammatica.", loading: "Caricamento dell’attività. Attendi un momento.", waiting: "Il link dell’attività è ancora in caricamento.", thinking: "Sto pensando…", wait: "Attendi la risposta corrente.", checking: "Controllo del testo…", preparing: "Preparazione di un aiuto alla scrittura…", empty: "La conversazione apparirà qui.", loadError: "Impossibile caricare la conversazione. Controlla il link dell’attività." },
        zh: { hint: "给我提示", phrases: "实用短语", grammar: "检查语法", placeholder: "写下你的回答…", choosePhrase: "选择一个短语添加到回答中：", needDraft: "请先写下回答，我再帮你检查语法。", loading: "正在加载练习，请稍候。", waiting: "活动链接仍在加载。", thinking: "思考中…", wait: "请等待当前回复完成。", checking: "正在检查你的写作…", preparing: "正在准备写作帮助…", empty: "对话会显示在这里。", loadError: "无法加载对话。请检查活动链接。" },
        ru: { hint: "Подсказка", phrases: "Полезные фразы", grammar: "Проверить грамматику", placeholder: "Напишите ответ…", choosePhrase: "Выберите фразу, чтобы добавить её в ответ:", needDraft: "Сначала напишите ответ, затем я проверю грамматику.", loading: "Загрузка упражнения. Подождите немного.", waiting: "Ссылка на упражнение ещё загружается.", thinking: "Думаю…", wait: "Дождитесь текущего ответа.", checking: "Проверяю ваш текст…", preparing: "Готовлю помощь с письмом…", empty: "Здесь появится беседа.", loadError: "Не удалось загрузить беседу. Проверьте ссылку на упражнение." },
        ko: { hint: "힌트 받기", phrases: "유용한 표현", grammar: "문법 확인", placeholder: "답변을 작성하세요…", choosePhrase: "답변에 추가할 표현을 선택하세요:", needDraft: "먼저 답변을 작성하면 문법을 확인해 드릴게요.", loading: "연습을 불러오는 중입니다. 잠시 기다려 주세요.", waiting: "활동 링크를 불러오는 중입니다.", thinking: "생각 중…", wait: "현재 답변이 끝날 때까지 기다려 주세요.", checking: "작성한 문장을 확인하는 중…", preparing: "작성 도구를 준비하는 중…", empty: "대화가 여기에 표시됩니다.", loadError: "대화를 불러오지 못했습니다. 활동 링크를 확인하세요." },
        ar: { hint: "أعطني تلميحًا", phrases: "عبارات مفيدة", grammar: "تحقق من القواعد", placeholder: "اكتب إجابتك…", choosePhrase: "اختر عبارة لإضافتها إلى إجابتك:", needDraft: "اكتب إجابتك أولًا لأتحقق من القواعد.", loading: "جارٍ تحميل التدريب. انتظر قليلًا.", waiting: "ما زال رابط النشاط قيد التحميل.", thinking: "جارٍ التفكير…", wait: "انتظر حتى تكتمل الإجابة الحالية.", checking: "جارٍ مراجعة كتابتك…", preparing: "جارٍ إعداد مساعدة للكتابة…", empty: "ستظهر المحادثة هنا.", loadError: "تعذر تحميل المحادثة. تحقق من رابط النشاط." }
    };
    return (translations[language] || translations.en)[key] || translations.en[key] || "";
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