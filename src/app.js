import { contentBlocks, resources, sports } from './data.js';

const app = document.querySelector('#app');
const nav = document.querySelector('#main-nav');
let filters = { sport: 'Todos', block: 'Todos', academicYear: 'Todos' };

const initialMainTaskLabels = ['Tarea 1', 'Tarea 2', 'Tarea 3'];

let sessionDesignerState = createEmptySessionState();
let observationState = createEmptyObservationState();

const OBSERVATION_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzIbQ_MqEEqgZx6Vfjf8gx1WsjMkl0-6zx4_l8JSDsoeX3z_o9VvfRVLj7BU95Rngzo8A/exec';
const OBSERVATION_DRAFT_KEY = 'deportes-colectivos-cafd-observation-draft';

const navItems = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'repositorio', label: 'Repositorio' },
  { id: 'uso-repositorio', label: 'Uso del repositorio' },
  { id: 'observacion-partido', label: 'Observación de partido' },
  { id: 'diseno-sesion', label: 'Diseño de sesión' },
  { id: 'uso-ia', label: 'Uso responsable de IA' },
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
      date: '',
      sessionNumber: '',
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
    tasks: mainTaskLabels.map((label) => createEmptyTask(label)),
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
              ${fieldControl('Fecha', 'general-date', sessionDesignerState.general.date, 'date')}
              ${fieldControl('Número de sesión', 'general-sessionNumber', sessionDesignerState.general.sessionNumber, 'number')}
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
              <div>
                <h2>3. Secuencia de tareas</h2>
                <p class="section-help">Introduce las tareas de la sesión en el orden en que se desarrollarán. No es necesario clasificarlas en calentamiento, parte principal o vuelta a la calma; cada tarea debe aparecer de forma consecutiva según la lógica de la sesión.</p>
              </div>
              <button class="secondary" type="button" data-add-task>Añadir tarea</button>
            </div>
            <div id="task-editors" class="task-editor-list">
              ${sessionDesignerState.tasks
                .map((task, index) => taskEditor(task, index, 'task', { canDelete: index >= initialMainTaskLabels.length }))
                .join('')}
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
    date: data.get('general-date') || '',
    sessionNumber: data.get('general-sessionNumber') || '',
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
  sessionDesignerState.tasks = sessionDesignerState.tasks.map((task, index) => readTaskFromForm(data, task, index, 'task'));
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
      <h4>Datos generales</h4>
      <dl class="session-meta">
        <div><dt>Fecha</dt><dd>${escapeHtml(filledValue(state.general.date))}</dd></div>
        <div><dt>Número de sesión</dt><dd>${escapeHtml(filledValue(state.general.sessionNumber))}</dd></div>
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
        <h4>Secuencia de tareas</h4>
        <div class="session-task-list">
          ${state.tasks.map((task) => taskPreviewHtml(task)).join('')}
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
    `Fecha: ${filledValue(state.general.date)}`,
    `Número de sesión: ${filledValue(state.general.sessionNumber)}`,
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
    'SECUENCIA DE TAREAS',
  ];

  state.tasks.forEach((task) => addTaskPlainText(lines, task));

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


function wordText(value) {
  return escapeHtml(String(value ?? '').trim());
}

function wordMultiline(value) {
  return wordText(value).replaceAll('\n', '<br />');
}

function compactWordCell(...values) {
  return values
    .map((value) => wordMultiline(value))
    .filter(Boolean)
    .join('<br />');
}

