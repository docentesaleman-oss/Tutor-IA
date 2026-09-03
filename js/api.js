javascript
async function askGPT(text, storylineData) {

    try {

        console.log(
            "===== ENVIANDO AL SERVIDOR ====="
        );

        console.log(
            "Pregunta:",
            text
        );

        console.log(
            "Storyline:",
            storylineData
        );


        /*
        ========================================================
        RECUPERAR HISTORIAL DEL CHAT
        ========================================================
        */

        let history = [];

        try {

            const historialCompleto =
    JSON.parse(
        localStorage.getItem(
            "tutorIA_chatHistory_v2"
        ) || "[]"
    );

/*
============================================================
ENVIAR SOLO LAS ÚLTIMAS 3 INTERACCIONES
============================================================
Cada interacción está formada por:

1 mensaje del estudiante
1 respuesta del tutor

Por eso conservamos las últimas 6 entradas.
============================================================
*/

history =
    historialCompleto.slice(-6);

        } catch (error) {

            console.error(
                "ERROR LEYENDO HISTORIAL:",
                error
            );

            history = [];

        }


        console.log(
            "Historial enviado:",
            history
        );


        /*
        ========================================================
        ENVIAR PREGUNTA + STORYLINE + HISTORIAL
        ========================================================
        */

        const response =
            await fetch(
                "/chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            text,

                        storyline: {

                            tipo:
                                storylineData.tipo || "contenido",

                            tema:
                                storylineData.tema || "",

                            nivel:
                                storylineData.nivel || "",

                            modulo:
                                storylineData.modulo || "",

                            seccion:
                                storylineData.seccion || "",

                            diapositiva:
                                storylineData.diapositiva || "",

                            contexto:
                                storylineData.contexto || "",

                            texto:
                                storylineData.texto || "",

                            Vcorrect:
                                storylineData.Vcorrect || "",

                            Vincorrect:
                                storylineData.Vincorrect || "",

                            Vvideo:
                                storylineData.Vvideo || ""

                        },

                        history:
                            history

                    })

                }
            );


        /*
        ========================================================
        COMPROBAR RESPUESTA
        ========================================================
        */

        if (!response.ok) {

            console.error(
                "ERROR HTTP:",
                response.status
            );


            return (
                "Error del servidor: " +
                response.status
            );

        }


        /*
        ========================================================
        CONVERTIR RESPUESTA
        ========================================================
        */

        const data =
            await response.json();


        console.log(
            "===== RESPUESTA DEL SERVIDOR ====="
        );

        console.log(
            data
        );


        /*
        ========================================================
        DEVOLVER RESPUESTA
        ========================================================
        */

        return (
            data.reply ||
            "No recibí una respuesta del tutor."
        );


    } catch (error) {

        console.error(
            "ERROR AL CONECTAR CON EL SERVIDOR:",
            error
        );


        return (
            "Error al conectar con el servidor."
        );

    }

}
