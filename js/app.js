/* =============================================
   mundocancel Touch · App Core
   Arquitectura: Modelo-Vista-Controlador
   Inspirado en SPECT DRIVE v7
   ============================================= */

// ==================== STATE MANAGER ====================
const AppState = {
    screen: 'home',
    budgetStep: 1,
    budgetType: 'Ventana',
    cutType: null,
    linearPieces: [],
    panelPieces: [],

    // Historial (TimeStack)
    history: [],
    historyIndex: -1,

    // Persistencia
    save() {
        localStorage.setItem('mundocancel_state', JSON.stringify({
            screen: this.screen,
            budgetStep: this.budgetStep,
            budgetType: this.budgetType,
            cutType: this.cutType,
        }));
    },

    load() {
        try {
            const saved = localStorage.getItem('mundocancel_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.screen = data.screen || 'home';
                this.budgetStep = data.budgetStep || 1;
                this.budgetType = data.budgetType || 'Ventana';
                this.cutType = data.cutType || null;
            }
        } catch(e) {}
    },

    pushHistory() {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(this.screen);
        this.historyIndex = this.history.length - 1;
    },

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.screen = this.history[this.historyIndex];
            return true;
        }
        return false;
    },
};

// ==================== DOM REFERENCES ====================
const DOM = {
    screens: {
        home: document.getElementById('homeScreen'),
        projects: document.getElementById('projectsScreen'),
        budget: document.getElementById('budgetScreen'),
        cutter: document.getElementById('cutterScreen'),
        glass: document.getElementById('glassScreen'),
    },
    budgetSteps: {
        1: document.getElementById('budgetStep1'),
        2: document.getElementById('budgetStep2'),
        3: document.getElementById('budgetStep3'),
    },
    stepBars: document.querySelectorAll('#budgetScreen .step-bar'),
    typeGrid: document.getElementById('typeGrid'),
    cutLinear: document.getElementById('cutLinear'),
    cutPanel: document.getElementById('cutPanel'),
    linearList: document.getElementById('linearList'),
    panelList: document.getElementById('panelList'),
    projectList: document.getElementById('projectList'),
    recentActivity: document.getElementById('recentActivity'),
    toast: document.getElementById('toast'),
    navItems: document.querySelectorAll('.nav-item'),
    helpBtn: document.getElementById('helpBtn'),
};

// ==================== TOAST ====================
function showToast(message, duration = 2500) {
    DOM.toast.textContent = message;
    DOM.toast.classList.remove('hidden');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
        DOM.toast.classList.add('hidden');
    }, duration);
}

// ==================== SCREEN NAVIGATION ====================
function showScreen(screenId) {
    if (AppState.screen === screenId) return;
    AppState.pushHistory();
    AppState.screen = screenId;
    renderScreen();
    AppState.save();
}

function renderScreen() {
    // Ocultar todas
    Object.values(DOM.screens).forEach(s => s.classList.add('hidden'));
    // Mostrar actual
    const current = DOM.screens[AppState.screen];
    if (current) current.classList.remove('hidden');
    // Actualizar nav
    updateNav();
    // Scroll top
    document.querySelector('.main-scroll').scrollTop = 0;
}

function updateNav() {
    DOM.navItems.forEach(item => {
        item.classList.remove('active');
        const tab = item.dataset.tab;
        if (tab === 'home' && AppState.screen === 'home') item.classList.add('active');
        if (tab === 'projects' && AppState.screen === 'projects') item.classList.add('active');
        if (tab === 'tools' && (AppState.screen === 'cutter' || AppState.screen === 'glass')) item.classList.add('active');
        if (tab === 'profile' && AppState.screen === 'profile') item.classList.add('active');
    });
}

// ==================== BUDGET WIZARD ====================
function renderBudgetSteps() {
    // Ocultar todos los pasos
    Object.values(DOM.budgetSteps).forEach(s => s.classList.add('hidden'));
    // Mostrar paso actual
    const current = DOM.budgetSteps[AppState.budgetStep];
    if (current) current.classList.remove('hidden');
    // Actualizar barras
    DOM.stepBars.forEach(bar => {
        bar.classList.toggle('active', parseInt(bar.dataset.step) <= AppState.budgetStep);
    });
}

function nextBudgetStep() {
    if (AppState.budgetStep < 3) {
        AppState.budgetStep++;
        renderBudgetSteps();
        AppState.save();
    }
}

