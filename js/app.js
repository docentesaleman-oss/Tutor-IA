const prompt = document.getElementById("prompt");
const send = document.getElementById("send");

send.onclick = sendMessage;

prompt.addEventListener("keydown", e => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});


/*
============================================================
DATOS RECIBIDOS DESDE STORYLINE

ESTAS SON LAS ÚNICAS VARIABLES DE CONTEXTO
QUE UTILIZA EL TUTOR
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
RECIBIR CONTEXTO DESDE STORYLINE
============================================================
*/

function actualizarStoryline(datos) {

    if (!datos) return;


    storylineData = {

        tipo: "contenido",

        tema: datos.tema || "",
        nivel: datos.nivel || "",
        modulo: datos.modulo || "",
        seccion: datos.seccion || "",
        diapositiva: datos.diapositiva || "",
        contexto: datos.contexto || "",
        texto: datos.texto || ""

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
FUNCIÓN COMPATIBLE CON EL CÓDIGO ANTERIOR
============================================================
*/

window.recibirDatosStoryline = function(datos) {

    actualizarStoryline(datos);

};


/*
============================================================
MOSTRAR MENSAJES
============================================================
*/

function addMessage(text, sender) {

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


    message.textContent = text;


    messages.appendChild(message);


    messages.scrollTop =
        messages.scrollHeight;

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