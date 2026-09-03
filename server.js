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
Vvideo
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
BLOQUEAR SOLICITUDES DE RESPUESTA DE EJERCICIOS
============================================================
*/

function esSolicitudDeRespuesta(texto, contexto = {}) {

    const pregunta =
        normalizar(texto);

    const contextoEjercicio =
        normalizar(
            [
                contexto.seccion,
                contexto.contexto,
                contexto.texto
            ].join(" ")
        );

    const esEjercicio =
        contextoEjercicio.includes("pretest") ||
        contextoEjercicio.includes("posttest") ||
        contextoEjercicio.includes("ejercicio") ||
        contextoEjercicio.includes("actividad") ||
        contextoEjercicio.includes("evaluacion") ||
        contextoEjercicio.includes("selecciona") ||
        contextoEjercicio.includes("seleccione") ||
        contextoEjercicio.includes("elige") ||
        contextoEjercicio.includes("escoge") ||
        Boolean(contexto.Vcorrect) ||
        Boolean(contexto.Vincorrect);

    const solicitudRespuesta =
        pregunta.includes("respuesta correcta") ||
        pregunta.includes("cual es la respuesta") ||
        pregunta.includes("cual es la correcta") ||
        pregunta.includes("cual opcion") ||
        pregunta.includes("que opcion") ||
        pregunta.includes("que debo elegir") ||
        pregunta.includes("que debo escoger") ||
        pregunta.includes("que tengo que elegir") ||
        pregunta.includes("que tengo que escoger") ||
        pregunta.includes("cual debo elegir") ||
        pregunta.includes("cual debo escoger") ||
        pregunta.includes("que selecciono") ||
        pregunta.includes("cual selecciono") ||
        pregunta.includes("que marco") ||
        pregunta.includes("cual marco") ||
        pregunta.includes("que pongo") ||
        pregunta.includes("que escribo") ||
        pregunta.includes("dime la respuesta") ||
        pregunta.includes("dame la respuesta") ||
        pregunta.includes("dime cual") ||
        pregunta.includes("resuelve el ejercicio") ||
        pregunta.includes("resuelveme el ejercicio") ||
        pregunta.includes("haz el ejercicio") ||
        pregunta.includes("hazme el ejercicio") ||
        pregunta.includes("hazlo por mi") ||
        pregunta.includes("esta bien mi respuesta") ||
        pregunta.includes("mi respuesta esta bien") ||
        pregunta.includes("mi respuesta es correcta") ||
        pregunta.includes("es correcta mi respuesta") ||
        pregunta.includes("esta correcta mi respuesta");

   
    const solicitudValidacion =
    pregunta.includes("esta bien") ||
    pregunta.includes("esta mal") ||
    pregunta.includes("es correcta") ||
    pregunta.includes("es incorrecta") ||
    pregunta.includes("esta correcta") ||
    pregunta.includes("esta incorrecta") ||
    pregunta.includes("es correcto") ||
    pregunta.includes("es incorrecto") ||
    pregunta.includes("esta escrita correctamente") ||
    pregunta.includes("esta bien escrita") ||
    pregunta.includes("esta mal escrita") ||
    pregunta.includes("es correcto escribir") ||
    pregunta.includes("es correcto decir") ||
    pregunta.includes("lo escribi bien") ||
    pregunta.includes("lo escribi mal") ||
    pregunta.includes("la escribi bien") ||
    pregunta.includes("la escribi mal");

    return (
        solicitudRespuesta ||
               (esEjercicio && solicitudValidacion)
    );

}

/*
============================================================
PREGUNTAS SOBRE ERROR DEL EJERCICIO
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
DETECTAR GUION DE VINCORRECT
============================================================
*/

function esGuionVincorrect(contexto = {}) {

    const Vincorrect =
        normalizar(
            contexto.Vincorrect
        );

    return (
        Vincorrect.includes(
            "usa vcorrect para determinar la respuesta correcta y vcontexto para determinar la dinamica del ejercicio"
        )
    );

}

/*
============================================================
PREGUNTA POR EL TEXTO COMPLETO DEL VIDEO
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
PREGUNTA SOBRE EL CONTENIDO DEL VIDEO
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
CONSTRUIR PROMPT DE CONTEXTO
============================================================
*/

