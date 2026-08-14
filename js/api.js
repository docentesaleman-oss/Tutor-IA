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

                        message: text,

                        storyline: {

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
                                storylineData.texto || ""

                        }

                    })

                }
            );


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


        const data =
            await response.json();


        console.log(
            "===== RESPUESTA DEL SERVIDOR ====="
        );

        console.log(
            data
        );


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