function wordTaskTable(tasks) {
  const hasSketch = tasks.some((task) => String(task.sketch ?? '').trim());
  const sketchHeader = hasSketch ? '<th class="sketch-col">Esquema</th>' : '';
  const sketchCell = hasSketch ? '<td class="sketch-col">${sketch}</td>' : '';

  const rows = tasks
    .map((task, index) => {
      const sketch = wordMultiline(task.sketch);

      return `
        <tr>
          <td class="number-col">${index + 1}</td>
          <td class="task-name-col">${wordText(task.name)}</td>
          <td>${compactWordCell(task.description, task.organization)}</td>
          <td>${wordMultiline(task.rules)}</td>
          <td>${wordMultiline(task.variants)}</td>
          ${hasSketch ? sketchCell.replace('${sketch}', sketch) : ''}
        </tr>
      `;
    })
    .join('');

  return `
    <table class="phase-table">
      <tr>
        <th class="number-col">Nº</th>
        <th class="task-name-col">Tarea</th>
        <th>Descripción / organización</th>
        <th>Reglas / consignas</th>
        <th>Variantes / progresiones</th>
        ${sketchHeader}
      </tr>
      ${rows}
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
    body { color: #243a32; font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; line-height: 1.18; margin: 19px; }
    .header-table, .meta-table, .section-table, .phase-table { border-collapse: collapse; width: 100%; }
    .header-table { border-bottom: 2px solid #1d5f48; margin: 0 0 8px; }
    .header-table td { border: 0; padding: 4px 5px 6px; vertical-align: bottom; }
    .header-title { color: #143d30; font-size: 18px; font-weight: bold; margin: 0; }
    .header-subtitle { color: #47645a; font-size: 10px; margin: 1px 0 0; text-transform: uppercase; }
    .header-data { background: #eef6f2; border-left: 3px solid #8cb7a5; font-size: 9.5px; }
    .header-data strong { color: #143d30; }
    h2 { border-bottom: 1px solid #8cb7a5; color: #143d30; font-size: 13.5px; margin: 10px 0 5px; padding-bottom: 2px; }
    h3 { background: #f3f8f5; color: #1d5f48; font-size: 11.5px; margin: 8px 0 3px; padding: 4px 5px; }
    th, td { border: 1px solid #cfded7; padding: 4px 5px; vertical-align: top; }
    th { background: #e8f1ed; color: #143d30; font-size: 9.5px; text-align: left; }
    .meta-table, .section-table, .phase-table { margin: 0 0 8px; }
    .meta-label { color: #143d30; font-weight: bold; width: 17%; }
    .meta-value { width: 33%; }
    .section-table th { width: 24%; }
    .phase-table th { background: #dfeee7; }
    .number-col { text-align: center; width: 5%; }
    .task-name-col { width: 16%; }
    .sketch-col { width: 15%; }
    .footer-note { color: #5a7167; font-size: 9px; margin-top: 8px; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 42%;">
        <p class="header-title">Ficha de sesión práctica</p>
        <p class="header-subtitle">Deportes Colectivos CAFD</p>
      </td>
      <td class="header-data" style="width: 18%;"><strong>Fecha:</strong> ${wordText(state.general.date)}<br /><strong>Nº sesión:</strong> ${wordText(state.general.sessionNumber)}</td>
      <td class="header-data" style="width: 18%;"><strong>Deporte:</strong> ${wordText(state.general.sport)}</td>
      <td class="header-data" style="width: 22%;"><strong>Título:</strong> ${wordText(state.general.title)}</td>
    </tr>
  </table>

  <h2>1. Datos generales</h2>
  <table class="meta-table">
    <tr>
      <td class="meta-label">Fecha</td><td class="meta-value">${wordText(state.general.date)}</td>
      <td class="meta-label">Nº sesión</td><td class="meta-value">${wordText(state.general.sessionNumber)}</td>
    </tr>
    <tr>
      <td class="meta-label">Deporte</td><td class="meta-value">${wordText(state.general.sport)}</td>
      <td class="meta-label">Curso o grupo</td><td class="meta-value">${wordText(state.general.group)}</td>
    </tr>
    <tr>
      <td class="meta-label">Duración estimada</td><td class="meta-value">${wordText(state.general.duration)}</td>
      <td class="meta-label">N.º alumnos</td><td class="meta-value">${wordText(state.general.students)}</td>
    </tr>
    <tr>
      <td class="meta-label">Espacio disponible</td><td class="meta-value">${wordText(state.general.space)}</td>
      <td class="meta-label">Material necesario</td><td class="meta-value">${wordMultiline(state.general.materials)}</td>
    </tr>
  </table>

  <h2>2. Objetivos y contenidos</h2>
  <table class="section-table">
    <tr><th>Objetivo principal</th><td>${wordMultiline(state.objectives.main)}</td></tr>
    <tr><th>Objetivos específicos</th><td>${wordMultiline(state.objectives.specific)}</td></tr>
    <tr><th>Contenidos técnico-tácticos trabajados</th><td>${wordMultiline(state.objectives.contents)}</td></tr>
  </table>

  <h2>3. Secuencia de tareas</h2>
  ${wordTaskTable(state.tasks)}

  <h2>4. Evaluación y observación</h2>
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

function deleteSessionTask(event) {
  readSessionForm();
  const index = Number(event.currentTarget.dataset.deleteTask);
  if (Number.isNaN(index) || index < initialMainTaskLabels.length) return;
  sessionDesignerState.tasks.splice(index, 1);
  sessionDesignerState.tasks = sessionDesignerState.tasks.map((task, taskIndex) => ({ ...task, label: `Tarea ${taskIndex + 1}` }));
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

  document.querySelector('[data-add-task]')?.addEventListener('click', addSessionTask);
  document.querySelectorAll('[data-delete-task]').forEach((button) => button.addEventListener('click', deleteSessionTask));
  document.querySelector('[data-copy-session]')?.addEventListener('click', copySessionToClipboard);
  document.querySelector('[data-download-word]')?.addEventListener('click', downloadSessionWord);
  document.querySelector('[data-clear-session]')?.addEventListener('click', clearSessionForm);
}


const countOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10 o más'];
const selfAssessmentOptions = ['Sí', 'No', 'No preguntado / No responde'];
const checklistAgents = [
  ['players', 'Jugadores'],
  ['coachingStaff', 'Cuerpo técnico / entrenadores'],
  ['spectators', 'Espectadores / padres'],
];
const aggressionTypes = [
  ['verbal', 'Agresión verbal'],
  ['gestural', 'Agresión gestual'],
  ['physical', 'Agresión física'],
];
const refereeQuestions = [
  ['pressuredByPlayers', '¿Te has sentido presionado por los jugadores?'],
  ['nerves', '¿Has sufrido nervios en algún momento?'],
  ['playerAttitudeConditionedDecisions', '¿Ha condicionado la actitud de los jugadores alguna de tus decisiones?'],
  ['scoreConditionedDecisions', '¿Ha condicionado el resultado provisional alguna de tus decisiones?'],
  ['verbalAggression', '¿Has sufrido algún tipo de agresión verbal?'],
  ['gesturalAggression', '¿Has sufrido algún tipo de agresión gestual?'],
  ['physicalAggression', '¿Has sufrido algún tipo de agresión física?'],
  ['treatedWithRespect', '¿Te han tratado con respeto?'],
  ['feltSafe', '¿Te has sentido seguro?'],
  ['sportsmanship', '¿Se han comportado de forma deportiva?'],
  ['supportedByPlayers', '¿Te has sentido apoyado por los jugadores?'],
];

function createEmptyChecklistAgent() {
  return { verbal: '0', gestural: '0', physical: '0', observations: '' };
}

function createEmptyObservationState() {
  return {
    observers: { student1: '', student2: '', group: '', academicYear: '', email: '' },
    matchContext: {
      sport: 'Voleibol',
      date: '',
      time: '',
      location: '',
      homeTeam: '',
      awayTeam: '',
      gender: '',
      category: '',
      approximateAge: '',
      competitiveLevel: '',
      spectators: '',
      finalScore: '',
      photoLink: '',
    },
    qualitative: {
      matchSummary: '',
      spectatorBehavior: '',
      playerBehavior: '',
      coachingBehavior: '',
      personalReflection: '',
      conclusions: '',
      improvementProposals: '',
    },
    behavioralChecklist: {
      players: createEmptyChecklistAgent(),
      coachingStaff: createEmptyChecklistAgent(),
      spectators: createEmptyChecklistAgent(),
    },
    refereeSelfAssessment: {
      pressuredByPlayers: '',
      nerves: '',
      playerAttitudeConditionedDecisions: '',
      scoreConditionedDecisions: '',
      verbalAggression: '',
      gesturalAggression: '',
      physicalAggression: '',
      treatedWithRespect: '',
      feltSafe: '',
      sportsmanship: '',
      supportedByPlayers: '',
      additionalComments: '',
    },
  };
}

function observationInput(path, label, type = 'text', options = {}) {
  const value = path.split('.').reduce((acc, key) => acc?.[key], observationState) ?? '';
  const help = options.help ? `<small>${options.help}</small>` : '';
  return `
    <label class="form-field observation-field">
      <span>${label}</span>
      <input type="${type}" data-observation-field="${path}" value="${escapeHtml(value)}" ${options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : ''}>
      ${help}
    </label>
  `;
}

function observationSelect(path, label, values, options = {}) {
  const value = path.split('.').reduce((acc, key) => acc?.[key], observationState) ?? '';
  const help = options.help ? `<small>${options.help}</small>` : '';
  return `
    <label class="form-field observation-field">
      <span>${label}</span>
      <select data-observation-field="${path}">
        ${values.map((item) => `<option value="${escapeHtml(item)}" ${item === value ? 'selected' : ''}>${escapeHtml(item || 'Seleccionar')}</option>`).join('')}
      </select>
      ${help}
    </label>
  `;
}

function observationTextarea(path, label, help = '', rows = 5) {
  const value = path.split('.').reduce((acc, key) => acc?.[key], observationState) ?? '';
  return `
    <label class="form-field observation-field observation-textarea">
      <span>${label}</span>
      ${help ? `<small>${help}</small>` : ''}
      <textarea data-observation-field="${path}" rows="${rows}">${escapeHtml(value)}</textarea>
    </label>
  `;
}

function setNestedValue(target, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const parent = keys.reduce((acc, key) => acc[key], target);
  parent[last] = value;
}

function readObservationForm() {
  document.querySelectorAll('[data-observation-field]').forEach((field) => {
    setNestedValue(observationState, field.dataset.observationField, field.value);
  });
}

function observationSection(title, helper, content, open = false) {
  return `
    <details class="form-section observation-section" ${open ? 'open' : ''}>
      <summary>
        <span>${title}</span>
        <small>${helper}</small>
      </summary>
      <div class="observation-section-body">${content}</div>
    </details>
  `;
}

function renderChecklistEditor() {
  return `
    <div class="checklist-help">
      <p><strong>Agresión verbal:</strong> insultos, amenazas, menosprecios o protestas ofensivas hacia el árbitro.</p>
      <p><strong>Agresión gestual:</strong> gestos despectivos, aspavientos, miradas intimidatorias o señales de desaprobación ofensiva.</p>
      <p><strong>Agresión física:</strong> empujones, intentos de agresión, invasión amenazante del espacio arbitral o contacto físico intimidatorio.</p>
    </div>
    <div class="mobile-table-wrap">
      <table class="observation-table checklist-table">
        <thead><tr><th>Agente</th>${aggressionTypes.map(([, label]) => `<th>${label}</th>`).join('')}</tr></thead>
        <tbody>
          ${checklistAgents.map(([agentKey, agentLabel]) => `
            <tr>
              <th scope="row">${agentLabel}</th>
              ${aggressionTypes.map(([typeKey, typeLabel]) => `
                <td data-label="${typeLabel}">
                  <select aria-label="${agentLabel}: ${typeLabel}" data-observation-field="behavioralChecklist.${agentKey}.${typeKey}">
                    ${countOptions.map((option) => `<option value="${option}" ${observationState.behavioralChecklist[agentKey][typeKey] === option ? 'selected' : ''}>${option}</option>`).join('')}
                  </select>
                </td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="form-grid">
      ${observationTextarea('behavioralChecklist.players.observations', 'Observaciones sobre jugadores', '', 3)}
      ${observationTextarea('behavioralChecklist.coachingStaff.observations', 'Observaciones sobre cuerpo técnico / entrenadores', '', 3)}
      ${observationTextarea('behavioralChecklist.spectators.observations', 'Observaciones sobre espectadores / padres', '', 3)}
    </div>
  `;
}

function renderRefereeSelfAssessmentEditor() {
  return `
    <p class="section-help">Estas preguntas deben realizarse al árbitro al finalizar el encuentro, siempre que sea posible y de forma respetuosa.</p>
    <div class="mobile-table-wrap">
      <table class="observation-table self-assessment-table">
        <thead><tr><th>Pregunta</th><th>Respuesta</th></tr></thead>
        <tbody>
          ${refereeQuestions.map(([key, question], index) => `
            <tr>
              <th scope="row">${index + 1}. ${question}</th>
              <td data-label="Respuesta">
                <select aria-label="${question}" data-observation-field="refereeSelfAssessment.${key}">
                  <option value="">Seleccionar</option>
                  ${selfAssessmentOptions.map((option) => `<option value="${option}" ${observationState.refereeSelfAssessment[key] === option ? 'selected' : ''}>${option}</option>`).join('')}
                </select>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${observationTextarea('refereeSelfAssessment.additionalComments', 'Comentarios adicionales del árbitro', '', 3)}
  `;
}

function renderObservationPage() {
  return `
    <section class="page-section observation-page">
      ${pageIntro(
        'Registro de campo · Categorías formativas',
        'Observación de partido en categorías formativas',
        'El módulo de observación de partido permite registrar información durante un encuentro de categoría formativa, prestando especial atención a las agresiones verbales, gestuales o físicas dirigidas hacia la figura arbitral. La herramienta permite guardar un borrador en el navegador, generar un informe de apoyo para el trabajo y enviar al profesor los datos estructurados de la checklist conductual y la autoevaluación del árbitro.',
      )}
      <div class="observation-layout">
        <form id="observation-form" class="session-form observation-form">
          <div class="callout-panel local-storage-warning">
            <h2>Guardado local en este dispositivo</h2>
            <p>El borrador se guarda en el navegador/dispositivo utilizado mediante localStorage. Si rellenas la información en el móvil, deberás descargar o copiar el informe desde ese mismo dispositivo, o utilizar el mismo navegador si quieres recuperar el borrador posteriormente.</p>
          </div>
          ${observationSection('1. Datos del alumnado observador', 'Identificación mínima del registro observacional.', `
            <p class="section-help">El trabajo se realiza preferentemente por parejas. Estos datos permiten identificar el registro observacional.</p>
            <div class="form-grid two-columns">
              ${observationInput('observers.student1', 'Nombre y apellidos del alumno/a 1')}
              ${observationInput('observers.student2', 'Nombre y apellidos del alumno/a 2')}
              ${observationInput('observers.group', 'Grupo de prácticas')}
              ${observationInput('observers.academicYear', 'Curso académico')}
              ${observationInput('observers.email', 'Correo de contacto, opcional', 'email')}
            </div>
          `, true)}
          ${observationSection('2. Contextualización del partido', 'Datos básicos del encuentro observado.', `
            <div class="form-grid two-columns">
              ${observationSelect('matchContext.sport', 'Deporte', ['Voleibol', 'Baloncesto', 'Balonmano', 'Fútbol'])}
              ${observationInput('matchContext.date', 'Fecha del partido', 'date')}
              ${observationInput('matchContext.time', 'Hora del partido', 'time')}
              ${observationInput('matchContext.location', 'Lugar o instalación')}
              ${observationInput('matchContext.homeTeam', 'Equipo local')}
              ${observationInput('matchContext.awayTeam', 'Equipo visitante')}
              ${observationSelect('matchContext.gender', 'Género', ['', 'Masculino', 'Femenino', 'Mixto'])}
              ${observationSelect('matchContext.category', 'Categoría', ['', 'Benjamín', 'Alevín', 'Infantil', 'Cadete', 'Juvenil', 'Otra'])}
              ${observationInput('matchContext.approximateAge', 'Edad aproximada')}
              ${observationInput('matchContext.competitiveLevel', 'Nivel competitivo, si procede')}
              ${observationInput('matchContext.spectators', 'Número aproximado de espectadores', 'number')}
              ${observationInput('matchContext.finalScore', 'Resultado final, si se conoce')}
              ${observationInput('matchContext.photoLink', 'Enlace a foto demostrativa de asistencia al partido', 'url', { help: 'No se suben imágenes a la app. Añade un enlace a Drive, Moodle u otro recurso si procede.' })}
            </div>
          `)}
          ${observationSection('3. Registro cualitativo para el trabajo del alumno', 'Se guarda y aparece en el informe, pero no se envía al profesor.', `
            <div class="form-grid">
              ${observationTextarea('qualitative.matchSummary', 'Resumen cualitativo del partido', 'Describe brevemente el contexto general del encuentro, el clima del partido, el comportamiento global de los participantes y cualquier circunstancia relevante para interpretar la observación.')}
              ${observationTextarea('qualitative.spectatorBehavior', 'Comportamiento de padres/espectadores', 'Analiza tipos de padres o espectadores en la grada, conducta durante el partido, comentarios dirigidos a niños/as, entrenadores o árbitro, ubicación, lenguaje corporal, manifestación emocional e influencia del marcador.')}
              ${observationTextarea('qualitative.playerBehavior', 'Comportamiento de jugadores/as', 'Analiza conductas y comportamientos, expresiones mostradas, influencia del entrenador, influencia de los padres/espectadores y respuesta ante decisiones arbitrales.')}
              ${observationTextarea('qualitative.coachingBehavior', 'Comportamiento del entrenador/cuerpo técnico', 'Analiza gestión de la competición, reparto de minutos o roles, expresiones mostradas, tipos de feedback, relación con el árbitro e influencia de los padres/espectadores.')}
              ${observationTextarea('qualitative.personalReflection', 'Opinión/reflexión personal')}
              ${observationTextarea('qualitative.conclusions', 'Conclusiones principales')}
              ${observationTextarea('qualitative.improvementProposals', 'Propuestas de mejora o intervención educativa')}
            </div>
          `)}
          ${observationSection('4. Checklist conductual de agresiones hacia el árbitro', 'Registro rápido por agente y tipo de conducta.', renderChecklistEditor())}
          ${observationSection('5. Autoevaluación del árbitro', 'Preguntas cerradas al árbitro al finalizar el partido.', renderRefereeSelfAssessmentEditor())}
          <div class="form-actions sticky-actions observation-actions" aria-label="Acciones de observación de partido">
            <div class="observation-action-row">
              <div class="observation-action-group" aria-label="Acciones de trabajo">
                <span class="observation-action-label">Trabajo</span>
                <button type="button" data-save-observation>Guardar borrador</button>
                <button type="button" class="secondary" data-load-observation>Cargar borrador</button>
                <button type="button" class="secondary" data-delete-observation>Borrar borrador</button>
              </div>
              <div class="observation-action-group" aria-label="Acciones de informe">
                <span class="observation-action-label">Informe</span>
                <button type="button" data-copy-observation>Copiar informe</button>
                <button type="button" data-download-observation>Descargar Word</button>
              </div>
            </div>
            <div class="observation-action-row observation-action-row-secondary">
              <div class="observation-submit-group">
                <button type="button" data-submit-observation>Enviar registro observacional al profesor</button>
                <div class="submission-scope-notice" role="note">
                  <strong>Envío limitado:</strong> solo checklist conductual, autoevaluación del árbitro y datos mínimos de identificación y partido.
                </div>
              </div>
              <button type="button" class="secondary observation-clear-button" data-clear-observation>Limpiar formulario</button>
            </div>
          </div>
          <p id="observation-status" class="copy-status" role="status" aria-live="polite"></p>
        </form>
        <aside class="info-panel observation-preview-panel">
          <div class="preview-heading">
            <p class="eyebrow">Vista previa</p>
            <h2>Informe de apoyo</h2>
          </div>
          <div id="observation-preview" class="observation-sheet">${observationReportHtml(observationState, true)}</div>
        </aside>
      </div>
    </section>
  `;
}

function observationReportSections(state) {
  const checklistRows = checklistAgents.flatMap(([agentKey, agentLabel]) =>
    aggressionTypes.map(([typeKey, typeLabel]) => [`${agentLabel} · ${typeLabel}`, state.behavioralChecklist[agentKey][typeKey]]),
  );
  const refereeRows = refereeQuestions.map(([key, question], index) => [`${index + 1}. ${question}`, state.refereeSelfAssessment[key]]);
  return [
    ['Datos del alumnado observador', [
      ['Nombre y apellidos del alumno/a 1', state.observers.student1],
      ['Nombre y apellidos del alumno/a 2', state.observers.student2],
      ['Grupo de prácticas', state.observers.group],
      ['Curso académico', state.observers.academicYear],
      ['Correo de contacto', state.observers.email],
    ]],
    ['Contextualización del partido', [
      ['Deporte', state.matchContext.sport],
      ['Fecha del partido', state.matchContext.date],
      ['Hora del partido', state.matchContext.time],
      ['Lugar o instalación', state.matchContext.location],
      ['Equipo local', state.matchContext.homeTeam],
      ['Equipo visitante', state.matchContext.awayTeam],
      ['Género', state.matchContext.gender],
      ['Categoría', state.matchContext.category],
      ['Edad aproximada', state.matchContext.approximateAge],
      ['Nivel competitivo', state.matchContext.competitiveLevel],
      ['Número aproximado de espectadores', state.matchContext.spectators],
      ['Resultado final', state.matchContext.finalScore],
      ['Enlace a foto demostrativa', state.matchContext.photoLink],
    ]],
    ['Registro cualitativo para el trabajo del alumno', [
      ['Resumen cualitativo del partido', state.qualitative.matchSummary],
      ['Comportamiento de padres/espectadores', state.qualitative.spectatorBehavior],
      ['Comportamiento de jugadores/as', state.qualitative.playerBehavior],
      ['Comportamiento del entrenador/cuerpo técnico', state.qualitative.coachingBehavior],
      ['Opinión/reflexión personal', state.qualitative.personalReflection],
      ['Conclusiones principales', state.qualitative.conclusions],
      ['Propuestas de mejora o intervención educativa', state.qualitative.improvementProposals],
    ]],
    ['Checklist conductual de agresiones hacia el árbitro', [
      ...checklistRows,
      ['Observaciones sobre jugadores', state.behavioralChecklist.players.observations],
      ['Observaciones sobre cuerpo técnico / entrenadores', state.behavioralChecklist.coachingStaff.observations],
      ['Observaciones sobre espectadores / padres', state.behavioralChecklist.spectators.observations],
    ], { alwaysIncludeRows: true }],
    ['Autoevaluación del árbitro', [
      ...refereeRows,
      ['12. Comentarios adicionales del árbitro', state.refereeSelfAssessment.additionalComments],
    ], { alwaysIncludeRows: true }],
  ];
}

function observationReportHtml(state, includeFallback = false) {
  const fallback = includeFallback ? 'Sin completar' : '';
  const sections = observationReportSections(state);
  return `
    <header><span>Deportes Colectivos CAFD</span><h3>Informe de observación de partido</h3></header>
    ${sections.map(([title, rows, options = {}], index) => {
      const visibleRows = includeFallback || options.alwaysIncludeRows ? rows : rows.filter(([, value]) => String(value ?? '').trim());
      if (!visibleRows.length) return '';
      return `<section><h4>${index + 1}. ${title}</h4><dl>${visibleRows.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${nl2br(String(value || fallback))}</dd></div>`).join('')}</dl></section>`;
    }).join('')}
  `;
}

function observationReportText(state) {
  return ['Informe de observación de partido', 'Deportes Colectivos CAFD', '']
    .concat(observationReportSections(state).flatMap(([title, rows, options = {}], index) => {
      const visibleRows = options.alwaysIncludeRows ? rows : rows.filter(([, value]) => String(value ?? '').trim());
      if (!visibleRows.length) return [];
      return [`${index + 1}. ${title}`, ...visibleRows.map(([label, value]) => `${label}: ${value ?? ''}`), ''];
    })).join('\n');
}

function observationWordHtml(state) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Informe de observación de partido</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1f3129; font-size: 11pt; line-height: 1.35; }
    h1 { color: #123326; font-size: 20pt; margin: 0 0 2pt; }
    h2 { color: #123326; border-bottom: 1pt solid #d9e4df; font-size: 13pt; margin: 14pt 0 6pt; padding-bottom: 3pt; }
    .subtitle { color: #47645a; font-weight: bold; margin: 0 0 12pt; text-transform: uppercase; }
    table { border-collapse: collapse; margin-bottom: 8pt; width: 100%; }
    th, td { border: 1pt solid #d9e4df; padding: 5pt; vertical-align: top; }
    th { background: #edf5f1; color: #123326; width: 32%; }
  </style></head><body><h1>Informe de observación de partido</h1><p class="subtitle">Deportes Colectivos CAFD</p>
  ${observationReportSections(state).map(([title, rows, options = {}], index) => {
    const visibleRows = options.alwaysIncludeRows ? rows : rows.filter(([, value]) => String(value ?? '').trim());
    if (!visibleRows.length) return '';
    return `<h2>${index + 1}. ${escapeHtml(title)}</h2><table>${visibleRows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${wordMultiline(String(value ?? ''))}</td></tr>`).join('')}</table>`;
  }).join('')}<p>Documento editable generado desde la herramienta Observación de partido de Deportes Colectivos CAFD.</p></body></html>`;
}

function observationWordFilename(state) {
  const date = slugifyFilePart(state.matchContext.date);
  const teams = slugifyFilePart(`${state.matchContext.homeTeam}-${state.matchContext.awayTeam}`);
  return `informe-observacion-partido-${[date, teams].filter(Boolean).join('-') || 'deportes-colectivos'}.doc`;
}

function observationSubmissionPayload(state) {
  return {
    submittedAt: new Date().toISOString(),
    observers: { ...state.observers },
    matchContext: {
      sport: state.matchContext.sport,
      date: state.matchContext.date,
      time: state.matchContext.time,
      location: state.matchContext.location,
      homeTeam: state.matchContext.homeTeam,
      awayTeam: state.matchContext.awayTeam,
      gender: state.matchContext.gender,
      category: state.matchContext.category,
      approximateAge: state.matchContext.approximateAge,
      competitiveLevel: state.matchContext.competitiveLevel,
      spectators: state.matchContext.spectators,
      finalScore: state.matchContext.finalScore,
    },
    behavioralChecklist: JSON.parse(JSON.stringify(state.behavioralChecklist)),
    refereeSelfAssessment: { ...state.refereeSelfAssessment },
  };
}

function refreshObservationPreview() {
  readObservationForm();
  const preview = document.querySelector('#observation-preview');
  if (preview) preview.innerHTML = observationReportHtml(observationState, true);
}

function setObservationStatus(message) {
  const status = document.querySelector('#observation-status');
  if (status) status.textContent = message;
}

function saveObservationDraft() {
  refreshObservationPreview();
  localStorage.setItem(OBSERVATION_DRAFT_KEY, JSON.stringify(observationState));
  setObservationStatus('Borrador guardado en este navegador.');
}

function loadObservationDraft() {
  const saved = localStorage.getItem(OBSERVATION_DRAFT_KEY);
  if (!saved) {
    setObservationStatus('No hay ningún borrador guardado en este navegador.');
    return;
  }
  observationState = { ...createEmptyObservationState(), ...JSON.parse(saved) };
  rerenderObservationPage();
  setObservationStatus('Borrador cargado correctamente.');
}

function deleteObservationDraft() {
  if (!window.confirm('¿Quieres borrar el borrador guardado en este navegador?')) return;
  localStorage.removeItem(OBSERVATION_DRAFT_KEY);
  setObservationStatus('Borrador eliminado de este navegador.');
}

async function copyObservationReport() {
  refreshObservationPreview();
  const text = observationReportText(observationState);
  try {
    await navigator.clipboard.writeText(text);
    setObservationStatus('Informe copiado al portapapeles.');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.className = 'manual-copy-field';
    textarea.value = text;
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    setObservationStatus('Informe copiado al portapapeles.');
  }
}

function downloadObservationWord() {
  refreshObservationPreview();
  const blob = new Blob(['\ufeff', observationWordHtml(observationState)], { type: 'application/msword;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = observationWordFilename(observationState);
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
  setObservationStatus('Informe en Word descargado.');
}

async function submitObservationRecord() {
  refreshObservationPreview();
  if (!OBSERVATION_ENDPOINT) {
    setObservationStatus('El envío directo todavía no está configurado. Puedes guardar el borrador, copiar el informe o descargarlo en Word para trabajar posteriormente.');
    return;
  }
  try {
    const payload = observationSubmissionPayload(observationState);
    await fetch(OBSERVATION_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload),
    });
    setObservationStatus('Registro observacional enviado correctamente. Se han enviado únicamente los datos de la checklist conductual, la autoevaluación del árbitro y los datos básicos del partido.');
  } catch {
    setObservationStatus('No se ha podido enviar el registro observacional. Revisa la conexión o la configuración del endpoint.');
  }
}

function clearObservationForm() {
  observationState = createEmptyObservationState();
  rerenderObservationPage();
  setObservationStatus('Formulario limpiado. El borrador guardado no se ha borrado.');
}

function rerenderObservationPage() {
  app.innerHTML = renderObservationPage();
  bindInteractions();
  bindObservationInteractions();
}

function bindObservationInteractions() {
  const form = document.querySelector('#observation-form');
  if (!form) return;
  form.addEventListener('input', refreshObservationPreview);
  form.addEventListener('change', refreshObservationPreview);
  document.querySelector('[data-save-observation]')?.addEventListener('click', saveObservationDraft);
  document.querySelector('[data-load-observation]')?.addEventListener('click', loadObservationDraft);
  document.querySelector('[data-delete-observation]')?.addEventListener('click', deleteObservationDraft);
  document.querySelector('[data-copy-observation]')?.addEventListener('click', copyObservationReport);
  document.querySelector('[data-download-observation]')?.addEventListener('click', downloadObservationWord);
  document.querySelector('[data-submit-observation]')?.addEventListener('click', submitObservationRecord);
  document.querySelector('[data-clear-observation]')?.addEventListener('click', clearObservationForm);
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
  } else if (route === 'observacion-partido') {
    app.innerHTML = renderObservationPage();
  } else if (route === 'uso-repositorio') {
    app.innerHTML = renderRepositoryUse();
  } else if (route === 'uso-ia') {
    app.innerHTML = renderResponsibleAi();
  } else if (route === 'incorporacion') {
    app.innerHTML = renderIncorporation();
  } else {
    app.innerHTML = renderHome();
  }

  bindInteractions();
  bindSessionDesignerInteractions();
  bindObservationInteractions();
  app.focus({ preventScroll: true });
}

window.addEventListener('hashchange', render);
render();
