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
    DATOS QUE POSTERIORMENTE RECIBIREMOS
    DESDE STORYLINE
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

        tema: datos.tema || "",
        modulo: datos.modulo || "",
        seccion: datos.seccion || "",
        diapositiva: datos.diapositiva || "",
        contexto: datos.contexto || ""

    };

    console.log("Datos recibidos desde Storyline:", storylineData);

};


/*
    ENVÍO DE LA PREGUNTA
*/

async function sendMessage() {

    const text = prompt.value.trim();

    if (text === "") return;

    addMessage(text, "user");

    prompt.value = "";

    send.disabled = true;

    const response = await askGPT(text, storylineData);

    addMessage(response, "bot");

    send.disabled = false;

}

window.addEventListener("message", function(event) {

    if (!event.data) return;

    if (event.data.type === "STORYLINE_CONTEXT") {

        console.log("MENSAJE RECIBIDO EN TUTOR:", event.data);

        storylineData = event.data.datos;

        console.log("CONTEXTO DE STORYLINE:", storylineData);

        if (storylineData.escenas) {
            console.log(
                "TOTAL ESCENAS RECIBIDAS:",
                storylineData.escenas.length
            );
        }
    }

    if (event.data.type === "STORYLINE_CURRENT_SLIDE") {

        console.log(
            "DIAPOSITIVA ACTUAL RECIBIDA EN TUTOR:",
            event.data.datos
        );

        storylineData.actual = event.data.datos;

        console.log(
            "ACTUALIZADO:",
            storylineData.actual
        );
    }

});