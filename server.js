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

ESTE ES EL ÚNICO ORIGEN DEL CONTEXTO.
============================================================
*/

function obtenerContextoStoryline(storyline) {

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
            )

    };

}


/*
============================================================
MOSTRAR CONTEXTO EN CONSOLA
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
        "========================================\n"
    );

}


/*
============================================================
DETECTAR PREGUNTAS DE UBICACIÓN
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


function esPreguntaDeModulo(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes(
            "en que modulo"
        ) ||
        pregunta.includes(
            "en cual modulo"
        ) ||
        pregunta.includes(
            "que modulo"
        ) ||
        pregunta.includes(
            "cual es el modulo"
        )
    );

}


function esPreguntaDeNivel(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes(
            "en que nivel"
        ) ||
        pregunta.includes(
            "que nivel"
        ) ||
        pregunta.includes(
            "cual es el nivel"
        )
    );

}


function esPreguntaDeTema(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes(
            "cual es el tema"
        ) ||
        pregunta.includes(
            "que tema"
        ) ||
        pregunta.includes(
            "sobre que tema"
        ) ||
        pregunta.includes(
            "de que trata"
        )
    );

}


function esPreguntaDeSeccion(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes(
            "en que seccion"
        ) ||
        pregunta.includes(
            "que seccion"
        ) ||
        pregunta.includes(
            "cual es la seccion"
        )
    );

}


function esPreguntaDeDiapositiva(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes(
            "en que diapositiva"
        ) ||
        pregunta.includes(
            "que diapositiva"
        ) ||
        pregunta.includes(
            "cual es la diapositiva"
        ) ||
        pregunta.includes(
            "en que pagina"
        ) ||
        pregunta.includes(
            "que pagina"
        )
    );

}


function esPreguntaDeContexto(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes(
            "que estoy viendo"
        ) ||
        pregunta.includes(
            "que estoy haciendo"
        ) ||
        pregunta.includes(
            "que estamos viendo"
        ) ||
        pregunta.includes(
            "donde estoy"
        )
    );

}


function esPreguntaDeTexto(texto) {

    const pregunta =
        normalizar(texto);

    return (
        pregunta.includes(
            "que dice la pantalla"
        ) ||
        pregunta.includes(
            "que hay en pantalla"
        ) ||
        pregunta.includes(
            "que aparece en pantalla"
        ) ||
        pregunta.includes(
            "que dice"
        ) ||
        pregunta.includes(
            "cual es el texto"
        ) ||
        pregunta.includes(
            "que texto aparece"
        )
    );

}


/*
============================================================
CONSTRUIR CONTEXTO PARA LA IA
============================================================
*/

function construirPrompt(contexto) {

    return `

Eres un tutor virtual de un curso educativo.

El contexto que recibes proviene DIRECTAMENTE
de las variables de Storyline del estudiante.

DATOS ACTUALES:

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


REGLAS DEL TUTOR:

1. Responde siempre en español.

2. Utiliza estos datos como fuente principal
   para responder sobre el curso.

3. Si el estudiante pregunta en qué módulo está,
   utiliza exactamente el valor de Módulo.

4. Si pregunta cuál es el tema,
   utiliza exactamente el valor de Tema.

5. Si pregunta en qué sección está,
   utiliza exactamente el valor de Sección.

6. Si pregunta qué diapositiva está viendo,
   utiliza exactamente el valor de Diapositiva.

7. Si pregunta qué está viendo,
   utiliza Contexto y Texto.

8. Si pide que le expliques el contenido,
   explica el contenido de Texto utilizando
   Contexto como apoyo.

9. No inventes información que contradiga
   los datos recibidos.

10. Si el texto de la diapositiva contiene
    ejemplos, vocabulario, gramática,
    preguntas o instrucciones, puedes
    explicarlos.

11. No menciones variables internas.

12. No menciones JSON.

13. No menciones programación.

14. No menciones Storyline como parte
    de la respuesta al estudiante.

15. Responde de forma clara y apropiada
    para el nivel indicado.

`;

}


/*
============================================================
LLAMAR A GROQ
============================================================
*/

async function consultarGroq(
    pregunta,
    systemPrompt
) {

    if (!process.env.GROQ_API_KEY) {

        throw new Error(
            "GROQ_API_KEY no está configurada."
        );

    }


    const response =
        await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${process.env.GROQ_API_KEY}`

                },

                body: JSON.stringify({

                    model:
                        "openai/gpt-oss-20b",

                    messages: [

                        {
                            role: "system",

                            content:
                                systemPrompt

                        },

                        {
                            role: "user",

                            content:
                                pregunta

                        }

                    ],

                    temperature: 0.1,

                    max_tokens: 500

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


            if (!message) {

                return res.status(400).json({

                    reply:
                        "No recibí ninguna pregunta."

                });

            }


            /*
            ----------------------------------------------------
            OBTENER LAS SIETE VARIABLES
            ----------------------------------------------------
            */

            const contexto =
                obtenerContextoStoryline(
                    storyline
                );


            /*
            ----------------------------------------------------
            MOSTRAR EN CONSOLA DEL SERVIDOR
            ----------------------------------------------------
            */

            console.log(
                "\n\n===== NUEVA PREGUNTA ====="
            );

            console.log(
                "PREGUNTA:",
                message
            );


            mostrarContexto(
                contexto
            );


            /*
            ----------------------------------------------------
            RESPUESTAS DIRECTAS DE UBICACIÓN
            ----------------------------------------------------
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
            ----------------------------------------------------
            PREGUNTAS SOBRE LO QUE ESTÁ EN PANTALLA
            ----------------------------------------------------
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
                        reply: respuesta
                    });

                }

            }


            /*
            ----------------------------------------------------
            TEXTO DE LA DIAPOSITIVA
            ----------------------------------------------------
            */

            if (
                esPreguntaDeTexto(
                    message
                )
            ) {

                if (
                    contexto.texto
                ) {

                    return res.json({

                        reply:
                            contexto.texto

                    });

                }


                return res.json({

                    reply:
                        "No tengo texto disponible para la diapositiva actual."

                });

            }


            /*
            ----------------------------------------------------
            TODAS LAS DEMÁS PREGUNTAS
            ----------------------------------------------------
            */

            const systemPrompt =
                construirPrompt(
                    contexto
                );


            const reply =
                await consultarGroq(
                    message,
                    systemPrompt
                );


            console.log(
                "RESPUESTA:",
                reply
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
            "Contexto:",
            "vTema, vNivel, vModulo, vSeccion, vDiapositiva, vContexto, vTexto"
        );

        console.log(
            "========================================"
        );

    }
);