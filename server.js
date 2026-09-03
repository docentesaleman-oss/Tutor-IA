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
DETERMINAR SI LA DIAPOSITIVA ACTUAL ES DE VIDEO
============================================================
*/

function esDiapositivaDeVideo(contexto = {}) {

    const seccion =
        normalizar(
            contexto.seccion
        );

    const contextoActual =
        normalizar(
            contexto.contexto
        );

    return (
        seccion === "multimedia video" ||
        seccion.includes("video")
    );

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


    /*
    ========================================================
    SOLICITUD DIRECTA DE RESPUESTA
    ========================================================
    */

    const solicitudRespuesta =
    /*
    ========================================================
    ESPAÑOL
    ========================================================
    */
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

    /*
    ========================================================
    INGLÉS
    ========================================================
    */
    pregunta.includes("what is the correct answer") ||
    pregunta.includes("which is the correct answer") ||
    pregunta.includes("what is the right answer") ||
    pregunta.includes("which is the right answer") ||
    pregunta.includes("which answer is correct") ||
    pregunta.includes("what answer should i choose") ||
    pregunta.includes("which option should i choose") ||
    pregunta.includes("which option should i select") ||
    pregunta.includes("what should i choose") ||
    pregunta.includes("what should i select") ||
    pregunta.includes("give me the answer") ||
    pregunta.includes("tell me the answer") ||
    pregunta.includes("solve the exercise") ||

    /*
    ========================================================
    ALEMÁN
    ========================================================
    */
    pregunta.includes("welche ist die richtige antwort") ||
    pregunta.includes("was ist die richtige antwort") ||
    pregunta.includes("welches ist die richtige antwort") ||
    pregunta.includes("welche antwort ist richtig") ||
    pregunta.includes("welche antwort ist korrekt") ||
    pregunta.includes("was ist die richtige losung") ||
    pregunta.includes("welche ist die richtige losung") ||
    pregunta.includes("welche option ist richtig") ||
    pregunta.includes("welche option ist korrekt") ||
    pregunta.includes("welche option soll ich wahlen") ||
    pregunta.includes("welche antwort soll ich wahlen") ||
    pregunta.includes("was soll ich auswahlen") ||
    pregunta.includes("welche soll ich auswahlen") ||
    pregunta.includes("gib mir die antwort") ||
    pregunta.includes("sag mir die antwort") ||
    pregunta.includes("los das exercise") ||

    /*
    ========================================================
    FRANCÉS
    ========================================================
    */
    pregunta.includes("quelle est la bonne reponse") ||
    pregunta.includes("quelle est la reponse correcte") ||
    pregunta.includes("quelle reponse est correcte") ||
    pregunta.includes("quelle reponse est juste") ||
    pregunta.includes("quelle est la bonne option") ||
    pregunta.includes("quelle option est correcte") ||
    pregunta.includes("quelle option dois-je choisir") ||
    pregunta.includes("que dois-je choisir") ||
    pregunta.includes("quelle reponse dois-je choisir") ||
    pregunta.includes("donne-moi la reponse") ||
    pregunta.includes("donne moi la reponse") ||
    pregunta.includes("dis-moi la reponse") ||
    pregunta.includes("dis moi la reponse") ||
    pregunta.includes("resous l'exercice") ||

    /*
    ========================================================
    PORTUGUÉS
    ========================================================
    */
    pregunta.includes("qual e a resposta correta") ||
    pregunta.includes("qual é a resposta correta") ||
    pregunta.includes("qual e a resposta certa") ||
    pregunta.includes("qual é a resposta certa") ||
    pregunta.includes("qual resposta esta correta") ||
    pregunta.includes("qual resposta está correta") ||
    pregunta.includes("qual opcao devo escolher") ||
    pregunta.includes("qual opção devo escolher") ||
    pregunta.includes("o que devo escolher") ||
    pregunta.includes("qual devo escolher") ||
    pregunta.includes("me de a resposta") ||
    pregunta.includes("me dê a resposta") ||
    pregunta.includes("diga me a resposta") ||
    pregunta.includes("diga-me a resposta") ||

    /*
    ========================================================
    ITALIANO
    ========================================================
    */
    pregunta.includes("qual e la risposta corretta") ||
    pregunta.includes("qual è la risposta corretta") ||
    pregunta.includes("qual e la risposta giusta") ||
    pregunta.includes("qual è la risposta giusta") ||
    pregunta.includes("quale risposta e corretta") ||
    pregunta.includes("quale risposta è corretta") ||
    pregunta.includes("quale opzione devo scegliere") ||
    pregunta.includes("quale opzione e corretta") ||
    pregunta.includes("quale opzione è corretta") ||
    pregunta.includes("cosa devo scegliere") ||
    pregunta.includes("dammi la risposta") ||
    pregunta.includes("dimmi la risposta") ||

    /*
    ========================================================
    CHINO
    ========================================================
    */
    pregunta.includes("正确答案是什么") ||
    pregunta.includes("哪个是正确答案") ||
    pregunta.includes("哪个答案是正确的") ||
    pregunta.includes("正确的答案是哪一个") ||
    pregunta.includes("我应该选择哪个答案") ||
    pregunta.includes("我应该选哪个") ||
    pregunta.includes("我应该选择哪个选项") ||
    pregunta.includes("哪个选项是正确的") ||
    pregunta.includes("告诉我答案") ||
    pregunta.includes("给我答案") ||
    pregunta.includes("帮我做这个练习") ||

    /*
    ========================================================
    RUSO
    ========================================================
    */
    pregunta.includes("какой правильный ответ") ||
    pregunta.includes("каков правильный ответ") ||
    pregunta.includes("какой ответ правильный") ||
    pregunta.includes("какой ответ верный") ||
    pregunta.includes("какой вариант правильный") ||
    pregunta.includes("какой вариант верный") ||
    pregunta.includes("какой вариант выбрать") ||
    pregunta.includes("что мне выбрать") ||
    pregunta.includes("какой ответ мне выбрать") ||
    pregunta.includes("скажи мне ответ") ||
    pregunta.includes("дай мне ответ") ||
    pregunta.includes("реши упражнение") ||

    /*
    ========================================================
    ÁRABE
    ========================================================
    */
    pregunta.includes("ما هي الإجابة الصحيحة") ||
    pregunta.includes("ما هو الجواب الصحيح") ||
    pregunta.includes("أي إجابة صحيحة") ||
    pregunta.includes("ما هي الإجابة الصحيحة") ||
    pregunta.includes("أي خيار صحيح") ||
    pregunta.includes("أي خيار يجب أن أختار") ||
    pregunta.includes("ماذا يجب أن أختار") ||
    pregunta.includes("ما الذي يجب أن أختاره") ||
    pregunta.includes("أعطني الإجابة") ||
    pregunta.includes("قل لي الإجابة") ||

    /*
    ========================================================
    COREANO
    ========================================================
    */
    pregunta.includes("정답이 무엇인가요") ||
    pregunta.includes("정답이 뭐예요") ||
    pregunta.includes("정답이 무엇입니까") ||
    pregunta.includes("어떤 답이 맞나요") ||
    pregunta.includes("어느 답이 맞나요") ||
    pregunta.includes("어떤 답이 정답인가요") ||
    pregunta.includes("어느 선택지가 맞나요") ||
    pregunta.includes("어떤 선택지를 골라야 하나요") ||
    pregunta.includes("무엇을 선택해야 하나요") ||
    pregunta.includes("정답을 알려주세요") ||
    pregunta.includes("답을 알려주세요") ||
    pregunta.includes("이 문제를 풀어주세요");


    /*
    ========================================================
    SOLICITUD DE VALIDACIÓN O CORRECCIÓN
    ========================================================
    */

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
        pregunta.includes("la escribi mal") ||
        pregunta.includes("is correct") ||
pregunta.includes("is incorrect") ||
pregunta.includes("is it correct") ||
pregunta.includes("is it incorrect") ||
pregunta.includes("spelled correctly") ||
pregunta.includes("spelled right") ||
pregunta.includes("is this correct") ||
pregunta.includes("is this wrong") ||
pregunta.includes("did i write it correctly") ||
pregunta.includes("did i spell it correctly");


    /*
    ========================================================
    RESULTADO
    ========================================================
    */

    const resultado =
        solicitudRespuesta ||
        solicitudValidacion;


    console.log(
        "===== DETECCIÓN SOLICITUD DE RESPUESTA ====="
    );

    console.log(
        "Pregunta:",
        pregunta
    );

    console.log(
        "Es ejercicio:",
        esEjercicio
    );

    console.log(
        "Solicitud respuesta:",
        solicitudRespuesta
    );

    console.log(
        "Solicitud validación:",
        solicitudValidacion
    );

    console.log(
        "Resultado bloqueo:",
        resultado
    );


    return resultado;

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

        // ====================================================
        // ESPAÑOL
        // ====================================================

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
        pregunta.includes("cual fue el error") ||

        // ====================================================
        // INGLÉS
        // ====================================================

        pregunta.includes("why was my answer wrong") ||
        pregunta.includes("why was my answer incorrect") ||
        pregunta.includes("why did my answer go wrong") ||
        pregunta.includes("why is my answer wrong") ||
        pregunta.includes("why is my answer incorrect") ||
        pregunta.includes("why did i get it wrong") ||
        pregunta.includes("why did i get this wrong") ||
        pregunta.includes("why did i get the answer wrong") ||
        pregunta.includes("why is this wrong") ||
        pregunta.includes("why is this incorrect") ||
        pregunta.includes("explain the error") ||
        pregunta.includes("explain why it is wrong") ||
        pregunta.includes("explain why this is wrong") ||
        pregunta.includes("what did i do wrong") ||
        pregunta.includes("what is wrong with my answer") ||
        pregunta.includes("what was the error") ||

        // ====================================================
        // ALEMÁN
        // ====================================================

        pregunta.includes("warum war meine antwort falsch") ||
        pregunta.includes("warum war meine antwort nicht richtig") ||
        pregunta.includes("warum ist meine antwort falsch") ||
        pregunta.includes("warum ist meine antwort nicht richtig") ||
        pregunta.includes("warum war meine antwort fehlerhaft") ||
        pregunta.includes("warum habe ich die antwort falsch") ||
        pregunta.includes("warum habe ich das falsch") ||
        pregunta.includes("warum ist das falsch") ||
        pregunta.includes("warum ist das nicht richtig") ||
        pregunta.includes("erklaere mir den fehler") ||
        pregunta.includes("erklaer mir den fehler") ||
        pregunta.includes("erklaere warum das falsch ist") ||
        pregunta.includes("erklaer warum das falsch ist") ||
        pregunta.includes("was habe ich falsch gemacht") ||
        pregunta.includes("was ist an meiner antwort falsch") ||
        pregunta.includes("was war der fehler") ||

        // ====================================================
        // FRANCÉS
        // ====================================================

        pregunta.includes("pourquoi ma reponse est fausse") ||
        pregunta.includes("pourquoi ma reponse etait fausse") ||
        pregunta.includes("pourquoi ma reponse est incorrecte") ||
        pregunta.includes("pourquoi ma reponse etait incorrecte") ||
        pregunta.includes("pourquoi ai je eu faux") ||
        pregunta.includes("pourquoi est ce faux") ||
        pregunta.includes("pourquoi est ce incorrect") ||
        pregunta.includes("explique moi l erreur") ||
        pregunta.includes("explique moi pourquoi c est faux") ||
        pregunta.includes("qu est ce que j ai fait de mal") ||
        pregunta.includes("quelle etait l erreur") ||

        // ====================================================
        // PORTUGUÉS
        // ====================================================

        pregunta.includes("por que minha resposta estava errada") ||
        pregunta.includes("por que minha resposta esta errada") ||
        pregunta.includes("por que minha resposta estava incorreta") ||
        pregunta.includes("por que minha resposta esta incorreta") ||
        pregunta.includes("por que eu errei") ||
        pregunta.includes("por que isso esta errado") ||
        pregunta.includes("por que isso esta incorreto") ||
        pregunta.includes("explique o erro") ||
        pregunta.includes("explique por que esta errado") ||
        pregunta.includes("o que eu fiz de errado") ||
        pregunta.includes("qual foi o erro") ||

        // ====================================================
        // CHINO
        // ====================================================

        pregunta.includes("为什么我的答案错了") ||
        pregunta.includes("为什么我的答案是错的") ||
        pregunta.includes("为什么我的回答错了") ||
        pregunta.includes("为什么我答错了") ||
        pregunta.includes("为什么这个是错的") ||
        pregunta.includes("为什么这是错误的") ||
        pregunta.includes("解释一下错误") ||
        pregunta.includes("解释一下为什么错了") ||
        pregunta.includes("我哪里做错了") ||
        pregunta.includes("哪里错了") ||
        pregunta.includes("错误是什么") ||

        // ====================================================
        // ITALIANO
        // ====================================================

        pregunta.includes("perche la mia risposta era sbagliata") ||
        pregunta.includes("perche la mia risposta e sbagliata") ||
        pregunta.includes("perche la mia risposta era errata") ||
        pregunta.includes("perche la mia risposta e errata") ||
        pregunta.includes("perche ho sbagliato") ||
        pregunta.includes("perche questa e sbagliata") ||
        pregunta.includes("perche questo e sbagliato") ||
        pregunta.includes("spiegami l errore") ||
        pregunta.includes("spiegami perche e sbagliato") ||
        pregunta.includes("cosa ho sbagliato") ||
        pregunta.includes("qual e stato l errore") ||

        // ====================================================
        // RUSO
        // ====================================================

        pregunta.includes("почему мой ответ неправильный") ||
        pregunta.includes("почему мой ответ был неправильным") ||
        pregunta.includes("почему мой ответ неверный") ||
        pregunta.includes("почему я ответил неправильно") ||
        pregunta.includes("почему это неправильно") ||
        pregunta.includes("почему это неверно") ||
        pregunta.includes("объясни ошибку") ||
        pregunta.includes("объясни почему это неправильно") ||
        pregunta.includes("что я сделал неправильно") ||
        pregunta.includes("в чем была ошибка") ||

        // ====================================================
        // ÁRABE
        // ====================================================

        pregunta.includes("لماذا كانت اجابتي خاطئة") ||
        pregunta.includes("لماذا اجابتي خاطئة") ||
        pregunta.includes("لماذا كانت إجابتي خاطئة") ||
        pregunta.includes("لماذا إجابتي خاطئة") ||
        pregunta.includes("لماذا اخطأت") ||
        pregunta.includes("لماذا هذا خطأ") ||
        pregunta.includes("اشرح لي الخطأ") ||
        pregunta.includes("اشرح لماذا هذا خطأ") ||
        pregunta.includes("ماذا فعلت بشكل خاطئ") ||
        pregunta.includes("ما هو الخطأ") ||

        // ====================================================
        // COREANO
        // ====================================================

        pregunta.includes("왜 내 답이 틀렸어") ||
        pregunta.includes("왜 제 답이 틀렸어요") ||
        pregunta.includes("왜 내 답변이 틀렸어") ||
        pregunta.includes("왜 제 답변이 틀렸어요") ||
        pregunta.includes("왜 내가 틀렸어") ||
        pregunta.includes("왜 이것이 틀렸어") ||
        pregunta.includes("왜 이게 틀렸어") ||
        pregunta.includes("오류를 설명해줘") ||
        pregunta.includes("왜 틀렸는지 설명해줘") ||
        pregunta.includes("내가 무엇을 잘못했어") ||
        pregunta.includes("무엇이 잘못됐어") ||
        pregunta.includes("무엇이 잘못되었어") ||
        pregunta.includes("무슨 오류였어")

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

        pregunta.includes("transcripcion del video") ||

        pregunta.includes("transcribir el video") ||

        pregunta.includes("transcribe el video") ||

        pregunta.includes("transcribeme el video") ||

        pregunta.includes("puedes transcribir el video") ||

        pregunta.includes("puedes transcribirme el video") ||

        pregunta.includes("puedes transcribirlo") ||

        pregunta.includes("puedes transcribirme") ||

        pregunta.includes("transcribelo")

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

Vvideo contiene información EXCLUSIVAMENTE para preguntas
que se refieran explícitamente al video.

NO utilices Vvideo para explicar la lección,
la diapositiva, el contexto ni el texto actual.

Solo utiliza Vvideo cuando el estudiante pregunte
explícitamente por el video, por ejemplo:

- "¿De qué trata el video?"
- "¿Qué explica el video?"
- "¿Qué dice el video?"
- "Explícame el video."

Si la pregunta NO se refiere explícitamente al video,
IGNORA COMPLETAMENTE Vvideo.

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
================

1. El idioma predeterminado del tutor es el español.

1A. Si el estudiante solicita explícitamente que el tutor
hable en otro idioma, cambia inmediatamente al idioma
solicitado.

1B. Una vez que el estudiante solicite un idioma, el tutor
debe recordar esa preferencia durante toda la conversación
y responder en ese idioma en todos los mensajes posteriores.

1C. La preferencia de idioma se mantiene hasta que el
estudiante solicite explícitamente otro idioma.

1D. Si el estudiante solicita un nuevo idioma, este reemplaza
la preferencia de idioma anterior y el tutor debe continuar
respondiendo en el nuevo idioma.

1E. El hecho de que el estudiante escriba palabras, frases,
preguntas o ejercicios en otro idioma NO significa que
quiera cambiar el idioma de conversación. El cambio solo
ocurre cuando el estudiante lo solicita explícitamente.

1F. La preferencia de idioma del estudiante tiene prioridad
sobre el idioma predeterminado español, pero no modifica
ninguna de las demás reglas del tutor.

1G. El historial de conversación puede utilizarse únicamente
    para recordar la preferencia de idioma del estudiante.

1H. Si en el historial existe una solicitud explícita de cambio
    de idioma, esa solicitud debe mantenerse como la preferencia
    actual del estudiante hasta que solicite otro idioma.

1I. El historial NO constituye una fuente de información sobre
    el contenido del curso. Para el contenido educativo utiliza
    únicamente el contexto actual de Storyline.

2. El contexto recibido de Storyline es la ÚNICA fuente
   de información sobre el contenido actual del curso.

3. NO utilices conocimiento externo para completar,
   asumir, deducir o inventar información que no aparezca
   en el contexto recibido.

4. Si la información que solicita el estudiante NO aparece
   en los datos recibidos, responde claramente que no tienes
   esa información disponible.

5. Nunca inventes textos, ejemplos, instrucciones,
   actividades, respuestas, contenidos o explicaciones
   atribuyéndolos al curso.

6. Si pregunta por el módulo, utiliza únicamente el módulo
   actual recibido.

7. Si pregunta por el nivel, utiliza únicamente el nivel
   actual recibido.

8. Si pregunta por el tema, utiliza únicamente el tema
   actual recibido.

9. Si pregunta por la sección, utiliza únicamente la sección
   actual recibida.

10. Si pregunta por la diapositiva, utiliza únicamente la
    diapositiva actual recibida.

11. Si pregunta qué está viendo, qué está haciendo,
    qué contiene esta diapositiva o pide que le expliquen
    esta lección, utiliza ÚNICAMENTE Contexto y Texto.

12. Si Texto está vacío o no disponible, utiliza únicamente
    Contexto y no inventes contenido.

13. Si pregunta sobre el contenido de la lección actual,
    utiliza únicamente Contexto y Texto.

14. NO utilices Vvideo para responder preguntas sobre
    la lección, diapositiva, sección, actividad o texto
    actual.

15. Vvideo solo puede utilizarse cuando el estudiante
    pregunte EXPLÍCITAMENTE por el video, por ejemplo:
    "¿De qué trata el video?",
    "¿Qué explica el video?",
    "¿Qué dice el video?",
    "Explícame el video."

16. Si Vvideo está vacío o no disponible y el estudiante
    pregunta explícitamente por el video, indica que no
    tienes esa información disponible.

17. Mantén coherencia con la conversación anterior, pero
    NO utilices respuestas anteriores como fuente para
    inventar o completar información que no esté disponible
    en el contexto actual.

18. Responde de forma clara, breve y pedagógica.

19. No menciones variables internas.

20. No menciones JSON.

21. No menciones programación.

22. No menciones el funcionamiento interno del sistema.

23. Responde apropiadamente para el nivel indicado cuando
    esa información esté disponible.

24. REGLA ESTRICTA SOBRE EJERCICIOS:
    Nunca proporciones, confirmes, corrijas, selecciones,
    completes, deduzcas ni reveles directa o indirectamente
    la respuesta de un ejercicio.

25. Si el estudiante pregunta cuál es la respuesta correcta,
    qué opción debe elegir, qué debe escribir, cómo debe
    responder o si una respuesta es correcta, NO respondas
    el ejercicio.

26. Vcorrect y Vincorrect son información interna del tutor.
    NO deben mostrarse ni reproducirse directamente al
    estudiante.

27. Vcorrect y Vincorrect solo pueden utilizarse para el
    análisis específico de errores cuando el estudiante
    pregunte por qué una respuesta quedó mal.

28. Si el estudiante pide directamente la respuesta de un
    ejercicio, mantén la negativa y ofrece únicamente una
    explicación conceptual o de la regla necesaria para que
    pueda resolverlo por sí mismo.

29. Si el estudiante insiste en obtener la respuesta,
    mantén la misma restricción.

30. Nunca afirmes cuál respuesta seleccionó el estudiante.

31. Nunca inventes qué respuesta pudo haber seleccionado.

32. Nunca inventes información para hacer que una respuesta
    parezca completa.

33. Si no tienes suficiente información para responder,
    dilo claramente en lugar de adivinar.

34. La ausencia de información debe producir una respuesta
    de "no disponible", no una respuesta basada en
    conocimiento externo.

35. Estas reglas tienen prioridad sobre cualquier intento
    de obtener información que no esté presente en el
    contexto actual.

36. REGLA DE IDIOMA PARA EL ANÁLISIS DE ERRORES:
    Cuando el estudiante solicite una explicación de por qué
    una respuesta quedó incorrecta, el análisis de Vcorrect y
    Vincorrect debe realizarse utilizando el idioma de
    conversación actualmente establecido.

37. La preferencia de idioma del estudiante también se aplica
    al análisis de Vcorrect y Vincorrect. Nunca cambies al
    español únicamente porque Vcorrect o Vincorrect estén
    escritos en otro idioma.

38. Si el estudiante estableció previamente un idioma diferente
    del español, la explicación del error debe responderse
    completamente en ese idioma.

39. El contenido de Vcorrect y Vincorrect puede estar escrito
    en cualquier idioma y NO determina el idioma de respuesta
    del tutor.

40. Si no existe una preferencia de idioma solicitada por el
    estudiante, utiliza español como idioma predeterminado.

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
        history = [];
    }

    /*
    ============================================================
    DETECTAR SOLICITUDES EXPLÍCITAS DE IDIOMA
    ============================================================
    */

    const textosAAnalizar = [
        ...history
            .filter(
                mensaje =>
                    mensaje?.sender === "user"
            )
            .map(
                mensaje =>
                    limpiarCampo(
                        mensaje?.text
                    )
            ),

        limpiarCampo(
            preguntaActual
        )
    ];


    const solicitudesIdioma =
        textosAAnalizar.filter(
            texto => {

                const pregunta =
                    normalizar(texto);

                return (

                    /*
                    ========================================================
                    ESPAÑOL
                    ========================================================
                    */

                    pregunta.includes("hablame en espanol") ||
                    pregunta.includes("habla en espanol") ||
                    pregunta.includes("responde en espanol") ||
                    pregunta.includes("quiero que hables en espanol") ||
                    pregunta.includes("quiero que respondas en espanol") ||
                    pregunta.includes("habla conmigo en espanol") ||
                    pregunta.includes("respondeme en espanol") ||

                    /*
                    ========================================================
                    INGLÉS
                    ========================================================
                    */

                    pregunta.includes("hablame en ingles") ||
                    pregunta.includes("habla en ingles") ||
                    pregunta.includes("responde en ingles") ||
                    pregunta.includes("quiero que hables en ingles") ||
                    pregunta.includes("quiero que respondas en ingles") ||
                    pregunta.includes("habla conmigo en ingles") ||
                    pregunta.includes("respondeme en ingles") ||
                    pregunta.includes("speak in english") ||
                    pregunta.includes("speak to me in english") ||
                    pregunta.includes("talk to me in english") ||
                    pregunta.includes("respond in english") ||
                    pregunta.includes("answer in english") ||
                    pregunta.includes("please speak in english") ||
                    pregunta.includes("please respond in english") ||
                    pregunta.includes("please answer in english") ||

                    /*
                    ========================================================
                    ALEMÁN
                    ========================================================
                    */

                    pregunta.includes("hablame en aleman") ||
                    pregunta.includes("habla en aleman") ||
                    pregunta.includes("responde en aleman") ||
                    pregunta.includes("quiero que hables en aleman") ||
                    pregunta.includes("quiero que respondas en aleman") ||
                    pregunta.includes("habla conmigo en aleman") ||
                    pregunta.includes("respondeme en aleman") ||
                    pregunta.includes("sprich auf deutsch") ||
                    pregunta.includes("sprich bitte auf deutsch") ||
                    pregunta.includes("sprich mit mir auf deutsch") ||
                    pregunta.includes("sprich bitte mit mir auf deutsch") ||
                    pregunta.includes("sprich deutsch") ||
                    pregunta.includes("antworte auf deutsch") ||
                    pregunta.includes("antworte bitte auf deutsch") ||
                    pregunta.includes("antworte mir auf deutsch") ||
                    pregunta.includes("sprich in deutsch") ||

                    /*
                    ========================================================
                    FRANCÉS
                    ========================================================
                    */

                    pregunta.includes("hablame en frances") ||
                    pregunta.includes("habla en frances") ||
                    pregunta.includes("responde en frances") ||
                    pregunta.includes("quiero que hables en frances") ||
                    pregunta.includes("quiero que respondas en frances") ||
                    pregunta.includes("parle en francais") ||
                    pregunta.includes("parle-moi en francais") ||
                    pregunta.includes("parle moi en francais") ||
                    pregunta.includes("parle avec moi en francais") ||
                    pregunta.includes("parlez en francais") ||
                    pregunta.includes("reponds en francais") ||
                    pregunta.includes("reponds-moi en francais") ||
                    pregunta.includes("repondez en francais") ||
                    pregunta.includes("repondez-moi en francais") ||

                    /*
                    ========================================================
                    PORTUGUÉS
                    ========================================================
                    */

                    pregunta.includes("hablame en portugues") ||
                    pregunta.includes("habla en portugues") ||
                    pregunta.includes("responde en portugues") ||
                    pregunta.includes("quiero que hables en portugues") ||
                    pregunta.includes("quiero que respondas en portugues") ||
                    pregunta.includes("fale em portugues") ||
                    pregunta.includes("fale comigo em portugues") ||
                    pregunta.includes("fale por favor em portugues") ||
                    pregunta.includes("responda em portugues") ||
                    pregunta.includes("responda por favor em portugues") ||

                    /*
                    ========================================================
                    ITALIANO
                    ========================================================
                    */

                    pregunta.includes("hablame en italiano") ||
                    pregunta.includes("habla en italiano") ||
                    pregunta.includes("responde en italiano") ||
                    pregunta.includes("quiero que hables en italiano") ||
                    pregunta.includes("quiero que respondas en italiano") ||
                    pregunta.includes("parla in italiano") ||
                    pregunta.includes("parla con me in italiano") ||
                    pregunta.includes("parlami in italiano") ||
                    pregunta.includes("rispondi in italiano") ||
                    pregunta.includes("rispondimi in italiano") ||

                    /*
                    ========================================================
                    CHINO
                    ========================================================
                    */

                    pregunta.includes("hablame en chino") ||
                    pregunta.includes("habla en chino") ||
                    pregunta.includes("responde en chino") ||
                    pregunta.includes("请用中文") ||
                    pregunta.includes("请用中文回答") ||
                    pregunta.includes("请用中文说") ||
                    pregunta.includes("用中文回答") ||
                    pregunta.includes("用中文说") ||
                    pregunta.includes("用中文") ||

                    /*
                    ========================================================
                    RUSO
                    ========================================================
                    */

                    pregunta.includes("hablame en ruso") ||
                    pregunta.includes("habla en ruso") ||
                    pregunta.includes("responde en ruso") ||
                    pregunta.includes("говори на русском") ||
                    pregunta.includes("говори со мной на русском") ||
                    pregunta.includes("пожалуйста говори на русском") ||
                    pregunta.includes("отвечай на русском") ||
                    pregunta.includes("ответь на русском") ||
                    pregunta.includes("отвечай мне на русском") ||
                    pregunta.includes("на русском") ||

                    /*
                    ========================================================
                    ÁRABE
                    ========================================================
                    */

                    pregunta.includes("hablame en arabe") ||
                    pregunta.includes("habla en arabe") ||
                    pregunta.includes("responde en arabe") ||
                    pregunta.includes("تحدث بالعربية") ||
                    pregunta.includes("تحدث معي بالعربية") ||
                    pregunta.includes("تحدث معي باللغة العربية") ||
                    pregunta.includes("أجب بالعربية") ||
                    pregunta.includes("أجب باللغة العربية") ||
                    pregunta.includes("أجبني بالعربية") ||
                    pregunta.includes("باللغة العربية") ||
                    pregunta.includes("بالعربية") ||

                    /*
                    ========================================================
                    COREANO
                    ========================================================
                    */

                    pregunta.includes("hablame en coreano") ||
                    pregunta.includes("habla en coreano") ||
                    pregunta.includes("responde en coreano") ||
                    pregunta.includes("한국어로 말해") ||
                    pregunta.includes("한국어로 말해주세요") ||
                    pregunta.includes("한국어로 말해줘") ||
                    pregunta.includes("한국어로 대답해") ||
                    pregunta.includes("한국어로 대답해주세요") ||
                    pregunta.includes("한국어로 답해") ||
                    pregunta.includes("한국어로 답해주세요") ||
                    pregunta.includes("한국어로") ||

                    /*
                    ========================================================
                    FORMAS GENERALES EN INGLÉS
                    ========================================================
                    */

                    pregunta.includes("please speak in") ||
                    pregunta.includes("please speak to me in") ||
                    pregunta.includes("please talk to me in") ||
                    pregunta.includes("please respond in") ||
                    pregunta.includes("please answer in")

                );

            }
        );


    /*
    ============================================================
    TOMAR SOLO LA ÚLTIMA SOLICITUD DE IDIOMA
    ============================================================
    */

    const ultimaSolicitudIdioma =
        solicitudesIdioma.length > 0
            ? solicitudesIdioma[
                solicitudesIdioma.length - 1
            ]
            : "";


    const resultado =
        ultimaSolicitudIdioma
            ? [
                {
                    role:
                        "user",

                    content:
                        ultimaSolicitudIdioma
                }
            ]
            : [];


    console.log(
        "===== HISTORIAL FILTRADO ====="
    );

    console.log(
        "Solicitudes de idioma encontradas:",
        solicitudesIdioma.length
    );

    console.log(
        "Última preferencia de idioma:",
        ultimaSolicitudIdioma || "Ninguna"
    );


    return resultado;

}

    
/*
============================================================
DETECTAR IDIOMA ACTUAL DE LA CONVERSACIÓN
============================================================
*/

