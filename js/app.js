const prompt = document.getElementById("prompt");
const send = document.getElementById("send");
const clearChat = document.getElementById("clearChat");


/*
============================================================
MEMORIA LOCAL DEL CHAT
============================================================
*/

const CHAT_STORAGE_KEY =
    "tutorIA_chatHistory_v2";

let chatHistory = [];

/*
============================================================
MEMORIA DEL IDIOMA DEL ESTUDIANTE
============================================================
*/

const LANGUAGE_STORAGE_KEY =
    "tutorIA_idioma";

let idiomaPreferido =
    localStorage.getItem(
        LANGUAGE_STORAGE_KEY
    ) || "";

/*
============================================================
DETECTAR SOLICITUD EXPLÍCITA DE IDIOMA
============================================================
*/

function detectarIdiomaSolicitado(texto) {

    const pregunta =
        String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

    if (
        pregunta.includes("hablame en espanol") ||
        pregunta.includes("habla en espanol") ||
        pregunta.includes("responde en espanol") ||
        pregunta.includes("habla conmigo en espanol") ||
        pregunta.includes("quiero que hables en espanol")
    ) {
        return "es";
    }

   if (
    pregunta.includes("hablame en ingles") ||
    pregunta.includes("hablame ahora en ingles") ||
    pregunta.includes("hablame en ingles por favor") ||
    pregunta.includes("hablame ahora en ingles por favor") ||
    pregunta.includes("hablame unicamente en ingles") ||
    pregunta.includes("habla en ingles") ||
    pregunta.includes("responde en ingles") ||
    pregunta.includes("respondeme en ingles") ||
    pregunta.includes("quiero que hables en ingles") ||
    pregunta.includes("quiero que respondas en ingles") ||
    pregunta.includes("habla conmigo en ingles") ||
    pregunta.includes("speak english") ||
    pregunta.includes("speak in english") ||
    pregunta.includes("talk to me in english") ||
    pregunta.includes("speak with me in english") ||
    pregunta.includes("respond in english") ||
    pregunta.includes("answer in english") ||
    pregunta.includes("speak to me in english") ||
    pregunta.includes("please speak in english") ||
    pregunta.includes("please respond in english") ||
    pregunta.includes("please answer in english")
) {
    return "en";
}

    if (
        pregunta.includes("sprich deutsch") ||
        pregunta.includes("sprich auf deutsch") ||
        pregunta.includes("sprich mit mir auf deutsch") ||
        pregunta.includes("sprich mit mir deutsch") ||
        pregunta.includes("sprich bitte mit mir auf deutsch") ||
        pregunta.includes("sprich bitte deutsch") ||
        pregunta.includes("antworte auf deutsch") ||
        pregunta.includes("rede mit mir auf deutsch")
    ) {
        return "de";
    }

    if (
        pregunta.includes("parle francais") ||
        pregunta.includes("parle en francais") ||
        pregunta.includes("parlez francais") ||
        pregunta.includes("reponds en francais") ||
        pregunta.includes("repondre en francais")
    ) {
        return "fr";
    }

    if (
        pregunta.includes("fale portugues") ||
        pregunta.includes("fale em portugues") ||
        pregunta.includes("fale comigo em portugues") ||
        pregunta.includes("responda em portugues")
    ) {
        return "pt";
    }

    if (
        pregunta.includes("parla italiano") ||
        pregunta.includes("parla in italiano") ||
        pregunta.includes("parlami in italiano") ||
        pregunta.includes("rispondi in italiano")
    ) {
        return "it";
    }

    if (
        pregunta.includes("用中文说") ||
        pregunta.includes("请用中文") ||
        pregunta.includes("用中文回答") ||
        pregunta.includes("请用中文回答")
    ) {
        return "zh";
    }

    if (
        pregunta.includes("говори по русски") ||
        pregunta.includes("говори на русском") ||
        pregunta.includes("говорите на русском") ||
        pregunta.includes("отвечай на русском")
    ) {
        return "ru";
    }

    if (
        pregunta.includes("تحدث معي بالعربية") ||
        pregunta.includes("تحدث بالعربية") ||
        pregunta.includes("أجب بالعربية") ||
        pregunta.includes("تكلم بالعربية")
    ) {
        return "ar";
    }

    if (
        pregunta.includes("한국어로 말해줘") ||
        pregunta.includes("한국어로 말해주세요") ||
        pregunta.includes("한국어로 대답해줘") ||
        pregunta.includes("한국어로 답변해줘")
    ) {
        return "ko";
    }

    return "";
}

