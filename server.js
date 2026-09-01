import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

app.use(express.static(__dirname));

/*
============================================================
PÁGINA PRINCIPAL
============================================================
*/

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "index.html")
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
OBTENER CONTEXTO DE STORYLINE
============================================================
*/

function obtenerContextoStoryline(storyline) {

    const datos =
        storyline &&
        typeof storyline === "object"
            ? storyline
            : {};

    const contexto = {};

    /*
    ========================================================
    CAMPOS GENERALES
    ========================================================
    */

    const campos = [
        "tipo",
        "tema",
        "nivel",
        "modulo",
        "seccion",
        "diapositiva",
        "contexto",
        "texto"
    ];

    for (const nombre of campos) {

        const valor =
            limpiarCampo(
                datos[nombre]
            );

        if (valor !== "") {
            contexto[nombre] = valor;
        }
    }

    /*
    ========================================================
    VARIABLES ESPECIALES
    ========================================================
    */

    const Vcorrect =
        datos.Vcorrect ??
        datos.vCorrect ??
        datos.vcorrect ??
        "";

    const Vincorrect =
        datos.Vincorrect ??
        datos.vIncorrect ??
        datos.vincorrect ??
        "";

    const Vvideo =
        datos.Vvideo ??
        datos.vVideo ??
        datos.vvideo ??
        "";

    if (limpiarCampo(Vcorrect) !== "") {
        contexto.Vcorrect =
            limpiarCampo(Vcorrect);
    }

    if (limpiarCampo(Vincorrect) !== "") {
        contexto.Vincorrect =
            limpiarCampo(Vincorrect);
    }

    if (limpiarCampo(Vvideo) !== "") {
        contexto.Vvideo =
            limpiarCampo(Vvideo);
    }

    return contexto;
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
        "CONTEXTO COMPLETO:",
        contexto
    );

    console.log(
        "vTema:",
        contexto.tema || ""
    );

    console.log(
        "vNivel:",
        contexto.nivel || ""
    );

    console.log(
        "vModulo:",
        contexto.modulo || ""
    );

    console.log(
        "vSeccion:",
        contexto.seccion || ""
    );

    console.log(
        "vDiapositiva:",
        contexto.diapositiva || ""
    );

    console.log(
        "vContexto:",
        contexto.contexto || ""
    );

    console.log(
        "vTexto:",
        contexto.texto || ""
    );

    console.log(
        "Vcorrect:",
        contexto.Vcorrect || ""
    );

    console.log(
        "Vincorrect:",
        contexto.Vincorrect || ""
    );

    console.log(
        "Vvideo:",
        contexto.Vvideo || ""
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
        pregunta.includes("sobre que tema")
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
        pregunta.includes("donde estoy") ||
        pregunta.includes("cual es el contexto") ||
        pregunta.includes("cual es el contexto actual")
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
PREGUNTA POR TEXTO DEL VIDEO
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
PREGUNTA SOBRE CONTENIDO DEL VIDEO
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
        pregunta.includes("que se habla en el video") ||
        pregunta.includes("cual es el contenido del video") ||
        pregunta.includes("sobre que trata el video")
    );
}

/*
============================================================
PROMPT GENERAL
============================================================
*/

