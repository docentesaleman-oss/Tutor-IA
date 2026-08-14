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
// FUNCIONES GENERALES
// ============================================================

function limpiarTexto(texto) {

    return String(texto || "")
        .replace(/\s+/g, " ")
        .trim();

}


function normalizarTexto(texto) {

    return limpiarTexto(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


// ============================================================
// ELEMENTOS TÉCNICOS
// ============================================================

function esElementoTecnico(texto) {

    const t = limpiarTexto(texto);
    const n = normalizarTexto(t);

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

        "line 1",
        "line 2",
        "line 3",
        "line 4",
        "line 5",
        "line 6",
        "line 7",

        "量"

    ];


    if (tecnicos.includes(n)) {
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

        const limpio =
            limpiarTexto(texto);


        if (!limpio) {
            continue;
        }


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
// DETECTAR IDIOMAS / CARACTERES
// ============================================================

function contieneChino(texto) {

    return /[\u3400-\u9FFF]/.test(
        String(texto || "")
    );

}


function contieneIngles(texto) {

    return /[A-Za-z]/.test(
        String(texto || "")
    );

}


// ============================================================
// DETECTAR NIVEL
// ============================================================

function obtenerNivel(textos) {

    if (!Array.isArray(textos)) {
        return "";
    }


    for (const texto of textos) {

        const t =
            limpiarTexto(texto);


        /*
        Ejemplos:

        中文 A2
        中文 B1
        Español B2
        English C1
        */

        if (
            /^(中文|chinese|español|english|ingles|espanol)\s+[ABC]\d$/i
                .test(t)
        ) {

            return t;

        }


        /*
        Búsqueda más flexible
        */

        const coincidencia =
            t.match(
                /\b[ABC][12]\b/i
            );


        if (
            coincidencia &&
            (
                contieneChino(t) ||
                contieneIngles(t)
            )
        ) {

            /*
            Solo aceptamos textos cortos
            para no confundirlos con contenido.
            */

            if (t.length <= 30) {
                return t;
            }

        }

    }


    return "";
}


// ============================================================
// DETECTAR MÓDULO / UNIDAD
// ============================================================

function obtenerModulo(textos) {

    if (!Array.isArray(textos)) {
        return "";
    }


    for (const texto of textos) {

        const t =
            limpiarTexto(texto);


        /*
        Ejemplo:

        单元 3 | 你学习还是工作? | Nǐ xuéxí háishì gōngzuò? | Do you study or work?
        */


        if (
            /单元\s*\d+/i.test(t) &&
            t.length > 8
        ) {

            return t;

        }


        /*
        También soportamos:

        Unit 3 | ...
        Unidad 3 | ...
        Module 3 | ...
        Módulo 3 | ...
        */

        if (
            /^(unit|unidad|module|modulo|módulo)\s*\d+/i
                .test(t)
        ) {

            return t;

        }

    }


    return "";
}


// ============================================================
// DETECTAR TEMA
// ============================================================

function obtenerTema(textos) {

    if (!Array.isArray(textos)) {
        return "";
    }


    /*
    Prioridad 1:
    textos chinos que contienen "第...课"

    Ejemplo:

    第四课 | 退休 | Tuìxiū | Unit 4 | The retirement
    */

    for (const texto of textos) {

        const t =
            limpiarTexto(texto);


        if (
            /第\s*[\d一二三四五六七八九十百]+\s*课/i
                .test(t)
        ) {

            return t;

        }

    }


    /*
    Prioridad 2:
    Unit / Unidad / Lesson
    */

    for (const texto of textos) {

        const t =
            limpiarTexto(texto);


        if (
            /^(unit|unidad|lesson|lección|leccion)\s*\d+/i
                .test(t)
        ) {

            return t;

        }

    }


    return "";
}


// ============================================================
// DETECTAR OBJETIVO / INSTRUCCIÓN
// ============================================================

function esInstruccion(texto) {

    const t =
        normalizarTexto(texto);


    const instrucciones = [

        "selecciona",
        "seleccione",
        "elige",
        "elija",
        "escoge",
        "escoja",
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
        "elige la",
        "selecciona la",
        "seleccione la",
        "escoge la",
        "escoger la",
        "responde",
        "responda",
        "elige la respuesta"

    ];


    for (const palabra of instrucciones) {

        if (
            t.startsWith(palabra) ||
            t.includes(" " + palabra + " ")
        ) {

            return true;

        }

    }


    return false;
}


function obtenerObjetivo(textos) {

    if (!Array.isArray(textos)) {
        return "";
    }


    for (const texto of textos) {

        const t =
            limpiarTexto(texto);


        if (!t) continue;


        if (esInstruccion(t)) {

            /*
            Evitamos elementos diminutos
            */

            if (t.length >= 8) {
                return t;
            }

        }

    }


    return "";
}


// ============================================================
// DETECTAR TÍTULO REAL DE LA LECCIÓN
// ============================================================

function pareceTituloLeccion(texto) {

    const t =
        limpiarTexto(texto);


    if (!t) return false;


    if (esElementoTecnico(t)) {
        return false;
    }


    /*
    No queremos instrucciones.
    */

    if (esInstruccion(t)) {
        return false;
    }


    /*
    No queremos el módulo.
    */

    if (
        /单元\s*\d+/i.test(t)
    ) {

        return false;

    }


    /*
    No queremos el tema.
    */

    if (
        /第\s*[\d一二三四五六七八九十百]+\s*课/i
            .test(t)
    ) {

        return false;

    }


    /*
    No queremos el nivel.
    */

    if (
        /^(中文|chinese|español|english|ingles|espanol)\s+[ABC]\d$/i
            .test(t)
    ) {

        return false;

    }


    /*
    Los títulos de las lecciones
    suelen contener una pregunta.

    Ejemplo:

    你已经退休了吗？
    Nǐ yǐjīng tuìxiūle ma?
    */

    if (
        t.includes("?") ||
        t.includes("？")
    ) {

        /*
        No aceptar instrucciones que terminen
        accidentalmente en pregunta.
        */

        return true;

    }


    return false;
}


function obtenerTituloLeccion(textos) {

    if (!Array.isArray(textos)) {
        return "";
    }


    /*
    PRIMERA PRIORIDAD:
    pregunta / frase principal de la lección.
    */

    for (const texto of textos) {

        const t =
            limpiarTexto(texto);


        if (
            pareceTituloLeccion(t)
        ) {

            return t;

        }

    }


    /*
    SEGUNDA PRIORIDAD:

    Si no existe signo de interrogación,
    buscar textos largos que tengan chino
    y caracteres latinos.
    */

    const candidatos =
        textos.filter(texto => {

            const t =
                limpiarTexto(texto);


            if (!t) return false;

            if (esElementoTecnico(t)) {
                return false;
            }

            if (esInstruccion(t)) {
                return false;
            }

            if (
                /单元\s*\d+/i.test(t)
            ) {
                return false;
            }

            if (
                /第\s*[\d一二三四五六七八九十百]+\s*课/i
                    .test(t)
            ) {
                return false;
            }

            if (
                /^(中文|chinese|español|english|ingles|espanol)\s+[ABC]\d$/i
                    .test(t)
            ) {
                return false;
            }

            if (t.length < 8) {
                return false;
            }

            return (
                contieneChino(t) &&
                contieneIngles(t)
            );

        });


    /*
    Elegimos el candidato más corto.
    Normalmente el título real de la lección
    es más corto que el módulo completo.
    */

    if (candidatos.length > 0) {

        candidatos.sort(
            (a, b) =>
                a.length - b.length
        );


        return candidatos[0];

    }


    return "";
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

        "1": "Portada",
        "2": "Pretest",
        "3": "Conversación multimedia",
        "4": "Vocabulario",
        "5": "Gramática",
        "6": "Pronunciación y caracteres",
        "7": "Test de lección"

    };


    return mapaEscenas[
        String(escena)
    ] || "";
}


// ============================================================
// TEMA DE RESPALDO
// ============================================================

function obtenerTemaActual(
    actual,
    textosUtiles
) {

    /*
    IMPORTANTE:

    Ya NO usamos directamente
    actual.titulo como tema.

    Storyline puede llamar a una diapositiva:

    "Escoger uno"

    aunque ese NO sea el título
    de la lección.
    */


    const tema =
        obtenerTema(textosUtiles);


    if (tema) {
        return tema;
    }


    /*
    Respaldo.
    */

    if (actual?.titulo) {

        const titulo =
            limpiarTexto(actual.titulo);


        if (
            titulo &&
            !esElementoTecnico(titulo) &&
            !esInstruccion(titulo)
        ) {

            return titulo;

        }

    }


    return "";
}


// ============================================================
// DETECTAR PREGUNTA / INSTRUCCIÓN
// ============================================================

function encontrarPregunta(textos) {

    const utiles =
        obtenerTextosUtiles(textos);


    /*
    Primero buscamos preguntas explícitas.
    */

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


    /*
    Después instrucciones.
    */

    for (const texto of utiles) {

        if (esInstruccion(texto)) {

            return texto;

        }

    }


    return null;
}


// ============================================================
// PREGUNTA DE UBICACIÓN
// ============================================================

function esPreguntaUbicacion(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("en que escena") ||
        p.includes("que escena") ||

        p.includes("donde estoy") ||

        p.includes("en que seccion") ||
        p.includes("que seccion") ||

        p.includes("en que parte estoy") ||

        p.includes("en que lugar estoy")

    );
}


// ============================================================
// PREGUNTA POR TÍTULO
// ============================================================

function esPreguntaTitulo(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("cual es el titulo") ||

        p.includes("titulo de la diapositiva") ||

        p.includes("titulo de la leccion") ||

        p.includes("nombre de la leccion") ||

        p.includes("como se llama la leccion")

    );
}