/*
============================================================
CONTEXTO ACTUAL DE STORYLINE
============================================================
*/

let storylineData = {

    tipo: "contenido",

    tema: "",

    nivel: "",

    modulo: "",

    seccion: "",

    diapositiva: "",

    contexto: "",

    texto: "",

    Vcorrect: "",

    Vincorrect: "",

    Vvideo: "",
    
    Vsugerencia: ""

};


/*
============================================================
ACTUALIZAR CONTEXTO DE STORYLINE
============================================================
*/

function actualizarStoryline(datos) {

    if (!datos || typeof datos !== "object") {

        console.warn(
            "STORYLINE → datos inválidos:",
            datos
        );

        return;
    }


    /*
    ============================================================
    REINICIAR COMPLETAMENTE EL CONTEXTO ANTERIOR
    ============================================================
    */

    storylineData = {

        tipo: "contenido",

        tema: "",

        nivel: "",

        modulo: "",

        seccion: "",

        diapositiva: "",

        contexto: "",

        texto: "",

        Vcorrect: "",

        Vincorrect: "",

        Vvideo: "",
Vsugerencia: ""

    };


    /*
    ============================================================
    CARGAR ÚNICAMENTE LOS DATOS RECIBIDOS AHORA
    ============================================================
    */

    if (
        datos.tipo !== undefined &&
        datos.tipo !== null
    ) {

        storylineData.tipo =
            String(
                datos.tipo
            ).trim() ||
            "contenido";

    }


    const campos = [

        "tema",

        "nivel",

        "modulo",

        "seccion",

        "diapositiva",

        "contexto",

        "texto",

        "Vcorrect",

        "Vincorrect",

       "Vvideo",
"Vsugerencia"

    ];


    campos.forEach(
        function(nombre) {

            if (
                datos[nombre] !== undefined &&
                datos[nombre] !== null
            ) {

                storylineData[nombre] =
                    String(
                        datos[nombre]
                    ).trim();

            }

        }
    );


    /*
    ============================================================
    MOSTRAR CONTEXTO ACTUAL
    ============================================================
    */

    console.log(
        "===== CONTEXTO STORYLINE ACTUALIZADO ====="
    );

    console.log(
        "vTema:",
        storylineData.tema
    );

    console.log(
        "vNivel:",
        storylineData.nivel
    );

    console.log(
        "vModulo:",
        storylineData.modulo
    );

    console.log(
        "vSeccion:",
        storylineData.seccion
    );

    console.log(
        "vDiapositiva:",
        storylineData.diapositiva
    );

    console.log(
        "vContexto:",
        storylineData.contexto
    );

    console.log(
        "vTexto:",
        storylineData.texto
    );

    console.log(
        "Vcorrect:",
        storylineData.Vcorrect
    );

    console.log(
        "Vincorrect:",
        storylineData.Vincorrect
    );

    console.log(
        "Vvideo:",
        storylineData.Vvideo
    );

console.log(
    "Vsugerencia:",
    storylineData.Vsugerencia
);

mostrarSugerencias();

}

/*
============================================================
SUGERENCIAS DEL TUTOR
============================================================
*/

