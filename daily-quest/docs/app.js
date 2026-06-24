/* ═══════════════════════════════════════════════
   LEVARA — App v2 (localStorage, offline-first)
═══════════════════════════════════════════════ */

const STORAGE_KEY = 'levara_v1';

/* ─── Constants ─────────────────────────────── */
const CATEGORIES = {
  salud:         { label: 'Salud',         icon: '💚' },
  productividad: { label: 'Productividad', icon: '⚡' },
  aprendizaje:   { label: 'Aprendizaje',   icon: '📚' },
  personal:      { label: 'Personal',      icon: '🌟' },
};

const RANK_NAMES = [
  'Novato','Aprendiz','Guerrero','Veterano','Campeón',
  'Maestro','Gran Maestro','Leyenda','Inmortal','Dios del Tiempo',
];

const ACHIEVEMENTS_DEF = {
  // ── Primeros pasos ──────────────────────────
  first_quest:       { icon:'🌟', name:'Primeros pasos',      desc:'Completa tu primera tarea' },

  // ── Rachas ──────────────────────────────────
  streak_3:          { icon:'🔥', name:'En llamas',            desc:'Racha de 3 días consecutivos' },
  streak_7:          { icon:'⚡', name:'Imparable',             desc:'Racha de 7 días consecutivos' },
  streak_14:         { icon:'🌊', name:'Flujo constante',       desc:'Racha de 14 días consecutivos' },
  streak_21:         { icon:'🧠', name:'El hábito se forja',   desc:'Racha de 21 días consecutivos' },
  streak_30:         { icon:'🌙', name:'Hábito de hierro',     desc:'Racha de 30 días consecutivos' },
  streak_60:         { icon:'🌕', name:'Dos lunas',             desc:'Racha de 60 días consecutivos' },
  streak_100:        { icon:'💀', name:'Sin descanso',          desc:'Racha de 100 días consecutivos' },

  // ── Tareas completadas ───────────────────────
  quests_10:         { icon:'✅', name:'Constante',              desc:'10 tareas completadas en total' },
  quests_25:         { icon:'🎯', name:'En ritmo',               desc:'25 tareas completadas en total' },
  quests_50:         { icon:'🏆', name:'Veterano',               desc:'50 tareas completadas en total' },
  quests_100:        { icon:'💎', name:'Élite',                  desc:'100 tareas completadas en total' },
  quests_250:        { icon:'🚀', name:'Implacable',             desc:'250 tareas completadas en total' },
  quests_500:        { icon:'🌠', name:'Máquina',                desc:'500 tareas completadas en total' },

  // ── Niveles ──────────────────────────────────
  level_5:           { icon:'⚔️',  name:'Guerrero curtido',     desc:'Llega al nivel 5' },
  level_10:          { icon:'👑',  name:'Leyenda',               desc:'Llega al nivel 10' },
  level_15:          { icon:'🗡️', name:'Espadachín élite',      desc:'Llega al nivel 15' },
  level_20:          { icon:'🛡️', name:'Paladín',               desc:'Llega al nivel 20' },
  level_25:          { icon:'🔮', name:'Arcano',                 desc:'Llega al nivel 25' },

  // ── XP total ─────────────────────────────────
  xp_1000:           { icon:'💡', name:'Destello de poder',      desc:'Acumula 1,000 XP en total' },
  xp_5000:           { icon:'🌪️',name:'Tormenta de energía',    desc:'Acumula 5,000 XP en total' },
  xp_10000:          { icon:'🌀', name:'Maestro del poder',      desc:'Acumula 10,000 XP en total' },

  // ── Días activos ─────────────────────────────
  active_7:          { icon:'📅', name:'Una semana',              desc:'7 días activos en total' },
  active_30:         { icon:'🗓️',name:'Mes activo',              desc:'30 días activos en total' },

  // ── Días perfectos ───────────────────────────
  perfect_day:       { icon:'💯', name:'Día perfecto',            desc:'Completa todas las tareas en un día' },
  perfect_3:         { icon:'⭐', name:'Triple perfecto',         desc:'3 días perfectos' },
  perfect_7:         { icon:'✨', name:'Semana sin fisuras',      desc:'7 días perfectos' },

  // ── Categorías ───────────────────────────────
  health_10:         { icon:'💪', name:'Cuerpo en forma',         desc:'10 tareas de Salud completadas' },
  productivity_10:   { icon:'📈', name:'Máquina de trabajo',      desc:'10 tareas de Productividad completadas' },
  learning_10:       { icon:'📚', name:'Mente ávida',             desc:'10 tareas de Aprendizaje completadas' },
  personal_10:       { icon:'🌺', name:'Alma equilibrada',        desc:'10 tareas de Personal completadas' },
  all_categories:    { icon:'🎪', name:'Todoterreno',              desc:'Completa 1 tarea de cada categoría en un mismo día' },
};