// ============================================================
// PREGUNTA POR MÓDULO
// ============================================================

function esPreguntaModulo(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("cual es el modulo") ||

        p.includes("nombre del modulo") ||

        p.includes("en que modulo estoy") ||

        p.includes("que modulo es")

    );
}


// ============================================================
// PREGUNTA POR TEMA
// ============================================================

function esPreguntaTema(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("cual es el tema") ||

        p.includes("nombre del tema") ||

        p.includes("en que tema estoy") ||

        p.includes("que tema estamos viendo")

    );
}


// ============================================================
// PREGUNTA POR NIVEL
// ============================================================

function esPreguntaNivel(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("que nivel") ||

        p.includes("cual es el nivel") ||

        p.includes("nivel del curso") ||

        p.includes("nivel estamos")

    );
}


// ============================================================
// PREGUNTA POR OBJETIVO
// ============================================================

function esPreguntaObjetivo(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("cual es el objetivo") ||

        p.includes("objetivo de la leccion") ||

        p.includes("que debo hacer") ||

        p.includes("que hay que hacer") ||

        p.includes("que tengo que hacer")

    );
}


// ============================================================
// PREGUNTA POR TEXTOS
// ============================================================

function esPreguntaTextos(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("que textos") ||

        p.includes("que texto") ||

        p.includes("que hay en pantalla") ||

        p.includes("que dice la pantalla") ||

        p.includes("que aparece en pantalla") ||

        p.includes("que ves en pantalla") ||

        p.includes("que texto veo") ||

        p.includes("que textos veo")

    );
}


