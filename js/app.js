const prompt = document.getElementById("prompt");
const send = document.getElementById("send");
const clearChat = document.getElementById("clearChat");


/*
============================================================
MEMORIA LOCAL DEL CHAT
============================================================
*/

const CHAT_STORAGE_KEY =
    "tutorIA_chatHistory";


let chatHistory = [];


/*
============================================================
BOTÓN ENVIAR
============================================================
*/

send.onclick = sendMessage;


prompt.addEventListener("keydown", e => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});


/*
============================================================
BOTÓN ELIMINAR CHAT
============================================================
*/

if (clearChat) {

    clearChat.onclick = function () {

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
CONTEXTO RECIBIDO DESDE STORYLINE

FUENTE EXCLUSIVA:
vTema
vNivel
vModulo
vSeccion
vDiapositiva
vContexto
vTexto
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
    texto: ""

};


/*
============================================================
ACTUALIZAR CONTEXTO DE STORYLINE
============================================================
*/

function actualizarStoryline(datos) {

    if (!datos) return;


    storylineData = {

        tipo: "contenido",

        tema:
            datos.tema ?? "",

        nivel:
            datos.nivel ?? "",

        modulo:
            datos.modulo ?? "",

        seccion:
            datos.seccion ?? "",

        diapositiva:
            datos.diapositiva ?? "",

        contexto:
            datos.contexto ?? "",

        texto:
            datos.texto ?? ""

    };


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

}


/*
============================================================
COMPATIBILIDAD CON EL CÓDIGO ANTERIOR
============================================================
*/

window.recibirDatosStoryline = function(datos) {

    actualizarStoryline(datos);

};


/*
============================================================
GUARDAR CHAT EN LOCALSTORAGE
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
CARGAR CHAT DESDE LOCALSTORAGE
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


        /*
        Reconstruir visualmente
        */

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
MOSTRAR MENSAJES
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


    /*
    Guardar mensaje
    */

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
ENVIAR PREGUNTA
============================================================
*/

async function sendMessage() {

    const text =
        prompt.value.trim();


    if (!text) return;


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

        console.log(
            "Contexto enviado:",
            storylineData
        );


        const response =
            await askGPT(
                text,
                storylineData
            );


        /*
        Mostrar respuesta
        y guardarla en memoria
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
RECIBIR MENSAJES DESDE STORYLINE
============================================================
*/

window.addEventListener(
    "message",
    function(event) {

        if (!event.data) return;


        /*
        CONTEXTO RECIBIDO
        */

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
INICIALIZAR APLICACIÓN
============================================================
*/

window.addEventListener(
    "load",
    function() {

        /*
        Primero recuperar el chat
        */

        cargarChat();


        /*
        Después solicitar contexto
        a Storyline
        */

        setTimeout(
            solicitarContextoStoryline,
            1000
        );

    }
);