const DAILY_QUOTES = [
  { text:'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',      author:'Robert Collier' },
  { text:'La disciplina es el puente entre metas y logros.',                        author:'Jim Rohn' },
  { text:'No importa lo lento que vayas, siempre y cuando no te detengas.',         author:'Confucio' },
  { text:'La única forma de hacer un gran trabajo es amar lo que haces.',           author:'Steve Jobs' },
  { text:'El dolor que sientes hoy será la fuerza que sentirás mañana.',           author:'Anónimo' },
  { text:'Cada día es una nueva oportunidad para cambiar tu vida.',                 author:'Anónimo' },
  { text:'El cuerpo logra lo que la mente cree.',                                   author:'Napoleon Hill' },
  { text:'Primero forma un hábito, luego el hábito te forma a ti.',                author:'Jim Ryun' },
  { text:'No hay atajos a ningún lugar que valga la pena ir.',                     author:'Beverly Sills' },
  { text:'El progreso, no la perfección, es la clave.',                            author:'Anónimo' },
  { text:'Cada acción que tomas es un voto por el tipo de persona que quieres ser.',author:'James Clear' },
  { text:'El secreto de salir adelante es comenzar.',                               author:'Mark Twain' },
  { text:'Haz hoy lo que otros no harán y mañana tendrás lo que otros no tienen.', author:'Jerry Rice' },
  { text:'No tienes que ser grande para empezar, pero tienes que empezar para ser grande.', author:'Zig Ziglar' },
  { text:'La motivación te pone en marcha, el hábito te mantiene en movimiento.',  author:'Jim Ryun' },
  { text:'Un año desde ahora desearás haber empezado hoy.',                         author:'Karen Lamb' },
  { text:'El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el coraje de continuar.', author:'Churchill' },
  { text:'No cuentes los días, haz que los días cuenten.',                          author:'Muhammad Ali' },
  { text:'Cree que puedes y ya estás a mitad del camino.',                          author:'Theodore Roosevelt' },
  { text:'La excelencia no es un acto, es un hábito.',                             author:'Aristóteles' },
];

/* ═══════════════════════════════════════════════
   SECURITY — HTML escape (prevents XSS)
═══════════════════════════════════════════════ */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ═══════════════════════════════════════════════
   STORAGE
═══════════════════════════════════════════════ */
function getData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeDefaultData(name) {
  return {
    profile:              { name: name.trim().slice(0, 30), avatar: null, createdAt: today() },
    stats:                { totalXP: 0, streak: 0, bestStreak: 0, daysActive: 0, questsDone: 0, lastActiveDate: null, perfectDays: 0, lastPerfectDate: null },
    theme:                { hue: 260, isDark: true },
    font:                 '',
    sound:                true,
    notificationsEnabled: false,
    quests:               [],
    completions:          {},
    achievements:         [],
    activityLog:          [],
  };
}

/* ═══════════════════════════════════════════════
   DATE / LEVEL HELPERS
═══════════════════════════════════════════════ */
function today()    { return new Date().toISOString().slice(0, 10); }
function genId()    { return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); }
function getRank(l) { return RANK_NAMES[Math.min(l - 1, RANK_NAMES.length - 1)]; }

function calcLevel(totalXP) {
  let level = 1, xpNeeded = 100, accumulated = 0;
  while (accumulated + xpNeeded <= totalXP) { accumulated += xpNeeded; level++; xpNeeded = Math.floor(xpNeeded * 1.2); }
  return { level, xpIntoLevel: totalXP - accumulated, xpForNextLevel: xpNeeded };
}

/* ═══════════════════════════════════════════════
   STATE (runtime, mirrors localStorage)
═══════════════════════════════════════════════ */
let state = null;

function getCompletionsToday()    { return state.completions[today()] || []; }
function getTodayXP()             { return state.quests.filter(q => getCompletionsToday().includes(q.id)).reduce((s, q) => s + q.xp, 0); }
function isQuestDone(id)          { return getCompletionsToday().includes(id); }

/* ─── Daily reset check ──────────────────────── */
function applyDailyReset() {
  const t = today();
  if (!state.completions[t]) state.completions[t] = [];

  if (state.stats.lastActiveDate && state.stats.lastActiveDate < t) {
    const diff = Math.floor((new Date(t) - new Date(state.stats.lastActiveDate)) / 86400000);
    if (diff > 1) state.stats.streak = 0;
  }

  // Trim old data
  const dates = Object.keys(state.completions).sort();
  if (dates.length > 60) dates.slice(0, dates.length - 60).forEach(d => delete state.completions[d]);
  if (state.activityLog.length > 50) state.activityLog = state.activityLog.slice(-50);
}

/* ═══════════════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════════════ */
function scheduleNotifications() {
  if (!state.notificationsEnabled || Notification.permission !== 'granted') return;
  const now    = new Date();
  const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);

  [{ offset: 60, label: '1 hora' }, { offset: 30, label: '30 minutos' }].forEach(({ offset, label }) => {
    const fireAt = new Date(midnight - offset * 60 * 1000);
    const delay  = fireAt - now;
    if (delay > 0) {
      setTimeout(() => {
        if (Notification.permission !== 'granted') return;
        const done  = getCompletionsToday().length;
        const total = state.quests.length;
        if (done < total) {
          new Notification('⚔️ Levara', {
            body: `¡Queda ${label}! Tienes ${total - done} tarea${total - done > 1 ? 's' : ''} sin completar.`,
            tag:  'levara-warning',
            icon: '/favicon.ico',
          });
        }
      }, delay);
    }
  });
}

async function enableNotifications(enable) {
  state.notificationsEnabled = enable;
  if (enable) {
    if (!('Notification' in window)) { showToast('Tu navegador no soporta notificaciones', 'info', '⚠️'); return false; }
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (perm !== 'granted') {
      state.notificationsEnabled = false;
      $('notif-toggle').checked   = false;
      showToast('Permiso de notificaciones denegado', 'info', '⚠️');
      saveData();
      return false;
    }
    scheduleNotifications();
    showToast('Notificaciones activadas', 'success', '🔔');
  }
  saveData();
  return true;
}

