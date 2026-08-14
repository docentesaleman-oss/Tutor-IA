async function askGPT(text, storylineData) {

    try {

        console.log(
            "ENVIANDO STORYLINE AL SERVIDOR:",
            storylineData
        );


        const response = await fetch(
            "https://tutor-ia-cfxk.onrender.com/chat",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    message: text,

                    storyline: storylineData

                })

            }
        );


        /*
            COMPROBAR RESPUESTA DEL SERVIDOR
        */

        if (!response.ok) {

            console.error(
                "ERROR HTTP DEL SERVIDOR:",
                response.status
            );

            return (
                "Error del servidor: " +
                response.status
            );

        }


        /*
            CONVERTIR RESPUESTA A JSON
        */

        const data =
            await response.json();


        console.log(
            "RESPUESTA RECIBIDA DEL SERVIDOR:",
            data
        );


        /*
            DEVOLVER RESPUESTA DEL TUTOR
        */

        return (
            data.reply ||
            "No recibí una respuesta del tutor."
        );


    } catch (error) {

        console.error(
            "ERROR AL CONECTAR CON RENDER:",
            error
        );


        return (
            "Error al conectar con el servidor."
        );

    }

}