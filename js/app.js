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
    DATOS QUE RECIBIMOS DESDE STORYLINE
*/

let storylineData = {
    tipo: "",
    escenas: [],
    actual: null
};


/*
    FUNCIÓN PARA RECIBIR INFORMACIÓN
    DESDE STORYLINE
*/

window.recibirDatosStoryline = function(datos) {

    if (!datos) return;

    storylineData = {

        ...storylineData,

        ...datos

    };

    console.log(
        "Datos recibidos desde Storyline:",
        storylineData
    );

};


/*
    MOSTRAR MENSAJES EN EL CHAT
*/

function addMessage(text, sender) {

    const messages =
        document.getElementById("messages");

    if (!messages) {

        console.error(
            "ERROR: No se encontró el elemento #messages"
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
    ENVÍO DE LA PREGUNTA
*/

async function sendMessage() {

    const text =
        prompt.value.trim();

    if (text === "") return;


    /*
        Mostrar pregunta del estudiante
    */

    addMessage(
        text,
        "user"
    );


    /*
        Limpiar campo
    */

    prompt.value = "";


    /*
        Desactivar botón mientras responde
    */

    send.disabled = true;


    try {

        console.log(
            "ENVIANDO PREGUNTA:",
            text
        );

        console.log(
            "ENVIANDO STORYLINE:",
            storylineData
        );


        /*
            Preguntar al servidor
        */

        const response =
            await askGPT(
                text,
                storylineData
            );


        /*
            Mostrar respuesta del tutor
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


    /*
        Reactivar botón
    */

    send.disabled = false;

}


/*
    RECIBIR MENSAJES DESDE STORYLINE
*/

window.addEventListener(
    "message",
    function(event) {

        if (!event.data) return;


        /*
            CONEXIÓN / CONTEXTO GENERAL
        */

        if (
            event.data.type ===
            "STORYLINE_CONTEXT"
        ) {

            console.log(
                "MENSAJE RECIBIDO EN TUTOR:",
                event.data
            );


            storylineData =
                event.data.datos || {};


            console.log(
                "CONTEXTO DE STORYLINE:",
                storylineData
            );


            if (
                storylineData.escenas
            ) {

                console.log(
                    "TOTAL ESCENAS RECIBIDAS:",
                    storylineData.escenas.length
                );

            }

        }


        /*
            DIAPOSITIVA ACTUAL
        */

        if (
            event.data.type ===
            "STORYLINE_CURRENT_SLIDE"
        ) {

            console.log(
                "DIAPOSITIVA ACTUAL RECIBIDA EN TUTOR:",
                event.data.datos
            );


            storylineData.actual =
                event.data.datos;


            console.log(
                "ACTUALIZADO:",
                storylineData.actual
            );

        }

    }
);