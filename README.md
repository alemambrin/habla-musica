# Hablá música

Herramienta para practicar lenguaje musical como un idioma. Funciona en el navegador del celular, la tablet o la compu, y sin conexión una vez abierta.

Hecha por Ale Mambrin para Lenguaje Musical, Orquesta del Bicentenario de Choele Choel.

## Qué tiene
- **Ritmo:** 10 mundos, del pulso a los compases compuestos. Se aprende escuchando, diciendo, tocando, leyendo y conversando, con el sistema de sílabas propio (voy, pa-ro, co-rro, ra-pi-di-to, tre-si-llo).
- **Notas y teoría:** lectura en clave de sol y de fa, alteraciones, escalas, armaduras, intervalos, acordes y símbolos del pentagrama.
- Examen en cada mundo para saltear lo que ya se sabe (se aprueba con 80 %).
- Repaso espaciado, racha semanal y avance guardado en el dispositivo.

## Cómo publicarla
Es un sitio estático: no necesita build ni dependencias.

**Vercel:** importar el repositorio (o arrastrar esta carpeta) con *Framework Preset: Other*. Dejar vacíos el comando de build y el directorio de salida.

**GitHub Pages:** en *Settings → Pages* elegir la rama principal y la carpeta raíz.

## Archivos
- `index.html`: toda la aplicación (código y estilos incluidos).
- ``: tipografías propias (Bricolage Grotesque, Noto Music), con licencia libre SIL OFL.
- ``, `manifest.webmanifest`, `sw.js`: ícono, instalación en el celular y modo sin conexión.
- `vercel.json`: encabezados de caché.

## Avance de los estudiantes
Se guarda en cada dispositivo. Para pasarlo a otro: Opciones → *Copiar mi código*, y en el otro dispositivo *Cargar el código*.

## Cambios
Si se modifica `index.html`, subir el número de `V` en `sw.js` (por ejemplo `pulso-v3`) para que los dispositivos tomen la versión nueva.
