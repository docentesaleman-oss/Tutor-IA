function limpiarFormato(text) {

    let texto = String(text);


    // ========================================================
    // ELIMINAR ENCABEZADOS MARKDOWN
    // # Texto
    // ## Texto
    // ### Texto
    // ========================================================

    texto = texto.replace(
        /^\s*#{1,6}\s*/gm,
        ""
    );


    // ========================================================
    // ELIMINAR NEGRILLA
    // **texto** → texto
    // ========================================================

    texto = texto.replace(
        /\*\*(.*?)\*\*/gs,
        "$1"
    );


    // ========================================================
    // ELIMINAR CURSIVA
    // *texto* → texto
    // ========================================================

    texto = texto.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "$1"
    );


    // ========================================================
    // ELIMINAR GUIONES BAJOS DE FORMATO
    // __texto__ → texto
    // _texto_ → texto
    // ========================================================

    texto = texto.replace(
        /__(.*?)__/gs,
        "$1"
    );

    texto = texto.replace(
        /(?<!_)_([^_\n]+)_(?!_)/g,
        "$1"
    );


    // ========================================================
    // ELIMINAR CÓDIGO MARKDOWN
    // `texto` → texto
    // ========================================================

    texto = texto.replace(
        /`([^`]+)`/g,
        "$1"
    );


    // ========================================================
    // ELIMINAR BLOQUES DE CÓDIGO
    // ```texto```
    // ========================================================

    texto = texto.replace(
        /```[\s\S]*?```/g,
        function(bloque) {

            return bloque
                .replace(/^```[a-zA-Z0-9_-]*\s*/i, "")
                .replace(/```\s*$/i, "");

        }
    );


    // ========================================================
    // ELIMINAR CITAS MARKDOWN
    // > texto → texto
    // ========================================================

    texto = texto.replace(
        /^\s*>\s?/gm,
        ""
    );


    // ========================================================
    // LIMPIAR TABLAS MARKDOWN
    //
    // | A | B | C |
    // |---|---|---|
    // | 1 | 2 | 3 |
    //
    // Se conservan los contenidos y se eliminan los |
    // ========================================================

    texto = texto.replace(
        /^\s*\|.*\|\s*$/gm,
        function(linea) {

            return linea
                .replace(/^\s*\|/, "")
                .replace(/\|\s*$/, "")
                .replace(/\|/g, " ");

        }
    );


    // ========================================================
    // LIMPIAR TABLAS SIN | AL FINAL
    //
    // A | B | C
    // ========================================================

    texto = texto.replace(
        /^(.+\|.+)$/gm,
        function(linea) {

            return linea.replace(/\|/g, " ");

        }
    );


    // ========================================================
    // ELIMINAR SEPARADORES DE TABLAS
    //
    // |-----|-----|
    // :----:|:----:
    // -----|-----
    // ========================================================

    texto = texto.replace(
        /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/gm,
        ""
    );


    // ========================================================
    // ELIMINAR LÍNEAS DE SOLO GUIONES
    // ========================================================

    texto = texto.replace(
        /^\s*-{3,}\s*$/gm,
        ""
    );


    // ========================================================
    // LIMPIAR LISTAS MARKDOWN
    //
    // No eliminamos el contenido.
    // Solo quitamos el marcador.
    //
    // - texto → texto
    // * texto → texto
    // + texto → texto
    // ========================================================

    texto = texto.replace(
        /^\s*[-+*]\s+/gm,
        ""
    );


    // ========================================================
    // LIMPIAR LISTAS NUMERADAS
    //
    // 1. Texto → 1. Texto
    //
    // Se conserva el número porque es información útil.
    // ========================================================

    texto = texto.replace(
        /^(\s*)(\d+)\.\s+/gm,
        "$1$2. "
    );


    // ========================================================
    // ELIMINAR ENLACES MARKDOWN
    //
    // [texto](url) → texto
    // ========================================================

    texto = texto.replace(
        /\[([^\]]+)\]\([^)]+\)/g,
        "$1"
    );


    // ========================================================
    // ELIMINAR REFERENCIAS DE IMAGEN MARKDOWN
    //
    // ![texto](url) → texto
    // ========================================================

    texto = texto.replace(
        /!\[([^\]]*)\]\([^)]+\)/g,
        "$1"
    );


    // ========================================================
    // LIMPIAR ESPACIOS ANTES DE SALTOS DE LÍNEA
    // ========================================================

    texto = texto.replace(
        /[ \t]+\n/g,
        "\n"
    );


    // ========================================================
    // LIMPIAR ESPACIOS EXCESIVOS
    // ========================================================

    texto = texto.replace(
        /[ \t]+/g,
        " "
    );


    // ========================================================
    // LIMPIAR LÍNEAS VACÍAS EXCESIVAS
    // ========================================================

    texto = texto.replace(
        /\n{3,}/g,
        "\n\n"
    );


    return texto.trim();

}


function addMessage(text,type){

    const div=document.createElement("div");

    div.className="message "+type;

    div.textContent=limpiarFormato(text);

    document
        .getElementById("messages")
        .appendChild(div);

    div.scrollIntoView();

}