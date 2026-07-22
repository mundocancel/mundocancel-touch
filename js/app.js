/**
 * mundocancel Touch - Aplicación principal
 * Arquitectura: Pantallas modulares con eventos
 * Estado: Simulación local (mock) hasta integrar API
 */

// ============================================
// 1. ESTADO GLOBAL
// ============================================
const APP = {
  // Usuario actual (null = no autenticado)
  user: null,
  // Proyectos cargados
  projects: [],
  // Proyecto seleccionado (para vista detalle)
  currentProject: null,
  // Configuración de API (cambiar cuando backend esté listo)
  api: {
    baseURL: 'http://localhost:3000/api',
    token: localStorage.getItem('token') || null
  }
};

// ============================================
// 2. UTILIDADES
// ============================================

/**
 * Muestra una pantalla y oculta las demás
 * @param {string} screenId - ID del elemento a mostrar
 */
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
  const screen = document.getElementById(screenId);
  if (screen) screen.style.display = 'block';
}

/**
 * Formatea moneda (MXN)
 */
function formatCurrency(amount) {
  return '$' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Valida email
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// 3. AUTENTICACIÓN (MOCK + PREPARADO PARA API)
// ============================================

/**
 * Intenta iniciar sesión
 * - Modo mock: usuario hardcodeado
 * - Modo real: POST a /api/auth/login
 */
async function loginUser(email, password) {
  // MOCK (eliminar cuando API esté lista)
  if (email === 'demo@mundocancel.com' && password === '123456') {
    const mockUser = { id: '1', full_name: 'Usuario Demo', email, role: 'admin' };
    APP.user = mockUser;
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    showScreen('homeScreen');
    loadProjects(); // Cargar proyectos mock
    return true;
  }

  // REAL (descomentar cuando backend esté listo)
  /*
  try {
    const res = await fetch(`${APP.api.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Credenciales incorrectas');
    const data = await res.json();
    APP.user = data.user;
    APP.api.token = data.token;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showScreen('homeScreen');
    loadProjects();
    return true;
  } catch (error) {
    alert('Error: ' + error.message);
    return false;
  }
  */
}

/**
 * Cierra sesión
 */
function logout() {
  APP.user = null;
  APP.api.token = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showScreen('loginScreen');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
}

// ============================================
// 4. PROYECTOS (MOCK + API)
// ============================================

// Datos mock para desarrollo
const MOCK_PROJECTS = [
  { id: '1', title: 'Oficina Centro', customer: 'Carlos Pérez', status: 'active', amount: 12500, progress: 70 },
  { id: '2', title: 'Casa Bosque', customer: 'Laura Gómez', status: 'pending', amount: 8300, progress: 30 },
  { id: '3', title: 'Local Comercial', customer: 'Ferretería El Toro', status: 'completed', amount: 22000, progress: 100 }
];

const MOCK_ACTIVITY = [
  { user: 'Ana', action: 'creó el proyecto', project: 'Oficina Centro', time: 'hace 2h' },
  { user: 'Luis', action: 'actualizó estado a', project: 'Casa Bosque', time: 'hace 4h' },
  { user: 'Carlos', action: 'subió una imagen a', project: 'Local Comercial', time: 'hace 1d' }
];

/**
 * Carga la lista de proyectos (mock o real)
 */
async function loadProjects() {
  // MOCK
  APP.projects = MOCK_PROJECTS;
  renderProjectList(APP.projects);
  renderActivityFeed(MOCK_ACTIVITY);
  updateStats(APP.projects);

  // REAL (descomentar)
  /*
  try {
    const res = await fetch(`${APP.api.baseURL}/projects`, {
      headers: { 'Authorization': `Bearer ${APP.api.token}` }
    });
    const data = await res.json();
    APP.projects = data;
    renderProjectList(data);
    renderActivityFeed(data.activity || []);
    updateStats(data);
  } catch (error) {
    console.error('Error cargando proyectos:', error);
  }
  */
}

/**
 * Renderiza las tarjetas de proyectos en el grid
 */
function renderProjectList(projects) {
  const container = document.getElementById('projectGrid');
  if (!container) return;

  if (projects.length === 0) {
    container.innerHTML = `<p class="empty-msg">No hay proyectos aún. Crea uno nuevo.</p>`;
    return;
  }

  container.innerHTML = projects.map(p => `
    <div class="project-card" data-id="${p.id}">
      <h3>${p.title}</h3>
      <p class="customer">${p.customer || 'Cliente'}</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${p.progress || 0}%"></div>
      </div>
      <p class="amount">${formatCurrency(p.amount || 0)}</p>
      <span class="status ${p.status}">${p.status === 'active' ? 'Activo' : p.status === 'pending' ? 'Pendiente' : 'Completado'}</span>
    </div>
  `).join('');

  // Evento para abrir detalle
  container.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const project = APP.projects.find(p => p.id === id);
      if (project) openProjectDetail(project);
    });
  });
}

