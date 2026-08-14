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
// UTILIDADES
// ============================================================

function limpiarTexto(texto) {
    return String(texto || "")
        .replace(/\s+/g, " ")
        .trim();
}


function normalizar(texto) {
    return limpiarTexto(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


function quitarBasura(texto) {
    return limpiarTexto(texto)
        .replace(/\u200b/g, "")
        .replace(/\uFEFF/g, "")
        .trim();
}


// ============================================================
// ELEMENTOS QUE NO SON CONTENIDO PEDAGÓGICO
// ============================================================

function esElementoTecnico(texto) {

    const t = normalizar(texto);

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
        "slide progress"
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

        const limpio = quitarBasura(texto);

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
// CLASIFICAR TEXTOS
// ============================================================

function pareceNivel(texto) {

    const t = limpiarTexto(texto);

    return (
        /^中文\s*[A-Z]\d+/i.test(t) ||
        /^español\s*[A-Z]\d+/i.test(t) ||
        /^english\s*[A-Z]\d+/i.test(t)
    );
}


function pareceModulo(texto) {

    const t = limpiarTexto(texto);

    return (
        /^单元\s*\d+/i.test(t) ||
        /^unit\s*\d+/i.test(t)
    );
}


function pareceTema(texto) {

    const t = limpiarTexto(texto);

    return (
        /^第.+课/i.test(t) ||
        /^lesson\s*\d+/i.test(t) ||
        /^lección\s*\d+/i.test(t) ||
        /^leccion\s*\d+/i.test(t)
    );
}


function pareceInstruccion(texto) {

    const t = normalizar(texto);

    const palabras = [
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
        "indique"
    ];

    return palabras.some(p => t.startsWith(p));
}


function parecePreguntaContenido(texto) {

    const t = limpiarTexto(texto);

    return (
        t.includes("?") ||
        t.includes("？")
    );
}


// ============================================================
// ANALIZAR CONTEXTO DE LA DIAPOSITIVA
// ============================================================

function analizarContexto(actual) {

    const textos =
        obtenerTextosUtiles(actual?.textos || []);

    let nivel = "";
    let modulo = "";
    let tema = "";
    let objetivo = "";

    for (const texto of textos) {

        if (!nivel && pareceNivel(texto)) {
            nivel = texto;
            continue;
        }

        if (!modulo && pareceModulo(texto)) {
            modulo = texto;
            continue;
        }

        if (!tema && pareceTema(texto)) {
            tema = texto;
            continue;
        }
    }


    /*
    ------------------------------------------------------------
    OBJETIVO / INSTRUCCIÓN
    ------------------------------------------------------------
    */

    for (const texto of textos) {

        if (pareceInstruccion(texto)) {

            objetivo = texto;
            break;
        }
    }


    /*
    ------------------------------------------------------------
    TÍTULO PEDAGÓGICO
    ------------------------------------------------------------

    NO utilizamos directamente actual.titulo.

    Storyline puede devolver:

        "Escoger uno"

    aunque el verdadero título esté dentro de
    data-acc-text.

    Por eso buscamos un texto que:

    - no sea técnico
    - no sea nivel
    - no sea módulo
    - no sea tema
    - no sea instrucción
    - tenga contenido lingüístico
    */

    let tituloLeccion = "";


    for (const texto of textos) {

        if (texto === nivel) continue;
        if (texto === modulo) continue;
        if (texto === tema) continue;
        if (texto === objetivo) continue;

        if (texto.length < 4) continue;

        /*
        Evitamos controles y nombres de imágenes.
        */

        if (esElementoTecnico(texto)) continue;


        /*
        Si es claramente una pregunta,
        puede ser una pregunta de ejercicio.
        */
        if (parecePreguntaContenido(texto)) {

            /*
            Solo lo usamos como título si todavía
            no tenemos otro candidato y tiene
            apariencia de frase de contenido.
            */

            if (!tituloLeccion) {
                tituloLeccion = texto;
            }

            continue;
        }


        /*
        El primer texto lingüístico relevante
        después de excluir encabezados
        es nuestro candidato.
        */

        if (
            /[a-zA-ZÀ-ÿ\u3400-\u9fff]/.test(texto)
        ) {

            tituloLeccion = texto;
            break;
        }
    }


    /*
    ------------------------------------------------------------
    SI EL CANDIDATO ES UNA INSTRUCCIÓN,
    BUSCAMOS OTRO.
    ------------------------------------------------------------
    */

    if (pareceInstruccion(tituloLeccion)) {

        tituloLeccion = "";

        for (const texto of textos) {

            if (texto === nivel) continue;
            if (texto === modulo) continue;
            if (texto === tema) continue;
            if (texto === objetivo) continue;

            if (esElementoTecnico(texto)) continue;

            if (texto.length < 4) continue;

            if (pareceInstruccion(texto)) continue;

            if (
                /[a-zA-ZÀ-ÿ\u3400-\u9fff]/.test(texto)
            ) {

                tituloLeccion = texto;
                break;
            }
        }
    }


    /*
    ------------------------------------------------------------
    PREGUNTA / ORACIÓN PRINCIPAL
    ------------------------------------------------------------
    */

    let pregunta = "";

    for (const texto of textos) {

        if (texto === objetivo) continue;

        if (parecePreguntaContenido(texto)) {

            pregunta = texto;
            break;
        }
    }


    /*
    ------------------------------------------------------------
    SI HAY UNA FRASE CON ? DENTRO DE UN TEXTO LARGO
    ------------------------------------------------------------
    */

    if (!pregunta) {

        for (const texto of textos) {

            const indice = texto.indexOf("?");

            if (indice > 0) {

                pregunta =
                    texto.substring(
                        0,
                        indice + 1
                    ).trim();

                break;
            }
        }
    }


    return {

        nivel,
        modulo,
        tema,
        tituloLeccion,
        objetivo,
        pregunta,
        textos

    };
}


// ============================================================
// MAPA DE SECCIONES
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
// DETECTORES DE PREGUNTAS
// ============================================================

function esPreguntaUbicacion(pregunta) {

    const p = normalizar(pregunta);

    return (
        p.includes("en que seccion") ||
        p.includes("que seccion") ||
        p.includes("en que escena") ||
        p.includes("que escena") ||
        p.includes("donde estoy")
    );
}


function esPreguntaTitulo(pregunta) {

    const p = normalizar(pregunta);

    return (
        p.includes("cual es el titulo") ||
        p.includes("titulo de la diapositiva") ||
        p.includes("cual es el nombre de la leccion") ||
        p.includes("nombre de la leccion")
    );
}


function esPreguntaTextos(pregunta) {

    const p = normalizar(pregunta);

    return (
        p.includes("que textos ves") ||
        p.includes("que textos hay") ||
        p.includes("que textos aparecen") ||
        p.includes("que texto ves") ||
        p.includes("que texto hay") ||
        p.includes("que hay en pantalla") ||
        p.includes("que dice la pantalla") ||
        p.includes("que aparece en pantalla")
    );
}


function esPreguntaCualEsLaPregunta(pregunta) {

    const p = normalizar(pregunta);

    return (
        p === "cual es la pregunta" ||
        p.includes("cual es la pregunta") ||
        p.includes("cual es la oracion") ||
        p.includes("cual es el ejercicio")
    );
}


function esPreguntaExplicacion(pregunta) {

    const p = normalizar(pregunta);

    return (
        p.includes("explicame") ||
        p.includes("explica") ||
        p.includes("no entiendo") ||
        p.includes("no comprendo") ||
        p.includes("ayudame a entender") ||
        p.includes("que significa esa leccion") ||
        p.includes("que significa la leccion")
    );
}


function esPreguntaTraduccion(pregunta) {

    const p = normalizar(pregunta);

    return (
        p.includes("traduce") ||
        p.includes("traduceme") ||
        p.includes("traducir") ||
        p.includes("traduccion") ||
        p.includes("como se dice")
    );
}


function esPreguntaSignificado(pregunta) {

    const p = normalizar(pregunta);

    return (
        p.includes("que significa") ||
        p.includes("que quiere decir") ||
        p.includes("significado de")
    );
}


// ============================================================
// EXTRAER PALABRA / EXPRESIÓN DEL MENSAJE
// ============================================================

function extraerExpresion(pregunta) {

    const original = limpiarTexto(pregunta);

    /*
    Texto entre comillas
    */

    const entreComillas =
        original.match(
            /["'“”‘’*]+([^"'“”‘’*]+)["'“”‘’*]+/
        );

    if (entreComillas) {
        return limpiarTexto(entreComillas[1]);
    }


    /*
    "qué significa moon"
    */

    let resultado =
        original.match(
            /(?:que significa|qué significa|significado de)\s+(.+)/i
        );

    if (resultado) {
        return limpiarTexto(
            resultado[1]
                .replace(/[?¿.]+$/g, "")
        );
    }


    /*
    "tradúceme moon al español"
    */

    resultado =
        original.match(
            /(?:traduceme|traduce|traducir)\s+(.+?)\s+(?:al|a|en)\s+/i
        );

    if (resultado) {
        return limpiarTexto(resultado[1]);
    }


    /*
    "cómo se dice moon"
    */

    resultado =
        original.match(
            /como se dice\s+(.+)/i
        );

    if (resultado) {
        return limpiarTexto(
            resultado[1]
                .replace(/[?¿.]+$/g, "")
        );
    }


    return "";
}


// ============================================================
// BUSCAR UNA PALABRA DENTRO DEL CONTENIDO
// ============================================================

function buscarExpresionEnContenido(
    expresion,
    textos
) {

    if (!expresion) return "";

    const objetivo =
        normalizar(expresion);

    if (!objetivo) return "";

    /*
    Coincidencia exacta o contenida.
    */

    for (const texto of textos) {

        const n =
            normalizar(texto);

        if (
            n === objetivo ||
            n.includes(objetivo)
        ) {

            return texto;
        }
    }

    return "";
}


// ============================================================
// CONTEXTO DE LA CONVERSACIÓN
// ============================================================

const memoriaConversaciones = new Map();


function obtenerMemoria(req) {

    /*
    Usamos una identificación sencilla
    por IP mientras no tengamos un ID
    de estudiante.
    */

    return req.ip || "usuario";
}


function guardarMemoria(req, datos) {

    const clave =
        obtenerMemoria(req);

    const anterior =
        memoriaConversaciones.get(clave) || {};

    memoriaConversaciones.set(
        clave,
        {
            ...anterior,
            ...datos
        }
    );
}


function obtenerMemoriaActual(req) {

    return (
        memoriaConversaciones.get(
            obtenerMemoria(req)
        ) || {}
    );
}


// ============================================================
// CONTROL DE TEMA
// ============================================================

function pareceRelacionadaConCurso(
    pregunta,
    contexto
) {

    const p =
        normalizar(pregunta);

    const palabrasCurso = [

        "curso",
        "leccion",
        "lección",
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
        "gramatica",
        "gramática",
        "pronunciacion",
        "pronunciación",
        "caracter",
        "carácter",
        "significa",
        "significado",
        "traducir",
        "traduccion",
        "traducción",
        "explica",
        "explicame",
        "explicación",
        "explicacion",
        "entiendo",
        "entiendes",
        "pregunta"
    ];


    for (const palabra of palabrasCurso) {

        if (p.includes(normalizar(palabra))) {
            return true;
        }
    }


    for (const texto of contexto.textos || []) {

        const limpio =
            normalizar(texto);

        if (
            limpio.length >= 4 &&
            p.includes(limpio)
        ) {

            return true;
        }
    }


    /*
    Preguntas cortas como:

    "explícame"
    "¿qué significa?"
    "tradúceme eso"

    dependen del contexto anterior.
    */

    if (
        p.includes("eso") ||
        p.includes("esa") ||
        p.includes("este") ||
        p.includes("esta") ||
        p === "explicame" ||
        p === "explica" ||
        p === "traduceme" ||
        p === "traduce"
    ) {

        return true;
    }


    return false;
}


// ============================================================
// RESPUESTA FUERA DE TEMA
// ============================================================

function respuestaFueraDeTema(
    contexto
) {

    if (contexto.tituloLeccion) {

        return (
            `En este momento estamos trabajando ` +
            `la lección "${contexto.tituloLeccion}". ` +
            `Puedo ayudarte con el contenido de este curso.`
        );
    }

    if (contexto.seccion) {

        return (
            `En este momento estamos trabajando ` +
            `en ${contexto.seccion}. ` +
            `Puedo ayudarte con el contenido de este curso.`
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


        const preguntaUsuario =
            limpiarTexto(message);


        console.log("\n=================================");
        console.log("PREGUNTA:", preguntaUsuario);
        console.log("STORYLINE RECIBIDO:", storyline);
        console.log("=================================");


        /*
        --------------------------------------------------------
        INFORMACIÓN DE STORYLINE
        --------------------------------------------------------
        */

        const actual =
            storyline?.actual || {};


        const textos =
            Array.isArray(actual.textos)
                ? actual.textos
                : [];


        const analisis =
            analizarContexto(actual);


        const nombreSeccion =
            obtenerNombreSeccion(
                actual.escena
            );


        const contexto = {

            seccion:
                nombreSeccion,

            nivel:
                analisis.nivel,

            modulo:
                analisis.modulo,

            tema:
                analisis.tema,

            tituloLeccion:
                analisis.tituloLeccion,

            objetivo:
                analisis.objetivo,

            pregunta:
                analisis.pregunta,

            textos:
                analisis.textos,

            slideTitle:
                actual.titulo || ""

        };


        /*
        --------------------------------------------------------
        MEMORIA
        --------------------------------------------------------
        */

        const memoria =
            obtenerMemoriaActual(req);


        guardarMemoria(req, {

            seccion:
                contexto.seccion,

            nivel:
                contexto.nivel,

            modulo:
                contexto.modulo,

            tema:
                contexto.tema,

            tituloLeccion:
                contexto.tituloLeccion,

            objetivo:
                contexto.objetivo,

            pregunta:
                contexto.pregunta,

            textos:
                contexto.textos

        });


        const memoriaActual =
            obtenerMemoriaActual(req);


        console.log(
            "SECCIÓN:",
            contexto.seccion
        );

        console.log(
            "NIVEL:",
            contexto.nivel
        );

        console.log(
            "MÓDULO:",
            contexto.modulo
        );

        console.log(
            "TEMA:",
            contexto.tema
        );

        console.log(
            "LECCIÓN:",
            contexto.tituloLeccion
        );

        console.log(
            "OBJETIVO:",
            contexto.objetivo
        );

        console.log(
            "PREGUNTA:",
            contexto.pregunta
        );

        console.log(
            "TEXTOS:",
            contexto.textos
        );


        // ====================================================
        // UBICACIÓN
        // ====================================================

        if (
            esPreguntaUbicacion(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    contexto.seccion ||
                    "No pude determinar la sección actual."

            });
        }


        // ====================================================
        // TÍTULO
        // ====================================================

        if (
            esPreguntaTitulo(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    contexto.tituloLeccion ||
                    "No pude determinar el título de la lección."

            });
        }


        // ====================================================
        // TEXTOS
        // ====================================================

        if (
            esPreguntaTextos(
                preguntaUsuario
            )
        ) {

            if (
                contexto.textos &&
                contexto.textos.length > 0
            ) {

                return res.json({

                    reply:
                        "Estos son los textos que puedo identificar en la pantalla:\n\n" +
                        contexto.textos
                            .map(
                                texto =>
                                    "• " + texto
                            )
                            .join("\n")

                });
            }

            return res.json({

                reply:
                    "No pude identificar textos visibles en esta diapositiva."

            });
        }


        // ====================================================
        // ¿CUÁL ES LA PREGUNTA?
        // ====================================================

        if (
            esPreguntaCualEsLaPregunta(
                preguntaUsuario
            )
        ) {

            if (contexto.pregunta) {

                guardarMemoria(req, {

                    ultimoTexto:
                        contexto.pregunta

                });


                return res.json({

                    reply:
                        `La pregunta es: ${contexto.pregunta}`

                });
            }


            /*
            Si no encontramos una pregunta
            con ? buscamos el objetivo.
            */

            if (contexto.objetivo) {

                guardarMemoria(req, {

                    ultimoTexto:
                        contexto.objetivo

                });


                return res.json({

                    reply:
                        `La instrucción de la actividad es: ${contexto.objetivo}`

                });
            }


            return res.json({

                reply:
                    "No pude identificar claramente la pregunta de esta actividad."

            });
        }


        // ====================================================
        // TRADUCCIÓN
        // ====================================================

        if (
            esPreguntaTraduccion(
                preguntaUsuario
            )
        ) {

            let expresion =
                extraerExpresion(
                    preguntaUsuario
                );


            /*
            Si el usuario dice:

            "tradúceme a español"

            no hay expresión explícita.
            Entonces usamos el último texto relevante.
            */

            if (!expresion) {

                expresion =
                    memoriaActual.ultimoTexto ||
                    contexto.pregunta ||
                    contexto.tituloLeccion ||
                    contexto.objetivo ||
                    "";

            }


            if (!expresion) {

                return res.json({

                    reply:
                        "Indícame qué palabra, frase o texto quieres traducir."

                });
            }


            guardarMemoria(req, {

                ultimoTexto:
                    expresion

            });


            /*
            La traducción la realiza Groq
            utilizando el contexto actual.
            */

            const systemPromptTraduccion = `

Eres un tutor de idiomas.

El estudiante quiere traducir un texto
que aparece en el curso.

CURSO:
${contexto.modulo || "No disponible"}

TEMA:
${contexto.tema || "No disponible"}

LECCIÓN:
${contexto.tituloLeccion || "No disponible"}

TEXTO A TRADUCIR:
${expresion}

TEXTOS DE LA DIAPOSITIVA:
${JSON.stringify(contexto.textos, null, 2)}

Reglas:

1. Responde en español.

2. Traduce exactamente el texto solicitado.

3. Si el texto está en chino, tradúcelo al español.

4. Si contiene pinyin, puedes explicar su significado,
pero no confundas el pinyin con una palabra diferente.

5. No inventes información.

6. Si el texto tiene contexto dentro de la diapositiva,
utilízalo.

7. Responde de manera breve.

`;


            return await consultarGroq(
                preguntaUsuario,
                systemPromptTraduccion,
                res
            );
        }


        // ====================================================
        // SIGNIFICADO
        // ====================================================

        if (
            esPreguntaSignificado(
                preguntaUsuario
            )
        ) {

            let expresion =
                extraerExpresion(
                    preguntaUsuario
                );


            if (!expresion) {

                expresion =
                    memoriaActual.ultimoTexto ||
                    contexto.pregunta ||
                    contexto.tituloLeccion ||
                    "";

            }


            if (!expresion) {

                return res.json({

                    reply:
                        "Indícame qué palabra, expresión o texto quieres comprender."

                });
            }


            const encontrado =
                buscarExpresionEnContenido(
                    expresion,
                    contexto.textos
                );


            const textoReferencia =
                encontrado ||
                expresion;


            guardarMemoria(req, {

                ultimoTexto:
                    textoReferencia

            });


            const systemPromptSignificado = `

Eres un tutor de idiomas.

El estudiante quiere saber qué significa
una palabra, expresión o frase relacionada
con el contenido actual.

LECCIÓN:
${contexto.tituloLeccion || "No disponible"}

TEMA:
${contexto.tema || "No disponible"}

CONTENIDO ACTUAL:
${JSON.stringify(contexto.textos, null, 2)}

ELEMENTO CONSULTADO:
${textoReferencia}

Reglas:

1. Responde en español.

2. Explica primero el significado.

3. Si es una palabra china, proporciona:
   - significado en español
   - pinyin si está disponible
   - explicación breve dentro del contexto.

4. Si es una frase, explica su sentido completo.

5. Utiliza el contenido de la diapositiva como contexto.

6. No inventes información.

7. Sé breve y claro.

`;


            return await consultarGroq(
                preguntaUsuario,
                systemPromptSignificado,
                res
            );
        }


        // ====================================================
        // EXPLICACIÓN
        // ====================================================

        if (
            esPreguntaExplicacion(
                preguntaUsuario
            )
        ) {

            const referencia =
                memoriaActual.ultimoTexto ||
                contexto.pregunta ||
                contexto.tituloLeccion ||
                contexto.objetivo;


            if (!referencia) {

                return res.json({

                    reply:
                        "No tengo suficiente contexto para saber qué quieres que explique."

                });
            }


            guardarMemoria(req, {

                ultimoTexto:
                    referencia

            });


            const systemPromptExplicacion = `

Eres un tutor virtual de idiomas.

El estudiante no entiende el contenido
que está viendo y necesita una explicación.

SECCIÓN:
${contexto.seccion || "No disponible"}

NIVEL:
${contexto.nivel || "No disponible"}

MÓDULO:
${contexto.modulo || "No disponible"}

TEMA:
${contexto.tema || "No disponible"}

LECCIÓN:
${contexto.tituloLeccion || "No disponible"}

OBJETIVO:
${contexto.objetivo || "No disponible"}

PREGUNTA:
${contexto.pregunta || "No disponible"}

TEXTO QUE DEBE EXPLICARSE:
${referencia}

TODOS LOS TEXTOS ACTUALES:
${JSON.stringify(contexto.textos, null, 2)}

Reglas:

1. Responde en español.

2. Explica de forma sencilla,
como un profesor a un estudiante.

3. Explica qué significa el contenido.

4. Si es una pregunta, explica qué está preguntando.

5. Si es una instrucción, explica qué debe hacer el estudiante.

6. Si contiene chino, utiliza el chino y su traducción
cuando sea útil.

7. No inventes información que no esté respaldada
por el contenido.

8. No menciones Storyline.

9. No menciones programación.

10. No menciones JSON.

11. No menciones variables.

12. Sé claro y relativamente breve.

`;


            return await consultarGroq(
                preguntaUsuario,
                systemPromptExplicacion,
                res
            );
        }


        // ====================================================
        // CONTROL DE TEMA
        // ====================================================

        const relacionada =
            pareceRelacionadaConCurso(
                preguntaUsuario,
                contexto
            );


        if (!relacionada) {

            return res.json({

                reply:
                    respuestaFueraDeTema(
                        contexto
                    )

            });
        }


        // ====================================================
        // CHAT GENERAL DEL CURSO
        // ====================================================

        const systemPrompt = `

Eres un tutor virtual de un curso educativo
de idiomas.

Ayudas al estudiante exclusivamente con
el contenido que está realizando actualmente.

SECCIÓN:
${contexto.seccion || "No disponible"}

NIVEL:
${contexto.nivel || "No disponible"}

MÓDULO:
${contexto.modulo || "No disponible"}

TEMA:
${contexto.tema || "No disponible"}

TÍTULO DE LA LECCIÓN:
${contexto.tituloLeccion || "No disponible"}

OBJETIVO:
${contexto.objetivo || "No disponible"}

PREGUNTA:
${contexto.pregunta || "No disponible"}

TEXTOS VISIBLES:
${JSON.stringify(contexto.textos, null, 2)}

CONTEXTO ANTERIOR:
${memoriaActual.ultimoTexto || "No disponible"}

REGLAS:

1. Responde siempre en español.

2. Utiliza primero el contenido proporcionado
por la diapositiva.

3. Puedes explicar vocabulario,
gramática, preguntas e instrucciones.

4. Si el estudiante pregunta por una palabra
que aparece en pantalla, explica su significado.

5. Si pregunta por una frase, explica su sentido.

6. Si pregunta "eso", "esa", "este", "esta"
o utiliza una referencia ambigua,
utiliza el último contenido relevante
de la conversación.

7. No inventes información.

8. No utilices información externa al curso
para completar una respuesta.

9. No menciones IDs.

10. No menciones lmsId.

11. No menciones JSON.

12. No menciones variables internas.

13. No menciones Storyline.

14. Responde de forma clara y natural.

15. Si el estudiante dice que no entiende,
explícale el contenido actual de forma sencilla.

`;


        return await consultarGroq(
            preguntaUsuario,
            systemPrompt,
            res
        );


    } catch (error) {

        console.error(
            "ERROR DEL SERVIDOR:",
            error
        );

        return res.status(500).json({

            reply:
                "Error interno del servidor."

        });
    }
});


// ============================================================
// FUNCIÓN GROQ
// ============================================================

async function consultarGroq(
    pregunta,
    systemPrompt,
    res
) {

    if (!process.env.GROQ_API_KEY) {

        console.error(
            "ERROR: GROQ_API_KEY no está configurada."
        );

        return res.status(500).json({

            reply:
                "La clave de Groq no está configurada en el servidor."

        });
    }


    try {

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
                            content: pregunta
                        }

                    ],

                    temperature: 0.1,

                    max_tokens: 250

                })

            }
        );


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


        const data =
            await response.json();


        const reply =
            data?.choices?.[0]?.message?.content?.trim() ||
            "No encontré información suficiente en el contenido del curso.";


        console.log(
            "RESPUESTA GROQ:",
            reply
        );


        return res.json({

            reply

        });


    } catch (error) {

        console.error(
            "ERROR CONSULTANDO GROQ:",
            error
        );

        return res.status(500).json({

            reply:
                "Error al conectar con Groq."

        });
    }
}


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