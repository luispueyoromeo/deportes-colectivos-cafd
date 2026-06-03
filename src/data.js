export const sports = [
  {
    slug: 'voleibol',
    name: 'Voleibol',
    emoji: '🏐',
    summary: 'Saque, recepción, colocación, ataque, bloqueo, sistemas de juego y reglamento específico.',
  },
  {
    slug: 'baloncesto',
    name: 'Baloncesto',
    emoji: '🏀',
    summary: 'Bote, pase, tiro, defensa, ocupación de espacios, cooperación-oposición y normas de juego.',
  },
  {
    slug: 'balonmano',
    name: 'Balonmano',
    emoji: '🤾',
    summary: 'Lanzamiento, pase, ciclo de pasos, defensa, ataque posicional, contraataque y reglamento.',
  },
  {
    slug: 'futbol',
    name: 'Fútbol',
    emoji: '⚽',
    summary: 'Conducción, pase, finalización, principios tácticos, fases del juego y reglas básicas.',
  },
];

export const contentBlocks = ['Fundamentos técnicos', 'Fundamentos tácticos', 'Reglamento'];
export const formats = ['Presentación', 'Vídeo', 'Documento', 'Infografía', 'Carpeta de Google Drive', 'Otro'];

// Recursos editables por el profesor. Para incorporar nuevos materiales:
// 1. Duplica un objeto del listado.
// 2. Cambia id, title, sport, category, authors, academicYear, format y description.
// 3. Sustituye url por el enlace revisado de Google Drive.
//
// Valores recomendados:
// - sport: usa el nombre del deporte, por ejemplo Fútbol, o el slug definido arriba, por ejemplo futbol.
// - category: usa Fundamentos técnicos, Fundamentos tácticos, Reglamento o Repositorio general.
// - academicYear: escribe el curso con formato 2025/2026. El filtro de cursos se genera automáticamente.
// - url: pega aquí el enlace editable de Google Drive.
export const resources = [
  {
    id: 'futbol-2025-2026-repositorio-general',
    title: 'Materiales de aula invertida de fútbol',
    sport: 'Fútbol',
    category: 'Repositorio general',
    authors: 'Alumnado de Deportes Colectivos',
    academicYear: '2025/2026',
    format: 'Carpeta de Google Drive',
    description:
      'Carpeta con materiales elaborados por el alumnado sobre reglamento, fundamentos técnicos y fundamentos tácticos de fútbol durante el curso académico 2025/2026.',
    url: 'https://drive.google.com/drive/folders/ENLACE_EDITABLE',
    isEditableExample: true,
  },
  {
    id: 1,
    title: 'Reglamento básico de balonmano',
    sport: 'balonmano',
    block: 'Reglamento',
    authorship: 'Grupo 1',
    academicYear: '2026/2027',
    format: 'Presentación',
    description:
      'Material introductorio sobre las principales normas del balonmano y su aplicación en el contexto de la asignatura.',
    driveUrl: 'https://drive.google.com/drive/folders/EDITABLE-BALONMANO-REGLAMENTO',
    isEditableExample: true,
  },
  {
    id: 2,
    title: 'Técnica de recepción y pase en voleibol',
    sport: 'voleibol',
    block: 'Fundamentos técnicos',
    authorship: 'Grupo 2',
    academicYear: '2026/2027',
    format: 'Vídeo',
    description:
      'Ejemplo editable con una propuesta de análisis técnico de la recepción de antebrazos y el pase de dedos.',
    driveUrl: 'https://drive.google.com/drive/folders/EDITABLE-VOLEIBOL-TECNICA',
    isEditableExample: true,
  },
  {
    id: 3,
    title: 'Principios de ocupación de espacios en baloncesto',
    sport: 'baloncesto',
    block: 'Fundamentos tácticos',
    authorship: 'Grupo 3',
    academicYear: '2026/2027',
    format: 'Infografía',
    description:
      'Recurso de muestra sobre amplitud, profundidad, líneas de pase y toma de decisiones en situaciones reducidas.',
    driveUrl: 'https://drive.google.com/drive/folders/EDITABLE-BALONCESTO-TACTICA',
    isEditableExample: true,
  },
  {
    id: 4,
    title: 'Reglas esenciales para iniciar una sesión de fútbol',
    sport: 'futbol',
    block: 'Reglamento',
    authorship: 'Grupo 4',
    academicYear: '2026/2027',
    format: 'Documento',
    description:
      'Documento de ejemplo con normas básicas, reinicios de juego y situaciones frecuentes en la práctica docente.',
    driveUrl: 'https://drive.google.com/drive/folders/EDITABLE-FUTBOL-REGLAMENTO',
    isEditableExample: true,
  },
  {
    id: 5,
    title: 'Ataque y defensa en superioridad numérica',
    sport: 'balonmano',
    block: 'Fundamentos tácticos',
    authorship: 'Grupo 5',
    academicYear: '2026/2027',
    format: 'Presentación',
    description:
      'Plantilla editable para explicar decisiones tácticas en fases de transición y situaciones de ventaja ofensiva.',
    driveUrl: 'https://drive.google.com/drive/folders/EDITABLE-BALONMANO-TACTICA',
    isEditableExample: true,
  },
  {
    id: 6,
    title: 'Conducción, pase y apoyo en fútbol',
    sport: 'futbol',
    block: 'Fundamentos técnicos',
    authorship: 'Grupo 6',
    academicYear: '2026/2027',
    format: 'Vídeo',
    description:
      'Ejemplo editable para mostrar consignas técnicas y criterios de observación en tareas de aprendizaje práctico.',
    driveUrl: 'https://drive.google.com/drive/folders/EDITABLE-FUTBOL-TECNICA',
    isEditableExample: true,
  },
];