/* ═══════════════════════════════════════════════
   EXPORT / IMPORT
═══════════════════════════════════════════════ */
function exportData() {
  const json  = JSON.stringify(state, null, 2);
  const blob  = new Blob([json], { type: 'application/json' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href = url; a.download = `levara-backup-${today()}.json`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('Backup exportado', 'success', '📥');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const raw = JSON.parse(e.target.result);
      // Validate minimal structure
      if (!raw || typeof raw !== 'object') throw new Error('Archivo inválido');
      if (!raw.profile?.name) throw new Error('Falta el perfil');
      if (!Array.isArray(raw.quests)) throw new Error('Falta la lista de tareas');

      // Sanitize to prevent stored XSS
      raw.profile.name   = String(raw.profile.name).slice(0, 30);
      raw.profile.avatar = (typeof raw.profile.avatar === 'string' && raw.profile.avatar.startsWith('data:image/'))
                           ? raw.profile.avatar : null;
      raw.quests = raw.quests.map(q => ({
        id:       String(q.id || genId()),
        name:     String(q.name || '').slice(0, 80),
        category: ['salud','productividad','aprendizaje','personal'].includes(q.category) ? q.category : 'personal',
        xp:       Math.max(5, Math.min(200, parseInt(q.xp) || 20)),
        createdAt: String(q.createdAt || today()),
      }));
      raw.achievements = Array.isArray(raw.achievements)
        ? raw.achievements.filter(a => Object.hasOwn(ACHIEVEMENTS_DEF, a))
        : [];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
      showToast('Datos importados. Recargando...', 'success', '📤');
      setTimeout(() => location.reload(), 1200);
    } catch (ex) {
      showToast('Error al importar: ' + esc(ex.message), 'info', '⚠️');
    }
  };
  reader.readAsText(file);
}

/* ═══════════════════════════════════════════════
   ACHIEVEMENTS
═══════════════════════════════════════════════ */
function checkAchievements() {
  const { stats, achievements } = state;
  const level       = calcLevel(stats.totalXP).level;
  const doneToday   = getCompletionsToday();
  const allDone     = state.quests.length > 0 && doneToday.length >= state.quests.length;
  const perfectDays = stats.perfectDays || 0;
  const newUnlocked = [];

  // Category counts across all completion history (only for currently existing quests)
  const questMap = Object.fromEntries(state.quests.map(q => [q.id, q]));
  const catCount = { salud: 0, productividad: 0, aprendizaje: 0, personal: 0 };
  Object.values(state.completions).forEach(ids => {
    ids.forEach(id => {
      const q = questMap[id];
      if (q?.category && catCount[q.category] !== undefined) catCount[q.category]++;
    });
  });

  // All 4 categories covered in today's completions
  const todayCats   = new Set(doneToday.map(id => questMap[id]?.category).filter(Boolean));
  const allCatsDone = ['salud','productividad','aprendizaje','personal'].every(c => todayCats.has(c));

  const defs = [
    // Primeros pasos
    { id: 'first_quest',     ok: stats.questsDone >= 1 },
    // Rachas
    { id: 'streak_3',        ok: stats.streak >= 3 },
    { id: 'streak_7',        ok: stats.streak >= 7 },
    { id: 'streak_14',       ok: stats.streak >= 14 },
    { id: 'streak_21',       ok: stats.streak >= 21 },
    { id: 'streak_30',       ok: stats.streak >= 30 },
    { id: 'streak_60',       ok: stats.streak >= 60 },
    { id: 'streak_100',      ok: stats.streak >= 100 },
    // Tareas
    { id: 'quests_10',       ok: stats.questsDone >= 10 },
    { id: 'quests_25',       ok: stats.questsDone >= 25 },
    { id: 'quests_50',       ok: stats.questsDone >= 50 },
    { id: 'quests_100',      ok: stats.questsDone >= 100 },
    { id: 'quests_250',      ok: stats.questsDone >= 250 },
    { id: 'quests_500',      ok: stats.questsDone >= 500 },
    // Niveles
    { id: 'level_5',         ok: level >= 5 },
    { id: 'level_10',        ok: level >= 10 },
    { id: 'level_15',        ok: level >= 15 },
    { id: 'level_20',        ok: level >= 20 },
    { id: 'level_25',        ok: level >= 25 },
    // XP
    { id: 'xp_1000',         ok: stats.totalXP >= 1000 },
    { id: 'xp_5000',         ok: stats.totalXP >= 5000 },
    { id: 'xp_10000',        ok: stats.totalXP >= 10000 },
    // Días activos
    { id: 'active_7',        ok: stats.daysActive >= 7 },
    { id: 'active_30',       ok: stats.daysActive >= 30 },
    // Días perfectos
    { id: 'perfect_day',     ok: allDone },
    { id: 'perfect_3',       ok: perfectDays >= 3 },
    { id: 'perfect_7',       ok: perfectDays >= 7 },
    // Categorías
    { id: 'health_10',       ok: catCount.salud >= 10 },
    { id: 'productivity_10', ok: catCount.productividad >= 10 },
    { id: 'learning_10',     ok: catCount.aprendizaje >= 10 },
    { id: 'personal_10',     ok: catCount.personal >= 10 },
    { id: 'all_categories',  ok: allCatsDone },
  ];

  for (const d of defs) {
    if (d.ok && !achievements.includes(d.id)) { achievements.push(d.id); newUnlocked.push(d.id); }
  }
  return newUnlocked;
}

