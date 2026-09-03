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

    Vvideo: ""

};


/*
============================================================
ACTUALIZAR CONTEXTO DE STORYLINE
============================================================
*/

function actualizarStoryline(datos) {

    if (
        !datos ||
        typeof datos !== "object"
    ) {

        console.warn(
            "STORYLINE → datos inválidos:",
            datos
        );

        return;

    }


    if (
        datos.tipo !== undefined &&
        datos.tipo !== null
    ) {

        storylineData.tipo =
            String(
                datos.tipo
            ).trim() || "contenido";

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
        "Vvideo"

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
ENVIAR PREGUNTA
============================================================
*/

async function sendMessage() {

    const text =
        prompt.value.trim();


    if (!text) {

        return;

    }


    addMessage(
        text,
        "user"
    );


    prompt.value =
        "";


    send.disabled =
        true;


    try {

        console.log(
            "===== PREGUNTA AL TUTOR ====="
        );


        console.log(
            "Pregunta:",
            text
        );


        /*
        ====================================================
        UTILIZAR EL CONTEXTO QUE YA ESTÁ EN STORYLINE DATA
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


        console.log(
            "===== VVIDEO ENVIADO ====="
        );


        console.log(
            contextoParaPregunta.Vvideo
        );


        const response =
            await askGPT(
                text,
                contextoParaPregunta
            );


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


    send.disabled =
        false;

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


        setTimeout(
            solicitarContextoStoryline,
            1000
        );

    }
);