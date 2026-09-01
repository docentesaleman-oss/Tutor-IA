import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const app =
    express();


/*
============================================================
CONFIGURACIÓN
============================================================
*/

app.use(cors());

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.static(__dirname)
);


/*
============================================================
PÁGINA PRINCIPAL
============================================================
*/

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


/*
============================================================
LIMPIAR DATOS
============================================================
*/

function limpiarCampo(valor) {

    if (
        valor === undefined ||
        valor === null
    ) {

        return "";

    }

    return String(valor).trim();

}


/*
============================================================
OBTENER CONTEXTO OFICIAL DE STORYLINE
============================================================
*/

function obtenerContextoStoryline(storyline) {

    const Vcorrect =
        storyline?.Vcorrect ??
        storyline?.vCorrect ??
        storyline?.vcorrect ??
        "";

    const Vincorrect =
        storyline?.Vincorrect ??
        storyline?.vIncorrect ??
        storyline?.vincorrect ??
        "";

    const Vvideo =
        storyline?.Vvideo ??
        storyline?.vVideo ??
        storyline?.vvideo ??
        "";


    return {

        tema:
            limpiarCampo(
                storyline?.tema
            ),

        nivel:
            limpiarCampo(
                storyline?.nivel
            ),

        modulo:
            limpiarCampo(
                storyline?.modulo
            ),

        seccion:
            limpiarCampo(
                storyline?.seccion
            ),

        diapositiva:
            limpiarCampo(
                storyline?.diapositiva
            ),

        contexto:
            limpiarCampo(
                storyline?.contexto
            ),

        texto:
            limpiarCampo(
                storyline?.texto
            ),

        Vcorrect:
            limpiarCampo(
                Vcorrect
            ),

        Vincorrect:
            limpiarCampo(
                Vincorrect
            ),

        Vvideo:
            limpiarCampo(
                Vvideo
            )

    };

}


/*
============================================================
MOSTRAR CONTEXTO
============================================================
*/

function mostrarContexto(contexto) {

    console.log(
        "\n========================================"
    );

    console.log(
        "CONTEXTO RECIBIDO DESDE STORYLINE"
    );

    console.log(
        "========================================"
    );

    console.log(
        "vTema:",
        contexto.tema
    );

    console.log(
        "vNivel:",
        contexto.nivel
    );

    console.log(
        "vModulo:",
        contexto.modulo
    );

    console.log(
        "vSeccion:",
        contexto.seccion
    );

    console.log(
        "vDiapositiva:",
        contexto.diapositiva
    );

    console.log(
        "vContexto:",
        contexto.contexto
    );

    console.log(
        "vTexto:",
        contexto.texto
    );

    console.log(
        "Vcorrect:",
        contexto.Vcorrect
    );

    console.log(
        "Vincorrect:",
        contexto.Vincorrect
    );

    console.log(
        "Vvideo:",
        contexto.Vvideo
    );

    console.log(
        "========================================\n"
    );

}


/*
============================================================
NORMALIZAR TEXTO
============================================================
*/

function normalizar(texto) {

    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();

}


/*
============================================================
PREGUNTAS DE UBICACIÓN
============================================================
*/

function esPreguntaDeModulo(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes("en que modulo") ||
        pregunta.includes("en cual modulo") ||
        pregunta.includes("que modulo") ||
        pregunta.includes("cual es el modulo") ||
        pregunta.includes("nombre del modulo") ||
        pregunta.includes("nombre de modulo")
    );

}


function esPreguntaDeNivel(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes("en que nivel") ||
        pregunta.includes("que nivel") ||
        pregunta.includes("cual es el nivel")
    );

}


function esPreguntaDeTema(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes("cual es el tema") ||
        pregunta.includes("que tema") ||
        pregunta.includes("sobre que tema") ||
        pregunta === "de que trata"
    );

}


function esPreguntaDeSeccion(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes("en que seccion") ||
        pregunta.includes("que seccion") ||
        pregunta.includes("cual es la seccion")
    );

}


function esPreguntaDeDiapositiva(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes("en que diapositiva") ||
        pregunta.includes("que diapositiva") ||
        pregunta.includes("cual es la diapositiva") ||
        pregunta.includes("en que pagina") ||
        pregunta.includes("que pagina")
    );

}


function esPreguntaDeContexto(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes("que estoy viendo") ||
        pregunta.includes("que estoy haciendo") ||
        pregunta.includes("que estamos viendo") ||
        pregunta.includes("donde estoy")
    );

}