/* ═══════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════ */
function applyTheme(hue, isDark) {
  document.documentElement.style.setProperty('--h', hue);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

function saveTheme(hue, isDark) {
  state.theme.hue    = hue;
  state.theme.isDark = isDark;
  applyTheme(hue, isDark);
  saveData();
}

/* ── Font ───────────────────────────────────── */
function applyFont(mode) {
  document.documentElement.setAttribute('data-font', mode || '');
}

function setFont(mode) {
  state.font = mode || '';
  applyFont(state.font);
  saveData();
  document.querySelectorAll('.font-opt').forEach(b => b.classList.toggle('active', b.dataset.font === state.font));
}

/* ── Notification badge ─────────────────────── */
function updateNotifBadge() {
  const pending = state.quests.length - getCompletionsToday().length;
  const badge   = $('notif-badge');
  if (!badge) return;
  if (pending > 0) {
    badge.textContent = pending > 9 ? '9+' : pending;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

/* ═══════════════════════════════════════════════
   DOM HELPERS
═══════════════════════════════════════════════ */
const $   = id  => document.getElementById(id);
const el  = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
  const t = $(`view-${viewId}`);
  t.classList.remove('hidden'); t.classList.add('active');
  document.querySelectorAll('.nav-btn, .mbn-btn').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  state.currentView = viewId;
  closeSidebar();
  if (viewId === 'quests')   renderQuests();
  if (viewId === 'stats')    renderStats();
  if (viewId === 'settings') renderSettings();
}

function openSidebar()  { $('sidebar').classList.add('open'); $('sidebar-overlay').classList.add('show'); }
function closeSidebar() { $('sidebar').classList.remove('open'); $('sidebar-overlay').classList.remove('show'); }

/* ═══════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════ */
function getInitial() { return (state.profile?.name?.[0] || '?').toUpperCase(); }

function setAvatarEl(el, url) {
  if (url) {
    el.style.backgroundImage    = `url(${url})`;
    el.style.backgroundSize     = 'cover';
    el.style.backgroundPosition = 'center';
    el.textContent = '';
  } else {
    el.style.backgroundImage = '';
    el.textContent = getInitial();
  }
}

function resizeToBase64(file, size = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload  = e => {
      const img = new Image();
      img.onerror = reject;
      img.onload  = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx  = canvas.getContext('2d');
        const side = Math.min(img.width, img.height);
        const sx   = (img.width  - side) / 2;
        const sy   = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ═══════════════════════════════════════════════
   SOUNDS
═══════════════════════════════════════════════ */
function playQuestSound() {
  if (!state.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[523,0],[659,.08],[784,.16]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(.14, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + delay + .35);
      osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + .35);
    });
  } catch {}
}

function playLevelUpSound() {
  if (!state.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[523,0],[659,.1],[784,.2],[1047,.32]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.value = freq;
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(.18, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + delay + .5);
      osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + .5);
    });
  } catch {}
}

/* ═══════════════════════════════════════════════
   CONFETTI
═══════════════════════════════════════════════ */
function triggerConfetti() {
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#cc5de8','#ff9f43','#00d2d3','#ff78c4'];
  for (let i = 0; i < 110; i++) {
    setTimeout(() => {
      const p    = el('div', 'confetti-piece');
      const size = 6 + Math.random() * 9;
      const dur  = 1.6 + Math.random() * 2;
      p.style.cssText = `left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};
        width:${size}px;height:${size}px;border-radius:${Math.random()>.5?'50%':'3px'};
        animation:confettiFall ${dur}s ${Math.random()*.4}s ease-in forwards;
        transform:rotate(${Math.random()*360}deg);`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), (dur + .5) * 1000);
    }, i * 18);
  }
}

/* ═══════════════════════════════════════════════
   TOASTS
═══════════════════════════════════════════════ */
function showToast(msg, type = 'info', icon = 'ℹ️') {
  const t = el('div', `toast toast--${type}`);
  t.innerHTML = `<span>${icon}</span><span>${esc(msg)}</span>`;
  $('toasts').appendChild(t);
  setTimeout(() => { t.style.animation = 'toastOut .3s ease forwards'; setTimeout(() => t.remove(), 300); }, 3200);
}

function showAchievementToast(id) {
  const def = ACHIEVEMENTS_DEF[id]; if (!def) return;
  const t = el('div', 'toast toast--achievement');
  t.innerHTML = `<span class="toast-ach-ico">${def.icon}</span>
    <div><p class="toast-ach-name">¡Logro desbloqueado!</p><p class="toast-ach-title">${esc(def.name)}</p></div>`;
  $('toasts').appendChild(t);
  setTimeout(() => { t.style.animation = 'toastOut .3s ease forwards'; setTimeout(() => t.remove(), 300); }, 4500);
}

function spawnXPFloat(targetEl, xp) {
  const rect  = targetEl.getBoundingClientRect();
  const label = el('div', 'xp-float');
  label.textContent = `+${xp} XP`;
  label.style.left  = `${rect.left + rect.width / 2 - 20}px`;
  label.style.top   = `${rect.top  + rect.height / 2}px`;
  document.body.appendChild(label);
  setTimeout(() => label.remove(), 1200);
}