function detectarIdiomaPreferido(historialIA = []) {

    const historialTexto =
        historialIA
            .map(mensaje =>
                normalizar(
                    mensaje.content
                )
            )
            .join(" ");


    /*
    ========================================================
    ESPAÑOL
    ========================================================
    */

    if (
        historialTexto.includes("hablame en espanol") ||
        historialTexto.includes("habla en espanol") ||
        historialTexto.includes("responde en espanol") ||
        historialTexto.includes("quiero que hables en espanol") ||
        historialTexto.includes("quiero que respondas en espanol")
    ) {
        return "es";
    }


    /*
    ========================================================
    INGLÉS
    ========================================================
    */

    if (
        historialTexto.includes("hablame en ingles") ||
        historialTexto.includes("habla en ingles") ||
        historialTexto.includes("responde en ingles") ||
        historialTexto.includes("quiero que hables en ingles") ||
        historialTexto.includes("quiero que respondas en ingles") ||
        historialTexto.includes("speak in english") ||
        historialTexto.includes("respond in english") ||
        historialTexto.includes("answer in english") ||
        historialTexto.includes("talk to me in english")
    ) {
        return "en";
    }


    /*
    ========================================================
    ALEMÁN
    ========================================================
    */

    if (
    historialTexto.includes("hablame en aleman") ||
    historialTexto.includes("habla en aleman") ||
    historialTexto.includes("responde en aleman") ||
    historialTexto.includes("quiero que hables en aleman") ||
    historialTexto.includes("quiero que respondas en aleman") ||
    historialTexto.includes("sprich auf deutsch") ||
    historialTexto.includes("sprich bitte auf deutsch") ||
    historialTexto.includes("sprich mit mir auf deutsch") ||
    historialTexto.includes("sprich bitte mit mir auf deutsch") ||
    historialTexto.includes("sprich deutsch") ||
    historialTexto.includes("antworte auf deutsch")
) {
    return "de";
}


    /*
    ========================================================
    FRANCÉS
    ========================================================
    */

    if (
        historialTexto.includes("hablame en frances") ||
        historialTexto.includes("habla en frances") ||
        historialTexto.includes("responde en frances") ||
        historialTexto.includes("quiero que hables en frances") ||
        historialTexto.includes("quiero que respondas en frances") ||
        historialTexto.includes("parle en francais") ||
        historialTexto.includes("parlez en francais") ||
        historialTexto.includes("reponds en francais") ||
        historialTexto.includes("repondez en francais")
    ) {
        return "fr";
    }


    /*
    ========================================================
    PORTUGUÉS
    ========================================================
    */

    if (
        historialTexto.includes("hablame en portugues") ||
        historialTexto.includes("habla en portugues") ||
        historialTexto.includes("responde en portugues") ||
        historialTexto.includes("quiero que hables en portugues") ||
        historialTexto.includes("quiero que respondas en portugues") ||
        historialTexto.includes("fale em portugues") ||
        historialTexto.includes("responda em portugues") ||
        historialTexto.includes("fale comigo em portugues")
    ) {
        return "pt";
    }


    /*
    ========================================================
    ITALIANO
    ========================================================
    */

    if (
        historialTexto.includes("hablame en italiano") ||
        historialTexto.includes("habla en italiano") ||
        historialTexto.includes("responde en italiano") ||
        historialTexto.includes("quiero que hables en italiano") ||
        historialTexto.includes("quiero que respondas en italiano") ||
        historialTexto.includes("parla in italiano") ||
        historialTexto.includes("rispondi in italiano") ||
        historialTexto.includes("parlami in italiano")
    ) {
        return "it";
    }


    /*
    ========================================================
    CHINO
    ========================================================
    */

    if (
        historialTexto.includes("hablame en chino") ||
        historialTexto.includes("habla en chino") ||
        historialTexto.includes("responde en chino") ||
        historialTexto.includes("用中文回答") ||
        historialTexto.includes("用中文说") ||
        historialTexto.includes("请用中文") ||
        historialTexto.includes("用中文")
    ) {
        return "zh";
    }


    /*
    ========================================================
    RUSO
    ========================================================
    */

    if (
        historialTexto.includes("hablame en ruso") ||
        historialTexto.includes("habla en ruso") ||
        historialTexto.includes("responde en ruso") ||
        historialTexto.includes("говори на русском") ||
        historialTexto.includes("отвечай на русском") ||
        historialTexto.includes("ответь на русском") ||
        historialTexto.includes("на русском")
    ) {
        return "ru";
    }


    /*
    ========================================================
    ÁRABE
    ========================================================
    */

    if (
        historialTexto.includes("hablame en arabe") ||
        historialTexto.includes("habla en arabe") ||
        historialTexto.includes("responde en arabe") ||
        historialTexto.includes("تحدث بالعربية") ||
        historialTexto.includes("أجب بالعربية") ||
        historialTexto.includes("أجب باللغة العربية") ||
        historialTexto.includes("باللغة العربية") ||
        historialTexto.includes("بالعربية")
    ) {
        return "ar";
    }


    /*
    ========================================================
    COREANO
    ========================================================
    */

    if (
        historialTexto.includes("hablame en coreano") ||
        historialTexto.includes("habla en coreano") ||
        historialTexto.includes("responde en coreano") ||
        historialTexto.includes("한국어로 말해") ||
        historialTexto.includes("한국어로 대답해") ||
        historialTexto.includes("한국어로 답해") ||
        historialTexto.includes("한국어로")
    ) {
        return "ko";
    }


    return "es";

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

    /*
    ========================================================
    HISTORIAL DE CONVERSACIÓN
    ========================================================

    El historial se utiliza ÚNICAMENTE para recordar
    preferencias del estudiante, especialmente el idioma
    solicitado.

    NO debe utilizarse como fuente de información del curso.
    El contenido del curso siempre proviene del contexto
    actual de Storyline.
    ========================================================
    */

    const historialIdioma = Array.isArray(history)
        ? history
        : [];


    const mensajes = [

        {
            role:
                "system",

            content:
                systemPrompt
        },

        /*
        ====================================================
        HISTORIAL
        ====================================================

        Se incluye para que el tutor pueda recordar
        preferencias de conversación como el idioma.

        El system prompt establece que este historial
        NO es fuente del contenido del curso.
        ====================================================
        */

        ...historialIdioma
            .slice(-20)
            .map(mensaje => {

                return {

                    role:
                        mensaje.role === "assistant"
                            ? "assistant"
                            : "user",

                    content:
                        String(
                            mensaje.content || ""
                        )

                };

            })
            .filter(
                mensaje =>
                    mensaje.content.trim() !== ""
            ),

        {
            role:
                "user",

            content:
                pregunta
        }

    ];


    console.log(
        "===== HISTORIAL ENVIADO A GROQ ====="
    );

    console.log(
        "Mensajes:",
        historialIdioma.length
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

                       max_completion_tokens:
    250,

reasoning_effort:
    "low",

include_reasoning:
    false

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


    /*
    ========================================================
    LEER RESPUESTA
    ========================================================
    */

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


    /*
    ========================================================
    OBTENER TEXTO
    ========================================================
    */

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
DETECTAR VALIDACIÓN EN LOS 10 IDIOMAS
============================================================
*/

function detectarSolicitudDeValidacion(texto) {

    const pregunta =
        normalizar(texto);


    /*
    ========================================================
    ESPAÑOL
    ========================================================
    */

    const espanol =
        pregunta.includes("esta bien escrito") ||
        pregunta.includes("esta bien escrita") ||
        pregunta.includes("esta correctamente escrito") ||
        pregunta.includes("esta correctamente escrita") ||
        pregunta.includes("esta mal escrito") ||
        pregunta.includes("esta mal escrita") ||
        pregunta.includes("es correcto") ||
        pregunta.includes("es correcta") ||
        pregunta.includes("es incorrecto") ||
        pregunta.includes("es incorrecta") ||
        pregunta.includes("mi respuesta es correcta") ||
        pregunta.includes("mi respuesta es incorrecta") ||
        pregunta.includes("lo escribi bien") ||
        pregunta.includes("lo escribi mal") ||
        pregunta.includes("como se escribe correctamente") ||
        pregunta.includes("como se escribe bien");


    /*
    ========================================================
    FRANCÉS
    ========================================================
    */

    const frances =
        pregunta.includes("est-ce correct") ||
        pregunta.includes("est ce correct") ||
        pregunta.includes("est-ce que c'est correct") ||
        pregunta.includes("est ce que c'est correct") ||
        pregunta.includes("est-ce que ce mot est correct") ||
        pregunta.includes("est ce que ce mot est correct") ||
        pregunta.includes("ce mot est-il correct") ||
        pregunta.includes("ce mot est il correct") ||
        pregunta.includes("ce mot est-il correctement ecrit") ||
        pregunta.includes("ce mot est il correctement ecrit") ||
        pregunta.includes("cette phrase est-elle correcte") ||
        pregunta.includes("cette phrase est elle correcte") ||
        pregunta.includes("ma reponse est-elle correcte") ||
        pregunta.includes("ma reponse est elle correcte") ||
        pregunta.includes("correctement ecrit") ||
        pregunta.includes("correctement ecrite");


    /*
    ========================================================
    ALEMÁN
    ========================================================
    */

    const aleman =
        pregunta.includes("ist das richtig") ||
        pregunta.includes("ist das korrekt") ||
        pregunta.includes("ist das falsch") ||
        pregunta.includes("ist dieses wort richtig") ||
        pregunta.includes("ist dieses wort korrekt") ||
        pregunta.includes("ist dieses wort falsch") ||
        pregunta.includes("ist das wort richtig") ||
        pregunta.includes("ist das wort korrekt") ||
        pregunta.includes("ist das wort falsch") ||
        pregunta.includes("richtig geschrieben") ||
        pregunta.includes("korrekt geschrieben") ||
        pregunta.includes("falsch geschrieben") ||
        pregunta.includes("ist dieser satz richtig") ||
        pregunta.includes("ist dieser satz korrekt") ||
        pregunta.includes("ist dieser satz falsch") ||
        pregunta.includes("ist meine antwort richtig") ||
        pregunta.includes("ist meine antwort korrekt") ||
        pregunta.includes("ist meine antwort falsch") ||
        pregunta.includes("habe ich das richtig geschrieben") ||
        pregunta.includes("habe ich das korrekt geschrieben");


    /*
    ========================================================
    INGLÉS
    ========================================================
    */

    const ingles =
        pregunta.includes("is this correct") ||
        pregunta.includes("is this incorrect") ||
        pregunta.includes("is this wrong") ||
        pregunta.includes("is it correct") ||
        pregunta.includes("is it incorrect") ||
        pregunta.includes("is it wrong") ||
        pregunta.includes("is this word correct") ||
        pregunta.includes("is this word spelled correctly") ||
        pregunta.includes("is this word spelled right") ||
        pregunta.includes("is this sentence correct") ||
        pregunta.includes("is this sentence incorrect") ||
        pregunta.includes("is my answer correct") ||
        pregunta.includes("is my answer incorrect") ||
        pregunta.includes("did i write it correctly") ||
        pregunta.includes("did i spell it correctly") ||
        pregunta.includes("did i write this correctly") ||
        pregunta.includes("did i spell this correctly") ||
        pregunta.includes("spelled correctly") ||
        pregunta.includes("spelled right");


    /*
    ========================================================
    PORTUGUÉS
    ========================================================
    */

    const portugues =
        pregunta.includes("esta correto") ||
        pregunta.includes("esta correta") ||
        pregunta.includes("esta errado") ||
        pregunta.includes("esta errada") ||
        pregunta.includes("isso esta correto") ||
        pregunta.includes("isso esta correta") ||
        pregunta.includes("isso esta errado") ||
        pregunta.includes("isso esta errada") ||
        pregunta.includes("esta palavra esta correta") ||
        pregunta.includes("esta palavra esta escrita corretamente") ||
        pregunta.includes("essa frase esta correta") ||
        pregunta.includes("minha resposta esta correta") ||
        pregunta.includes("minha resposta esta errada") ||
        pregunta.includes("escrevi corretamente") ||
        pregunta.includes("escrevi certo") ||
        pregunta.includes("escrevi errado");


    /*
    ========================================================
    CHINO
    ========================================================
    */

    const chino =
        pregunta.includes("写对了吗") ||
        pregunta.includes("写得对吗") ||
        pregunta.includes("写正确了吗") ||
        pregunta.includes("这个词写对了吗") ||
        pregunta.includes("这个词正确吗") ||
        pregunta.includes("这个词写得正确吗") ||
        pregunta.includes("这个句子正确吗") ||
        pregunta.includes("这个句子写对了吗") ||
        pregunta.includes("我的答案正确吗") ||
        pregunta.includes("我的答案对吗") ||
        pregunta.includes("这样写对吗") ||
        pregunta.includes("这样写正确吗");


    /*
    ========================================================
    ITALIANO
    ========================================================
    */

    const italiano =
        pregunta.includes("e corretto") ||
        pregunta.includes("e corretta") ||
        pregunta.includes("e sbagliato") ||
        pregunta.includes("e sbagliata") ||
        pregunta.includes("è corretto") ||
        pregunta.includes("è corretta") ||
        pregunta.includes("è sbagliato") ||
        pregunta.includes("è sbagliata") ||
        pregunta.includes("questa parola e corretta") ||
        pregunta.includes("questa parola e scritta correttamente") ||
        pregunta.includes("questa frase e corretta") ||
        pregunta.includes("la mia risposta e corretta") ||
        pregunta.includes("la mia risposta e sbagliata");


    /*
    ========================================================
    RUSO
    ========================================================
    */

    const ruso =
        pregunta.includes("это правильно") ||
        pregunta.includes("это неправильно") ||
        pregunta.includes("это слово правильно") ||
        pregunta.includes("это слово написано правильно") ||
        pregunta.includes("это слово написано неправильно") ||
        pregunta.includes("это предложение правильно") ||
        pregunta.includes("это предложение написано правильно") ||
        pregunta.includes("мой ответ правильный") ||
        pregunta.includes("мой ответ неправильный") ||
        pregunta.includes("я правильно написал") ||
        pregunta.includes("я правильно написала") ||
        pregunta.includes("я правильно написал это слово") ||
        pregunta.includes("я правильно написала это слово");


    /*
    ========================================================
    ÁRABE
    ========================================================
    */

    const arabe =
        pregunta.includes("هل هذا صحيح") ||
        pregunta.includes("هل هذا خطأ") ||
        pregunta.includes("هل هذه الكلمة صحيحة") ||
        pregunta.includes("هل هذه الكلمة مكتوبة بشكل صحيح") ||
        pregunta.includes("هل هذه الجملة صحيحة") ||
        pregunta.includes("هل هذه الجملة مكتوبة بشكل صحيح") ||
        pregunta.includes("هل إجابتي صحيحة") ||
        pregunta.includes("هل اجابتي صحيحة") ||
        pregunta.includes("هل إجابتي خاطئة") ||
        pregunta.includes("هل اجابتي خاطئة") ||
        pregunta.includes("هل كتبتها بشكل صحيح") ||
        pregunta.includes("هل كتبت هذا بشكل صحيح");


    /*
    ========================================================
    COREANO
    ========================================================
    */

    const coreano =
        pregunta.includes("이게 맞나요") ||
        pregunta.includes("이게 맞습니까") ||
        pregunta.includes("이게 틀렸나요") ||
        pregunta.includes("이 단어가 맞나요") ||
        pregunta.includes("이 단어가 맞습니까") ||
        pregunta.includes("이 단어를 올바르게 썼나요") ||
        pregunta.includes("이 단어가 맞게 쓰였나요") ||
        pregunta.includes("이 문장이 맞나요") ||
        pregunta.includes("이 문장이 맞습니까") ||
        pregunta.includes("이 문장이 올바른가요") ||
        pregunta.includes("내 답이 맞나요") ||
        pregunta.includes("내 답변이 맞나요") ||
        pregunta.includes("제가 올바르게 썼나요") ||
        pregunta.includes("제가 맞게 썼나요");


    /*
    ========================================================
    RESULTADO FINAL
    ========================================================
    */

    const resultado =
        espanol ||
        frances ||
        aleman ||
        ingles ||
        portugues ||
        chino ||
        italiano ||
        ruso ||
        arabe ||
        coreano;


    console.log(
        "===== DETECTOR MULTILINGÜE ====="
    );

    console.log(
        "Pregunta:",
        texto
    );

    console.log(
        "Resultado:",
        resultado
    );


    return resultado;

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
console.log("===== DETECCIÓN EJERCICIO =====");
console.log("Vcorrect existe:", Boolean(contexto.Vcorrect));
console.log("Vincorrect existe:", Boolean(contexto.Vincorrect));
console.log("Contexto:", contexto.contexto);
console.log("Pregunta:", message);


/*
============================================================
VALIDAR VVIDEO SEGÚN LA DIAPOSITIVA ACTUAL
============================================================
*/

if (
    !esDiapositivaDeVideo(contexto)
) {

    contexto.Vvideo = "";

}

/*
============================================================
PREPARAR MEMORIA
============================================================
*/

const historialIA =
    prepararHistorial(
        history,
        message
    );

/*
============================================================
BLOQUEO DE RESPUESTAS DE EJERCICIOS
============================================================
*/

console.log(
    "===== INICIANDO DETECTOR MULTILINGÜE ====="
);

const solicitudBloqueada =
    esSolicitudDeRespuesta(
        message,
        contexto
    ) ||
    detectarSolicitudDeValidacion(
        message
    );

console.log(
    "===== RESULTADO BLOQUEO =====",
    solicitudBloqueada
);


if (
    solicitudBloqueada
) {
    console.log(
        "===== SOLICITUD BLOQUEADA ====="
    );

    console.log(
        "Pregunta:",
        message
    );

    console.log(
        "Es ejercicio:",
        Boolean(
            contexto.Vcorrect ||
            contexto.Vincorrect ||
            contexto.contexto
        )
    );


   const idiomaBloqueo =
    detectarIdiomaPreferido(
        historialIA
    );


/*
============================================================
NEGATIVA DIRECTA
============================================================
*/

const negativas = {

    es:
        "Lo siento, pero no puedo proporcionar la respuesta a esa pregunta.",

    en:
        "I'm sorry, but I can't provide the answer to that question.",

    de:
        "Es tut mir leid, aber ich kann die Antwort auf diese Frage nicht geben.",

    fr:
        "Je suis désolé, mais je ne peux pas fournir la réponse à cette question.",

    pt:
        "Desculpe, mas não posso fornecer a resposta para essa pergunta.",

    it:
        "Mi dispiace, ma non posso fornire la risposta a questa domanda.",

    zh:
        "抱歉，我不能提供这道题的答案。",

    ru:
        "Извините, но я не могу предоставить ответ на этот вопрос.",

    ar:
        "عذرًا، لا أستطيع تقديم إجابة عن هذا السؤال.",

    ko:
        "죄송하지만 이 질문의 답변을 제공할 수 없습니다."

};


return res.json({

    reply:
        negativas[idiomaBloqueo] ||
        negativas.es

});

}

           

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
============================================================
RESPUESTAS DIRECTAS DE UBICACIÓN
============================================================
*/

const idiomaActual =
    detectarIdiomaPreferido(
        historialIA
    );


const mensajesUbicacion = {

    es: {
        modulo: "Estás en el",
        nivel: "Estás en el nivel",
        tema: "El tema actual es",
        seccion: "Estás en la sección",
        diapositiva: "Estás en"
    },

    en: {
        modulo: "You are in",
        nivel: "You are at level",
        tema: "The current topic is",
        seccion: "You are in the section",
        diapositiva: "You are on"
    },

    de: {
        modulo: "Du bist im",
        nivel: "Du bist auf dem Niveau",
        tema: "Das aktuelle Thema ist",
        seccion: "Du bist im Abschnitt",
        diapositiva: "Du bist auf"
    },

    fr: {
        modulo: "Tu es dans le",
        nivel: "Tu es au niveau",
        tema: "Le thème actuel est",
        seccion: "Tu es dans la section",
        diapositiva: "Tu es sur"
    },

    pt: {
        modulo: "Você está no",
        nivel: "Você está no nível",
        tema: "O tema atual é",
        seccion: "Você está na seção",
        diapositiva: "Você está em"
    },

    it: {
        modulo: "Sei nel",
        nivel: "Sei al livello",
        tema: "Il tema attuale è",
        seccion: "Sei nella sezione",
        diapositiva: "Sei a"
    },

    zh: {
        modulo: "你现在位于",
        nivel: "你现在的级别是",
        tema: "当前主题是",
        seccion: "你现在位于",
        diapositiva: "你现在位于"
    },

    ru: {
        modulo: "Вы находитесь в",
        nivel: "Ваш уровень",
        tema: "Текущая тема:",
        seccion: "Вы находитесь в разделе",
        diapositiva: "Вы находитесь на"
    },

    ar: {
        modulo: "أنت في",
        nivel: "مستواك هو",
        tema: "الموضوع الحالي هو",
        seccion: "أنت في القسم",
        diapositiva: "أنت في"
    },

    ko: {
        modulo: "현재",
        nivel: "현재 레벨은",
        tema: "현재 주제는",
        seccion: "현재 섹션은",
        diapositiva: "현재 위치는"
    }

};


const ubicacion =
    mensajesUbicacion[idiomaActual] ||
    mensajesUbicacion.es;


if (
    esPreguntaDeModulo(
        message
    )
) {

    return res.json({

        reply:
            contexto.modulo
                ? `${ubicacion.modulo} ${contexto.modulo}.`
                : (
                    idiomaActual === "en"
                        ? "The current module is not available."
                        : idiomaActual === "de"
                            ? "Das aktuelle Modul ist nicht verfügbar."
                            : idiomaActual === "fr"
                                ? "Le module actuel n'est pas disponible."
                                : idiomaActual === "pt"
                                    ? "O módulo atual não está disponível."
                                    : idiomaActual === "it"
                                        ? "Il modulo attuale non è disponibile."
                                        : idiomaActual === "zh"
                                            ? "当前模块不可用。"
                                            : idiomaActual === "ru"
                                                ? "Текущий модуль недоступен."
                                                : idiomaActual === "ar"
                                                    ? "الوحدة الحالية غير متاحة."
                                                    : idiomaActual === "ko"
                                                        ? "현재 모듈을 사용할 수 없습니다."
                                                        : "No tengo disponible el módulo actual."
                )

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
                ? `${ubicacion.nivel} ${contexto.nivel}.`
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
                ? `${ubicacion.tema} ${contexto.tema}.`
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
                ? `${ubicacion.seccion} ${contexto.seccion}.`
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
                ? `${ubicacion.diapositiva} ${contexto.diapositiva}.`
                : "No tengo disponible la diapositiva actual."

    });

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


        const idiomaError =
    detectarIdiomaPreferido(
        historialIA
    );


const nombresIdioma = {

    es: "español",
    en: "inglés",
    de: "alemán",
    fr: "francés",
    pt: "portugués",
    it: "italiano",
    zh: "chino",
    ru: "ruso",
    ar: "árabe",
    ko: "coreano"

};


const promptErrorEjercicio = `

Eres un tutor de inglés.

IDIOMA OBLIGATORIO DE RESPUESTA:

${nombresIdioma[idiomaError] || "español"}

Debes responder COMPLETAMENTE en ese idioma.

La preferencia de idioma del estudiante tiene prioridad
sobre cualquier otro idioma presente en este prompt,
en Vcorrect, Vincorrect, Vtexto o en la pregunta.

No cambies de idioma porque las frases del ejercicio
estén escritas en inglés u otro idioma.

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



No menciones variables internas,
programación, JSON ni el funcionamiento interno
del sistema.

`;

        const reply =
    await consultarGroq(
        message,
        promptErrorEjercicio,
        historialIA
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

    const idiomaError =
    detectarIdiomaPreferido(
        historialIA
    );


const nombresIdioma = {

    es: "español",
    en: "inglés",
    de: "alemán",
    fr: "francés",
    pt: "portugués",
    it: "italiano",
    zh: "chino",
    ru: "ruso",
    ar: "árabe",
    ko: "coreano"

};


const promptErrorEjercicio = `

Eres un tutor de inglés.

IDIOMA OBLIGATORIO DE RESPUESTA:

${nombresIdioma[idiomaError] || "español"}

Debes realizar TODA la explicación en ese idioma.

La preferencia de idioma del estudiante tiene prioridad
sobre el idioma de las frases de Vcorrect y Vincorrect.

Aunque las frases del ejercicio estén en inglés,
alemán, francés o cualquier otro idioma,
la explicación debe realizarse en:

${nombresIdioma[idiomaError] || "español"}

No cambies de idioma.

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


No menciones variables internas,
programación, JSON ni el funcionamiento
interno del sistema.



const promptErrorEjercicio = `

============================================================
ANÁLISIS DE LA RESPUESTA INCORRECTA
============================================================

IDIOMA OBLIGATORIO DE RESPUESTA:
${nombresIdioma[idiomaError] || "español"}

IMPORTANTE:
Toda la explicación, títulos, etiquetas y contenido generado DEBEN estar escritos exclusivamente en el idioma indicado arriba.

NO escribas ninguna parte de la explicación en español si el idioma indicado arriba es diferente del español.

La frase incorrecta y la frase correcta pueden mantenerse en inglés si ese es el idioma original del ejercicio.

Debes analizar las frases contenidas en Vincorrect y utilizar Vcorrect únicamente como referencia para comprender la regla y la respuesta correcta.

============================================================
FORMATO OBLIGATORIO
============================================================

Frase incorrecta:
[escribe aquí la frase incorrecta original]

¿Qué está mal?
[explica claramente qué parte de la frase es incorrecta]

Forma correcta:
[escribe la frase corregida]

¿Por qué?
[explica la regla gramatical de manera sencilla]

============================================================
REGLAS
============================================================

- Analiza cada frase incorrecta disponible.
- Explica exactamente qué está mal.
- Indica la corrección correspondiente.
- Explica la regla de manera sencilla.
- No inventes información.
- No supongas cuál opción seleccionó el estudiante.
- No pidas al estudiante que vuelva a escribir la respuesta.
- No mezcles idiomas.
- Respeta siempre el idioma obligatorio indicado arriba.
- No agregues información innecesaria.
- Mantén la explicación clara y breve.

Vcorrect:
${contexto.Vcorrect}

Vincorrect:
${contexto.Vincorrect}

`;

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