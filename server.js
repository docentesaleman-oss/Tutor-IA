import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function limpiarTexto(texto) {

    return String(texto || "")
        .replace(/\s+/g, " ")
        .trim();

}


// ============================================================
// ELEMENTOS TÉCNICOS
// ============================================================

function esElementoTecnico(texto) {

    const t = limpiarTexto(texto).toLowerCase();

    if (!t) return true;

    const tecnicos = [

        "playback controls",
        "misc controls",
        "slide navigation",
        "sidebar",
        "sidebar-tabs",
        "top bar",
        "previous",
        "next",
        "submit",
        "play",
        "pause",
        "replay",
        "slide progress",
        "rectangle",
        "group",
        "line",
        "量"

    ];

    if (tecnicos.includes(t)) {
        return true;
    }

    if (
        /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(t)
    ) {
        return true;
    }

    if (
        /^rectangle\s*\d*$/i.test(t) ||
        /^line\s*\d*$/i.test(t) ||
        /^group\s*\d*$/i.test(t)
    ) {
        return true;
    }

    return false;
}


// ============================================================
// OBTENER TEXTOS ÚTILES
// ============================================================

function obtenerTextosUtiles(textos) {

    if (!Array.isArray(textos)) {
        return [];
    }

    const resultado = [];

    for (const texto of textos) {

        const limpio = limpiarTexto(texto);

        if (!limpio) continue;

        if (esElementoTecnico(limpio)) {
            continue;
        }

        if (!resultado.includes(limpio)) {
            resultado.push(limpio);
        }
    }

    return resultado;
}


// ============================================================
// MAPA DE ESCENAS
// ============================================================

function obtenerNombreSeccion(escena) {

    const mapaEscenas = {

        "Scene1": "Portada",
        "Scene2": "Pretest",
        "Scene3": "Conversación multimedia",
        "Scene4": "Vocabulario",
        "Scene5": "Gramática",
        "Scene6": "Pronunciación y caracteres",
        "Scene7": "Test de lección",

        // Compatibilidad con números
        "1": "Portada",
        "2": "Pretest",
        "3": "Conversación multimedia",
        "4": "Vocabulario",
        "5": "Gramática",
        "6": "Pronunciación y caracteres",
        "7": "Test de lección"

    };

    return mapaEscenas[String(escena)] || "";
}


// ============================================================
// OBTENER TEMA DINÁMICO
// ============================================================

function obtenerTemaActual(actual, textosUtiles) {

    const textos = textosUtiles || [];

    if (actual?.titulo) {

        const titulo =
            limpiarTexto(actual.titulo);

        if (
            titulo &&
            !esElementoTecnico(titulo)
        ) {

            return titulo;
        }
    }

    for (const texto of textos) {

        const t = limpiarTexto(texto);

        if (!t) continue;

        const minuscula =
            t.toLowerCase();

        if (
            minuscula.startsWith("selecciona") ||
            minuscula.startsWith("seleccione") ||
            minuscula.startsWith("elige") ||
            minuscula.startsWith("elija") ||
            minuscula.startsWith("completa") ||
            minuscula.startsWith("complete") ||
            minuscula.startsWith("relaciona") ||
            minuscula.startsWith("relacione") ||
            minuscula.startsWith("arrastra") ||
            minuscula.startsWith("arrastre")
        ) {
            continue;
        }

        if (
            t.includes("?") ||
            t.includes("？")
        ) {
            continue;
        }

        if (t.length < 4) {
            continue;
        }

        return t;
    }

    return "";
}


// ============================================================
// DETECTAR PREGUNTA / INSTRUCCIÓN
// ============================================================

function encontrarPregunta(textos) {

    const utiles =
        obtenerTextosUtiles(textos);

    const palabrasClave = [

        "selecciona",
        "seleccione",
        "elige",
        "elija",
        "escoge",
        "escoger",
        "completa",
        "complete",
        "relaciona",
        "relacione",
        "une",
        "unir",
        "arrastra",
        "arrastre",
        "escribe",
        "escriba",
        "marca",
        "marque",
        "indica",
        "indique",
        "corresponde"

    ];

    for (const texto of utiles) {

        const minuscula =
            texto.toLowerCase();

        for (const palabra of palabrasClave) {

            if (
                minuscula.startsWith(palabra) ||
                minuscula.includes(" " + palabra)
            ) {

                return texto;
            }
        }
    }

    const preguntas =
        utiles.filter(texto => {

            return (
                texto.includes("?") ||
                texto.includes("？")
            );

        });

    if (preguntas.length > 0) {
        return preguntas[0];
    }

    return null;
}


