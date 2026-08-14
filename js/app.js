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

const STORYLINE_STORAGE_KEY =
    "tutorIA_storylineContext";


let chatHistory = [];


/*
============================================================
CONTEXTO DE STORYLINE
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
RECUPERAR ÚLTIMO CONTEXTO VÁLIDO
============================================================
*/

function cargarContextoStorylineGuardado() {

    try {

        const guardado =
            sessionStorage.getItem(
                STORYLINE_STORAGE_KEY
            );

        if (!guardado) {

            console.log(
                "No existe contexto Storyline guardado."
            );

            return;

        }

        const datos =
            JSON.parse(guardado);

        if (!datos || typeof datos !== "object") {

            return;

        }

        /*
        Recuperamos solamente valores válidos.
        */

        if (datos.tema) {
            storylineData.tema = datos.tema;
        }

        if (datos.nivel) {
            storylineData.nivel = datos.nivel;
        }

        if (datos.modulo) {
            storylineData.modulo = datos.modulo;
        }

        if (datos.seccion) {
            storylineData.seccion = datos.seccion;
        }

        if (datos.diapositiva) {
            storylineData.diapositiva = datos.diapositiva;
        }

        if (datos.contexto) {
            storylineData.contexto = datos.contexto;
        }

        if (datos.texto) {
            storylineData.texto = datos.texto;
        }

        console.log(
            "===== CONTEXTO STORYLINE RECUPERADO ====="
        );

        console.log(
            storylineData
        );

    } catch (error) {

        console.error(
            "ERROR RECUPERANDO CONTEXTO STORYLINE:",
            error
        );

    }

}


/*
============================================================
GUARDAR CONTEXTO STORYLINE
============================================================
*/

function guardarContextoStoryline() {

    try {

        sessionStorage.setItem(
            STORYLINE_STORAGE_KEY,
            JSON.stringify(storylineData)
        );

        console.log(
            "===== CONTEXTO STORYLINE GUARDADO ====="
        );

    } catch (error) {

        console.error(
            "ERROR GUARDANDO CONTEXTO STORYLINE:",
            error
        );

    }

}


/*
============================================================
VERIFICAR SI TENEMOS CONTEXTO
============================================================
*/

function tieneContextoStoryline() {

    return Boolean(

        storylineData.tema ||
        storylineData.nivel ||
        storylineData.modulo ||
        storylineData.seccion ||
        storylineData.diapositiva ||
        storylineData.contexto ||
        storylineData.texto

    );

}


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
ACTUALIZAR CONTEXTO DE STORYLINE
============================================================
*/

function actualizarStoryline(datos) {

    if (!datos) {

        console.warn(
            "STORYLINE → datos vacíos"
        );

        return;

    }


    /*
    SOLO reemplazar cuando Storyline
    realmente entrega un valor.
    */

    if (
        datos.tema !== undefined &&
        datos.tema !== null &&
        String(datos.tema).trim() !== ""
    ) {

        storylineData.tema =
            datos.tema;

    }


    if (
        datos.nivel !== undefined &&
        datos.nivel !== null &&
        String(datos.nivel).trim() !== ""
    ) {

        storylineData.nivel =
            datos.nivel;

    }


    if (
        datos.modulo !== undefined &&
        datos.modulo !== null &&
        String(datos.modulo).trim() !== ""
    ) {

        storylineData.modulo =
            datos.modulo;

    }


    if (
        datos.seccion !== undefined &&
        datos.seccion !== null &&
        String(datos.seccion).trim() !== ""
    ) {

        storylineData.seccion =
            datos.seccion;

    }


    if (
        datos.diapositiva !== undefined &&
        datos.diapositiva !== null &&
        String(datos.diapositiva).trim() !== ""
    ) {

        storylineData.diapositiva =
            datos.diapositiva;

    }


    if (
        datos.contexto !== undefined &&
        datos.contexto !== null &&
        String(datos.contexto).trim() !== ""
    ) {

        storylineData.contexto =
            datos.contexto;

    }


    if (
        datos.texto !== undefined &&
        datos.texto !== null &&
        String(datos.texto).trim() !== ""
    ) {

        storylineData.texto =
            datos.texto;

    }


    storylineData.tipo =
        datos.tipo || "contenido";


    /*
    Guardar inmediatamente el contexto válido.
    */

    guardarContextoStoryline();


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
ESPERAR CONTEXTO DE STORYLINE
============================================================
*/

function esperarContextoStoryline(
    tiempo = 500
) {

    return new Promise(resolve => {

        if (tieneContextoStoryline()) {

            resolve();

            return;

        }


        solicitarContextoStoryline();


        setTimeout(
            resolve,
            tiempo
        );

    });

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
    Mostrar pregunta.
    */

    addMessage(
        text,
        "user"
    );


    prompt.value = "";


    send.disabled = true;


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
        SI POR ALGUNA RAZÓN EL CONTEXTO SE PERDIÓ,
        LO SOLICITAMOS NUEVAMENTE A STORYLINE.
        ====================================================
        */

        if (!tieneContextoStoryline()) {

            console.warn(
                "CONTEXTO VACÍO → SOLICITANDO NUEVAMENTE A STORYLINE"
            );

            await esperarContextoStoryline(700);

        }


        /*
        ====================================================
        COPIA CONGELADA DEL CONTEXTO
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
                storylineData.texto

        };


        console.log(
            "===== CONTEXTO CONGELADO PARA LA PREGUNTA ====="
        );

        console.log(
            contextoParaPregunta
        );


        /*
        Enviar contexto al servidor.
        */

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
RECIBIR MENSAJES DESDE STORYLINE
============================================================
*/

window.addEventListener(
    "message",
    function(event) {

        if (!event.data) return;


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
INICIALIZAR APLICACIÓN
============================================================
*/

window.addEventListener(
    "load",
    function() {

        /*
        Primero recuperar el último contexto válido.
        */

        cargarContextoStorylineGuardado();


        /*
        Recuperar chat.
        */

        cargarChat();


        /*
        Solicitar contexto actual a Storyline.
        */

        setTimeout(
            solicitarContextoStoryline,
            1000
        );

    }
);