function resetBudget() {
    AppState.budgetStep = 1;
    AppState.budgetType = 'Ventana';
    renderBudgetSteps();
    // Limpiar inputs
    document.getElementById('clientInput').value = '';
    document.getElementById('widthInput').value = '';
    document.getElementById('heightInput').value = '';
    // Resetear selección de tipo
    document.querySelectorAll('#typeGrid .touch-card').forEach(c => c.classList.remove('selected'));
    const firstType = document.querySelector('#typeGrid .touch-card[data-type="Ventana"]');
    if (firstType) firstType.classList.add('selected');
}

// ==================== CUTTER ====================
function selectCutType(type) {
    AppState.cutType = type;
    DOM.cutLinear.classList.toggle('hidden', type !== 'linear');
    DOM.cutPanel.classList.toggle('hidden', type !== 'panel');
    AppState.save();
}

function addLinearPiece() {
    const row = document.createElement('div');
    row.className = 'piece-row';
    row.innerHTML = `
        <input class="input-line" placeholder="MM" inputmode="numeric" autocomplete="off">
        <input class="input-line short" placeholder="CANT" value="1" inputmode="numeric" autocomplete="off">
        <button class="btn-secondary" style="width:auto; padding:10px 14px;" onclick="this.parentElement.remove()">✕</button>
    `;
    DOM.linearList.appendChild(row);
}

function addPanelPiece() {
    const row = document.createElement('div');
    row.className = 'piece-row';
    row.innerHTML = `
        <input class="input-line" placeholder="ANCHO" inputmode="numeric" autocomplete="off">
        <input class="input-line" placeholder="ALTO" inputmode="numeric" autocomplete="off">
        <button class="btn-secondary" style="width:auto; padding:10px 14px;" onclick="this.parentElement.remove()">✕</button>
    `;
    DOM.panelList.appendChild(row);
}

function calculateLinear() {
    const rows = DOM.linearList.querySelectorAll('.piece-row');
    const pieces = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const length = parseFloat(inputs[0].value) || 0;
        const qty = parseInt(inputs[1].value) || 1;
        if (length > 0) pieces.push({ length, qty });
    });
    if (pieces.length === 0) {
        showToast('AGREGA AL MENOS UNA PIEZA');
        return;
    }
    // Algoritmo First-Fit Decreasing simple
    const BAR = 6000;
    const all = [];
    pieces.forEach(p => { for(let i=0; i<p.qty; i++) all.push(p.length); });
    all.sort((a,b) => b - a);
    const bars = [];
    all.forEach(l => {
        let placed = false;
        for (let bar of bars) {
            if (bar.remaining >= l) {
                bar.pieces.push(l);
                bar.remaining -= l;
                placed = true;
                break;
            }
        }
        if (!placed) bars.push({ pieces: [l], remaining: BAR - l });
    });
    const totalUsed = bars.length * BAR;
    const totalPiece = all.reduce((a,b) => a+b, 0);
    const efficiency = ((totalPiece / totalUsed) * 100).toFixed(1);
    showToast(`${bars.length} BARRAS · ${efficiency}% APROVECHAMIENTO`);
}

function calculatePanel() {
    const rows = DOM.panelList.querySelectorAll('.piece-row');
    const pieces = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const w = parseFloat(inputs[0].value) || 0;
        const h = parseFloat(inputs[1].value) || 0;
        if (w > 0 && h > 0) pieces.push({ w, h });
    });
    if (pieces.length === 0) {
        showToast('AGREGA AL MENOS UN PAÑO');
        return;
    }
    // Estimación simple por área
    const PLATE_AREA = 2600 * 1800;
    const totalArea = pieces.reduce((sum, p) => sum + (p.w * p.h), 0);
    const plates = Math.ceil(totalArea / (PLATE_AREA * 0.85));
    showToast(`${plates} PLACAS ESTIMADAS`);
}

// ==================== PROJECT LIST (demo) ====================
function renderProjectList(filter = '') {
    const projects = [
        { id: '078', title: 'Ventanal Ruiz', status: 'TALLER', statusColor: 'var(--primary)' },
        { id: '045', title: 'Cocina Pérez', status: 'INSTALAR', statusColor: 'var(--text-mid)' },
        { id: '102', title: 'Cancel Baño Gómez', status: 'PRESUPUESTO', statusColor: 'var(--outline-variant)' },
    ];
    const filtered = projects.filter(p =>
        p.title.toLowerCase().includes(filter.toLowerCase()) ||
        p.id.includes(filter)
    );
    DOM.projectList.innerHTML = filtered.map(p => `
        <button class="touch-card" type="button" style="flex-direction:row; justify-content:space-between; padding:18px; text-align:left; width:100%;">
            <div>
                <span class="card-title">#${p.id}</span>
                <div style="font:var(--font-body-lg); text-transform:none;">${p.title}</div>
            </div>
            <span style="background:${p.statusColor}; color:white; padding:4px 12px; font:var(--font-label-sm);">${p.status}</span>
        </button>
    `).join('');
}

