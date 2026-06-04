import { contentBlocks, resources, sports } from './data.js';

const app = document.querySelector('#app');
const nav = document.querySelector('#main-nav');
let filters = { sport: 'Todos', block: 'Todos', academicYear: 'Todos' };

const initialMainTaskLabels = ['Tarea 1', 'Tarea 2', 'Tarea 3'];

let sessionDesignerState = createEmptySessionState();

const navItems = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'repositorio', label: 'Repositorio' },
  { id: 'uso-repositorio', label: 'Uso del repositorio' },
  { id: 'guia-trabajo', label: 'Guía del trabajo' },
  { id: 'uso-ia', label: 'Uso responsable de IA' },
  { id: 'diseno-sesion', label: 'Diseño de sesión' },
];

function sportName(slug) {
  return sports.find((sport) => sport.slug === slug)?.name ?? slug;
}

function academicYearsFrom(items) {
  return [...new Set(items.map((resource) => resource.academicYear))].sort().reverse();
}


function createEmptySessionState(mainTaskLabels = initialMainTaskLabels) {
  return {
    general: {
      sport: 'Voleibol',
      title: '',
      group: '',
      duration: '',
      students: '',
      space: '',
      materials: '',
    },
    objectives: {
      main: '',
      specific: '',
      contents: '',
    },
    warmupTasks: [createEmptyTask('Calentamiento 1')],
    tasks: mainTaskLabels.map((label) => createEmptyTask(label)),
    closing: createEmptyTask('Vuelta a la calma o cierre reflexivo'),
    evaluation: {
      finalComment: '',
      improvements: '',
    },
  };
}

