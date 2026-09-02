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


        setTimeout(
            solicitarContextoStoryline,
            1000
        );

    }
);