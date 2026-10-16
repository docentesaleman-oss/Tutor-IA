# Tutor de práctica escrita

El web object se abre en `/practice-written/`. Envía la variable `Vlink` con `window.recibirDatosStoryline({ Vlink: GetPlayer().GetVar("Vlink") })` o incluye `?Vlink=...` en la URL.

Para transferirla con `postMessage`, escucha `PRACTICE_WRITTEN_READY` y responde al iframe con `{ type: "practice-written-vlink", Vlink: GetPlayer().GetVar("Vlink") }`.

Este tutor usa el servicio compartido `/practice/content` y `/practice/chat`, con memoria independiente por cada Vlink. La conversación se realiza escribiendo.