// ============================================================
// PREGUNTA DE UBICACIÓN
// ============================================================

function esPreguntaUbicacion(pregunta) {

    const p =
        limpiarTexto(pregunta).toLowerCase();

    return (

        p.includes("en qué escena") ||
        p.includes("en que escena") ||
        p.includes("qué escena") ||
        p.includes("que escena") ||

        p.includes("dónde estoy") ||
        p.includes("donde estoy") ||

        p.includes("en qué sección") ||
        p.includes("en que sección") ||
        p.includes("en que seccion") ||

        p.includes("qué sección") ||
        p.includes("que sección") ||
        p.includes("que seccion")

    );
}


// ============================================================
// PREGUNTA POR TÍTULO
// ============================================================

function esPreguntaTitulo(pregunta) {

    const p =
        limpiarTexto(pregunta).toLowerCase();

    return (

        p.includes("cuál es el título") ||
        p.includes("cual es el titulo") ||

        p.includes("título de la diapositiva") ||
        p.includes("titulo de la diapositiva")

    );
}


// ============================================================
// PREGUNTA POR TEXTOS
// ============================================================

function esPreguntaTextos(pregunta) {

    const p =
        limpiarTexto(pregunta).toLowerCase();

    return (

        p.includes("qué textos") ||
        p.includes("que textos") ||

        p.includes("qué texto") ||
        p.includes("que texto") ||

        p.includes("qué hay en pantalla") ||
        p.includes("que hay en pantalla") ||

        p.includes("qué dice la pantalla") ||
        p.includes("que dice la pantalla") ||

        p.includes("qué aparece en pantalla") ||
        p.includes("que aparece en pantalla") ||

        p.includes("qué ves en pantalla") ||
        p.includes("que ves en pantalla")

    );
}


// ============================================================
// PREGUNTA DEL EJERCICIO
// ============================================================

function esPreguntaEjercicio(pregunta) {

    const p =
        limpiarTexto(pregunta).toLowerCase();

    return (

        p.includes("pregunta del ejercicio") ||

        p.includes("pregunta que está en el ejercicio") ||
        p.includes("pregunta que esta en el ejercicio") ||

        p.includes("pregunta de la diapositiva") ||

        p.includes("pregunta que está en pantalla") ||
        p.includes("pregunta que esta en pantalla")

    );
}


// ============================================================
// PREGUNTA DE LA LECCIÓN
// ============================================================

function esPreguntaLeccion(pregunta) {

    const p =
        limpiarTexto(pregunta).toLowerCase();

    return (

        p.includes("pregunta de la lección") ||
        p.includes("pregunta de la leccion") ||

        p.includes("pregunta de la unidad") ||

        p.includes("pregunta del tema")

    );
}


// ============================================================
// DETECTAR SI ESTÁ RELACIONADA CON EL CURSO
// ============================================================

function pareceRelacionadaConCurso(
    pregunta,
    actual,
    textosUtiles,
    nombreSeccion,
    temaActual
) {

    const p =
        limpiarTexto(pregunta).toLowerCase();

    const palabrasCurso = [

        "curso",
        "lección",
        "leccion",
        "unidad",
        "tema",
        "diapositiva",
        "ejercicio",
        "actividad",
        "pregunta",
        "respuesta",
        "texto",
        "pantalla",
        "palabra",
        "palabras",
        "vocabulario",
        "gramática",
        "gramatica",
        "pronunciación",
        "pronunciacion",
        "carácter",
        "caracter",

        "significa",
        "significado",

        "traducir",
        "traducción",
        "traduccion",

        "pronuncia",
        "pronunciar",

        "cómo se dice",
        "como se dice",

        "qué significa",
        "que significa",

        "qué quiere decir",
        "que quiere decir",

        "cómo se responde",
        "como se responde"

    ];

    for (const palabra of palabrasCurso) {

        if (p.includes(palabra)) {
            return true;
        }
    }

    for (const texto of textosUtiles) {

        const limpio =
            limpiarTexto(texto).toLowerCase();

        if (
            limpio.length >= 4 &&
            p.includes(limpio)
        ) {

            return true;
        }
    }

    if (
        p.includes("estoy viendo") ||
        p.includes("estoy estudiando") ||
        p.includes("estamos estudiando") ||
        p.includes("qué estamos") ||
        p.includes("que estamos")
    ) {

        return true;
    }

    if (
        nombreSeccion &&
        p.includes(
            nombreSeccion.toLowerCase()
        )
    ) {

        return true;
    }

    if (
        temaActual &&
        p.includes(
            temaActual.toLowerCase()
        )
    ) {

        return true;
    }

    return false;
}


