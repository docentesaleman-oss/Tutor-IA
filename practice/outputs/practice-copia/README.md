# Práctica guiada con Vlink

El web object se abre en `/practice/`. Antes de iniciar, Storyline debe enviar la variable `Vlink`:

```javascript
window.recibirDatosStoryline({ Vlink: GetPlayer().GetVar("Vlink") });
```

Para evitar que el mensaje se envíe antes de que cargue el web object, la práctica también emite `PRACTICE_READY`. Si Storyline usa `postMessage`, responda a ese aviso enviando el mismo `Vlink`:

```javascript
window.addEventListener("message", event => {
    if (event.data?.type !== "PRACTICE_READY") return;

    document.querySelector("iframe")
        ?.contentWindow
        .postMessage(
            {
                type: "practice-vlink",
                Vlink: GetPlayer().GetVar("Vlink")
            },
            "*"
        );
});
```

La práctica intenta recuperar el valor directamente cuando ambos documentos comparten origen y vuelve a anunciar que está lista durante el arranque.

El valor de `Vlink` debe ser una URL pública al archivo `.txt`. El texto debe contener al menos `SCRIPT`; se recomiendan también `TITLE`, `VOCABULARY`, `GRAMMAR`, `PRONUNCIATION`, `SUGGESTIONS` y `RULES`.

Formato mínimo:

```text
-----------------------------------------
TITLE
-----------------------------------------
Shopping: Choosing Shoes

-----------------------------------------
SCRIPT
-----------------------------------------
Tutor: Hi! What shoe brand do you like?

-----------------------------------------
VOCABULARY
-----------------------------------------
shoes, comfortable, affordable
```

Para restringir los enlaces a dominios de confianza, agregue `PRACTICE_ALLOWED_HOSTS=contenido.tuplataforma.com` al archivo `.env`. Puede listar varios dominios separados por coma.

La memoria de esta práctica usa claves distintas del tutor principal y se guarda por cada Vlink.
