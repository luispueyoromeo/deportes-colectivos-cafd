import { contentBlocks, formats, resources, sports } from './data.js';

const app = document.querySelector('#app');
const nav = document.querySelector('#main-nav');
let filters = { sport: 'Todos', block: 'Todos', format: 'Todos', academicYear: 'Todos' };

const navItems = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'repositorio', label: 'Repositorio' },
  ...sports.map((sport) => ({ id: sport.slug, label: sport.name })),
  { id: 'incorporacion', label: 'Cómo se incorporan' },
  { id: 'calidad', label: 'Guía de calidad' },
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
          <button class="secondary" data-route="incorporacion">Conocer el procedimiento</button>
        </div>
      </div>
      <div class="stats-card" aria-label="Resumen del repositorio">
        <strong>${resources.length}</strong><span>recursos de ejemplo editables</span>
        <strong>${sports.length}</strong><span>deportes colectivos</span>
        <strong>${contentBlocks.length}</strong><span>bloques de contenido por deporte</span>
      </div>
      <div class="sport-grid" aria-label="Accesos por deporte">
        ${sports
          .map(
            (sport) => `
              <article class="sport-card">
                <span class="sport-emoji" aria-hidden="true">${sport.emoji}</span>
                <h2>${sport.name}</h2>
                <p>${sport.summary}</p>
                <button class="link-button" data-route="${sport.slug}">Entrar en ${sport.name}</button>
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
    const byFormat = filters.format === 'Todos' || resource.format === filters.format;
    const byAcademicYear =
      filters.academicYear === 'Todos' || resource.academicYear === filters.academicYear;
    return bySport && byBlock && byFormat && byAcademicYear;
  });

  return `
    <section class="page-section">
      ${pageIntro(
        'Repositorio general',
        'Consulta todos los materiales disponibles',
        'Filtra los recursos por deporte, bloque de contenido, formato y curso académico. Los ejemplos incluidos son ficticios y editables para facilitar la actualización manual de enlaces a Google Drive.',
      )}
      <div class="filters" aria-label="Filtros del repositorio">
        ${selectFilter('Deporte', 'sport', ['Todos', ...sports.map((sport) => sport.slug)], (value) =>
          value === 'Todos' ? value : sportName(value),
        )}
        ${selectFilter('Bloque', 'block', ['Todos', ...contentBlocks], (value) => value)}
        ${selectFilter('Formato', 'format', ['Todos', ...formats], (value) => value)}
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

function renderSportPage(sport) {
  const sportResources = resources.filter((resource) => resource.sport === sport.slug);
  const filteredSportResources = sportResources.filter(
    (resource) => filters.academicYear === 'Todos' || resource.academicYear === filters.academicYear,
  );

  return `
    <section class="page-section">
      ${pageIntro(
        'Página por deporte',
        `${sport.emoji} ${sport.name}`,
        `${sport.summary} Cada bloque muestra las tarjetas correspondientes a los recursos revisados e incorporados manualmente al repositorio.`,
      )}
      <div class="filters" aria-label="Filtros de ${sport.name}">
        ${selectFilter(
          'Curso académico',
          'academicYear',
          ['Todos', ...academicYearsFrom(sportResources)],
          (value) => value,
        )}
      </div>
      <div class="block-stack">
        ${contentBlocks
          .map((block) => {
            const blockResources = filteredSportResources.filter((resource) => resource.block === block);
            return `
              <section class="content-block">
                <div class="block-heading">
                  <h2>${block}</h2>
                  <span>${blockResources.length} recursos</span>
                </div>
                ${resourceGrid(blockResources, 'Todavía no hay recursos en este apartado.')}
              </section>
            `;
          })
          .join('')}
      </div>
    </section>
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
                <span>${resource.format}</span>
              </div>
              <h3>${resource.title}</h3>
              <p>${resource.description}</p>
              <dl>
                <div><dt>Bloque</dt><dd>${resource.block}</dd></div>
                <div><dt>Autoría</dt><dd>${resource.authorship}</dd></div>
                <div><dt>Curso</dt><dd>${resource.academicYear}</dd></div>
              </dl>
              ${resource.isEditableExample ? '<span class="editable-badge">Ejemplo editable</span>' : ''}
              <a class="drive-link" href="${resource.driveUrl}" target="_blank" rel="noreferrer">Abrir en Google Drive</a>
            </article>
          `,
        )
        .join('')}
    </div>
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

function renderQualityGuide() {
  const criteria = [
    'Claridad en la explicación.',
    'Corrección conceptual.',
    'Relación directa con la asignatura.',
    'Utilidad para el aprendizaje práctico.',
    'Buena organización visual.',
    'Inclusión de ejemplos aplicados.',
    'Uso adecuado de fuentes o referencias.',
    'Originalidad y elaboración propia.',
    'Uso ético y crítico de la inteligencia artificial, si procede.',
  ];

  return `
    <section class="page-section two-column-page">
      ${pageIntro(
        'Orientación para el alumnado',
        'Guía de calidad de los materiales',
        'Estos criterios ayudan a elaborar recursos útiles para el aula invertida, conectados con la práctica y preparados para ser consultados por diferentes promociones del Grado en CAFD.',
      )}
      <div class="quality-list">
        ${criteria
          .map(
            (criterion, index) => `
              <article>
                <span>${String(index + 1).padStart(2, '0')}</span>
                <p>${criterion}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function bindInteractions() {
  document.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => setRoute(button.dataset.route));
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

  const sport = sports.find((item) => item.slug === route);
  if (route === 'repositorio') {
    app.innerHTML = renderRepository();
  } else if (sport) {
    app.innerHTML = renderSportPage(sport);
  } else if (route === 'incorporacion') {
    app.innerHTML = renderIncorporation();
  } else if (route === 'calidad') {
    app.innerHTML = renderQualityGuide();
  } else {
    app.innerHTML = renderHome();
  }

  bindInteractions();
  app.focus({ preventScroll: true });
}

window.addEventListener('hashchange', render);
render();