function mostrarSugerencias() {

    let contenedor =
        document.getElementById("suggestions");

    if (!contenedor) {

        contenedor =
            document.createElement("div");

        contenedor.id =
            "suggestions";

        const inputArea =
            document.getElementById("inputArea");

        if (!inputArea) {
            return;
        }

        inputArea.parentNode.insertBefore(
            contenedor,
            inputArea
        );
    }

    contenedor.innerHTML = "";

    if (!idiomaPreferido) {

        contenedor.style.display =
            "none";

        return;
    }

    const textoSugerencias =
        storylineData.Vsugerencia || "";

    if (!textoSugerencias.trim()) {

        contenedor.style.display =
            "none";

        return;
    }

    const sugerencias =
        textoSugerencias
            .split(",")
            .map(s => s.trim())
            .filter(s => s !== "");

    if (sugerencias.length === 0) {

        contenedor.style.display =
            "none";

        return;
    }

    contenedor.style.display =
        "flex";

    sugerencias.forEach(
        function(sugerencia) {

            const boton =
                document.createElement("button");

            boton.type =
                "button";

            boton.className =
                "suggestion";

            boton.textContent =
                traducirSugerencia(
                    sugerencia
                );

            boton.addEventListener(
                "click",
                function() {

                    prompt.value =
                        boton.textContent;

                    sendMessage();

                }
            );

            contenedor.appendChild(
                boton
            );

        }
    );
}