/**
 * Actualiza estadísticas del dashboard
 */
function updateStats(projects) {
  const total = projects.length;
  const active = projects.filter(p => p.status === 'active').length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const totalAmount = projects.reduce((sum, p) => sum + (p.amount || 0), 0);

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statAmount').textContent = formatCurrency(totalAmount);
}

/**
 * Renderiza el feed de actividad
 */
function renderActivityFeed(activities) {
  const container = document.getElementById('activityFeed');
  if (!container) return;

  if (activities.length === 0) {
    container.innerHTML = `<p class="empty-msg">Sin actividad reciente.</p>`;
    return;
  }

  container.innerHTML = activities.map(a => `
    <div class="activity-item">
      <strong>${a.user}</strong> ${a.action} <em>${a.project}</em>
      <span class="time">${a.time}</span>
    </div>
  `).join('');
}

// ============================================
// 5. DETALLE DE PROYECTO
// ============================================

/**
 * Abre la pantalla de detalle de un proyecto
 */
function openProjectDetail(project) {
  APP.currentProject = project;
  document.getElementById('detailTitle').textContent = project.title;
  document.getElementById('detailCustomer').textContent = project.customer || 'Cliente no especificado';
  document.getElementById('detailAmount').textContent = formatCurrency(project.amount || 0);
  document.getElementById('detailStatus').textContent = project.status || 'Sin estado';
  document.getElementById('detailProgress').textContent = project.progress + '%';
  // Aquí puedes cargar imágenes, ítems, etc.
  showScreen('projectScreen');
}

/**
 * Cierra el detalle y vuelve al home
 */
function closeProjectDetail() {
  APP.currentProject = null;
  showScreen('homeScreen');
}

// ============================================
// 6. ACCIONES PRINCIPALES (BOTONES)
// ============================================

// --- Login ---
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) {
    alert('Ingresa email y contraseña');
    return;
  }
  await loginUser(email, password);
});

// --- Logout ---
document.getElementById('logoutBtn')?.addEventListener('click', logout);

// --- Cerrar detalle ---
document.getElementById('closeDetailBtn')?.addEventListener('click', closeProjectDetail);

// --- Botón Nuevo Proyecto (ejemplo) ---
document.getElementById('newProjectBtn')?.addEventListener('click', () => {
  alert('Función: Crear nuevo proyecto (conexión a API pendiente)');
});

// --- Optimizar (ejemplo) ---
document.getElementById('optimizeBtn')?.addEventListener('click', async () => {
  if (!APP.currentProject) return;
  alert(`Simulando optimización para "${APP.currentProject.title}"...`);
  // Aquí llamarías a POST /api/projects/${id}/optimize/linear
  // y mostrarías el resultado en un modal o en la misma pantalla
});

// ============================================
// 7. INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar si hay sesión guardada
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  if (token && userData) {
    try {
      APP.user = JSON.parse(userData);
      APP.api.token = token;
      showScreen('homeScreen');
      loadProjects();
    } catch {
      logout();
    }
  } else {
    showScreen('loginScreen');
  }
});