/* ═══════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════ */
function renderSidebar() {
  const { profile, stats } = state;
  const lvl  = calcLevel(stats.totalXP);
  const rank = getRank(lvl.level);

  $('sidebar-name').textContent        = esc(profile.name);
  $('sidebar-level-text').textContent  = `Nivel ${lvl.level} · ${rank}`;
  $('mobile-level-chip').textContent   = `Nv.${lvl.level}`;
  setAvatarEl($('sidebar-avatar'), profile.avatar);
  setAvatarEl($('mobile-avatar'),  profile.avatar);

  const pct = lvl.xpForNextLevel > 0 ? Math.round((lvl.xpIntoLevel / lvl.xpForNextLevel) * 100) : 100;
  $('xp-bar-fill').style.width  = pct + '%';
  $('xp-bar-glow').style.width  = pct + '%';
  $('xp-label-text').textContent = `${lvl.xpIntoLevel} / ${lvl.xpForNextLevel}`;
  $('q-streak').textContent = stats.streak;
  $('q-xp').textContent     = stats.totalXP.toLocaleString();
  $('q-days').textContent   = stats.daysActive;
  updateNotifBadge();
}

/* ═══════════════════════════════════════════════
   QUOTE CARD
═══════════════════════════════════════════════ */
async function renderQuoteCard() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const fallback  = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  $('quote-text').textContent   = `"${fallback.text}"`;
  $('quote-author').textContent = `— ${fallback.author}`;
  try {
    const res  = await fetch('/api/quote');
    if (!res.ok) return;
    const data = await res.json();
    if (data.text) {
      $('quote-text').textContent   = `"${data.text}"`;
      $('quote-author').textContent = `— ${data.author || 'Anónimo'}`;
    }
  } catch { /* sin red → mantiene fallback */ }
}

/* ═══════════════════════════════════════════════
   QUESTS VIEW
═══════════════════════════════════════════════ */
function renderQuests() {
  const grid = $('quests-grid');
  const d    = new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  $('today-date-label').textContent = d.charAt(0).toUpperCase() + d.slice(1);
  renderQuoteCard();

  if (state.quests.length === 0) {
    grid.innerHTML = `<div class="empty-quests">
      <div class="empty-quests__icon">📋</div>
      <h3 class="empty-quests__title">No tienes tareas aún</h3>
      <p class="empty-quests__sub">Crea tus propias tareas y empieza a ganar XP</p>
      <button class="btn btn--primary" id="create-first-btn">✨ Crear primera tarea</button>
    </div>`;
    $('create-first-btn').addEventListener('click', showCreateModal);
    updateSummaryCard(); return;
  }

  const groups = {};
  for (const q of state.quests) { if (!groups[q.category]) groups[q.category] = []; groups[q.category].push(q); }

  grid.innerHTML = '';
  for (const [cat, quests] of Object.entries(groups)) {
    const catInfo   = CATEGORIES[cat] || { label: cat, icon: '⭐' };
    const completed = quests.filter(q => isQuestDone(q.id)).length;
    const block     = el('div', `category-block cat--${cat}`);
    block.innerHTML = `
      <div class="category-header">
        <div class="category-header__left">
          <div class="category-icon">${catInfo.icon}</div>
          <span class="category-name">${esc(catInfo.label)}</span>
          <span class="category-progress">${completed}/${quests.length}</span>
        </div>
        <span class="category-done-badge${completed === quests.length ? ' show' : ''}">¡Completo!</span>
      </div>
      <div class="quest-list"></div>`;
    const list = block.querySelector('.quest-list');
    for (const q of quests) list.appendChild(makeQuestItem(q));
    grid.appendChild(block);
  }
  updateSummaryCard();
}

function makeQuestItem(quest) {
  const done = isQuestDone(quest.id);
  const item = el('div', `quest-item${done ? ' done' : ''}`);
  item.dataset.id = quest.id;
  // Safe: esc() prevents XSS on user-provided quest name
  item.innerHTML = `
    <div class="quest-check${done ? ' checked' : ''}"><span class="quest-check__mark">✓</span></div>
    <div class="quest-info"><p class="quest-name">${esc(quest.name)}</p></div>
    <span class="xp-badge">+${quest.xp} XP</span>
    <button class="quest-del-btn" title="Eliminar tarea">🗑️</button>`;
  const toggle = () => toggleQuest(quest.id, item);
  item.querySelector('.quest-check').addEventListener('click', toggle);
  item.querySelector('.quest-info').addEventListener('click',  toggle);
  item.querySelector('.xp-badge').addEventListener('click',    toggle);
  item.querySelector('.quest-del-btn').addEventListener('click', e => { e.stopPropagation(); deleteQuest(quest.id, quest.name); });
  return item;
}

function updateSummaryCard() {
  const total     = state.quests.length;
  const completed = state.quests.filter(q => isQuestDone(q.id)).length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  $('daily-xp-count').textContent = getTodayXP().toLocaleString();
  $('progress-badge').textContent = `${completed} / ${total}`;
  $('donut-pct').textContent      = pct + '%';
  $('donut-ring').setAttribute('stroke-dasharray', `${pct} ${100 - pct}`);
  updateNotifBadge();
}