function esPreguntaDeTexto(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes("que dice la pantalla") ||
        pregunta.includes("que hay en pantalla") ||
        pregunta.includes("que aparece en pantalla") ||
        pregunta.includes("que dice") ||
        pregunta.includes("cual es el texto") ||
        pregunta.includes("que texto aparece")
    );

}


/*
============================================================
PREGUNTA SOBRE ERROR DEL EJERCICIO
============================================================
*/

function esPreguntaSobreErrorEjercicio(texto) {

    const pregunta =
        normalizar(texto);

    return (

        pregunta.includes("porque me quedo mal") ||
        pregunta.includes("por que me quedo mal") ||
        pregunta.includes("porque me quedo") ||
        pregunta.includes("por que me quedo") ||
        pregunta.includes("porque esta mal") ||
        pregunta.includes("por que esta mal") ||
        pregunta.includes("porque esta incorrecta") ||
        pregunta.includes("por que esta incorrecta") ||
        pregunta.includes("porque es incorrecta") ||
        pregunta.includes("por que es incorrecta") ||
        pregunta.includes("por que esta mal mi respuesta") ||
        pregunta.includes("porque esta mal mi respuesta") ||
        pregunta.includes("explicame el error") ||
        pregunta.includes("explicame por que") ||
        pregunta.includes("explica por que") ||
        pregunta.includes("que hice mal") ||
        pregunta.includes("que esta mal") ||
        pregunta.includes("cual fue el error")

    );

}


/*
============================================================
TEXTO COMPLETO DEL VIDEO
============================================================
*/

function esPreguntaSobreTextoVideo(texto) {

    const pregunta =
        normalizar(texto);

    return (

        pregunta.includes("cual es el texto del video") ||
        pregunta.includes("que dice el video") ||
        pregunta.includes("que dice el video completo") ||
        pregunta.includes("dame el texto del video") ||
        pregunta.includes("dame el texto completo del video") ||
        pregunta.includes("muestrame el texto del video") ||
        pregunta.includes("muestrame el texto completo del video") ||
        pregunta.includes("texto completo del video") ||
        pregunta.includes("transcripcion del video")

    );

}


/*
============================================================
CONTENIDO DEL VIDEO
============================================================
*/

function esPreguntaSobreContenidoVideo(texto) {

    const pregunta =
        normalizar(texto);

    return (

        pregunta.includes("de que trata el video") ||
        pregunta.includes("de que habla el video") ||
        pregunta.includes("que explica el video") ||
        pregunta.includes("explicame el video") ||
        pregunta.includes("explica el video") ||
        pregunta.includes("cual es el tema del video") ||
        pregunta.includes("que se habla en el video")

    );

}


/*
============================================================
CONSTRUIR PROMPT
============================================================
*/

function construirPrompt(contexto) {

    return `

Eres un tutor virtual de un curso educativo.

El contexto proviene directamente de las
variables actuales del curso.


============================================================
DATOS ACTUALES DEL CURSO
============================================================

Tema:
${contexto.tema || "No disponible"}

Nivel:
${contexto.nivel || "No disponible"}

Módulo:
${contexto.modulo || "No disponible"}

Sección:
${contexto.seccion || "No disponible"}

Diapositiva:
${contexto.diapositiva || "No disponible"}

Contexto:
${contexto.contexto || "No disponible"}

Texto:
${contexto.texto || "No disponible"}


============================================================
CONTENIDO DEL VIDEO
============================================================

${contexto.Vvideo || "No disponible"}


============================================================
DATOS DEL EJERCICIO
============================================================

RESPUESTAS CORRECTAS:

${contexto.Vcorrect || "No disponible"}


RESPUESTAS INCORRECTAS:

${contexto.Vincorrect || "No disponible"}


============================================================
REGLAS
============================================================

1. Responde siempre en español.

2. Utiliza el contexto recibido como fuente principal.

3. No inventes información.

4. Si preguntan por el ejercicio,
   utiliza Vcorrect y Vincorrect.

5. Si preguntan por qué una respuesta está mal,
   analiza Vincorrect directamente.

6. Si preguntan sobre el video,
   utiliza Vvideo como fuente principal.

7. Si solicitan el texto completo del video,
   devuelve Vvideo completo.

8. Si preguntan de qué trata el video,
   explica sus ideas principales usando Vvideo.

9. No afirmes qué opción seleccionó el estudiante.

10. Mantén las respuestas dentro del contenido
    del curso actual.

11. No menciones variables, JSON, programación
    ni funcionamiento interno.

12. Responde de forma clara y pedagógica.

`;

}