function normalizarSugerencia(texto) {

    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[¿?¡!.,]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


function traducirSugerencia(sugerencia) {

    const clave =
        normalizarSugerencia(
            sugerencia
        );

    const traducciones = {

        "por que me quedo mal la respuesta": {

            es: "¿Por qué me quedó mal la respuesta?",
            en: "Why did I get the answer wrong?",
            de: "Warum war meine Antwort falsch?",
            fr: "Pourquoi ma réponse était-elle incorrecte ?",
            pt: "Por que minha resposta ficou errada?",
            it: "Perché la mia risposta era sbagliata?",
            zh: "为什么我的答案错了？",
            ru: "Почему мой ответ оказался неправильным?",
            ar: "لماذا كانت إجابتي خاطئة؟",
            ko: "왜 제 답이 틀렸나요?"

        },

        "que debo hacer en este ejercicio": {

            es: "¿Qué debo hacer en este ejercicio?",
            en: "What do I have to do in this exercise?",
            de: "Was muss ich bei dieser Übung machen?",
            fr: "Que dois-je faire dans cet exercice ?",
            pt: "O que devo fazer neste exercício?",
            it: "Cosa devo fare in questo esercizio?",
            zh: "这道练习我需要做什么？",
            ru: "Что мне нужно сделать в этом упражнении?",
            ar: "ماذا يجب أن أفعل في هذا التمرين؟",
            ko: "이 연습문제에서 무엇을 해야 하나요?"

        },

        "de que trata el video": {

            es: "¿De qué trata el video?",
            en: "What is the video about?",
            de: "Worum geht es in dem Video?",
            fr: "De quoi parle la vidéo ?",
            pt: "Sobre o que é o vídeo?",
            it: "Di cosa parla il video?",
            zh: "这个视频讲的是什么？",
            ru: "О чем это видео?",
            ar: "ماذا يتناول هذا الفيديو؟",
            ko: "이 비디오는 무엇에 관한 내용인가요?"

        },

        "transcribeme el video": {

            es: "Transcríbeme el video.",
            en: "Transcribe the video for me.",
            de: "Transkribiere das Video für mich.",
            fr: "Transcris-moi la vidéo.",
            pt: "Transcreva o vídeo para mim.",
            it: "Trascrivimi il video.",
            zh: "请把视频转录给我。",
            ru: "Расшифруй видео для меня.",
            ar: "اكتب لي نص الفيديو.",
            ko: "비디오 내용을 글로 옮겨 주세요."

        },

        "explicame esta leccion": {

            es: "Explícame esta lección.",
            en: "Explain this lesson to me.",
            de: "Erkläre mir diese Lektion.",
            fr: "Explique-moi cette leçon.",
            pt: "Explique esta lição para mim.",
            it: "Spiegami questa lezione.",
            zh: "请给我解释一下这一课。",
            ru: "Объясни мне этот урок.",
            ar: "اشرح لي هذا الدرس.",
            ko: "이 수업을 설명해 주세요."

        },

        "de que trata la conversacion": {

            es: "¿De qué trata la conversación?",
            en: "What is the conversation about?",
            de: "Worum geht es in dem Gespräch?",
            fr: "De quoi parle la conversation ?",
            pt: "Sobre o que é a conversa?",
            it: "Di cosa parla la conversazione?",
            zh: "这段对话讲的是什么？",
            ru: "О чем этот разговор?",
            ar: "ما موضوع هذه المحادثة؟",
            ko: "이 대화는 무엇에 관한内容인가요?"

        }

    };

    const idioma =
        idiomaPreferido || "es";

    if (
        traducciones[clave] &&
        traducciones[clave][idioma]
    ) {

        return traducciones[clave][idioma];

    }

    return sugerencia;
}

/*
============================================================
COMPATIBILIDAD CON CÓDIGO ANTERIOR
============================================================
*/

window.recibirDatosStoryline =
    function(datos) {

        actualizarStoryline(
            datos
        );

    };


/*
============================================================
GUARDAR CHAT
============================================================
*/

function guardarChat() {

    try {

        localStorage.setItem(

            CHAT_STORAGE_KEY,

            JSON.stringify(
                chatHistory
            )

        );


        console.log(
            "CHAT GUARDADO:",
            chatHistory.length,
            "mensajes"
        );

    } catch (error) {

        console.error(
            "ERROR GUARDANDO CHAT:",
            error
        );

    }

}


/*
============================================================
CARGAR CHAT
============================================================
*/

function cargarChat() {

    try {

        const guardado =
            localStorage.getItem(
                CHAT_STORAGE_KEY
            );


        if (!guardado) {

            return;

        }


        const historial =
            JSON.parse(
                guardado
            );


        if (
            !Array.isArray(
                historial
            )
        ) {

            return;

        }


        chatHistory =
            historial;


        console.log(
            "===== MEMORIA DEL CHAT CARGADA ====="
        );


        console.log(
            "Mensajes:",
            chatHistory.length
        );


        const messages =
            document.getElementById(
                "messages"
            );


        if (!messages) {

            return;

        }


        messages.innerHTML =
            "";


        for (
            const mensaje
            of chatHistory
        ) {

            const message =
                document.createElement(
                    "div"
                );


            message.className =
                mensaje.sender === "user"
                    ? "message user-message"
                    : "message bot-message";


            message.textContent =
                mensaje.text;


            messages.appendChild(
                message
            );

        }


        messages.scrollTop =
            messages.scrollHeight;


    } catch (error) {

        console.error(
            "ERROR CARGANDO MEMORIA DEL CHAT:",
            error
        );


        chatHistory =
            [];

    }

}

/*
============================================================
INICIAR SELECCIÓN DE IDIOMA
============================================================
*/

function iniciarSeleccionIdioma() {

    if (idiomaPreferido) {

        console.log(
            "IDIOMA GUARDADO:",
            idiomaPreferido
        );

        return;

    }

    const mensajeInicial =
        "Hola, soy el Tutor IA de Tech Language School. Bienvenido. ¿En qué idioma deseas comunicarte conmigo?";

    addMessage(
    mensajeInicial,
    "bot",
    false
);

}

/*
============================================================
ELIMINAR CHAT
============================================================
*/

if (clearChat) {

    clearChat.onclick =
        function() {

            chatHistory =
                [];


            localStorage.removeItem(
                CHAT_STORAGE_KEY
            );


            const messages =
                document.getElementById(
                    "messages"
                );


            if (messages) {

                messages.innerHTML =
                    "";

            }


            console.log(
                "===== CHAT ELIMINADO ====="
            );

        };

}


/*
============================================================
MOSTRAR MENSAJE
============================================================
*/

function addMessage(
    text,
    sender,
    guardar = true
) {

    const messages =
        document.getElementById(
            "messages"
        );


    if (!messages) {

        console.error(
            "ERROR: No se encontró #messages"
        );

        return;

    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        sender === "user"
            ? "message user-message"
            : "message bot-message";


    message.textContent =
        text;


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;


    if (guardar) {

        chatHistory.push({

            sender:
                sender,

            text:
                text

        });


        guardarChat();

    }

}


/*
============================================================
RECIBIR CONTEXTO DESDE STORYLINE
============================================================
*/

window.addEventListener(
    "message",
    function(event) {

        if (!event.data) {

            return;

        }


        if (
            event.data.type ===
            "STORYLINE_CONTEXT"
        ) {

            console.log(
                "===== MENSAJE RECIBIDO DE STORYLINE ====="
            );


            console.log(
                event.data
            );


            if (
                event.data.datos
            ) {

                actualizarStoryline(
                    event.data.datos
                );

            }

        }

    }
);


/*
============================================================
SOLICITAR CONTEXTO A STORYLINE
============================================================
*/

function solicitarContextoStoryline() {

    console.log(
        "===== TUTOR SOLICITA CONTEXTO A STORYLINE ====="
    );


    window.parent.postMessage(

        {
            type:
                "REQUEST_STORYLINE_CONTEXT"
        },

        "*"

    );

}

/*
============================================================
BLOQUEAR SOLICITUDES DE RESPUESTAS DE EJERCICIOS
============================================================
*/

function esSolicitudDeRespuesta(texto) {

    const pregunta = texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const patrones = [

        "cual es la respuesta",
        "cual es la respuesta correcta",
        "cual es la correcta",
        "cual respuesta es correcta",
        "que respuesta es correcta",
        "que tengo que escoger",
        "que debo escoger",
        "que debo elegir",
        "que tengo que elegir",
        "cual debo escoger",
        "cual debo elegir",
        "que marco",
        "cual marco",
        "dime la respuesta",
        "dame la respuesta",
        "dime cual es",
        "dime cual",
        "cual selecciono",
        "cual selecciono",
        "cual opcion es correcta",
        "que opcion es correcta",
        "que opcion debo marcar",
        "que opcion debo escoger",
        "resuelve el ejercicio",
        "resuelveme el ejercicio",
        "hazme el ejercicio",
        "haz el ejercicio por mi",
        "dime que poner",
        "que pongo"

    ];

    return patrones.some(
        patron => pregunta.includes(patron)
    );
}

/*
============================================================
ENVIAR PREGUNTA
============================================================
*/

async function sendMessage() {

   const text = prompt.value.trim();

if (!text) {
    return;
}


/*
============================================================
ACTUALIZAR IDIOMA DEL ESTUDIANTE
============================================================
*/

const nuevoIdioma =
    detectarIdiomaSolicitado(text);

if (nuevoIdioma) {

    idiomaPreferido =
        nuevoIdioma;

    localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        idiomaPreferido
    );

    console.log(
        "===== IDIOMA ACTUALIZADO ====="
    );

    console.log(
        "Nuevo idioma:",
        idiomaPreferido
    );

mostrarSugerencias();

}


addMessage(text, "user");

    prompt.value = "";

    send.disabled = true;

    /*
    ========================================================
    BLOQUEO ABSOLUTO DE SOLICITUDES DE RESPUESTA
    ========================================================
    */

    const pregunta = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();


    const pideRespuesta =

        pregunta.includes("respuesta correcta") ||
        pregunta.includes("respuesta es") ||
        pregunta.includes("cual es la respuesta") ||
        pregunta.includes("cual es la correcta") ||
        pregunta.includes("cual opcion") ||
        pregunta.includes("que opcion") ||
        pregunta.includes("que tengo que escoger") ||
        pregunta.includes("que tengo que elegir") ||
        pregunta.includes("que debo escoger") ||
        pregunta.includes("que debo elegir") ||
        pregunta.includes("cual debo escoger") ||
        pregunta.includes("cual debo elegir") ||
        pregunta.includes("cual selecciono") ||
        pregunta.includes("que selecciono") ||
        pregunta.includes("cual marco") ||
        pregunta.includes("que marco") ||
        pregunta.includes("dime la respuesta") ||
        pregunta.includes("dame la respuesta") ||
        pregunta.includes("dime cual") ||
        pregunta.includes("dime que poner") ||
        pregunta.includes("que pongo") ||
        pregunta.includes("resuelve el ejercicio") ||
        pregunta.includes("resuelveme el ejercicio") ||
        pregunta.includes("hazme el ejercicio") ||
        pregunta.includes("haz el ejercicio por mi");


    /*
    ========================================================
    SI PIDE LA RESPUESTA, NO SE ENVÍA AL SERVIDOR
    ========================================================
    */

    if (pideRespuesta) {

        console.log(
            "===== SOLICITUD DE RESPUESTA BLOQUEADA ====="
        );

        console.log(
            "Pregunta bloqueada:",
            text
        );


        addMessage(
            "No puedo darte directamente la respuesta de un ejercicio ni decirte qué opción seleccionar. Puedo ayudarte explicándote la regla o el concepto necesario para que lo resuelvas por ti mismo.",
            "bot"
        );


        send.disabled = false;

        return;
    }


    /*
    ========================================================
    PREGUNTA NORMAL
    ========================================================
    */

    try {

        console.log(
            "===== PREGUNTA AL TUTOR ====="
        );

        console.log(
            "Pregunta:",
            text
        );


        const contextoParaPregunta = {

            tipo:
                storylineData.tipo,

            tema:
                storylineData.tema,

            nivel:
                storylineData.nivel,

            modulo:
                storylineData.modulo,

            seccion:
                storylineData.seccion,

            diapositiva:
                storylineData.diapositiva,

            contexto:
                storylineData.contexto,

            texto:
                storylineData.texto,

            Vcorrect:
                storylineData.Vcorrect,

            Vincorrect:
                storylineData.Vincorrect,

            Vvideo:
                storylineData.Vvideo

        };


        console.log(
            "===== CONTEXTO ENVIADO AL SERVIDOR ====="
        );

        console.log(
            contextoParaPregunta
        );


        const response =
    await askGPT(
        text,
        contextoParaPregunta,
        idiomaPreferido
    );


       const respuestaLimpia =
    response
        // Eliminar negritas y cursivas Markdown
        .replace(/\*\*(.*?)\*\*/gs, "$1")
        .replace(/\*(.*?)\*/gs, "$1")
        .replace(/__(.*?)__/gs, "$1")
        .replace(/_(.*?)_/gs, "$1")

        // Eliminar encabezados Markdown: #, ##, ###
        .replace(/^\s*#{1,6}\s*/gm, "")

        // Eliminar separadores Markdown: ---, ***, ___
        .replace(/^\s*([-*_])(?:\s*\1){2,}\s*$/gm, "")

        // Convertir filas de tablas Markdown en texto normal
        .replace(/^\s*\|(.+)\|\s*$/gm, "$1")
        .replace(/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/gm, "")

        // Eliminar separadores | de las tablas
        .replace(/\s*\|\s*/g, " — ")

        // Convertir <br> en salto de línea
        .replace(/<br\s*\/?>/gi, "\n")

        // Limpiar líneas vacías excesivas
        .replace(/\n{3,}/g, "\n\n")
        .trim();

addMessage(
    respuestaLimpia,
    "bot"
);


    } catch (error) {

        console.error(
            "ERROR AL ENVIAR:",
            error
        );


        addMessage(
            "Error al conectar con el servidor.",
            "bot"
        );

    }


    send.disabled = false;

}

/*
============================================================
BOTÓN ENVIAR
============================================================
*/

if (send) {

    send.onclick =
        sendMessage;

}


/*
============================================================
ENTER PARA ENVIAR
============================================================
*/

if (prompt) {

    prompt.addEventListener(
        "keydown",
        function(e) {

            if (
                e.key === "Enter" &&
                !e.shiftKey
            ) {

                e.preventDefault();

                sendMessage();

            }

        }
    );

}


/*
============================================================
INICIALIZACIÓN
============================================================
*/

window.addEventListener(
    "load",
    function() {

        cargarChat();

        iniciarSeleccionIdioma();


        setTimeout(
            solicitarContextoStoryline,
            1000
        );

    }
);