/* ═══════════════════════════════════════════════
   TOGGLE QUEST
═══════════════════════════════════════════════ */
function toggleQuest(questId, itemEl) {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest) return;

  const t           = today();
  if (!state.completions[t]) state.completions[t] = [];
  const completions = state.completions[t];
  const idx         = completions.indexOf(questId);
  const wasDone     = idx !== -1;
  const checkEl     = itemEl.querySelector('.quest-check');

  const oldLevel = calcLevel(state.stats.totalXP).level;

  if (!wasDone) {
    completions.push(questId);
    state.stats.totalXP    += quest.xp;
    state.stats.questsDone += 1;

    if (state.stats.lastActiveDate !== t) {
      const last = state.stats.lastActiveDate;
      const diff = last ? Math.floor((new Date(t) - new Date(last)) / 86400000) : 0;
      state.stats.streak = diff === 1 ? state.stats.streak + 1 : 1;
      state.stats.daysActive += 1;
      state.stats.lastActiveDate = t;
    }
    if (state.stats.streak > state.stats.bestStreak) state.stats.bestStreak = state.stats.streak;

    state.activityLog.push({ message: `${quest.name} — +${quest.xp} XP`, xp: quest.xp, ts: new Date().toISOString() });
    if (state.activityLog.length > 50) state.activityLog = state.activityLog.slice(-50);

    itemEl.classList.add('done'); checkEl.classList.add('checked');
    spawnXPFloat(itemEl, quest.xp);
    playQuestSound();
    showToast(`+${quest.xp} XP — ${quest.name}`, 'xp', '⭐');

    const newLevel = calcLevel(state.stats.totalXP).level;
    if (newLevel > oldLevel) { setTimeout(() => { showLevelUp(newLevel); playLevelUpSound(); }, 100); }

    const newAch = checkAchievements();
    newAch.forEach((id, i) => setTimeout(() => showAchievementToast(id), i * 1200 + 400));

    const allDone = state.quests.length > 0 && completions.length >= state.quests.length;
    if (allDone) {
      if (state.stats.lastPerfectDate !== t) {
        state.stats.perfectDays = (state.stats.perfectDays || 0) + 1;
        state.stats.lastPerfectDate = t;
      }
      setTimeout(triggerConfetti, 300);
      showToast('¡Todas las tareas completadas! 🎉', 'success', '🏆');
    }

  } else {
    completions.splice(idx, 1);
    state.stats.totalXP    = Math.max(0, state.stats.totalXP - quest.xp);
    state.stats.questsDone = Math.max(0, state.stats.questsDone - 1);
    itemEl.classList.remove('done'); checkEl.classList.remove('checked');
  }

  // Update category progress badge
  const cat      = quest.category;
  const catBlock = itemEl.closest(`.cat--${cat}`);
  if (catBlock) {
    const catQ    = state.quests.filter(q => q.category === cat);
    const catDone = catQ.filter(q => isQuestDone(q.id)).length;
    catBlock.querySelector('.category-done-badge')?.classList.toggle('show', catDone === catQ.length);
    const prog = catBlock.querySelector('.category-progress');
    if (prog) prog.textContent = `${catDone}/${catQ.length}`;
  }

  saveData();
  renderSidebar();
  updateSummaryCard();
}

/* ═══════════════════════════════════════════════
   CREATE / DELETE QUEST
═══════════════════════════════════════════════ */
function showCreateModal()  { $('create-quest-form').reset(); $('cq-error').classList.add('hidden'); document.querySelectorAll('.cq-cat').forEach((b,i) => b.classList.toggle('active', i===0)); document.querySelectorAll('.cq-xp').forEach((b,i) => b.classList.toggle('active', i===1)); $('create-quest-bg').classList.remove('hidden'); setTimeout(() => $('cq-name').focus(), 80); }
function hideCreateModal()  { $('create-quest-bg').classList.add('hidden'); }

function submitCreateQuest(e) {
  e.preventDefault();
  const errEl = $('cq-error'); errEl.classList.add('hidden');
  const name  = $('cq-name').value.trim();
  const cat   = document.querySelector('.cq-cat.active')?.dataset.cat || 'personal';
  const xp    = parseInt(document.querySelector('.cq-xp.active')?.dataset.xp || '20');
  if (!name) { errEl.textContent = 'Escribe un nombre para la tarea'; errEl.classList.remove('hidden'); return; }

  const quest = { id: genId(), name: name.slice(0, 80), category: cat, xp, createdAt: today() };
  state.quests.push(quest);
  saveData();
  hideCreateModal();
  renderQuests();
  showToast(`Tarea creada: ${quest.name}`, 'success', '⚔️');
}

function deleteQuest(questId, questName) {
  if (!confirm(`¿Eliminar la tarea "${questName}"?`)) return;
  state.quests = state.quests.filter(q => q.id !== questId);
  // Remove from all completions
  Object.keys(state.completions).forEach(d => {
    state.completions[d] = state.completions[d].filter(id => id !== questId);
  });
  saveData();
  renderQuests();
  showToast('Tarea eliminada', 'remove', '🗑️');
}