function construirPrompt(contexto) {

    return `

Eres un tutor virtual de un curso educativo.

El contexto recibido proviene directamente
del contenido actual del curso.

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

Si Vvideo está disponible, contiene el contenido
del video actual.

Utilízalo como fuente principal para responder
preguntas relacionadas con el video.

Vvideo:

${contexto.Vvideo || "No disponible"}

============================================================
DATOS DEL EJERCICIO
============================================================

Vcorrect:

${contexto.Vcorrect || "No disponible"}

Vincorrect:

${contexto.Vincorrect || "No disponible"}

============================================================
REGLAS GENERALES
============================================================

1. Responde siempre en español.

2. Utiliza primero el contenido recibido.

3. No inventes información.

4. Mantente relacionado con la lección actual.

5. Si el estudiante pregunta sobre el video,
   utiliza Vvideo.

6. Si el estudiante pregunta por un ejercicio,
   utiliza los datos del ejercicio.

7. Nunca inventes qué opción seleccionó
   el estudiante.

8. No menciones variables internas,
   JSON, programación ni funcionamiento
   interno del sistema.

9. Mantén coherencia con el historial.

10. Explica de forma clara y pedagógica.

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
                    role: sender,
                    content: content
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
            historial.slice(0, -1);
    }

    return historial;
}

/*
============================================================
LLAMAR A GROQ
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
            role: "system",
            content: systemPrompt
        }
    ];

    if (
        Array.isArray(history) &&
        history.length > 0
    ) {
        mensajes.push(...history);
    }

    mensajes.push({
        role: "user",
        content: pregunta
    });

    console.log(
        "===== HISTORIAL ENVIADO A GROQ ====="
    );

    console.log(history);

    console.log(
        "===== TOTAL DE MENSAJES A GROQ ====="
    );

    console.log(mensajes.length);

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

    console.log(
        "===== RESPUESTA COMPLETA DE GROQ ====="
    );

    console.dir(
        data,
        {
            depth: null
        }
    );

    const reply =
        data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {

        throw new Error(
            "Groq no devolvió contenido."
        );
    }

    console.log(
        "RESPUESTA GROQ:",
        reply
    );

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
            OBTENER CONTEXTO
            ====================================================
            */

            const contexto =
                obtenerContextoStoryline(
                    storyline
                );

            /*
            ====================================================
            HISTORIAL
            ====================================================
            */

            const historialIA =
                prepararHistorial(
                    history,
                    message
                );

            /*
            ====================================================
            LOG
            ====================================================
            */

            console.log(
                "\n\n========================================"
            );

            console.log(
                "NUEVA PREGUNTA"
            );

            console.log(
                "========================================"
            );

            console.log(
                "PREGUNTA:",
                message
            );

            mostrarContexto(
                contexto
            );

            /*
            ====================================================
            MÓDULO
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

            /*
            ====================================================
            NIVEL
            ====================================================
            */

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

            /*
            ====================================================
            TEMA
            ====================================================
            */

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

            /*
            ====================================================
            SECCIÓN
            ====================================================
            */

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

            /*
            ====================================================
            DIAPOSITIVA
            ====================================================
            */

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
            CONTEXTO
            ====================================================
            */

            if (
                esPreguntaDeContexto(
                    message
                )
            ) {

                const partes = [];

                if (contexto.contexto) {

                    partes.push(
                        `Contexto: ${contexto.contexto}`
                    );
                }

                if (contexto.texto) {

                    partes.push(
                        `Contenido: ${contexto.texto}`
                    );
                }

                if (contexto.Vvideo) {

                    partes.push(
                        `El contenido corresponde a un video sobre: ${contexto.Vvideo}`
                    );
                }

                if (partes.length > 0) {

                    return res.json({

                        reply:
                            partes.join(
                                "\n\n"
                            )

                    });
                }

                return res.json({

                    reply:
                        "No tengo disponible el contexto actual."

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

                if (contexto.Vvideo) {

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

                console.log(
                    "===== PREGUNTA SOBRE CONTENIDO DEL VIDEO ====="
                );

                console.log(
                    "Vvideo recibido:",
                    contexto.Vvideo || "[VACÍO]"
                );

                if (!contexto.Vvideo) {

                    return res.json({

                        reply:
                            "No tengo disponible el contenido del video actual."

                    });
                }

                const promptVideo = `

Eres un tutor virtual de un curso educativo.

El estudiante está viendo un video del curso.

============================================================
CONTENIDO REAL DEL VIDEO
============================================================

${contexto.Vvideo}

============================================================
PREGUNTA DEL ESTUDIANTE
============================================================

${message}

============================================================
INSTRUCCIONES
============================================================

Responde utilizando EXCLUSIVAMENTE la información
contenida en el texto del video.

Si pregunta "¿de qué trata el video?",
explica brevemente:

- cuál es el tema principal;
- cuáles son las ideas principales;
- qué conceptos o reglas explica;
- los ejemplos importantes que aparecen.

No inventes información.

No agregues conocimientos externos como si estuvieran
en el video.

Si el video explica una regla gramatical,
puedes explicarla de manera sencilla basándote
en lo que dice el video.

Responde en español.

No menciones variables, JSON, programación,
Storyline ni el funcionamiento interno del sistema.

Sé claro, directo y pedagógico.

`;

                const reply =
                    await consultarGroq(
                        message,
                        promptVideo,
                        historialIA
                    );

                return res.json({
                    reply: reply
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

                console.log(
                    "===== PREGUNTA SOBRE ERROR DEL EJERCICIO ====="
                );

                console.log(
                    "Vcorrect:",
                    contexto.Vcorrect || "[VACÍO]"
                );

                console.log(
                    "Vincorrect:",
                    contexto.Vincorrect || "[VACÍO]"
                );

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

El estudiante está realizando un ejercicio de gramática.

============================================================
RESPUESTAS CORRECTAS
============================================================

${contexto.Vcorrect || "No disponible"}

============================================================
RESPUESTAS INCORRECTAS
============================================================

${contexto.Vincorrect}

============================================================
TAREA
============================================================

Explica por qué las frases consideradas incorrectas
son incorrectas.

Analiza directamente las frases recibidas.

Identifica la palabra, estructura o regla gramatical
que causa el error.

Cuando sea útil, compara con las respuestas correctas.

Si existen varias frases incorrectas, analízalas
una por una.

No inventes información.

No afirmes cuál opción seleccionó el estudiante.

No pidas al estudiante que vuelva a proporcionar
las frases.

Responde en español.

Sé claro, breve y pedagógico.

No menciones variables, JSON, programación
ni el funcionamiento interno del sistema.

`;

                const reply =
                    await consultarGroq(
                        message,
                        promptErrorEjercicio,
                        []
                    );

                return res.json({
                    reply: reply
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
                reply: reply
            });

        } catch (error) {

            console.error(
                "===== ERROR /chat ====="
            );

            console.error(error);

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
            status: "ok",
            service: "tutor-storyline"
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
    "0.0.0.0",
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
            "Host:",
            "0.0.0.0"
        );

        console.log(
            "Modelo:",
            "openai/gpt-oss-20b"
        );

        console.log(
            "Contexto:",
            "tema, nivel, modulo, seccion, diapositiva, contexto, texto, Vvideo"
        );

        console.log(
            "Ejercicio:",
            "Vcorrect, Vincorrect"
        );

        console.log(
            "Memoria:",
            "historial enviado desde localStorage"
        );

        console.log(
            "========================================"
        );

    }
);