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

FUENTE:

vTema
vNivel
vModulo
vSeccion
vDiapositiva
vContexto
vTexto
Vcorrect
Vincorrect
============================================================
*/

function obtenerContextoStoryline(storyline) {

    /*
    ========================================================
    IMPORTANTE

    Aceptamos tanto:

    Vcorrect
    Vincorrect

    como:

    vCorrect
    vIncorrect

    Esto evita problemas si algún punto del envío cambia
    únicamente la mayúscula/minúscula del nombre.
    ========================================================
    */

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

        /*
        ====================================================
        RESPUESTAS DEL EJERCICIO
        ====================================================
        */

        Vcorrect:
            limpiarCampo(
                Vcorrect
            ),

        Vincorrect:
            limpiarCampo(
                Vincorrect
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
        "Vcorrect:",
        contexto.Vcorrect
    );

    console.log(
        "Vincorrect:",
        contexto.Vincorrect
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
        pregunta.includes("de que trata")
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
DETECTAR PREGUNTAS SOBRE EL ERROR DEL EJERCICIO
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
CONSTRUIR PROMPT DE CONTEXTO
============================================================
*/

function construirPrompt(contexto) {

    return `

Eres un tutor virtual de un curso educativo.

El contexto que recibes proviene DIRECTAMENTE
de las variables de Storyline del estudiante.


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
DATOS DEL EJERCICIO
============================================================

Vcorrect contiene las respuestas que Storyline
considera CORRECTAS:

${contexto.Vcorrect || "No disponible"}


Vincorrect contiene las respuestas que Storyline
considera INCORRECTAS:

${contexto.Vincorrect || "No disponible"}


============================================================
REGLA ESPECIAL PARA "¿POR QUÉ ME QUEDÓ MAL?"
============================================================

Cuando el estudiante pregunte:

"¿Por qué me quedó mal?"

"¿Por qué me quedó mal la respuesta?"

"¿Qué hice mal?"

"¿Por qué está mal?"

o haga una pregunta equivalente sobre el error
del ejercicio:

DEBES ANALIZAR DIRECTAMENTE EL CONTENIDO DE
Vincorrect.

Vincorrect es la fuente PRINCIPAL para explicar
el error.

NO necesitas saber qué opción seleccionó
el estudiante.

NO debes pedirle al estudiante que comparta
las frases nuevamente.

NO debes responder:

"No tengo disponibles las frases incorrectas."

si Vincorrect contiene información.

NO debes decir:

"necesito saber qué seleccionaste"

"necesito saber qué marcaste"

"compárteme las opciones"

"no puedo saber qué respuesta elegiste"

En cambio:

1. Lee todas las frases de Vincorrect.

2. Analiza cada frase incorrecta.

3. Identifica exactamente qué parte está mal.

4. Explica la regla gramatical, lingüística
   o de vocabulario correspondiente.

5. Utiliza Vcorrect como referencia para entender
   la estructura correcta del ejercicio.

6. Si es necesario, muestra la corrección.

7. Si hay varias frases en Vincorrect,
   analízalas una por una.

8. No inventes respuestas que no estén
   en los datos recibidos.

9. No afirmes que el estudiante seleccionó
   una frase específica.

10. No necesitas conocer la selección real
    del estudiante para explicar por qué
    las frases de Vincorrect son incorrectas.


============================================================
EJEMPLO DEL TIPO DE ANÁLISIS
============================================================

Si Vincorrect contiene:

"The woman who daughter goes..."

debes explicar que "who daughter" no expresa
posesión correctamente y que "whose daughter"
es la estructura adecuada.

Si Vincorrect contiene:

"The car who is parked..."

debes explicar que "who" se utiliza para personas
y que para un objeto como "car" corresponde
normalmente "which" o "that".

Estos ejemplos sirven solamente para mostrar
el tipo de análisis esperado.

Siempre debes analizar primero los datos reales
de Vincorrect.


============================================================
REGLAS GENERALES DEL TUTOR
============================================================

1. Responde siempre en español.

2. Utiliza los datos recibidos como fuente principal
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

8. Si pide que expliques el contenido,
   explica el contenido de Texto utilizando
   Contexto como apoyo.

9. Si pregunta por qué le quedó mal un ejercicio,
   analiza Vincorrect.

10. Utiliza Vcorrect como referencia para
    comprender la estructura correcta.

11. Nunca afirmes cuáles respuestas seleccionó
    el estudiante.

12. Nunca inventes selecciones del estudiante.

13. Mantén coherencia con la conversación anterior.

14. Si el estudiante hace referencia a algo
    que acaba de preguntar, utiliza el historial
    de conversación.

15. No inventes información que contradiga
    los datos recibidos.

16. Si el texto de la diapositiva contiene
    ejemplos, vocabulario, gramática,
    preguntas o instrucciones, puedes explicarlos.

17. No menciones variables internas.

18. No menciones JSON.

19. No menciones programación.

20. No menciones Storyline como parte
    de la respuesta al estudiante.

21. Responde de forma clara y apropiada
    para el nivel indicado.

22. Prioriza la explicación pedagógica
    sobre simplemente dar la respuesta.

23. Si Vincorrect contiene varias frases,
    puedes analizarlas una por una.

24. Si Vcorrect contiene varias frases,
    utilízalas conjuntamente como referencia
    para identificar la regla del ejercicio.

25. Cuando Vincorrect tenga contenido,
    úsalo directamente para explicar
    el error del ejercicio.

`;


}


/*
============================================================
PREPARAR HISTORIAL PARA LA IA
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
            .filter(mensaje =>
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
            role:
                "system",

            content:
                systemPrompt

        }

    ];


    /*
    ========================================================
    HISTORIAL
    ========================================================
    */

    if (
        Array.isArray(history) &&
        history.length > 0
    ) {

        mensajes.push(
            ...history
        );

    }


    /*
    ========================================================
    PREGUNTA ACTUAL
    ========================================================
    */

    mensajes.push({

        role:
            "user",

        content:
            pregunta

    });


    console.log(
        "===== HISTORIAL ENVIADO A GROQ ====="
    );

    console.log(
        history
    );


    console.log(
        "===== TOTAL DE MENSAJES A GROQ ====="
    );

    console.log(
        mensajes.length
    );


    /*
    ========================================================
    PETICIÓN A GROQ
    ========================================================
    */

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


    /*
    ========================================================
    COMPROBAR RESPUESTA
    ========================================================
    */

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

    console.error(
        "===== GROQ NO DEVOLVIÓ CONTENT ====="
    );

    console.error(
        JSON.stringify(
            data,
            null,
            2
        )
    );

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
            PREPARAR MEMORIA
            ====================================================
            */

            const historialIA =
                prepararHistorial(
                    history,
                    message
                );


            /*
            ====================================================
            MOSTRAR INFORMACIÓN
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


            console.log(
                "HISTORIAL RECIBIDO:",
                history.length,
                "mensajes"
            );


            console.log(
                "HISTORIAL UTILIZABLE:",
                historialIA.length,
                "mensajes"
            );


            /*
            ====================================================
            VERIFICACIÓN ESPECIAL DEL EJERCICIO
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
                    "Vcorrect disponible:",
                    Boolean(
                        contexto.Vcorrect
                    )
                );

                console.log(
                    "Vincorrect disponible:",
                    Boolean(
                        contexto.Vincorrect
                    )
                );

                console.log(
                    "===== VINCORRECT QUE SE ENVIARÁ A GROQ ====="
                );

                console.log(
                    contexto.Vincorrect
                );

                console.log(
                    "===== VCORRECT QUE SE ENVIARÁ A GROQ ====="
                );

                console.log(
                    contexto.Vcorrect
                );

            }


            /*
            ====================================================
            RESPUESTAS DIRECTAS DE UBICACIÓN
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
            PREGUNTAS SOBRE LO QUE ESTÁ EN PANTALLA
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
            TEXTO DE LA DIAPOSITIVA
            ====================================================
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
============================================================
PREGUNTA SOBRE ERROR DEL EJERCICIO
============================================================

TRATAMIENTO ESPECIAL

Cuando el estudiante pregunta por qué una respuesta
está mal, analizamos directamente Vincorrect y Vcorrect.

IMPORTANTE:
NO utilizamos el historial de conversación en este caso,
para evitar que una respuesta anterior de la IA interfiera
con el análisis actual.
============================================================
*/

if (
    esPreguntaSobreErrorEjercicio(
        message
    )
) {

    console.log(
        "===== ANÁLISIS ESPECIAL DEL EJERCICIO ====="
    );

    console.log(
        "Vcorrect:",
        contexto.Vcorrect
    );

    console.log(
        "Vincorrect:",
        contexto.Vincorrect
    );


    /*
    ========================================================
    COMPROBAR QUE EXISTAN RESPUESTAS INCORRECTAS
    ========================================================
    */

    if (
        !contexto.Vincorrect
    ) {

        console.warn(
            "Vincorrect está vacío."
        );

        return res.json({

            reply:
                "No tengo disponibles las respuestas incorrectas de este ejercicio."

        });

    }


    /*
    ========================================================
    PROMPT ESPECIAL
    ========================================================
    */

    const promptErrorEjercicio = `

Eres un tutor de inglés.

El estudiante está realizando un ejercicio de gramática.

El estudiante pregunta:

"${message}"


============================================================
RESPUESTAS CORRECTAS DEL EJERCICIO
============================================================

${contexto.Vcorrect || "No disponible"}


============================================================
RESPUESTAS INCORRECTAS DEL EJERCICIO
============================================================

${contexto.Vincorrect}


============================================================
TAREA
============================================================

Debes explicar POR QUÉ las frases de Vincorrect son
incorrectas.

IMPORTANTE:

Vincorrect contiene las frases que el ejercicio considera
INCORRECTAS.

Vcorrect contiene las frases que el ejercicio considera
CORRECTAS.

Debes utilizar ambos grupos para analizar la regla
gramatical del ejercicio.


============================================================
INSTRUCCIONES
============================================================

1. Lee cada frase de Vincorrect.

2. Identifica exactamente qué palabra, estructura
   o elemento gramatical hace que la frase sea incorrecta.

3. Compara la estructura incorrecta con las estructuras
   correctas presentes en Vcorrect cuando sea útil.

4. Explica la regla gramatical de manera sencilla.

5. Cuando sea posible, muestra cómo debería escribirse
   correctamente la frase incorrecta.

6. Si hay varias frases en Vincorrect, analiza cada una
   por separado.

7. No inventes frases que no estén relacionadas con
   el ejercicio.

8. No digas que no tienes acceso a las frases.

9. No pidas al estudiante que vuelva a proporcionar
   las opciones.

10. No necesitas saber cuál frase seleccionó realmente
    el estudiante.

11. NO utilices el historial anterior de la conversación
    para determinar cuáles son las frases correctas
    o incorrectas. Utiliza exclusivamente los datos
    proporcionados arriba.

12. Responde en español.

13. Sé claro y pedagógico.

14. No menciones Vcorrect, Vincorrect, Storyline,
    programación, variables, JSON ni el funcionamiento
    interno del sistema.


============================================================
FORMATO DE RESPUESTA
============================================================

Para cada frase incorrecta utiliza esta estructura:

Frase incorrecta:
[frase]

¿Qué está mal?
[explicación concreta]

Forma correcta:
[frase corregida]

¿Por qué?
[explicación sencilla de la regla]


============================================================
OBJETIVO
============================================================

El estudiante debe entender qué error gramatical
cometió y aprender la regla, no solamente recibir
la respuesta correcta.

IMPORTANTE:

Responde directamente con la explicación final.
No escribas ni muestres tu razonamiento interno.
No dediques espacio a analizar cómo vas a responder.

Sé conciso pero explica claramente cada frase incorrecta.

`;


    /*
    ========================================================
    LLAMAR A GROQ SIN HISTORIAL
    ========================================================
    */

    const reply =
        await consultarGroq(
            message,
            promptErrorEjercicio,
            []
        );


    console.log(
        "===== RESPUESTA DEL ANÁLISIS DEL EJERCICIO ====="
    );

    console.log(
        reply
    );


    return res.json({

        reply:
            reply

    });

}


            /*
            ====================================================
            PREGUNTA GENERAL → GROQ + CONTEXTO + MEMORIA
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