/*
============================================================
PREPARAR HISTORIAL
============================================================
*/

function prepararHistorial(
    history,
    preguntaActual
) {

    if (!Array.isArray(history)) {

        return [];

    }

    let historial =
        history
            .slice(-20)
            .map(mensaje => {

                const sender =
                    mensaje?.sender === "user"
                        ? "user"
                        : "assistant";

                const content =
                    limpiarCampo(
                        mensaje?.text
                    );

                return {

                    role:
                        sender,

                    content:
                        content

                };

            })
            .filter(
                mensaje =>
                    mensaje.content !== ""
            );


    const ultimo =
        historial[
            historial.length - 1
        ];


    if (
        ultimo &&
        ultimo.role === "user" &&
        normalizar(ultimo.content) ===
            normalizar(preguntaActual)
    ) {

        historial =
            historial.slice(
                0,
                -1
            );

    }


    return historial;

}


/*
============================================================
GROQ
============================================================
*/

async function consultarGroq(
    pregunta,
    systemPrompt,
    history = []
) {

    if (!process.env.GROQ_API_KEY) {

        throw new Error(
            "GROQ_API_KEY no está configurada."
        );

    }


    const mensajes = [

        {
            role:
                "system",

            content:
                systemPrompt

        }

    ];


    if (
        Array.isArray(history) &&
        history.length > 0
    ) {

        mensajes.push(
            ...history
        );

    }


    mensajes.push({

        role:
            "user",

        content:
            pregunta

    });


    const response =
        await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${process.env.GROQ_API_KEY}`

                },

                body:
                    JSON.stringify({

                        model:
                            "openai/gpt-oss-20b",

                        messages:
                            mensajes,

                        temperature:
                            0.1,

                        max_tokens:
                            1000

                    })

            }
        );


    if (!response.ok) {

        const error =
            await response.text();

        console.error(
            "ERROR GROQ:",
            error
        );

        throw new Error(
            "Groq respondió con HTTP " +
            response.status
        );

    }


    const data =
        await response.json();


    const reply =
        data?.choices?.[0]?.message?.content?.trim();


    if (!reply) {

        throw new Error(
            "Groq no devolvió contenido."
        );

    }


    return reply;

}


/*
============================================================
CHAT
============================================================
*/

app.post(
    "/chat",
    async (req, res) => {

        try {

            const message =
                limpiarCampo(
                    req.body?.message
                );


            const storyline =
                req.body?.storyline || {};


            const history =
                Array.isArray(
                    req.body?.history
                )
                    ? req.body.history
                    : [];


            if (!message) {

                return res.status(400).json({

                    reply:
                        "No recibí ninguna pregunta."

                });

            }


            /*
            ====================================================
            CONTEXTO
            ====================================================
            */

            const contexto =
                obtenerContextoStoryline(
                    storyline
                );


            mostrarContexto(
                contexto
            );


            const historialIA =
                prepararHistorial(
                    history,
                    message
                );


            /*
            ====================================================
            UBICACIÓN
            ====================================================
            */

            if (
                esPreguntaDeModulo(
                    message
                )
            ) {

                return res.json({

                    reply:
                        contexto.modulo
                            ? `Estás en el ${contexto.modulo}.`
                            : "No tengo disponible el módulo actual."

                });

            }


            if (
                esPreguntaDeNivel(
                    message
                )
            ) {

                return res.json({

                    reply:
                        contexto.nivel
                            ? `Estás en el nivel ${contexto.nivel}.`
                            : "No tengo disponible el nivel actual."

                });

            }


            if (
                esPreguntaDeTema(
                    message
                )
            ) {

                return res.json({

                    reply:
                        contexto.tema
                            ? `El tema actual es ${contexto.tema}.`
                            : "No tengo disponible el tema actual."

                });

            }


            if (
                esPreguntaDeSeccion(
                    message
                )
            ) {

                return res.json({

                    reply:
                        contexto.seccion
                            ? `Estás en la sección ${contexto.seccion}.`
                            : "No tengo disponible la sección actual."

                });

            }


            if (
                esPreguntaDeDiapositiva(
                    message
                )
            ) {

                return res.json({

                    reply:
                        contexto.diapositiva
                            ? `Estás en ${contexto.diapositiva}.`
                            : "No tengo disponible la diapositiva actual."

                });

            }


            /*
            ====================================================
            CONTEXTO DE PANTALLA
            ====================================================
            */

            if (
                esPreguntaDeContexto(
                    message
                )
            ) {

                const respuesta = [

                    contexto.contexto
                        ? `Contexto: ${contexto.contexto}`
                        : "",

                    contexto.texto
                        ? `\nContenido: ${contexto.texto}`
                        : ""

                ]
                .filter(Boolean)
                .join("\n");


                if (respuesta) {

                    return res.json({

                        reply:
                            respuesta

                    });

                }

            }


            /*
            ====================================================
            TEXTO DE PANTALLA
            ====================================================
            */

            if (
                esPreguntaDeTexto(
                    message
                )
            ) {

                return res.json({

                    reply:
                        contexto.texto ||
                        "No tengo texto disponible para la diapositiva actual."

                });

            }


            /*
            ====================================================
            ERROR DEL EJERCICIO
            ====================================================
            */

            if (
                esPreguntaSobreErrorEjercicio(
                    message
                )
            ) {

                if (
                    !contexto.Vincorrect
                ) {

                    return res.json({

                        reply:
                            "No tengo disponibles las respuestas incorrectas de este ejercicio."

                    });

                }


                const promptErrorEjercicio = `

Eres un tutor de inglés.

El estudiante pregunta:

"${message}"


RESPUESTAS CORRECTAS:

${contexto.Vcorrect || "No disponible"}


RESPUESTAS INCORRECTAS:

${contexto.Vincorrect}


Explica por qué las frases incorrectas
son incorrectas.

Analiza cada frase por separado.

Identifica el error.

Explica la regla.

Muestra la forma correcta cuando sea posible.

No inventes información.

No necesitas saber qué opción seleccionó
el estudiante.

Responde en español de forma clara y pedagógica.

`;


                const reply =
                    await consultarGroq(
                        message,
                        promptErrorEjercicio,
                        []
                    );


                return res.json({

                    reply:
                        reply

                });

            }


            /*
            ====================================================
            TEXTO COMPLETO DEL VIDEO
            ====================================================
            */

            if (
                esPreguntaSobreTextoVideo(
                    message
                )
            ) {

                if (
                    contexto.Vvideo
                ) {

                    return res.json({

                        reply:
                            contexto.Vvideo

                    });

                }


                return res.json({

                    reply:
                        "No tengo disponible el texto del video actual."

                });

            }


            /*
            ====================================================
            CONTENIDO DEL VIDEO
            ====================================================
            */

            if (
                esPreguntaSobreContenidoVideo(
                    message
                )
            ) {

                if (
                    !contexto.Vvideo
                ) {

                    return res.json({

                        reply:
                            "No tengo disponible el contenido del video actual."

                    });

                }


                const promptVideo = `

Eres un tutor virtual.

El estudiante está viendo un video.

Pregunta:

"${message}"


TEXTO DEL VIDEO:

${contexto.Vvideo}


Responde utilizando exclusivamente
la información respaldada por el texto del video.

Explica las ideas principales de forma clara
y pedagógica.

No inventes información.

Responde en español.

`;


                const reply =
                    await consultarGroq(
                        message,
                        promptVideo,
                        historialIA
                    );


                return res.json({

                    reply:
                        reply

                });

            }


            /*
            ====================================================
            PREGUNTA GENERAL
            ====================================================
            */

            const systemPrompt =
                construirPrompt(
                    contexto
                );


            const reply =
                await consultarGroq(
                    message,
                    systemPrompt,
                    historialIA
                );


            return res.json({

                reply:
                    reply

            });


        } catch (error) {

            console.error(
                "===== ERROR /chat ====="
            );

            console.error(
                error
            );


            return res.status(500).json({

                reply:
                    "Ocurrió un error al procesar la pregunta."

            });

        }

    }
);


/*
============================================================
HEALTH CHECK
============================================================
*/

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            ok:
                true,

            service:
                "Tutor IA",

            video:
                true

        });

    }
);


/*
============================================================
INICIAR SERVIDOR
============================================================
*/

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            "========================================"
        );

        console.log(
            "TUTOR IA INICIADO"
        );

        console.log(
            "Puerto:",
            PORT
        );

        console.log(
            "Modelo:",
            "openai/gpt-oss-20b"
        );

        console.log(
            "Vvideo:",
            "ACTIVADO"
        );

        console.log(
            "Vcorrect / Vincorrect:",
            "ACTIVADOS"
        );

        console.log(
            "========================================"
        );

    }
);