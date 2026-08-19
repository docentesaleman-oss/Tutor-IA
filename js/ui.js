function limpiarFormato(text) {

    let texto = String(text);


    // ========================================================
    // ELIMINAR ENCABEZADOS MARKDOWN
    // ### Texto
    // ## Texto
    // # Texto
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
    // LIMPIAR TABLAS MARKDOWN
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
    // ELIMINAR LÍNEAS SEPARADORAS DE TABLAS
    // |-----|-----|
    // ========================================================

    texto = texto.replace(
        /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/gm,
        ""
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