/* ═══════════════════════════════════════════════
   STATS VIEW
═══════════════════════════════════════════════ */
function renderStats() {
  const { stats } = state;
  const lvl  = calcLevel(stats.totalXP);
  const rank = getRank(lvl.level);

  $('s-level').textContent  = lvl.level;
  $('s-xp').textContent     = stats.totalXP.toLocaleString();
  $('s-streak').textContent = stats.streak;
  $('s-best').textContent   = stats.bestStreak;
  $('s-days').textContent   = stats.daysActive;
  $('s-done').textContent   = stats.questsDone;

  $('s-level-chip').textContent = `Nv. ${lvl.level}`;
  $('s-rank').textContent       = rank;
  $('s-next').textContent       = `→ Nv. ${lvl.level + 1}`;
  const pct = lvl.xpForNextLevel > 0 ? Math.round((lvl.xpIntoLevel / lvl.xpForNextLevel) * 100) : 100;
  $('s-xp-fill').style.width  = pct + '%';
  $('s-xp-glow').style.width  = pct + '%';
  $('s-xp-curr').textContent   = `${lvl.xpIntoLevel} XP`;
  $('s-xp-needed').textContent = `${lvl.xpForNextLevel} XP para el siguiente nivel`;

  // Activity log
  const list = $('activity-list');
  const logs = [...state.activityLog].reverse();
  list.innerHTML = !logs.length
    ? '<p class="empty-msg">Nada aún. ¡Completa tus primeras tareas!</p>'
    : logs.map(a => {
        const date = new Date(a.ts).toLocaleString('es-ES', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
        return `<div class="activity-item">
          <span>📌</span>
          <span style="flex:1">${esc(a.message)}</span>
          ${a.xp > 0 ? `<span class="activity-item__xp">+${a.xp} XP</span>` : ''}
          <span class="activity-item__time">${esc(date)}</span>
        </div>`;
      }).join('');

  // Weekly chart (from completions history)
  renderWeeklyChart();

  // Achievements
  renderAchievements();
}

function renderWeeklyChart() {
  const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d    = new Date(); d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const ids  = state.completions[dStr] || [];
    const xp   = state.quests.filter(q => ids.includes(q.id)).reduce((s, q) => s + q.xp, 0)
               + (ids.length > 0
                  ? ids.filter(id => !state.quests.find(q => q.id === id)).length * 20 // deleted quests estimate
                  : 0);
    days.push({ date: dStr, label: DAY_NAMES[d.getDay()], xp });
  }
  const max = Math.max(...days.map(d => d.xp), 1);
  $('week-chart').innerHTML = days.map(d => {
    const h       = Math.round((d.xp / max) * 100);
    const isToday = d.date === today();
    return `<div class="week-col${isToday ? ' week-col--today' : ''}">
      <span class="week-xp-num">${d.xp > 0 ? d.xp : ''}</span>
      <div class="week-bar-wrap"><div class="week-bar" style="height:${h}%"></div></div>
      <span class="week-label">${d.label}</span>
    </div>`;
  }).join('');
}