// ============================================================
// RESPUESTA FUERA DE TEMA
// ============================================================

function respuestaFueraDeTema(
    nombreSeccion,
    temaActual
) {

    if (temaActual) {

        return (
            "En este momento estamos estudiando " +
            `"${temaActual}". ` +
            "Solo puedo ayudarte con el contenido de este curso."
        );

    }

    if (nombreSeccion) {

        return (
            "En este momento estamos trabajando en " +
            `"${nombreSeccion}". ` +
            "Solo puedo ayudarte con el contenido de este curso."
        );

    }

    return (
        "Solo puedo ayudarte con el contenido " +
        "del curso que estás realizando."
    );
}


// ============================================================
// CHAT
// ============================================================

app.post("/chat", async (req, res) => {

    try {

        const {
            message,
            storyline = {}
        } = req.body;

        console.log("=================================");
        console.log("PREGUNTA:", message);
        console.log("STORYLINE RECIBIDO:", storyline);
        console.log("SLIDE ACTUAL:", storyline?.actual);
        console.log("=================================");


        // ----------------------------------------------------
        // INFORMACIÓN ACTUAL
        // ----------------------------------------------------

        const actual =
            storyline?.actual || {};

        /*
        IMPORTANTE:

        Actualmente Storyline nos está enviando:

        escena
        id
        titulo
        numero
        lmsId

        Si en el futuro llegan textos, también
        serán utilizados automáticamente.
        */

        const textos =
            Array.isArray(actual.textos)
                ? actual.textos
                : [];

        const textosUtiles =
            obtenerTextosUtiles(textos);

        const pregunta =
            encontrarPregunta(textos);

        const preguntaUsuario =
            limpiarTexto(message);


        // ----------------------------------------------------
        // SECCIÓN
        // ----------------------------------------------------

        const nombreSeccion =
            obtenerNombreSeccion(
                actual.escena
            );


        // ----------------------------------------------------
        // TEMA
        // ----------------------------------------------------

        const temaActual =
            obtenerTemaActual(
                actual,
                textosUtiles
            );


        console.log(
            "SECCIÓN ACTUAL:",
            nombreSeccion
        );

        console.log(
            "TEMA ACTUAL:",
            temaActual
        );

        console.log(
            "TÍTULO ACTUAL:",
            actual.titulo || ""
        );

        console.log(
            "NÚMERO DE DIAPOSITIVA:",
            actual.numero || ""
        );

        console.log(
            "LMS ID:",
            actual.lmsId || ""
        );


        // ====================================================
        // RESPUESTAS DIRECTAS
        // ====================================================

        if (
            esPreguntaUbicacion(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    nombreSeccion ||
                    `Estás en la diapositiva "${actual.titulo || "actual"}".`

            });
        }


        if (
            esPreguntaTitulo(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    actual.titulo ||
                    "No tengo información sobre el título."

            });
        }


        if (
            esPreguntaEjercicio(
                preguntaUsuario
            )
        ) {

            if (pregunta) {

                return res.json({

                    reply: pregunta

                });
            }

            return res.json({

                reply:
                    "No encuentro una pregunta clara del ejercicio en esta diapositiva."

            });
        }


        if (
            esPreguntaLeccion(
                preguntaUsuario
            )
        ) {

            if (pregunta) {

                return res.json({

                    reply: pregunta

                });
            }

            return res.json({

                reply:
                    "No encuentro una pregunta de la lección en la actividad actual."

            });
        }


        if (
            esPreguntaTextos(
                preguntaUsuario
            )
        ) {

            if (textosUtiles.length > 0) {

                return res.json({

                    reply:
                        "En la diapositiva aparecen:\n\n" +
                        textosUtiles
                            .map(
                                texto =>
                                    "• " + texto
                            )
                            .join("\n")

                });
            }

            return res.json({

                reply:
                    "Todavía no tengo los textos internos de esta diapositiva."

            });
        }


        // ====================================================
        // CONTROL DE TEMA
        // ====================================================

        const relacionadaConCurso =
            pareceRelacionadaConCurso(
                preguntaUsuario,
                actual,
                textosUtiles,
                nombreSeccion,
                temaActual
            );

        if (!relacionadaConCurso) {

            return res.json({

                reply:
                    respuestaFueraDeTema(
                        nombreSeccion,
                        temaActual
                    )

            });
        }


        // ====================================================
        // PROMPT PARA GROQ
        // ====================================================

        const systemPrompt = `

Eres un tutor virtual de un curso educativo.

Ayudas al estudiante exclusivamente con
el contenido que está realizando actualmente.

SECCIÓN ACTUAL:
${nombreSeccion || "No disponible"}

DIAPOSITIVA ACTUAL:
${actual.numero || "No disponible"}

TÍTULO DE LA DIAPOSITIVA:
${actual.titulo || "No disponible"}

TEMA ACTUAL:
${temaActual || "No disponible"}

TEXTOS DISPONIBLES EN LA DIAPOSITIVA:

${JSON.stringify(textosUtiles, null, 2)}

REGLAS:

1. Responde siempre en español.

2. Utiliza únicamente la información proporcionada
del curso.

3. No inventes información.

4. No utilices información externa al curso.

5. No respondas preguntas que no estén relacionadas
con el contenido del curso.

6. No menciones IDs.

7. No menciones lmsId.

8. No menciones códigos internos.

9. No menciones JSON.

10. No menciones variables internas.

11. No menciones detalles técnicos de Storyline.

12. Si aparecen textos en otros idiomas,
consérvalos exactamente cuando sea necesario.

13. Puedes explicar palabras, conceptos,
gramática o instrucciones que formen parte
del contenido actual.

14. Si la información no está disponible,
dilo claramente.

15. Responde de manera breve, clara y natural.

16. No cambies de tema.

17. No agregues información externa para completar
una respuesta.

`;


        // ====================================================
        // GROQ
        // ====================================================

        if (!process.env.GROQ_API_KEY) {

            console.error(
                "ERROR: GROQ_API_KEY no está configurada."
            );

            return res.status(500).json({

                reply:
                    "La clave de Groq no está configurada en el servidor."

            });
        }


        const response = await fetch(
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
                            content: systemPrompt
                        },

                        {
                            role: "user",
                            content: preguntaUsuario
                        }

                    ],

                    temperature: 0.1,

                    max_tokens: 120

                })

            }
        );


        // ====================================================
        // COMPROBAR GROQ
        // ====================================================

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "ERROR GROQ:",
                errorText
            );

            return res.status(500).json({

                reply:
                    "Error al conectar con Groq."

            });
        }


        // ====================================================
        // RESPUESTA
        // ====================================================

        const data =
            await response.json();

        const reply =
            data?.choices?.[0]?.message?.content?.trim() ||
            "No encontré información suficiente en el contenido del curso.";


        console.log(
            "RESPUESTA GROQ:",
            reply
        );


        res.json({

            reply

        });


    } catch (error) {

        console.error(
            "ERROR DEL SERVIDOR:",
            error
        );

        res.status(500).json({

            reply:
                "Error al conectar con Groq."

        });

    }

});


// ============================================================
// INICIAR SERVIDOR
// ============================================================

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        "================================="
    );

    console.log(
        "TUTOR IA INICIADO"
    );

    console.log(
        "Servidor: http://localhost:" + PORT
    );

    console.log(
        "Motor: Groq"
    );

    console.log(
        "Modelo: openai/gpt-oss-20b"
    );

    console.log(
        "================================="
    );

});