// ==================== EVENT DELEGATION ====================
function setupGlobalListeners() {
    // Cards con data-action
    document.querySelectorAll('[data-action]').forEach(el => {
        el.addEventListener('click', () => {
            const action = el.dataset.action;
            if (action === 'budget') {
                resetBudget();
                showScreen('budget');
            } else if (action === 'projects') {
                renderProjectList();
                showScreen('projects');
            } else if (action === 'cutter') {
                showScreen('cutter');
            } else if (action === 'glass') {
                showScreen('glass');
            }
        });
    });

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => showScreen('home'));
    });

    // Bottom nav
    DOM.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            if (tab === 'home') showScreen('home');
            else if (tab === 'projects') {
                renderProjectList();
                showScreen('projects');
            } else if (tab === 'tools') showScreen('cutter');
            else if (tab === 'profile') showToast('PERFIL DE CARLOS (DEMO)');
        });
    });

    // Budget next buttons
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', nextBudgetStep);
    });

    // Budget type selection
    DOM.typeGrid.querySelectorAll('.touch-card').forEach(card => {
        card.addEventListener('click', () => {
            DOM.typeGrid.querySelectorAll('.touch-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            AppState.budgetType = card.dataset.type;
            AppState.save();
        });
    });

    // Finish budget
    document.getElementById('finishBudget').addEventListener('click', () => {
        const client = document.getElementById('clientInput').value || 'Sin nombre';
        const width = document.getElementById('widthInput').value || '?';
        const height = document.getElementById('heightInput').value || '?';
        showToast(`PRESUPUESTO ENVIADO · ${AppState.budgetType} ${width}x${height}mm`);
        resetBudget();
        showScreen('home');
    });

    // Cutter type selection
    document.querySelectorAll('#cutTypeGrid .touch-card').forEach(card => {
        card.addEventListener('click', () => selectCutType(card.dataset.type));
    });

    // Add pieces
    document.getElementById('addLinear').addEventListener('click', addLinearPiece);
    document.getElementById('addPanel').addEventListener('click', addPanelPiece);

    // Calculate
    document.getElementById('calcLinear').addEventListener('click', calculateLinear);
    document.getElementById('calcPanel').addEventListener('click', calculatePanel);

    // Project search
    document.getElementById('projectSearch').addEventListener('input', (e) => {
        renderProjectList(e.target.value);
    });

    // Help button
    DOM.helpBtn.addEventListener('click', () => {
        showToast('TOCA LOS MÓDULOS PARA EMPEZAR · ESCRIBE / PARA COMANDOS');
    });

    // Recent activity clicks
    DOM.recentActivity.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            renderProjectList();
            showScreen('projects');
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Z para volver
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (AppState.undo()) {
                renderScreen();
                AppState.save();
                showToast('DESHECHO');
            }
        }
        // / para paleta de comandos
        if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement === document.body) {
            e.preventDefault();
            const cmd = prompt('COMANDO: home / projects / budget / cutter / glass');
            if (cmd) {
                const valid = ['home','projects','budget','cutter','glass'];
                if (valid.includes(cmd.trim())) {
                    if (cmd.trim() === 'budget') resetBudget();
                    if (cmd.trim() === 'projects') renderProjectList();
                    showScreen(cmd.trim());
                } else {
                    showToast('COMANDO NO RECONOCIDO');
                }
            }
        }
    });
}

// ==================== INIT ====================
function init() {
    AppState.load();
    renderScreen();
    if (AppState.screen === 'budget') renderBudgetSteps();
    if (AppState.screen === 'projects') renderProjectList();
    if (AppState.screen === 'cutter' && AppState.cutType) selectCutType(AppState.cutType);
    // Agregar piezas de ejemplo
    if (DOM.linearList.children.length === 0) {
        addLinearPiece();
        addLinearPiece();
    }
    if (DOM.panelList.children.length === 0) {
        addPanelPiece();
        addPanelPiece();
    }
    setupGlobalListeners();
}

document.addEventListener('DOMContentLoaded', init);