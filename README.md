# Deportes Colectivos CAFD

Aplicación web docente para la asignatura **Deportes Colectivos** del Grado en Ciencias de la Actividad Física y del Deporte de la Universidad de Zaragoza.

El repositorio funciona como una biblioteca navegable de carpetas de Google Drive organizadas por deporte, bloque de contenido y curso académico. No incluye login, subida directa de archivos, base de datos ni conexión con Google Drive API: el profesor incorpora manualmente los enlaces en `src/data.js`.

## Estructura

- `index.html`: documento base de la aplicación.
- `src/data.js`: deportes, bloques de contenido y matriz de carpetas Drive por curso académico.
- `src/app.js`: navegación, filtros por deporte/bloque/curso y renderizado de páginas.
- `src/styles.css`: diseño responsive y componentes visuales.
- `scripts/build.mjs`: construcción estática en `dist/`, preparada para Vercel.

## Comandos

```bash
npm run dev
npm run build
npm run preview
```

## Actualizar carpetas Drive

Cada entrada del array `resources` representa una carpeta recopilatoria de Google Drive. Para publicar enlaces reales, localiza el recurso por su `id` en `src/data.js` y sustituye `ENLACE_EDITABLE` por el identificador de la carpeta correspondiente.