// ============================================================
// PREGUNTA DEL EJERCICIO
// ============================================================

function esPreguntaEjercicio(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("pregunta del ejercicio") ||

        p.includes("pregunta que esta en el ejercicio") ||

        p.includes("pregunta de la diapositiva") ||

        p.includes("pregunta que esta en pantalla") ||

        p.includes("cual es la pregunta")

    );
}


// ============================================================
// PREGUNTA DE LA LECCIÓN
// ============================================================

function esPreguntaLeccion(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("pregunta de la leccion") ||

        p.includes("pregunta de la unidad") ||

        p.includes("pregunta del tema")

    );
}


// ============================================================
// TRADUCCIÓN
// ============================================================

function esPreguntaTraduccion(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("traduceme") ||
        p.includes("traduce") ||
        p.includes("traduccion") ||
        p.includes("como se dice") ||
        p.includes("que significa en español") ||
        p.includes("que significa en ingles") ||
        p.includes("como se traduce")

    );
}


// ============================================================
// SIGNIFICADO DE PALABRA
// ============================================================

function esPreguntaSignificado(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("que significa") ||
        p.includes("que quiere decir") ||
        p.includes("significado de") ||
        p.includes("que significa la palabra") ||
        p.includes("que significa esta palabra")

    );
}


// ============================================================
// EXPLICACIÓN
// ============================================================