function construirPrompt(contexto) {

    return `

Eres un tutor virtual de un curso educativo.

El contexto que recibes proviene DIRECTAMENTE
de las variables del curso del estudiante.


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

El siguiente contenido corresponde al video
actual que está viendo el estudiante.

Utiliza esta información como fuente principal
para responder preguntas relacionadas con el video.

Vvideo:

${contexto.Vvideo || "No disponible"}


============================================================
DATOS DEL EJERCICIO
============================================================

Vcorrect contiene las respuestas que el ejercicio
considera CORRECTAS:

${contexto.Vcorrect || "No disponible"}


Vincorrect contiene las respuestas que el ejercicio
considera INCORRECTAS:

${contexto.Vincorrect || "No disponible"}


============================================================
REGLA PARA PREGUNTAS SOBRE ERRORES
============================================================

Cuando el estudiante pregunte por qué una respuesta
está mal, analiza directamente las frases incorrectas
proporcionadas.

No necesitas saber cuál opción seleccionó realmente
el estudiante.

No debes pedir al estudiante que vuelva a proporcionar
las frases.

Analiza las frases incorrectas una por una.

Identifica qué parte está mal.

Explica la regla gramatical o lingüística.

Utiliza las frases correctas como referencia.

No inventes información.



============================================================
REGLAS GENERALES
============================================================

1. Responde siempre en español.

2. Utiliza los datos recibidos como fuente principal.

3. Si pregunta por el módulo, utiliza el módulo actual.

4. Si pregunta por el nivel, utiliza el nivel actual.

5. Si pregunta por el tema, utiliza el tema actual.

6. Si pregunta por la sección, utiliza la sección actual.

7. Si pregunta por la diapositiva, utiliza la diapositiva actual.

8. Si pregunta qué está viendo, utiliza Contexto y Texto.

9. REGLA ESTRICTA SOBRE EJERCICIOS:
   Nunca proporciones, confirmes, corrijas, selecciones,
   completes, deduzcas ni reveles directa o indirectamente
   la respuesta de un ejercicio.

10. Si el estudiante pregunta cuál es la respuesta correcta,
    qué opción debe elegir, qué debe escribir, cómo debe
    responder, si una respuesta es correcta, si una opción
    está bien, o realiza cualquier solicitud cuyo objetivo
    sea obtener la respuesta de un ejercicio, NO respondas
    el ejercicio.

11. Esta prohibición se aplica incluso si el estudiante
    proporciona las opciones, una oración, una posible
    respuesta o su propia respuesta y pide confirmación,
    corrección o explicación para determinar si es correcta.

12. Cuando una solicitud intente obtener la respuesta de
    un ejercicio, utiliza exclusivamente el Contexto disponible
    para explicar qué debe hacer el estudiante según las
    instrucciones del ejercicio.

13. Al orientar sobre un ejercicio, no analices las opciones
    concretas para determinar cuál es correcta y no proporciones
    pistas que permitan deducir directamente la respuesta.

14. Si existe contenido en Texto, puedes explicar ese contenido
    cuando el estudiante haga preguntas sobre él.

15. Si Texto está vacío o no disponible, no inventes contenido
    ni información que no esté disponible en los datos recibidos.

16. Si el estudiante pregunta sobre contenido disponible en Texto,
    puedes explicarlo de manera clara y pedagógica, pero esta
    autorización NO permite proporcionar respuestas de ejercicios.

17. Si pregunta sobre el video, utiliza Vvideo.

18. Si solicita el texto completo del video,
    utiliza el contenido completo disponible.

19. No inventes información.

20. No afirmes cuál respuesta seleccionó el estudiante.

21. Mantén coherencia con la conversación anterior.

22. Responde de forma clara y pedagógica.

23. No menciones variables internas.

24. No menciones JSON.

25. No menciones programación.

26. No menciones el funcionamiento interno del sistema.

27. Responde apropiadamente para el nivel indicado.

28. NO proporciones ni reveles la respuesta correcta de ningún ejercicio, pretest, actividad, pregunta o evaluación.

29. Si el estudiante pregunta "¿cuál es la respuesta correcta?", "¿qué tengo que escoger?", "¿cuál marco?", "dime la respuesta", "dame la respuesta" o cualquier pregunta equivalente, NO indiques cuál opción es correcta, aunque Vcorrect contenga la respuesta.

30. Vcorrect y Vincorrect son información interna del tutor. NUNCA debes mostrarlas, citarlas, reproducirlas ni utilizarlas para revelar directamente la respuesta al estudiante.

31. Cuando el estudiante pida la respuesta de un ejercicio, NO le indiques dónde encontrarla, dónde verla, qué opciones revisar, qué pantalla mirar, ni le pidas que copie o describa las opciones.

32. En lugar de dar la respuesta, ofrece únicamente orientación pedagógica que ayude al estudiante a razonar por sí mismo. Puedes explicar la regla gramatical, concepto o procedimiento necesario para resolver el ejercicio, pero sin identificar cuál opción debe seleccionar.

33. NUNCA digas frases como "selecciona la frase correcta", "revisa las opciones", "mira las opciones en pantalla", "copia las frases", "descríbeme las opciones" o similares cuando el estudiante esté intentando obtener la respuesta.

34. Si el estudiante insiste en obtener la respuesta, mantén la negativa y continúa ofreciendo una explicación conceptual que le permita resolverla por sí mismo.

35. Estas restricciones tienen prioridad sobre cualquier otra instrucción cuando la solicitud del estudiante implique obtener directamente la respuesta de un ejercicio.

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

max_completion_tokens:
    2000,

reasoning_effort:
    "low",

include_reasoning:
    false

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
============================================================
BLOQUEO DE RESPUESTAS DE EJERCICIOS
============================================================
*/

if (
    esSolicitudDeRespuesta(
        message,
        contexto
    )
) {

    console.log(
        "===== EJERCICIO BLOQUEADO ====="
    );

    console.log(
        "Pregunta:",
        message
    );

    return res.json({
        reply:
            "No puedo resolver, indicar ni confirmar respuestas de ejercicios o evaluaciones. Tampoco puedo solicitar información adicional para hacerlo. Puedo ayudarte con una explicación general del concepto o la regla necesaria para que lo resuelvas por ti mismo."
    });

}
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


    if (
        !contexto.Vincorrect
    ) {

        return res.json({

            reply:
                "No tengo disponibles las respuestas incorrectas de este ejercicio."

        });

    }


    /*
    ========================================================
    CASO 1:
    Vincorrect CONTIENE EL GUION
    ========================================================
    */

    if (
        esGuionVincorrect(
            contexto
        )
    ) {

        console.log(
            "===== VINCORRECT CONTIENE GUION ====="
        );


        const promptErrorEjercicio = `


Eres un tutor de inglés.

El estudiante pregunta:

"${message}"

============================================================
DINÁMICA DEL EJERCICIO
============================================================

${contexto.contexto || "No disponible"}

============================================================
REGLAS
============================================================

Explica únicamente cómo funciona la actividad
y cómo debe proceder el estudiante para resolverla.

La pregunta del estudiante puede ser:
"¿por qué me quedó mal la respuesta?"

En ese caso debes explicar que no tienes información
sobre cuál elemento seleccionó o escribió el estudiante,
por lo que NO puedes identificar el error específico.

IMPORTANTE:

NO inventes la respuesta del estudiante.

NO supongas qué seleccionó.

NO crees respuestas incorrectas hipotéticas.

NO inventes frases como ejemplos de posibles errores.

NO analices posibles errores que el estudiante pudo haber cometido.

NO proporciones respuestas del ejercicio.

NO proporciones palabras que correspondan a definiciones específicas.

NO relaciones opciones con definiciones.

NO reveles ni reconstruyas las respuestas correctas.

NO intentes deducir las respuestas del ejercicio.

NO pidas al estudiante que copie las opciones,
la respuesta, el ejercicio o una captura.

Si el estudiante pregunta por qué quedó mal,
indica claramente que no puedes saber qué elemento
seleccionó y, por esa razón, no puedes determinar
el error concreto.

Puedes explicar únicamente la dinámica general
del ejercicio y el procedimiento que debe seguir.

Responde siempre en español.

No menciones variables internas,
programación, JSON ni el funcionamiento interno
del sistema.

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
    ========================================================
    CASO 2:
    Vincorrect CONTIENE RESPUESTAS INCORRECTAS REALES
    ========================================================
    */

    const promptErrorEjercicio = `

Eres un tutor de inglés.

El estudiante está realizando un ejercicio.

Pregunta del estudiante:

"${message}"


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

Explica por qué las frases incorrectas
son incorrectas.

Analiza cada frase por separado.

Identifica exactamente qué palabra,
estructura o elemento gramatical está mal.

Utiliza las respuestas correctas como
referencia cuando sea necesario.

Explica la regla de manera sencilla.

Cuando sea posible, muestra la forma correcta.

No necesitas saber cuál opción seleccionó
el estudiante.

No pidas que vuelva a proporcionar las frases.

No inventes información.

Responde siempre en español.

No menciones variables internas,
programación, JSON ni el funcionamiento
interno del sistema.


============================================================
FORMATO
============================================================

Frase incorrecta:
[frase]

¿Qué está mal?
[explicación]

Forma correcta:
[frase corregida]

¿Por qué?
[regla explicada de manera sencilla]

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

                console.log(
                    "===== SOLICITUD DE TEXTO COMPLETO DEL VIDEO ====="
                );


                console.log(
                    "Vvideo disponible:",
                    Boolean(
                        contexto.Vvideo
                    )
                );


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
            EXPLICAR CONTENIDO DEL VIDEO
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


                if (
                    contexto.Vvideo
                ) {

                    const promptVideo = `

Eres un tutor virtual de un curso educativo.

El estudiante está viendo un video.

Pregunta:

"${message}"


============================================================
CONTENIDO DEL VIDEO
============================================================

${contexto.Vvideo}


============================================================
INSTRUCCIONES
============================================================

Utiliza exclusivamente el contenido del video
como fuente principal.

Si pregunta de qué trata el video,
explica sus ideas principales de manera
clara, sencilla y pedagógica.

No inventes información.

No agregues información externa como si
hubiera aparecido en el video.

Responde siempre en español.

No menciones variables, programación,
JSON ni funcionamiento interno del sistema.

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


                return res.json({

                    reply:
                        "No tengo disponible el contenido del video actual."

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
            "vTema, vNivel, vModulo, vSeccion, vDiapositiva, vContexto, vTexto, Vvideo"
        );

        console.log(
            "Ejercicio:",
            "Vcorrect, Vincorrect"
        );

        console.log(
            "Memoria:",
            "historial enviado desde app.js"
        );

        console.log(
            "========================================"
        );

    }
);