function createEmptyTask(label) {
  return {
    label,
    name: '',
    description: '',
    organization: '',
    rules: '',
    variants: '',
    sketch: '',
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function filledValue(value, fallback = 'Pendiente de completar') {
  return value.trim() || fallback;
}

function nl2br(value) {
  return escapeHtml(filledValue(value)).replaceAll('\n', '<br>');
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


function fieldControl(label, name, value, type = 'text', placeholder = '') {
  return `
    <label class="form-field">
      <span>${label}</span>
      <input type="${type}" name="${name}" value="${escapeHtml(value)}" placeholder="${placeholder}" />
    </label>
  `;
}

function textareaControl(label, name, value, placeholder = '') {
  return `
    <label class="form-field">
      <span>${label}</span>
      <textarea name="${name}" rows="4" placeholder="${placeholder}">${escapeHtml(value)}</textarea>
    </label>
  `;
}

function taskEditor(task, index, prefix = 'task', options = {}) {
  const { canDelete = false, deleteLabel = 'Eliminar tarea' } = options;
  return `
    <article class="task-editor">
      <div class="task-editor-heading">
        <div>
          <p class="eyebrow">${escapeHtml(task.label)}</p>
          <h3>${escapeHtml(task.label)}</h3>
        </div>
        ${
          canDelete
            ? `<button class="secondary small-button" type="button" data-delete-${prefix}="${index}">${deleteLabel}</button>`
            : ''
        }
      </div>
      <div class="form-grid two-columns">
        ${fieldControl('Nombre de la tarea', `${prefix}-${index}-name`, task.name)}
        ${fieldControl('Organización del grupo', `${prefix}-${index}-organization`, task.organization)}
      </div>
      ${textareaControl('Descripción breve', `${prefix}-${index}-description`, task.description)}
      ${textareaControl('Reglas o consignas', `${prefix}-${index}-rules`, task.rules)}
      ${textareaControl('Variantes o progresiones', `${prefix}-${index}-variants`, task.variants)}
      ${textareaControl('Esquema o dibujo (si procede)', `${prefix}-${index}-sketch`, task.sketch, 'Espacio reservado para describir o incorporar posteriormente un esquema.')}
    </article>
  `;
}

function renderSessionDesigner() {
  return `
    <section class="page-section session-page">
      ${pageIntro(
        'Herramienta práctica',
        'Diseño de sesión práctica',
        'Esta herramienta permite estructurar una sesión práctica de deportes colectivos a partir de los contenidos trabajados en la asignatura. Su finalidad es ayudar al alumnado a organizar objetivos, tareas, materiales, variantes y criterios de observación de forma coherente.',
      )}
      <div class="session-layout">
        <form id="session-form" class="session-form" aria-label="Formulario de diseño de sesión práctica">
          <section class="form-section">
            <h2>1. Datos generales</h2>
            <div class="form-grid two-columns">
              <label class="form-field">
                <span>Deporte</span>
                <select name="general-sport">
                  ${['Voleibol', 'Baloncesto', 'Balonmano', 'Fútbol']
                    .map(
                      (sport) =>
                        `<option value="${sport}" ${sessionDesignerState.general.sport === sport ? 'selected' : ''}>${sport}</option>`,
                    )
                    .join('')}
                </select>
              </label>
              ${fieldControl('Título de la sesión', 'general-title', sessionDesignerState.general.title)}
              ${fieldControl('Curso o grupo', 'general-group', sessionDesignerState.general.group)}
              ${fieldControl('Duración estimada', 'general-duration', sessionDesignerState.general.duration)}
              ${fieldControl('Número aproximado de alumnos', 'general-students', sessionDesignerState.general.students, 'number')}
              ${fieldControl('Espacio disponible', 'general-space', sessionDesignerState.general.space)}
            </div>
            ${textareaControl('Material necesario', 'general-materials', sessionDesignerState.general.materials)}
          </section>

          <section class="form-section">
            <h2>2. Objetivos y contenidos</h2>
            ${textareaControl('Objetivo principal de la sesión', 'objectives-main', sessionDesignerState.objectives.main)}
            ${textareaControl('Objetivos específicos', 'objectives-specific', sessionDesignerState.objectives.specific)}
            ${textareaControl('Contenidos técnico-tácticos trabajados', 'objectives-contents', sessionDesignerState.objectives.contents)}
          </section>

          <section class="form-section">
            <div class="form-section-heading">
              <h2>3. Estructura de la sesión</h2>
            </div>
            <div class="session-phase-heading">
              <div>
                <p class="eyebrow">Calentamiento</p>
                <h3>Tareas de calentamiento</h3>
              </div>
              <button class="secondary" type="button" data-add-warmup>Añadir calentamiento</button>
            </div>
            <div id="warmup-editors" class="task-editor-list">
              ${sessionDesignerState.warmupTasks
                .map((task, index) =>
                  taskEditor(task, index, 'warmup', {
                    canDelete: sessionDesignerState.warmupTasks.length > 1,
                    deleteLabel: 'Eliminar calentamiento',
                  }),
                )
                .join('')}
            </div>
            <div class="session-phase-heading">
              <div>
                <p class="eyebrow">Parte principal</p>
                <h3>Tareas principales</h3>
              </div>
              <button class="secondary" type="button" data-add-task>Añadir tarea principal</button>
            </div>
            <div id="task-editors" class="task-editor-list">
              ${sessionDesignerState.tasks.map((task, index) => taskEditor(task, index)).join('')}
            </div>
            <div class="session-phase-heading single-heading">
              <div>
                <p class="eyebrow">Cierre</p>
                <h3>Vuelta a la calma o cierre reflexivo</h3>
              </div>
            </div>
            <div id="closing-editor" class="task-editor-list">
              ${taskEditor(sessionDesignerState.closing, 0, 'closing')}
            </div>
          </section>

          <section class="form-section">
            <h2>4. Evaluación y observación</h2>
            ${textareaControl('Comentario final de la sesión', 'evaluation-finalComment', sessionDesignerState.evaluation.finalComment)}
            ${textareaControl('Propuestas de mejora (fundamentadas)', 'evaluation-improvements', sessionDesignerState.evaluation.improvements)}
          </section>

          <div class="form-actions">
            <button type="button" data-copy-session>Copiar sesión</button>
            <button class="secondary" type="button" data-download-word>Descargar ficha en Word</button>
            <button class="secondary" type="button" data-clear-session>Limpiar formulario</button>
          </div>
          <p id="copy-status" class="copy-status" role="status" aria-live="polite"></p>
        </form>

        <aside class="session-preview-panel" aria-label="Vista previa organizada de la sesión">
          <div class="preview-heading">
            <p class="eyebrow">Vista previa</p>
            <h2>Ficha de sesión</h2>
          </div>
          <div id="session-preview" class="session-preview">
            ${sessionPreviewHtml(sessionDesignerState)}
          </div>
        </aside>
      </div>
    </section>
  `;
}

function readSessionForm() {
  const form = document.querySelector('#session-form');
  if (!form) return;
  const data = new FormData(form);
  sessionDesignerState.general = {
    sport: data.get('general-sport') || 'Voleibol',
    title: data.get('general-title') || '',
    group: data.get('general-group') || '',
    duration: data.get('general-duration') || '',
    students: data.get('general-students') || '',
    space: data.get('general-space') || '',
    materials: data.get('general-materials') || '',
  };
  sessionDesignerState.objectives = {
    main: data.get('objectives-main') || '',
    specific: data.get('objectives-specific') || '',
    contents: data.get('objectives-contents') || '',
  };
  sessionDesignerState.warmupTasks = sessionDesignerState.warmupTasks.map((task, index) => readTaskFromForm(data, task, index, 'warmup'));
  sessionDesignerState.tasks = sessionDesignerState.tasks.map((task, index) => readTaskFromForm(data, task, index, 'task'));
  sessionDesignerState.closing = readTaskFromForm(data, sessionDesignerState.closing, 0, 'closing');
  sessionDesignerState.evaluation = {
    finalComment: data.get('evaluation-finalComment') || '',
    improvements: data.get('evaluation-improvements') || '',
  };
}


function readTaskFromForm(data, task, index, prefix) {
  return {
    label: task.label,
    name: data.get(`${prefix}-${index}-name`) || '',
    description: data.get(`${prefix}-${index}-description`) || '',
    organization: data.get(`${prefix}-${index}-organization`) || '',
    rules: data.get(`${prefix}-${index}-rules`) || '',
    variants: data.get(`${prefix}-${index}-variants`) || '',
    sketch: data.get(`${prefix}-${index}-sketch`) || '',
  };
}

function refreshSessionPreview() {
  readSessionForm();
  const preview = document.querySelector('#session-preview');
  if (preview) {
    preview.innerHTML = sessionPreviewHtml(sessionDesignerState);
  }
}

function sessionPreviewHtml(state) {
  return `
    <article class="session-sheet">
      <header>
        <span>${escapeHtml(state.general.sport)}</span>
        <h3>${escapeHtml(filledValue(state.general.title, 'Título de la sesión'))}</h3>
      </header>
      <dl class="session-meta">
        <div><dt>Curso o grupo</dt><dd>${escapeHtml(filledValue(state.general.group))}</dd></div>
        <div><dt>Duración</dt><dd>${escapeHtml(filledValue(state.general.duration))}</dd></div>
        <div><dt>Alumnado</dt><dd>${escapeHtml(filledValue(state.general.students))}</dd></div>
        <div><dt>Espacio</dt><dd>${escapeHtml(filledValue(state.general.space))}</dd></div>
      </dl>
      <section>
        <h4>Material necesario</h4>
        <p>${nl2br(state.general.materials)}</p>
      </section>
      <section>
        <h4>Objetivos y contenidos</h4>
        <p><strong>Objetivo principal:</strong> ${nl2br(state.objectives.main)}</p>
        <p><strong>Objetivos específicos:</strong> ${nl2br(state.objectives.specific)}</p>
        <p><strong>Contenidos técnico-tácticos:</strong> ${nl2br(state.objectives.contents)}</p>
      </section>
      <section>
        <h4>Estructura de la sesión</h4>
        <div class="session-phase-preview">
          <h5>Calentamiento</h5>
          <div class="session-task-list">
            ${state.warmupTasks.map((task) => taskPreviewHtml(task)).join('')}
          </div>
        </div>
        <div class="session-phase-preview">
          <h5>Parte principal</h5>
          <div class="session-task-list">
            ${state.tasks.map((task) => taskPreviewHtml(task)).join('')}
          </div>
        </div>
        <div class="session-phase-preview">
          <h5>Vuelta a la calma o cierre reflexivo</h5>
          <div class="session-task-list">
            ${taskPreviewHtml(state.closing)}
          </div>
        </div>
      </section>
      <section>
        <h4>Evaluación y observación</h4>
        <p><strong>Comentario final:</strong> ${nl2br(state.evaluation.finalComment)}</p>
        <p><strong>Propuestas de mejora:</strong> ${nl2br(state.evaluation.improvements)}</p>
      </section>
    </article>
  `;
}


function taskPreviewHtml(task) {
  return `
    <article class="session-task">
      <span>${escapeHtml(task.label)}</span>
      <h5>${escapeHtml(filledValue(task.name, 'Nombre pendiente'))}</h5>
      <p><strong>Descripción:</strong> ${nl2br(task.description)}</p>
      <p><strong>Organización:</strong> ${nl2br(task.organization)}</p>
      <p><strong>Reglas o consignas:</strong> ${nl2br(task.rules)}</p>
      <p><strong>Variantes o progresiones:</strong> ${nl2br(task.variants)}</p>
      <p><strong>Esquema o dibujo:</strong> ${nl2br(task.sketch)}</p>
    </article>
  `;
}

function sessionPlainText(state) {
  const lines = [
    'DISEÑO DE SESIÓN PRÁCTICA',
    '',
    'DATOS GENERALES',
    `Deporte: ${filledValue(state.general.sport)}`,
    `Título de la sesión: ${filledValue(state.general.title)}`,
    `Curso o grupo: ${filledValue(state.general.group)}`,
    `Duración estimada: ${filledValue(state.general.duration)}`,
    `Número aproximado de alumnos: ${filledValue(state.general.students)}`,
    `Espacio disponible: ${filledValue(state.general.space)}`,
    `Material necesario: ${filledValue(state.general.materials)}`,
    '',
    'OBJETIVOS Y CONTENIDOS',
    `Objetivo principal: ${filledValue(state.objectives.main)}`,
    `Objetivos específicos: ${filledValue(state.objectives.specific)}`,
    `Contenidos técnico-tácticos trabajados: ${filledValue(state.objectives.contents)}`,
    '',
    'ESTRUCTURA DE LA SESIÓN',
  ];

  lines.push('', 'CALENTAMIENTO');
  state.warmupTasks.forEach((task) => addTaskPlainText(lines, task));

  lines.push('', 'PARTE PRINCIPAL');
  state.tasks.forEach((task) => addTaskPlainText(lines, task));

  lines.push('', 'VUELTA A LA CALMA O CIERRE REFLEXIVO');
  addTaskPlainText(lines, state.closing);

  lines.push(
    '',
    'EVALUACIÓN Y OBSERVACIÓN',
    `Comentario final de la sesión: ${filledValue(state.evaluation.finalComment)}`,
    `Propuestas de mejora (fundamentadas): ${filledValue(state.evaluation.improvements)}`,
  );

  return lines.join('\n');
}


function addTaskPlainText(lines, task) {
  lines.push(
    '',
    task.label.toUpperCase(),
    `Nombre de la tarea: ${filledValue(task.name)}`,
    `Descripción breve: ${filledValue(task.description)}`,
    `Organización del grupo: ${filledValue(task.organization)}`,
    `Reglas o consignas: ${filledValue(task.rules)}`,
    `Variantes o progresiones: ${filledValue(task.variants)}`,
    `Esquema o dibujo: ${filledValue(task.sketch)}`,
  );
}

async function copySessionToClipboard() {
  refreshSessionPreview();
  const status = document.querySelector('#copy-status');
  const text = sessionPlainText(sessionDesignerState);

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.writeText(text);
    status.textContent = 'Sesión copiada al portapapeles.';
  } catch {
    const manualCopy = document.createElement('textarea');
    manualCopy.value = text;
    manualCopy.setAttribute('readonly', '');
    manualCopy.className = 'manual-copy-field';
    document.body.append(manualCopy);
    manualCopy.select();

    const copied = document.execCommand('copy');
    manualCopy.remove();
    status.textContent = copied
      ? 'Sesión copiada al portapapeles.'
      : 'No se ha podido copiar automáticamente. Selecciona el texto de la vista previa y cópialo manualmente.';
  }
}


function wordText(value, fallback = 'Pendiente de completar') {
  return escapeHtml(filledValue(value, fallback));
}

function wordMultiline(value, fallback = 'Pendiente de completar') {
  return escapeHtml(filledValue(value, fallback)).replaceAll('\n', '<br />');
}

function wordTaskBlock(task) {
  return `
    <table class="task-table">
      <tr>
        <th colspan="2">${escapeHtml(task.label)} · ${wordText(task.name, 'Nombre pendiente')}</th>
      </tr>
      <tr>
        <td class="field-label">Descripción breve</td>
        <td>${wordMultiline(task.description)}</td>
      </tr>
      <tr>
        <td class="field-label">Organización del grupo</td>
        <td>${wordMultiline(task.organization)}</td>
      </tr>
      <tr>
        <td class="field-label">Reglas o consignas</td>
        <td>${wordMultiline(task.rules)}</td>
      </tr>
      <tr>
        <td class="field-label">Variantes o progresiones</td>
        <td>${wordMultiline(task.variants)}</td>
      </tr>
      <tr>
        <td class="field-label">Esquema o dibujo</td>
        <td>${wordMultiline(task.sketch, 'Espacio reservado para incorporar posteriormente un esquema o dibujo.')}</td>
      </tr>
    </table>
  `;
}

function sessionWordHtml(state) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Ficha de sesión práctica</title>
  <style>
    body { color: #253a32; font-family: Arial, Helvetica, sans-serif; line-height: 1.45; margin: 28px; }
    .cover { background: #143d30; color: #ffffff; padding: 24px 28px; }
    .cover h1 { font-size: 30px; letter-spacing: .2px; margin: 0 0 6px; }
    .cover p { font-size: 15px; margin: 0; }
    .meta-table, .task-table, .section-table { border-collapse: collapse; margin: 16px 0 22px; width: 100%; }
    .meta-table th { background: #e8f1ed; color: #143d30; font-size: 12px; text-align: left; text-transform: uppercase; }
    .meta-table th, .meta-table td, .section-table th, .section-table td, .task-table th, .task-table td { border: 1px solid #d5e2dc; padding: 9px 10px; vertical-align: top; }
    h2 { border-bottom: 2px solid #1d5f48; color: #143d30; font-size: 19px; margin: 24px 0 10px; padding-bottom: 5px; }
    h3 { background: #f3f8f5; color: #1d5f48; font-size: 16px; margin: 16px 0 8px; padding: 8px 10px; }
    .section-table th { background: #e8f1ed; color: #143d30; text-align: left; width: 28%; }
    .task-table th { background: #1d5f48; color: #ffffff; font-size: 14px; text-align: left; }
    .task-table .field-label { background: #f5faf7; color: #143d30; font-weight: bold; width: 26%; }
    .footer-note { color: #5a7167; font-size: 11px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="cover">
    <h1>Ficha de sesión práctica</h1>
    <p>Deportes Colectivos CAFD</p>
  </div>

  <table class="meta-table">
    <tr>
      <th>Deporte</th><th>Título de la sesión</th><th>Curso o grupo</th>
    </tr>
    <tr>
      <td>${wordText(state.general.sport)}</td><td>${wordText(state.general.title, 'Título de la sesión')}</td><td>${wordText(state.general.group)}</td>
    </tr>
    <tr>
      <th>Duración estimada</th><th>N.º aproximado de alumnos</th><th>Espacio disponible</th>
    </tr>
    <tr>
      <td>${wordText(state.general.duration)}</td><td>${wordText(state.general.students)}</td><td>${wordText(state.general.space)}</td>
    </tr>
    <tr>
      <th colspan="3">Material necesario</th>
    </tr>
    <tr>
      <td colspan="3">${wordMultiline(state.general.materials)}</td>
    </tr>
  </table>

  <h2>1. Objetivos y contenidos</h2>
  <table class="section-table">
    <tr><th>Objetivo principal</th><td>${wordMultiline(state.objectives.main)}</td></tr>
    <tr><th>Objetivos específicos</th><td>${wordMultiline(state.objectives.specific)}</td></tr>
    <tr><th>Contenidos técnico-tácticos trabajados</th><td>${wordMultiline(state.objectives.contents)}</td></tr>
  </table>

  <h2>2. Estructura de la sesión</h2>
  <h3>Calentamiento</h3>
  ${state.warmupTasks.map((task) => wordTaskBlock(task)).join('')}
  <h3>Parte principal</h3>
  ${state.tasks.map((task) => wordTaskBlock(task)).join('')}
  <h3>Vuelta a la calma o cierre reflexivo</h3>
  ${wordTaskBlock(state.closing)}

  <h2>3. Evaluación y observación</h2>
  <table class="section-table">
    <tr><th>Comentario final de la sesión</th><td>${wordMultiline(state.evaluation.finalComment)}</td></tr>
    <tr><th>Propuestas de mejora fundamentadas</th><td>${wordMultiline(state.evaluation.improvements)}</td></tr>
  </table>
  <p class="footer-note">Documento editable generado desde la herramienta Diseño de sesión de Deportes Colectivos CAFD.</p>
</body>
</html>`;
}

function slugifyFilePart(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sessionWordFilename(state) {
  const sport = slugifyFilePart(state.general.sport);
  const title = slugifyFilePart(state.general.title);
  if (!title) return 'ficha-sesion-deportes-colectivos.doc';
  return `ficha-sesion-${[sport, title].filter(Boolean).join('-')}.doc`;
}

function downloadSessionWord() {
  refreshSessionPreview();
  const status = document.querySelector('#copy-status');
  const html = sessionWordHtml(sessionDesignerState);
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = sessionWordFilename(sessionDesignerState);
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
  if (status) status.textContent = 'Ficha de sesión en Word descargada.';
}

function rerenderSessionDesigner() {
  app.innerHTML = renderSessionDesigner();
  bindInteractions();
  bindSessionDesignerInteractions();
}

function renumberWarmupTasks() {
  sessionDesignerState.warmupTasks = sessionDesignerState.warmupTasks.map((task, index) => ({
    ...task,
    label: `Calentamiento ${index + 1}`,
  }));
}

function addWarmupTask() {
  readSessionForm();
  sessionDesignerState.warmupTasks.push(createEmptyTask(`Calentamiento ${sessionDesignerState.warmupTasks.length + 1}`));
  rerenderSessionDesigner();
}

function deleteWarmupTask(event) {
  readSessionForm();
  const index = Number(event.currentTarget.dataset.deleteWarmup);
  if (Number.isNaN(index) || sessionDesignerState.warmupTasks.length <= 1) return;
  sessionDesignerState.warmupTasks.splice(index, 1);
  renumberWarmupTasks();
  rerenderSessionDesigner();
}

function addSessionTask() {
  readSessionForm();
  const taskNumber = sessionDesignerState.tasks.filter((task) => task.label.startsWith('Tarea')).length + 1;
  sessionDesignerState.tasks.push(createEmptyTask(`Tarea ${taskNumber}`));
  rerenderSessionDesigner();
}

function clearSessionForm() {
  sessionDesignerState = createEmptySessionState();
  rerenderSessionDesigner();
}

function bindSessionDesignerInteractions() {
  const form = document.querySelector('#session-form');
  if (!form) return;

  form.addEventListener('input', refreshSessionPreview);
  form.addEventListener('change', refreshSessionPreview);

  document.querySelector('[data-add-warmup]')?.addEventListener('click', addWarmupTask);
  document.querySelector('[data-add-task]')?.addEventListener('click', addSessionTask);
  document.querySelectorAll('[data-delete-warmup]').forEach((button) => button.addEventListener('click', deleteWarmupTask));
  document.querySelector('[data-copy-session]')?.addEventListener('click', copySessionToClipboard);
  document.querySelector('[data-download-word]')?.addEventListener('click', downloadSessionWord);
  document.querySelector('[data-clear-session]')?.addEventListener('click', clearSessionForm);
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
  } else if (route === 'diseno-sesion') {
    app.innerHTML = renderSessionDesigner();
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
  bindSessionDesignerInteractions();
  app.focus({ preventScroll: true });
}

window.addEventListener('hashchange', render);
render();
