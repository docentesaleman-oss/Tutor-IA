const prompt = document.getElementById("prompt");
const send = document.getElementById("send");
const clearChat = document.getElementById("clearChat");


/*
============================================================
MEMORIA LOCAL DEL CHAT
============================================================
*/

const CHAT_STORAGE_KEY = "tutorIA_chatHistory";

let chatHistory = [];


/*
============================================================
CONTEXTO ACTUAL DE STORYLINE
============================================================

IMPORTANTE:

Este objeto representa ÚNICAMENTE el contexto actual
recibido desde Storyline.

Vcorrect y Vincorrect contienen:

Vcorrect:
Las respuestas que Storyline considera correctas.

Vincorrect:
Las respuestas que Storyline considera incorrectas.

Vvideo:
El contenido asociado al video actual.

El tutor NO sabe cuáles seleccionó realmente
el estudiante.
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

    Vvideo: ""

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


    const actualizarCampo = function(nombre) {

        if (
            datos[nombre] !== undefined &&
            datos[nombre] !== null
        ) {

            const valor =
                String(datos[nombre]).trim();

            if (valor !== "") {

                storylineData[nombre] =
                    valor;

            }

        }

    };


    actualizarCampo("tema");

    actualizarCampo("nivel");

    actualizarCampo("modulo");

    actualizarCampo("seccion");

    actualizarCampo("diapositiva");

    actualizarCampo("contexto");

    actualizarCampo("texto");


    /*
    ========================================================
    RESPUESTAS DEL EJERCICIO
    ========================================================
    */

    actualizarCampo("Vcorrect");

    actualizarCampo("Vincorrect");


    /*
    ========================================================
    CONTENIDO DEL VIDEO
    ========================================================
    */

    actualizarCampo("Vvideo");


    storylineData.tipo =
        datos.tipo || "contenido";


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

}


/*
============================================================
COMPATIBILIDAD CON CÓDIGO ANTERIOR
============================================================
*/

window.recibirDatosStoryline = function(datos) {

    actualizarStoryline(datos);

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
            JSON.stringify(chatHistory)
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


        if (!Array.isArray(historial)) {

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
            document.getElementById("messages");


        if (!messages) {

            return;

        }


        messages.innerHTML = "";


        for (
            const mensaje of chatHistory
        ) {

            const message =
                document.createElement("div");


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


        chatHistory = [];

    }

}


/*
============================================================
ELIMINAR CHAT
============================================================
*/

if (clearChat) {

    clearChat.onclick = function() {

        chatHistory = [];


        localStorage.removeItem(
            CHAT_STORAGE_KEY
        );


        const messages =
            document.getElementById("messages");


        if (messages) {

            messages.innerHTML = "";

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
        document.getElementById("messages");


    if (!messages) {

        console.error(
            "ERROR: No se encontró #messages"
        );

        return;

    }


    const message =
        document.createElement("div");


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


            actualizarStoryline(
                event.data.datos
            );

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
ENVIAR PREGUNTA
============================================================
*/

async function sendMessage() {

    const text =
        prompt.value.trim();


    if (!text) {

        return;

    }


    /*
    Mostrar pregunta
    */

    addMessage(
        text,
        "user"
    );


    /*
    Limpiar entrada
    */

    prompt.value = "";


    /*
    Desactivar botón
    */

    send.disabled = true;


    try {

        console.log(
            "===== PREGUNTA AL TUTOR ====="
        );


        console.log(
            "Pregunta:",
            text
        );

console.log("===== STORYLINE DATA ANTES DE ENVIAR =====");
console.log(storylineData);
console.log("Vvideo directo:", storylineData.Vvideo);


        /*
        ====================================================
        COPIA EXACTA DEL CONTEXTO ACTUAL
        ====================================================
        */

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


            /*
            ==================================================
            RESPUESTAS DEL EJERCICIO
            ==================================================
            */

            Vcorrect:
                storylineData.Vcorrect,

            Vincorrect:
                storylineData.Vincorrect,


            /*
            ==================================================
            CONTENIDO DEL VIDEO
            ==================================================
            */

            Vvideo:
                storylineData.Vvideo

        };


        console.log(
            "===== CONTEXTO ENVIADO AL SERVIDOR ====="
        );


        console.log(
            contextoParaPregunta
        );


        /*
        ====================================================
        ENVIAR AL SERVIDOR
        ====================================================
        */

        const response =
            await askGPT(
                text,
                contextoParaPregunta
            );


        /*
        Mostrar respuesta
        */

        addMessage(
            response,
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

        /*
        Recuperar SOLO el chat
        */

        cargarChat();


        /*
        Pedir a Storyline el contexto actual
        */

        setTimeout(
            solicitarContextoStoryline,
            1000
        );

    }
);