function esPreguntaExplicacion(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p.includes("explicame") ||
        p.includes("explica") ||
        p.includes("no entiendo este texto") ||
        p.includes("no entiendo esta pregunta") ||
        p.includes("no entiendo") ||
        p.includes("me puedes explicar") ||
        p.includes("puedes explicarme")

    );
}


// ============================================================
// REFERENCIA
// ============================================================

function esPreguntaReferencia(pregunta) {

    const p =
        normalizarTexto(pregunta);


    return (

        p === "que significa eso" ||
        p === "que quiere decir eso" ||
        p === "que es eso" ||
        p === "que significa esto" ||
        p === "que quiere decir esto" ||
        p === "que es esto"

    );
}


// ============================================================
// EXTRAER PALABRA SOLICITADA
// ============================================================

function extraerPalabra(pregunta) {

    const texto =
        limpiarTexto(pregunta);


    /*
    Ejemplos:

    ¿Qué significa moon?
    ¿Qué significa "moon"?
    ¿Qué significa la palabra moon?
    Tradúceme moon al español.
    */

    let resultado;


    resultado =
        texto.match(
            /(?:significa|significado de|traduce|traduceme|traducir|palabra)\s+["'“”¿¡]?([^"'“”?!.,]+)["'“”?!.,]?/i
        );


    if (resultado?.[1]) {

        let palabra =
            limpiarTexto(resultado[1]);


        palabra =
            palabra
                .replace(
                    /^(la|el|la palabra|el termino|el término)\s+/i,
                    ""
                )
                .trim();


        if (
            palabra.length > 0 &&
            palabra.length < 100
        ) {

            return palabra;

        }

    }


    /*
    Segundo método:
    tomar una palabra marcada entre comillas.
    */

    resultado =
        texto.match(
            /["'“”]([^"'“”]+)["'“”]/
        );


    if (resultado?.[1]) {

        return limpiarTexto(
            resultado[1]
        );

    }


    return "";
}


// ============================================================
// ENCONTRAR TEXTO RELEVANTE PARA UNA PALABRA
// ============================================================

function buscarTextoRelacionado(
    palabra,
    textos
) {

    if (!palabra || !Array.isArray(textos)) {
        return "";
    }


    const objetivo =
        normalizarTexto(palabra);


    for (const texto of textos) {

        const limpio =
            limpiarTexto(texto);


        if (
            normalizarTexto(limpio)
                .includes(objetivo)
        ) {

            return limpio;

        }

    }


    return "";
}


// ============================================================
// DETECTAR SI ESTÁ RELACIONADA CON EL CURSO
// ============================================================