function renderAchievements() {
  const grid     = $('achievements-grid');
  const unlocked = new Set(state.achievements);
  grid.innerHTML = Object.entries(ACHIEVEMENTS_DEF).map(([id, def]) => {
    const on = unlocked.has(id);
    return `<div class="ach-card${on ? '' : ' ach-card--locked'}" title="${esc(def.desc)}">
      <div class="ach-card__icon">${def.icon}</div>
      <p class="ach-card__name">${esc(def.name)}</p>
      <p class="ach-card__desc">${esc(def.desc)}</p>
      ${on ? '<span class="ach-unlocked">✓</span>' : ''}
    </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════════
   SETTINGS VIEW
═══════════════════════════════════════════════ */
const COLOR_PRESETS = [
  { name:'Púrpura', hue:260 }, { name:'Azul',    hue:220 }, { name:'Cian',    hue:185 },
  { name:'Verde',   hue:140 }, { name:'Naranja',  hue:30  }, { name:'Rosa',    hue:330 },
  { name:'Rojo',    hue:0   }, { name:'Amarillo', hue:55  },
];

function renderSettings() {
  const { profile, theme, sound, notificationsEnabled, font } = state;
  $('settings-name').value       = profile.name;
  $('hue-slider').value          = theme.hue;
  $('dark-mode-toggle').checked  = theme.isDark;
  $('sound-toggle').checked      = sound;
  $('notif-toggle').checked      = notificationsEnabled;
  updateHueDot(theme.hue);
  setAvatarEl($('settings-avatar'), profile.avatar);
  document.querySelectorAll('.font-opt').forEach(b => b.classList.toggle('active', b.dataset.font === (font || '')));

  const container = $('color-presets');
  container.innerHTML = '';
  for (const p of COLOR_PRESETS) {
    const dot = el('button', 'color-preset');
    dot.style.background = `hsl(${p.hue},75%,58%)`;
    dot.title = p.name;
    if (p.hue === theme.hue) dot.classList.add('active');
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-preset').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      $('hue-slider').value = p.hue;
      updateHueDot(p.hue);
      saveTheme(p.hue, $('dark-mode-toggle').checked);
    });
    container.appendChild(dot);
  }
}

function updateHueDot(hue) { $('hue-dot').style.background = `hsl(${hue},75%,58%)`; }

/* ═══════════════════════════════════════════════
   LEVEL UP MODAL
═══════════════════════════════════════════════ */
function showLevelUp(newLevel) {
  $('levelup-num').textContent  = `Nivel ${newLevel}`;
  $('levelup-rank').textContent = getRank(newLevel);
  const particles = $('levelup-particles'); particles.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const p = el('div', 'particle');
    const angle = (i / 20) * Math.PI * 2;
    const dist  = 80 + Math.random() * 120;
    p.style.cssText = `left:50%;top:50%;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;
      background:hsl(${Math.random()*360},80%,65%);animation-delay:${Math.random()*.3}s;`;
    particles.appendChild(p);
  }
  $('levelup-bg').classList.remove('hidden');
}

/* ═══════════════════════════════════════════════
   EVENTS
═══════════════════════════════════════════════ */
function bindEvents() {

  /* SETUP (first-time onboarding) */
  $('setup-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('setup-name').value.trim();
    if (!name) return;
    state = makeDefaultData(name);
    saveData();
    applyTheme(state.theme.hue, state.theme.isDark);
    applyFont(state.font);
    renderSidebar();
    showView('quests');
    showScreen('app-screen');
  });

  $('setup-import-btn').addEventListener('click', () => $('setup-import-file').click());
  $('setup-import-file').addEventListener('change', e => importData(e.target.files[0]));

  /* NAV */
  document.querySelectorAll('.nav-btn, .mbn-btn').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));

  /* NOTIFICATION BELL */
  $('notif-bell-btn')?.addEventListener('click', () => showView('quests'));
  $('mobile-menu-btn').addEventListener('click', openSidebar);
  $('sidebar-close').addEventListener('click',   closeSidebar);
  $('sidebar-overlay').addEventListener('click', closeSidebar);
  $('logout-btn').addEventListener('click', () => {
    if (!confirm('¿Cerrar sesión? Tus datos quedan guardados en este dispositivo.')) return;
    showScreen('setup-screen');
  });

  /* LEVEL UP */
  $('levelup-close').addEventListener('click', () => $('levelup-bg').classList.add('hidden'));

  /* CREATE QUEST */
  $('new-quest-btn').addEventListener('click', showCreateModal);
  $('cq-x-btn').addEventListener('click',      hideCreateModal);
  $('cq-cancel-btn').addEventListener('click', hideCreateModal);
  $('create-quest-bg').addEventListener('click', e => { if (e.target === $('create-quest-bg')) hideCreateModal(); });
  document.querySelectorAll('.cq-cat').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.cq-cat').forEach(x => x.classList.remove('active')); b.classList.add('active'); }));
  document.querySelectorAll('.cq-xp').forEach(b  => b.addEventListener('click', () => { document.querySelectorAll('.cq-xp').forEach(x => x.classList.remove('active'));  b.classList.add('active'); }));
  $('create-quest-form').addEventListener('submit', submitCreateQuest);

  /* AVATAR */
  $('change-avatar-btn').addEventListener('click', () => $('avatar-file-input').click());
  $('avatar-file-input').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 8 * 1024 * 1024) { showToast('Imagen demasiado grande (máx 8 MB)', 'info', '⚠️'); return; }
    try {
      const b64 = await resizeToBase64(file, 200);
      state.profile.avatar = b64;
      saveData();
      setAvatarEl($('sidebar-avatar'), b64);
      setAvatarEl($('settings-avatar'), b64);
      showToast('Foto de perfil actualizada', 'success', '📷');
    } catch { showToast('No se pudo procesar la imagen', 'info', '⚠️'); }
    e.target.value = '';
  });
  $('remove-avatar-btn').addEventListener('click', () => {
    state.profile.avatar = null;
    saveData();
    setAvatarEl($('sidebar-avatar'), null);
    setAvatarEl($('settings-avatar'), null);
    showToast('Foto de perfil eliminada', 'remove', '🗑️');
  });

  /* THEME */
  $('hue-slider').addEventListener('input',  e => { updateHueDot(parseInt(e.target.value)); applyTheme(parseInt(e.target.value), $('dark-mode-toggle').checked); document.querySelectorAll('.color-preset').forEach(d => d.classList.remove('active')); });
  $('hue-slider').addEventListener('change', e => saveTheme(parseInt(e.target.value), $('dark-mode-toggle').checked));
  $('dark-mode-toggle').addEventListener('change', e => saveTheme(parseInt($('hue-slider').value), e.target.checked));

  /* SOUND */
  $('sound-toggle').addEventListener('change', e => { state.sound = e.target.checked; saveData(); if (e.target.checked) playQuestSound(); });

  /* NOTIFICATIONS */
  $('notif-toggle').addEventListener('change', e => enableNotifications(e.target.checked));

  /* SAVE NAME */
  $('save-name-btn').addEventListener('click', () => {
    const name = $('settings-name').value.trim();
    if (!name) return;
    state.profile.name = name.slice(0, 30);
    saveData();
    renderSidebar();
    showToast('Nombre actualizado', 'success', '✅');
  });

  /* EXPORT / IMPORT */
  $('export-btn').addEventListener('click', exportData);
  $('import-btn').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', e => { importData(e.target.files[0]); e.target.value = ''; });

  /* FONT TOGGLE */
  document.querySelectorAll('.font-opt').forEach(btn => btn.addEventListener('click', () => setFont(btn.dataset.font)));

  /* RESET */
  $('reset-btn').addEventListener('click', () => {
    if (!confirm('¿Borrar TODO el progreso? Esta acción es irreversible.')) return;
    const name = state.profile.name;
    state = makeDefaultData(name);
    saveData();
    applyTheme(state.theme.hue, state.theme.isDark);
    renderSidebar();
    showView('quests');
    showToast('Progreso reiniciado', 'info', '🔄');
  });
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
function main() {
  bindEvents();

  const saved = getData();
  if (saved?.profile?.name) {
    state = saved;
    if (!state.font) state.font = '';
    applyDailyReset();
    applyTheme(state.theme.hue, state.theme.isDark);
    applyFont(state.font);
    renderSidebar();
    showView('quests');
    showScreen('app-screen');
    scheduleNotifications();
  } else {
    showScreen('setup-screen');
  }
}

main();
