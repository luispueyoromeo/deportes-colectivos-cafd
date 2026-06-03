# Deportes Colectivos CAFD

Aplicación web docente para la asignatura **Deportes Colectivos** del Grado en Ciencias de la Actividad Física y del Deporte de la Universidad de Zaragoza.

Esta primera versión es un repositorio navegable de materiales de aula invertida. No incluye login, subida directa de archivos, base de datos ni conexión con Google Drive API: el profesor incorpora manualmente los enlaces en `src/data.js`.

## Estructura

- `index.html`: documento base de la aplicación.
- `src/data.js`: deportes, bloques, formatos y recursos editables.
- `src/app.js`: navegación, filtros y renderizado de páginas.
- `src/styles.css`: diseño responsive y componentes visuales.
- `scripts/build.mjs`: construcción estática en `dist/`, preparada para Vercel.

## Comandos

```bash
npm run dev
npm run build
npm run preview
```

## Actualizar recursos

Para añadir un recurso nuevo, duplica un objeto del array `resources` en `src/data.js`, actualiza sus metadatos y sustituye `driveUrl` por el enlace de Google Drive revisado.
