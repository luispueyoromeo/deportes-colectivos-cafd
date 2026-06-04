import { contentBlocks, resources, sports } from './data.js';

const app = document.querySelector('#app');
const nav = document.querySelector('#main-nav');
let filters = { sport: 'Todos', block: 'Todos', academicYear: 'Todos' };

const navItems = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'repositorio', label: 'Repositorio' },
  { id: 'uso-repositorio', label: 'Uso del repositorio' },
  { id: 'guia-trabajo', label: 'Guía del trabajo' },
  { id: 'uso-ia', label: 'Uso responsable de IA' },
];

function sportName(slug) {
  return sports.find((sport) => sport.slug === slug)?.name ?? slug;
}

function academicYearsFrom(items) {
  return [...new Set(items.map((resource) => resource.academicYear))].sort().reverse();
}

function setRoute(route) {
  window.location.hash = route;
}

function currentRoute() {
  return window.location.hash.replace('#', '') || 'inicio';
}

function updateNav(route) {
  nav.innerHTML = navItems
    .map(
      (item) => `
        <a href="#${item.id}" class="${route === item.id ? 'active' : ''}">${item.label}</a>
      `,
    )
    .join('');
}

function pageIntro(eyebrow, title, text) {
  return `
    <div class="page-intro">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p>${text}</p>
    </div>
  `;
}

