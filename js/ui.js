function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function convertirMarkdown(text) {

    let html = escapeHTML(text);


    // ========================================================
    // NEGRITA
    // **texto** → texto
    // ========================================================

    html = html.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );


    // ========================================================
    // CURSIVA
    // *texto* → texto
    // ========================================================

    html = html.replace(
        /(^|[^\*])\*([^\*\n]+)\*(?!\*)/g,
        "$1<em>$2</em>"
    );


    // ========================================================
    // LISTAS
    // - texto
    // • texto
    // ========================================================

    html = html.replace(
        /(^|\n)[-•]\s+(.+?)(?=\n|$)/g,
        "$1<li>$2</li>"
    );


    // ========================================================
    // AGRUPAR ELEMENTOS DE LISTA
    // ========================================================

    html = html.replace(
        /(<li>.*?<\/li>)(?:\s*<li>.*?<\/li>)*/gs,
        function(lista) {

            return "<ul>" + lista + "</ul>";

        }
    );


    // ========================================================
    // SALTOS DE LÍNEA
    // ========================================================

    html = html.replace(
        /\n/g,
        "<br>"
    );


    return html;

}


function addMessage(text,type){

    const div=document.createElement("div");

    div.className="message "+type;

    div.innerHTML=convertirMarkdown(text);

    document
        .getElementById("messages")
        .appendChild(div);

    div.scrollIntoView();

}