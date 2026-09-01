```javascript
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

            history = JSON.parse(
                localStorage.getItem(
                    "tutorIA_chatHistory"
                ) || "[]"
            );


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
        LIMPIAR CONTEXTO
        ========================================================

        Solo se envían propiedades que realmente existen
        y contienen información.

        No se crean Vvideo, Vcorrect o Vincorrect
        artificialmente.
        ========================================================
        */

        const contextoLimpio = {};


        if (
            storylineData &&
            typeof storylineData === "object"
        ) {

            for (
                const [nombre, valor]
                of Object.entries(storylineData)
            ) {

                if (
                    valor !== undefined &&
                    valor !== null &&
                    String(valor).trim() !== ""
                ) {

                    contextoLimpio[nombre] =
                        String(valor).trim();

                }

            }

        }


        console.log(
            "===== CONTEXTO REAL ENVIADO ====="
        );


        console.log(
            contextoLimpio
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


                        storyline:
                            contextoLimpio,


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
```