function pareceRelacionadaConCurso(
    pregunta,
    actual,
    textosUtiles,
    nombreSeccion,
    tituloLeccion,
    modulo,
    temaActual
) {

    const p =
        normalizarTexto(pregunta);


    const palabrasCurso = [

        "curso",
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
        "gramatica",
        "pronunciacion",
        "caracter",

        "significa",
        "significado",

        "traducir",
        "traduccion",

        "pronuncia",
        "pronunciar",

        "como se dice",

        "que significa",
        "que quiere decir",

        "explica",
        "explicame",
        "no entiendo",

        "como se responde",
        "como responder"

    ];


    for (const palabra of palabrasCurso) {

        if (p.includes(palabra)) {
            return true;
        }

    }


    /*
    Si la pregunta menciona literalmente
    una palabra que aparece en pantalla,
    también pertenece al curso.
    */

    for (const texto of textosUtiles) {

        const limpio =
            normalizarTexto(texto);


        if (
            limpio.length >= 3 &&
            p.includes(limpio)
        ) {

            return true;

        }

    }


    /*
    Preguntas relacionadas con la ubicación.
    */

    if (
        p.includes("estoy viendo") ||
        p.includes("estoy estudiando") ||
        p.includes("estamos estudiando") ||
        p.includes("que estamos") ||
        p.includes("donde estoy")
    ) {

        return true;

    }


    if (
        nombreSeccion &&
        p.includes(
            normalizarTexto(nombreSeccion)
        )
    ) {

        return true;

    }


    if (
        tituloLeccion &&
        p.includes(
            normalizarTexto(tituloLeccion)
        )
    ) {

        return true;

    }


    if (
        modulo &&
        p.includes(
            normalizarTexto(modulo)
        )
    ) {

        return true;

    }


    if (
        temaActual &&
        p.includes(
            normalizarTexto(temaActual)
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
    tituloLeccion
) {

    if (tituloLeccion) {

        return (
            `En este momento estamos trabajando la lección "${tituloLeccion}". ` +
            "Puedo ayudarte con el contenido de este curso."
        );

    }


    if (nombreSeccion) {

        return (
            `En este momento estamos trabajando en "${nombreSeccion}". ` +
            "Puedo ayudarte con el contenido de este curso."
        );

    }


    return (
        "Puedo ayudarte con el contenido del curso que estás realizando."
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


        const textos =
            Array.isArray(actual.textos)
                ? actual.textos
                : [];


        const textosUtiles =
            obtenerTextosUtiles(textos);


        /*
        --------------------------------------------------------
        METADATOS AUTOMÁTICOS
        --------------------------------------------------------
        */

        const nivel =
            obtenerNivel(textos);


        const modulo =
            obtenerModulo(textos);


        const temaActual =
            obtenerTema(textos);


        const tituloLeccion =
            obtenerTituloLeccion(textos);


        const objetivo =
            obtenerObjetivo(textos);


        const preguntaEjercicio =
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
        // LOGS
        // ----------------------------------------------------

        console.log(
            "SECCIÓN:",
            nombreSeccion
        );

        console.log(
            "NIVEL:",
            nivel
        );

        console.log(
            "MÓDULO:",
            modulo
        );

        console.log(
            "TEMA:",
            temaActual
        );

        console.log(
            "TÍTULO REAL DE LA LECCIÓN:",
            tituloLeccion
        );

        console.log(
            "OBJETIVO:",
            objetivo
        );

        console.log(
            "TÍTULO INTERNO STORYLINE:",
            actual.titulo || ""
        );

        console.log(
            "TEXTOS ÚTILES:",
            textosUtiles
        );


        // ====================================================
        // RESPUESTAS DIRECTAS
        // ====================================================

        /*
        --------------------------------------------------------
        UBICACIÓN
        --------------------------------------------------------
        */

        if (
            esPreguntaUbicacion(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    nombreSeccion ||
                    "No pude determinar la sección actual."

            });

        }


        /*
        --------------------------------------------------------
        TÍTULO REAL DE LA LECCIÓN
        --------------------------------------------------------
        */

        if (
            esPreguntaTitulo(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    tituloLeccion ||
                    "No pude determinar automáticamente el título de la lección."

            });

        }


        /*
        --------------------------------------------------------
        MÓDULO
        --------------------------------------------------------
        */

        if (
            esPreguntaModulo(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    modulo ||
                    "No pude determinar automáticamente el módulo."

            });

        }


        /*
        --------------------------------------------------------
        TEMA
        --------------------------------------------------------
        */

        if (
            esPreguntaTema(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    temaActual ||
                    "No pude determinar automáticamente el tema."

            });

        }


        /*
        --------------------------------------------------------
        NIVEL
        --------------------------------------------------------
        */

        if (
            esPreguntaNivel(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    nivel ||
                    "No pude determinar automáticamente el nivel."

            });

        }


        /*
        --------------------------------------------------------
        OBJETIVO
        --------------------------------------------------------
        */

        if (
            esPreguntaObjetivo(
                preguntaUsuario
            )
        ) {

            return res.json({

                reply:
                    objetivo ||
                    "No pude encontrar claramente el objetivo de esta diapositiva."

            });

        }


        /*
        --------------------------------------------------------
        TEXTOS DE PANTALLA
        --------------------------------------------------------
        */

        if (
            esPreguntaTextos(
                preguntaUsuario
            )
        ) {

            if (
                textosUtiles.length > 0
            ) {

                return res.json({

                    reply:
                        "Estos son los textos detectados en la pantalla:\n\n" +
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


        /*
        --------------------------------------------------------
        PREGUNTA DEL EJERCICIO
        --------------------------------------------------------
        */

        if (
            esPreguntaEjercicio(
                preguntaUsuario
            )
        ) {

            if (preguntaEjercicio) {

                return res.json({

                    reply:
                        preguntaEjercicio

                });

            }


            return res.json({

                reply:
                    "No encuentro una pregunta clara del ejercicio en esta diapositiva."

            });

        }


        /*
        --------------------------------------------------------
        PREGUNTA DE LA LECCIÓN
        --------------------------------------------------------
        */

        if (
            esPreguntaLeccion(
                preguntaUsuario
            )
        ) {

            if (preguntaEjercicio) {

                return res.json({

                    reply:
                        preguntaEjercicio

                });

            }


            return res.json({

                reply:
                    "No encuentro una pregunta clara de la lección en esta actividad."

            });

        }


        // ====================================================
        // PALABRA / TRADUCCIÓN / SIGNIFICADO
        // ====================================================

        const esTraduccion =
            esPreguntaTraduccion(
                preguntaUsuario
            );


        const esSignificado =
            esPreguntaSignificado(
                preguntaUsuario
            );


        const palabraSolicitada =
            extraerPalabra(
                preguntaUsuario
            );


        const textoRelacionado =
            buscarTextoRelacionado(
                palabraSolicitada,
                textos
            );


        /*
        --------------------------------------------------------
        TRADUCCIÓN
        --------------------------------------------------------
        */

        if (
            esTraduccion &&
            palabraSolicitada
        ) {

            const systemPrompt = `

Eres un tutor de idiomas.

El estudiante está trabajando actualmente
con una lección educativa.

Responde SIEMPRE en español.

PALABRA O EXPRESIÓN SOLICITADA:
${palabraSolicitada}

TEXTO DE LA PANTALLA DONDE APARECE:
${textoRelacionado || "No aparece literalmente en los textos detectados."}

TÍTULO DE LA LECCIÓN:
${tituloLeccion || "No disponible"}

TEMA:
${temaActual || "No disponible"}

MÓDULO:
${modulo || "No disponible"}

NIVEL:
${nivel || "No disponible"}

TAREA:

Si el estudiante pide traducir una palabra
o expresión, proporciona su traducción
al idioma solicitado.

Si no especifica idioma,
asume español.

Sé breve.

Si la palabra aparece en otro idioma,
puedes traducirla.

No inventes información sobre el curso.

No menciones datos técnicos de Storyline.

`;


            return await consultarGroq(
                systemPrompt,
                preguntaUsuario,
                res
            );

        }


        /*
        --------------------------------------------------------
        SIGNIFICADO
        --------------------------------------------------------
        */

        if (
            esSignificado &&
            palabraSolicitada
        ) {

            const systemPrompt = `

Eres un tutor de idiomas.

Responde SIEMPRE en español.

El estudiante pregunta por el significado
de una palabra o expresión.

PALABRA:
${palabraSolicitada}

CONTEXTO DE LA PANTALLA:
${textoRelacionado || "La palabra no aparece literalmente en los textos detectados."}

TÍTULO DE LA LECCIÓN:
${tituloLeccion || "No disponible"}

TEMA:
${temaActual || "No disponible"}

NIVEL:
${nivel || "No disponible"}

Explica:

1. Qué significa la palabra.
2. Su traducción al español si corresponde.
3. Cómo se entiende dentro del contexto actual.

Si la palabra no aparece en la pantalla,
puedes explicar su significado general
como tutor de idiomas, pero no inventes
un significado relacionado con el curso.

Sé breve y claro.

No menciones Storyline ni datos técnicos.

`;


            return await consultarGroq(
                systemPrompt,
                preguntaUsuario,
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

            const systemPrompt = `

Eres un tutor educativo.

El estudiante indica que no entiende
un texto, pregunta o contenido de la pantalla.

Responde SIEMPRE en español.

CONTEXTO ACTUAL:

SECCIÓN:
${nombreSeccion || "No disponible"}

NIVEL:
${nivel || "No disponible"}

MÓDULO:
${modulo || "No disponible"}

TEMA:
${temaActual || "No disponible"}

TÍTULO DE LA LECCIÓN:
${tituloLeccion || "No disponible"}

OBJETIVO:
${objetivo || "No disponible"}

TEXTOS DETECTADOS EN LA PANTALLA:

${JSON.stringify(textosUtiles, null, 2)}

PREGUNTA DEL ESTUDIANTE:

${preguntaUsuario}

Explica el contenido de manera sencilla,
como un profesor.

Si el estudiante dice
"No entiendo esta pregunta",
identifica primero la pregunta
relevante de la pantalla.

Si dice
"No entiendo este texto",
utiliza el texto correspondiente.

No inventes información.

No menciones códigos internos,
IDs, JSON ni Storyline.

`;


            return await consultarGroq(
                systemPrompt,
                preguntaUsuario,
                res
            );

        }


        // ====================================================
        // REFERENCIA
        // ====================================================

        if (
            esPreguntaReferencia(
                preguntaUsuario
            )
        ) {

            const systemPrompt = `

Eres un tutor educativo.

El estudiante utiliza expresiones como
"¿qué significa eso?" o
"¿qué quiere decir eso?".

Debes interpretar "eso" utilizando
el contenido más relevante de la pantalla actual.

SECCIÓN:
${nombreSeccion || "No disponible"}

TÍTULO DE LA LECCIÓN:
${tituloLeccion || "No disponible"}

TEMA:
${temaActual || "No disponible"}

OBJETIVO:
${objetivo || "No disponible"}

TEXTOS ACTUALES:

${JSON.stringify(textosUtiles, null, 2)}

ÚLTIMA PREGUNTA DEL ESTUDIANTE:

${preguntaUsuario}

Explica el elemento más relevante
del contexto actual.

Responde en español.

Sé claro y breve.

`;


            return await consultarGroq(
                systemPrompt,
                preguntaUsuario,
                res
            );

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
                tituloLeccion,
                modulo,
                temaActual
            );


        if (!relacionadaConCurso) {

            return res.json({

                reply:
                    respuestaFueraDeTema(
                        nombreSeccion,
                        tituloLeccion
                    )

            });

        }


        // ====================================================
        // PROMPT GENERAL
        // ====================================================

        const systemPrompt = `

Eres un tutor virtual de un curso educativo.

Tu función es ayudar al estudiante
a comprender el contenido que está realizando.

Responde SIEMPRE en español.

==================================================
CONTEXTO DEL CURSO
==================================================

SECCIÓN:
${nombreSeccion || "No disponible"}

NIVEL:
${nivel || "No disponible"}

MÓDULO:
${modulo || "No disponible"}

TEMA:
${temaActual || "No disponible"}

TÍTULO REAL DE LA LECCIÓN:
${tituloLeccion || "No disponible"}

OBJETIVO DE LA DIAPOSITIVA:
${objetivo || "No disponible"}

==================================================
DIAPOSITIVA
==================================================

NÚMERO:
${actual.numero || "No disponible"}

TÍTULO INTERNO DE STORYLINE:
${actual.titulo || "No disponible"}

==================================================
TEXTOS DETECTADOS
==================================================

${JSON.stringify(textosUtiles, null, 2)}

==================================================
PREGUNTA DEL ESTUDIANTE
==================================================

${preguntaUsuario}

==================================================
REGLAS
==================================================

1. Responde siempre en español.

2. Ayuda al estudiante con el contenido
   que está viendo.

3. Puedes explicar textos.

4. Puedes explicar preguntas.

5. Puedes explicar palabras.

6. Puedes explicar vocabulario.

7. Puedes explicar gramática.

8. Puedes traducir palabras y expresiones.

9. Si el estudiante pregunta por una palabra
   que aparece en la pantalla, utiliza ese contexto.

10. Si el estudiante pregunta
    "¿qué significa eso?",
    interpreta "eso" utilizando el contexto
    actual de la pantalla.

11. No inventes contenido del curso.

12. No menciones IDs.

13. No menciones lmsId.

14. No menciones JSON.

15. No menciones variables internas.

16. No menciones detalles técnicos de Storyline.

17. Si una información no está disponible,
    dilo claramente.

18. Responde de manera breve,
    clara y natural.

19. No cambies de tema.

20. El nombre interno de una diapositiva
    NO necesariamente es el título de la lección.

==================================================

`;


        // ====================================================
        // GROQ
        // ====================================================

        return await consultarGroq(
            systemPrompt,
            preguntaUsuario,
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
// FUNCIÓN CENTRAL PARA GROQ
// ============================================================

async function consultarGroq(
    systemPrompt,
    preguntaUsuario,
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
                                content: systemPrompt
                            },

                            {
                                role: "user",
                                content: preguntaUsuario
                            }

                        ],

                        temperature: 0.1,

                        max_tokens: 180

                    })

                }
            );


        // ----------------------------------------------------
        // ERROR GROQ
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // RESPUESTA
        // ----------------------------------------------------

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