function renderHome() {
  return `
    <section class="hero page-section">
      <div class="hero-content">
        <p class="eyebrow">Repositorio docente · Aula invertida</p>
        <h1>Materiales de Deportes Colectivos para aprender, revisar y reutilizar.</h1>
        <p class="hero-text">
          Deportes Colectivos CAFD es un espacio docente destinado a organizar y compartir los materiales de aula
          invertida elaborados por el alumnado de la asignatura Deportes Colectivos del Grado en Ciencias de la
          Actividad Física y del Deporte de la Universidad de Zaragoza. El repositorio permite consultar recursos sobre
          reglamento, fundamentos técnicos y fundamentos tácticos de los deportes colectivos trabajados en la asignatura.
        </p>
        <div class="hero-actions">
          <button data-route="repositorio">Ver repositorio completo</button>
          <button class="secondary" data-route="uso-repositorio">Cómo usar los filtros</button>
        </div>
      </div>
      <div class="stats-card" aria-label="Resumen del repositorio">
        <strong>${resources.length}</strong><span>carpetas de Google Drive</span>
        <strong>${sports.length}</strong><span>deportes colectivos</span>
        <strong>${contentBlocks.length}</strong><span>bloques de contenido por deporte</span>
      </div>
      <div class="sport-grid" aria-label="Consulta por deporte desde el repositorio">
        ${sports
          .map(
            (sport) => `
              <article class="sport-card">
                <span class="sport-emoji" aria-hidden="true">${sport.emoji}</span>
                <h2>${sport.name}</h2>
                <p>${sport.summary}</p>
                <button class="link-button" data-route="repositorio" data-sport-filter="${sport.slug}">Ver en el repositorio</button>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderRepository() {
  const filteredResources = resources.filter((resource) => {
    const bySport = filters.sport === 'Todos' || resource.sport === filters.sport;
    const byBlock = filters.block === 'Todos' || resource.block === filters.block;
    const byAcademicYear =
      filters.academicYear === 'Todos' || resource.academicYear === filters.academicYear;
    return bySport && byBlock && byAcademicYear;
  });

  return `
    <section class="page-section">
      ${pageIntro(
        'Repositorio general',
        'Consulta todos los materiales disponibles',
        'Filtra las carpetas recopilatorias por deporte, bloque de contenido y curso académico. Cada tarjeta enlaza a una carpeta de Google Drive preparada para reunir los materiales de aula invertida del alumnado.',
      )}
      <div class="filters" aria-label="Filtros del repositorio">
        ${selectFilter('Deporte', 'sport', ['Todos', ...sports.map((sport) => sport.slug)], (value) =>
          value === 'Todos' ? value : sportName(value),
        )}
        ${selectFilter('Bloque', 'block', ['Todos', ...contentBlocks], (value) => value)}
        ${selectFilter('Curso académico', 'academicYear', ['Todos', ...academicYearsFrom(resources)], (value) => value)}
      </div>
      ${resourceGrid(filteredResources, 'No hay recursos con los filtros seleccionados.')}
    </section>
  `;
}

function selectFilter(label, key, options, display) {
  return `
    <label>
      ${label}
      <select data-filter="${key}">
        ${options
          .map(
            (option) => `
              <option value="${option}" ${filters[key] === option ? 'selected' : ''}>${display(option)}</option>
            `,
          )
          .join('')}
      </select>
    </label>
  `;
}

function resourceGrid(items, emptyText) {
  if (items.length === 0) {
    return `<p class="empty-state">${emptyText}</p>`;
  }

  return `
    <div class="resource-grid">
      ${items
        .map(
          (resource) => `
            <article class="resource-card">
              <div class="card-topline">
                <span>${sportName(resource.sport)}</span>
              </div>
              <h3>${resource.title}</h3>
              <p>${resource.description}</p>
              <dl>
                <div><dt>Bloque</dt><dd>${resource.block}</dd></div>
                <div><dt>Curso</dt><dd>${resource.academicYear}</dd></div>
              </dl>
              <a class="drive-link" href="${resource.driveUrl}" target="_blank" rel="noopener noreferrer">Abrir carpeta en Google Drive</a>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}


function cardList(title, items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `
    <article class="info-panel">
      <h2>${title}</h2>
      <${tag}>
        ${items.map((item) => `<li>${item}</li>`).join('')}
      </${tag}>
    </article>
  `;
}

function renderRepositoryUse() {
  const usageCards = [
    {
      title: 'Qué es',
      text:
        'El repositorio de Deportes Colectivos CAFD es un espacio complementario a Moodle destinado a centralizar los materiales de aula invertida elaborados y revisados en el marco de la asignatura.',
    },
    {
      title: 'Para qué sirve',
      text:
        'Su finalidad es ofrecer una consulta más visual, ordenada e interactiva de los recursos vinculados al aprendizaje previo, facilitando su reutilización y la organización progresiva del material docente.',
    },
    {
      title: 'Cómo se organiza',
      text:
        'Los materiales están organizados por deporte, bloque de contenido y curso académico. Cada tarjeta enlaza a carpetas de Google Drive revisadas y ordenadas por el profesorado.',
    },
    {
      title: 'Relación con Moodle',
      text:
        'No sustituye a Moodle como plataforma oficial de la asignatura. Moodle sigue siendo el espacio institucional de referencia para la información, entregas y comunicaciones oficiales.',
    },
    {
      title: 'Cómo debe usarlo el alumnado',
      text:
        'Antes de cada bloque práctico, el alumnado podrá consultar los materiales indicados por el profesorado para llegar a clase con una base conceptual previa que facilite la participación activa.',
    },
  ];

  return `
    <section class="page-section two-column-page">
      ${pageIntro(
        'Uso docente del repositorio',
        'Uso del repositorio',
        'El repositorio de Deportes Colectivos CAFD es un espacio complementario a Moodle destinado a centralizar los materiales de aula invertida elaborados y revisados en el marco de la asignatura. No sustituye a Moodle como plataforma oficial, sino que actúa como una herramienta de consulta más visual, ordenada e interactiva para acceder a los recursos vinculados al aprendizaje previo.',
      )}
      <div class="highlight-panel">
        <p>
          Los materiales se organizan por deporte, bloque de contenido y curso académico. Cada tarjeta del repositorio
          enlaza a una carpeta de Google Drive donde se recopilan recursos relacionados con reglamento, fundamentos
          técnicos o fundamentos tácticos.
        </p>
        <p>
          Antes de cada bloque práctico, el alumnado podrá consultar los materiales indicados por el profesorado con el
          objetivo de llegar a la sesión con una base conceptual previa que facilite la comprensión de las tareas y la
          aplicación de los contenidos en situaciones reales de práctica.
        </p>
      </div>
      <div class="info-card-grid usage-grid">
        ${usageCards
          .map(
            (card) => `
              <article class="info-card">
                <h2>${card.title}</h2>
                <p>${card.text}</p>
              </article>
            `,
          )
          .join('')}
      </div>
      <div class="callout-panel">
        <h2>Continuidad entre cursos</h2>
        <p>
          La aplicación pretende facilitar la consulta, la reutilización y la organización progresiva del material docente
          generado en la asignatura, de modo que los materiales puedan ser utilizados por la clase actual y por futuros
          cursos académicos.
        </p>
      </div>
    </section>
  `;
}

function renderWorkGuide() {
  const formats = [
    'Vídeo explicativo o demostrativo',
    'Presentación grabada',
    'Recurso interactivo',
    'Infografía',
    'Podcast o entrevista',
    'Juego o cuestionario interactivo',
    'Videotutorial',
  ];
  const structure = [
    'Contextualización del trabajo realizado',
    'Descripción del contenido o fundamento',
    'Finalidad del contenido',
    'Tipos o variantes, si las hay',
    'Ejecución técnica o aplicación táctica',
    'Errores comunes o dificultades habituales',
    'Tareas de aprendizaje y/o tareas correctivas',
    'Referencias bibliográficas',
    'Integrantes del grupo',
  ];
  const recommendations = [
    'Buscar equilibrio entre rigor académico y creatividad.',
    'Utilizar ejemplos visuales, esquemas o clips reales.',
    'Relacionar el contenido con situaciones prácticas de enseñanza-aprendizaje.',
    'Evitar explicaciones excesivamente superficiales.',
    'Cuidar la claridad del lenguaje.',
    'Revisar la calidad de la información antes de entregar.',
    'Citar las fuentes utilizadas.',
    'Recordar que el objetivo final es aprender enseñando.',
  ];

  return `
    <section class="page-section two-column-page">
      ${pageIntro(
        'Apoyo rápido para el trabajo grupal',
        'Guía para elaborar los materiales de aula invertida',
        'Esta guía resume los elementos principales que debe tener el trabajo grupal de aula invertida. Su finalidad es orientar la elaboración de materiales rigurosos, creativos y útiles para comprender, enseñar y ejemplificar los fundamentos del deporte asignado.',
      )}
      <div class="highlight-panel">
        <h2>Objetivo del trabajo</h2>
        <p>
          El alumnado debe desarrollar, explicar y presentar de forma creativa, original y didáctica los contenidos
          asignados, vinculados al reglamento, los fundamentos técnicos o los fundamentos tácticos del deporte
          correspondiente.
        </p>
      </div>
      <div class="block-badges" aria-label="Bloques de contenido del trabajo">
        ${contentBlocks.map((block) => `<span>${block}</span>`).join('')}
      </div>
      <div class="panel-grid">
        ${cardList('Producto final', [
          'Debe permitir comprender, enseñar y ejemplificar el contenido elegido mediante recursos visuales, interactivos o audiovisuales.',
          `Formatos posibles: ${formats.join(', ')}.`,
        ])}
        ${cardList('Relación con el repositorio', [
          'Los materiales revisados podrán incorporarse posteriormente al repositorio de la app.',
          'Su clasificación se realizará por deporte, bloque de contenido y curso académico.',
        ])}
      </div>
      <div class="guide-section">
        <h2>Estructura mínima recomendada</h2>
        <div class="quality-list numbered-list">
          ${structure
            .map(
              (item, index) => `
                <article>
                  <span>${String(index + 1).padStart(2, '0')}</span>
                  <p>${item}</p>
                </article>
              `,
            )
            .join('')}
        </div>
      </div>
      <div class="guide-section">
        <h2>Recomendaciones de calidad</h2>
        <div class="info-card-grid">
          ${recommendations
            .map(
              (recommendation) => `
                <article class="info-card compact-card">
                  <p>${recommendation}</p>
                </article>
              `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderResponsibleAi() {
  const suitableUses = [
    'Organizar ideas iniciales.',
    'Mejorar la estructura de una presentación.',
    'Revisar claridad, coherencia y redacción.',
    'Proponer ejemplos didácticos que después deben ser revisados.',
    'Generar preguntas de autoevaluación.',
    'Ayudar a transformar contenidos complejos en explicaciones más comprensibles.',
    'Sugerir formas visuales o interactivas de presentar un contenido.',
  ];
  const unsuitableUses = [
    'Entregar contenido generado automáticamente sin revisión crítica.',
    'Copiar respuestas de IA como si fueran elaboración propia.',
    'Inventar referencias bibliográficas.',
    'Incluir información no contrastada.',
    'Sustituir la consulta de apuntes, bibliografía o materiales docentes.',
    'Utilizar IA para evitar el trabajo grupal o la comprensión del contenido.',
    'Generar imágenes, vídeos o textos que vulneren derechos de autor o incluyan personas sin permiso.',
  ];

  return `
    <section class="page-section two-column-page">
      ${pageIntro(
        'Criterios formativos y éticos',
        'Uso responsable de IA',
        'La inteligencia artificial puede utilizarse como apoyo al aprendizaje, la organización de ideas, la mejora de la redacción o la generación de ejemplos, pero no debe sustituir el trabajo propio del alumnado ni la revisión crítica de la información.',
      )}
      <div class="ai-grid">
        <article class="info-panel positive-panel">
          <h2>Usos adecuados</h2>
          <ul>${suitableUses.map((item) => `<li>${item}</li>`).join('')}</ul>
        </article>
        <article class="info-panel caution-panel">
          <h2>Usos no adecuados</h2>
          <ul>${unsuitableUses.map((item) => `<li>${item}</li>`).join('')}</ul>
        </article>
      </div>
      <div class="declaration-panel">
        <h2>Declaración de uso de IA</h2>
        <p>
          “En caso de haber utilizado herramientas de inteligencia artificial de forma relevante, el grupo deberá indicarlo
          brevemente, especificando para qué se ha usado: organización de ideas, revisión lingüística, generación de
          ejemplos, apoyo visual u otras funciones.”
        </p>
      </div>
      <div class="callout-panel">
        <h2>Responsabilidad del alumnado</h2>
        <ul>
          <li>El alumnado es responsable de la calidad, veracidad y adecuación del material entregado.</li>
          <li>Todo contenido generado o apoyado por IA debe ser revisado, corregido y adaptado al contexto de la asignatura.</li>
          <li>El uso de IA debe contribuir al aprendizaje, no sustituirlo.</li>
        </ul>
      </div>
    </section>
  `;
}

function renderIncorporation() {
  const steps = [
    'Los alumnos crean sus materiales de aula invertida.',
    'Los alumnos comparten el material con el profesor.',
    'El profesor revisa el material.',
    'El profesor lo sube o guarda en Google Drive.',
    'El profesor incorpora manualmente el recurso a la aplicación web mediante un enlace.',
    'El alumnado puede consultar los materiales desde la aplicación.',
  ];
  const rules = [
    'El material debe estar relacionado con uno de los deportes trabajados.',
    'Debe clasificarse como reglamento, fundamentos técnicos o fundamentos tácticos.',
    'El contenido debe ser claro, riguroso y adecuado al contexto universitario.',
    'No deben incluirse imágenes, vídeos o datos personales sin autorización.',
    'El uso de herramientas de inteligencia artificial debe declararse cuando haya sido relevante en la elaboración del material.',
  ];

  return `
    <section class="page-section two-column-page">
      ${pageIntro(
        'Procedimiento de trabajo',
        'Cómo se incorporan los materiales',
        'Los materiales de aula invertida son elaborados por el alumnado de la asignatura y compartidos con el profesor responsable. Tras su revisión, el profesor incorpora los recursos al repositorio mediante enlaces a Google Drive. Esta organización permite que los materiales puedan ser consultados por la clase actual y reutilizados como apoyo docente en futuros cursos académicos.',
      )}
      <div class="panel-grid">
        ${infoPanel('Flujo de incorporación', steps, true)}
        ${infoPanel('Normas básicas', rules)}
      </div>
    </section>
  `;
}

function infoPanel(title, items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `
    <article class="info-panel">
      <h2>${title}</h2>
      <${tag}>
        ${items.map((item) => `<li>${item}</li>`).join('')}
      </${tag}>
    </article>
  `;
}

function bindInteractions() {
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.sportFilter) {
        filters = { ...filters, sport: button.dataset.sportFilter };
      }

      if (currentRoute() === button.dataset.route) {
        render();
      } else {
        setRoute(button.dataset.route);
      }
    });
  });

  document.querySelectorAll('[data-filter]').forEach((select) => {
    select.addEventListener('change', (event) => {
      filters = { ...filters, [event.target.dataset.filter]: event.target.value };
      render();
    });
  });
}

function render() {
  const route = currentRoute();
  updateNav(route);

  if (route === 'repositorio') {
    app.innerHTML = renderRepository();
  } else if (route === 'uso-repositorio') {
    app.innerHTML = renderRepositoryUse();
  } else if (route === 'guia-trabajo') {
    app.innerHTML = renderWorkGuide();
  } else if (route === 'uso-ia') {
    app.innerHTML = renderResponsibleAi();
  } else if (route === 'incorporacion') {
    app.innerHTML = renderIncorporation();
  } else {
    app.innerHTML = renderHome();
  }

  bindInteractions();
  app.focus({ preventScroll: true });
}

window.addEventListener('hashchange', render);
render();
