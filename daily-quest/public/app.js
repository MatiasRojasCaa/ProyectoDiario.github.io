/* ═══════════════════════════════════════════════
   DAILY QUEST — Frontend App
═══════════════════════════════════════════════ */

const API = '/api';

const CATEGORIES = {
  salud:         { label:'Salud',         icon:'💚' },
  productividad: { label:'Productividad', icon:'⚡' },
  aprendizaje:   { label:'Aprendizaje',   icon:'📚' },
  personal:      { label:'Personal',      icon:'🌟' },
};

const RANK_NAMES = [
  'Novato','Aprendiz','Guerrero','Veterano','Campeón',
  'Maestro','Gran Maestro','Leyenda','Inmortal','Dios del Tiempo'
];

const ACHIEVEMENTS_DEF = {
  first_quest:  { icon:'🌟', name:'Primeros pasos',    desc:'Completa tu primera misión' },
  streak_3:     { icon:'🔥', name:'En llamas',         desc:'Racha de 3 días consecutivos' },
  streak_7:     { icon:'⚡', name:'Imparable',          desc:'Racha de 7 días consecutivos' },
  streak_30:    { icon:'🌙', name:'Hábito de hierro',  desc:'Racha de 30 días consecutivos' },
  perfect_day:  { icon:'💯', name:'Día perfecto',      desc:'Completa todas las misiones en un día' },
  quests_10:    { icon:'✅', name:'Constante',          desc:'10 misiones completadas en total' },
  quests_50:    { icon:'🏆', name:'Veterano',           desc:'50 misiones completadas' },
  quests_100:   { icon:'💎', name:'Élite',             desc:'100 misiones completadas' },
  level_5:      { icon:'⚔️', name:'Guerrero curtido',  desc:'Llega al nivel 5' },
  level_10:     { icon:'👑', name:'Leyenda',            desc:'Llega al nivel 10' },
};

const DAILY_QUOTES = [
  { text:'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', author:'Robert Collier' },
  { text:'La disciplina es el puente entre metas y logros.', author:'Jim Rohn' },
  { text:'No importa lo lento que vayas, siempre y cuando no te detengas.', author:'Confucio' },
  { text:'La única forma de hacer un gran trabajo es amar lo que haces.', author:'Steve Jobs' },
  { text:'El dolor que sientes hoy será la fuerza que sentirás mañana.', author:'Anónimo' },
  { text:'Cada día es una nueva oportunidad para cambiar tu vida.', author:'Anónimo' },
  { text:'El cuerpo logra lo que la mente cree.', author:'Napoleon Hill' },
  { text:'Primero forma un hábito, luego el hábito te forma a ti.', author:'Jim Ryun' },
  { text:'No hay atajos a ningún lugar que valga la pena ir.', author:'Beverly Sills' },
  { text:'El progreso, no la perfección, es la clave.', author:'Anónimo' },
  { text:'Cada acción que tomas es un voto por el tipo de persona que quieres ser.', author:'James Clear' },
  { text:'El secreto de salir adelante es comenzar.', author:'Mark Twain' },
  { text:'Haz hoy lo que otros no harán y mañana tendrás lo que otros no tienen.', author:'Jerry Rice' },
  { text:'No tienes que ser grande para empezar, pero tienes que empezar para ser grande.', author:'Zig Ziglar' },
  { text:'La motivación te pone en marcha, el hábito te mantiene en movimiento.', author:'Jim Ryun' },
  { text:'Invierte en ti mismo. Tu carrera es el motor de tu riqueza.', author:'Paul Clitheroe' },
  { text:'Un año desde ahora desearás haber empezado hoy.', author:'Karen Lamb' },
  { text:'El éxito no es definitivo, el fracaso no es fatal. Lo que cuenta es el coraje de continuar.', author:'Churchill' },
  { text:'No cuentes los días, haz que los días cuenten.', author:'Muhammad Ali' },
  { text:'Cree que puedes y ya estás a mitad del camino.', author:'Theodore Roosevelt' },
];

/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let state = {
  token:        null,
  profile:      null,
  completions:  [],
  quests:       [],
  soundEnabled: true,
  currentView:  'quests',
};

/* ═══════════════════════════════════════════════
   API
═══════════════════════════════════════════════ */
async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(API + path, { ...opts, headers: { ...headers, ...(opts.headers||{}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

/* ═══════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════ */
function saveToken(t)  { state.token = t; localStorage.setItem('dq_token', t); }
function loadToken()   { state.token = localStorage.getItem('dq_token'); return !!state.token; }
function clearToken()  { state.token = null; localStorage.removeItem('dq_token'); }

async function login(username, password) {
  const d = await apiFetch('/auth/login', { method:'POST', body: JSON.stringify({ username, password }) });
  saveToken(d.token);
}
async function register(username, password, displayName) {
  const d = await apiFetch('/auth/register', { method:'POST', body: JSON.stringify({ username, password, displayName }) });
  saveToken(d.token);
}
async function loadProfile()          { state.profile = await apiFetch('/profile'); }
async function loadCompletions()      { const d = await apiFetch('/quests/today'); state.completions = d.completed.map(String); }
async function loadQuestDefinitions() { const d = await apiFetch('/quests/definitions'); state.quests = d.quests.map(q=>({...q, id:String(q.id)})); }

/* ═══════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════ */
function applyTheme(hue, isDark) {
  document.documentElement.style.setProperty('--h', hue);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}
async function saveTheme(hue, isDark) {
  applyTheme(hue, isDark);
  await apiFetch('/profile/theme', { method:'PATCH', body: JSON.stringify({ hue, isDark }) });
  if (state.profile?.theme) { state.profile.theme.hue = hue; state.profile.theme.isDark = isDark; }
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function getRank(level) { return RANK_NAMES[Math.min(level-1, RANK_NAMES.length-1)]; }
function getTodayXP()   { return state.quests.filter(q=>state.completions.includes(q.id)).reduce((s,q)=>s+q.xp, 0); }

const $ = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(id).classList.remove('hidden');
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
  const t = $(`view-${viewId}`);
  t.classList.remove('hidden'); t.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-view="${viewId}"]`)?.classList.add('active');
  state.currentView = viewId;
  closeSidebar();
  if (viewId === 'quests')   renderQuests();
  if (viewId === 'stats')    renderStats();
  if (viewId === 'settings') renderSettings();
}

function openSidebar()  { $('sidebar').classList.add('open'); $('sidebar-overlay').classList.add('show'); }
function closeSidebar() { $('sidebar').classList.remove('open'); $('sidebar-overlay').classList.remove('show'); }

/* ═══════════════════════════════════════════════
   AVATAR HELPERS
═══════════════════════════════════════════════ */
function getAvatarInitial() { return (state.profile?.displayName?.[0] || '?').toUpperCase(); }

function setAvatarEl(el, avatarUrl) {
  if (avatarUrl) {
    el.style.backgroundImage = `url(${avatarUrl})`;
    el.style.backgroundSize  = 'cover';
    el.style.backgroundPosition = 'center';
    el.textContent = '';
  } else {
    el.style.backgroundImage = '';
    el.textContent = getAvatarInitial();
  }
}

function resizeToBase64(file, size = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = e => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        const side = Math.min(img.width, img.height);
        const sx = (img.width  - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ═══════════════════════════════════════════════
   SOUNDS (Web Audio API)
═══════════════════════════════════════════════ */
function playQuestSound() {
  if (!state.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[523, 0], [659, 0.08], [784, 0.16]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.14, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    });
  } catch {}
}

function playLevelUpSound() {
  if (!state.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[523,0],[659,0.1],[784,0.2],[1047,0.32]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.5);
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
      const p = el('div', 'confetti-piece');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size  = 6 + Math.random() * 9;
      const dur   = 1.6 + Math.random() * 2;
      const delay = Math.random() * 0.4;
      p.style.cssText = `
        left:${Math.random()*100}vw;
        background:${color};
        width:${size}px; height:${size}px;
        border-radius:${Math.random()>.5?'50%':'3px'};
        animation:confettiFall ${dur}s ${delay}s ease-in forwards;
        transform:rotate(${Math.random()*360}deg);`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), (dur + delay) * 1000 + 200);
    }, i * 18);
  }
}

/* ═══════════════════════════════════════════════
   ACHIEVEMENT TOAST
═══════════════════════════════════════════════ */
function showAchievementToast(id) {
  const def = ACHIEVEMENTS_DEF[id];
  if (!def) return;
  const t = el('div', 'toast toast--achievement');
  t.innerHTML = `
    <span class="toast-ach-ico">${def.icon}</span>
    <div>
      <p class="toast-ach-name">¡Logro desbloqueado!</p>
      <p class="toast-ach-title">${def.name}</p>
    </div>`;
  $('toasts').appendChild(t);
  setTimeout(() => { t.style.animation='toastOut .3s ease forwards'; setTimeout(()=>t.remove(),300); }, 4500);
}

/* ═══════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════ */
function renderSidebar() {
  const { profile } = state;
  if (!profile) return;
  const { stats, level, displayName, avatar } = profile;
  const rank = getRank(level.level);

  $('sidebar-name').textContent       = displayName;
  $('sidebar-level-text').textContent = `Nivel ${level.level} · ${rank}`;
  $('mobile-level-chip').textContent  = `Nv.${level.level}`;
  setAvatarEl($('sidebar-avatar'), avatar);

  const pct = level.xpForNextLevel > 0
    ? Math.round((level.xpIntoLevel / level.xpForNextLevel) * 100) : 100;
  $('xp-bar-fill').style.width = pct + '%';
  $('xp-bar-glow').style.width = pct + '%';
  $('xp-label-text').textContent = `${level.xpIntoLevel} / ${level.xpForNextLevel}`;
  $('q-streak').textContent = stats.streak;
  $('q-xp').textContent     = stats.totalXP.toLocaleString();
  $('q-days').textContent   = stats.daysActive;
}

/* ═══════════════════════════════════════════════
   DAILY QUOTE
═══════════════════════════════════════════════ */
async function renderQuoteCard() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
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
  } catch { /* sin internet → mantiene el fallback local */ }
}

/* ═══════════════════════════════════════════════
   QUESTS VIEW
═══════════════════════════════════════════════ */
function renderQuests() {
  const grid = $('quests-grid');
  const d = new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  $('today-date-label').textContent = d.charAt(0).toUpperCase() + d.slice(1);
  renderQuoteCard(); // async, no bloqueante — se actualiza sola

  if (state.quests.length === 0) {
    grid.innerHTML = `<div class="empty-quests">
      <div class="empty-quests__icon">📋</div>
      <h3 class="empty-quests__title">No tienes misiones aún</h3>
      <p class="empty-quests__sub">Crea tus propias misiones y empieza a ganar XP</p>
      <button class="btn btn--primary" id="create-first-btn">✨ Crear primera misión</button>
    </div>`;
    $('create-first-btn').addEventListener('click', showCreateModal);
    updateSummaryCard();
    return;
  }

  const groups = {};
  for (const q of state.quests) { if (!groups[q.category]) groups[q.category]=[]; groups[q.category].push(q); }

  grid.innerHTML = '';
  for (const [cat, quests] of Object.entries(groups)) {
    const catInfo   = CATEGORIES[cat] || { label:cat, icon:'⭐' };
    const completed = quests.filter(q=>state.completions.includes(q.id)).length;
    const block = el('div', `category-block cat--${cat}`);
    block.innerHTML = `
      <div class="category-header">
        <div class="category-header__left">
          <div class="category-icon">${catInfo.icon}</div>
          <span class="category-name">${catInfo.label}</span>
          <span class="category-progress">${completed}/${quests.length}</span>
        </div>
        <span class="category-done-badge${completed===quests.length?' show':''}">¡Completo!</span>
      </div>
      <div class="quest-list"></div>`;
    const list = block.querySelector('.quest-list');
    for (const q of quests) list.appendChild(makeQuestItem(q));
    grid.appendChild(block);
  }
  updateSummaryCard();
}

function makeQuestItem(quest) {
  const done = state.completions.includes(quest.id);
  const item = el('div', `quest-item${done?' done':''}`);
  item.dataset.id = quest.id;
  item.innerHTML = `
    <div class="quest-check${done?' checked':''}"><span class="quest-check__mark">✓</span></div>
    <div class="quest-info"><p class="quest-name">${quest.name}</p></div>
    <span class="xp-badge">+${quest.xp} XP</span>
    <button class="quest-del-btn" title="Eliminar misión">🗑️</button>`;
  item.querySelector('.quest-check').addEventListener('click', () => toggleQuest(quest, item));
  item.querySelector('.quest-info').addEventListener('click',  () => toggleQuest(quest, item));
  item.querySelector('.xp-badge').addEventListener('click',    () => toggleQuest(quest, item));
  item.querySelector('.quest-del-btn').addEventListener('click', e => { e.stopPropagation(); deleteQuest(quest.id, quest.name); });
  return item;
}

function updateSummaryCard() {
  const total     = state.quests.length;
  const completed = state.quests.filter(q=>state.completions.includes(q.id)).length;
  const todayXP   = getTodayXP();
  const pct       = total>0 ? Math.round((completed/total)*100) : 0;
  $('daily-xp-count').textContent = todayXP.toLocaleString();
  $('progress-badge').textContent = `${completed} / ${total}`;
  $('donut-pct').textContent      = pct + '%';
  $('donut-ring').setAttribute('stroke-dasharray', `${pct} ${100-pct}`);
}

/* ═══════════════════════════════════════════════
   TOGGLE QUEST
═══════════════════════════════════════════════ */
async function toggleQuest(quest, itemEl) {
  const wasDone = state.completions.includes(quest.id);
  const checkEl = itemEl.querySelector('.quest-check');

  if (!wasDone) {
    state.completions.push(quest.id);
    itemEl.classList.add('done'); checkEl.classList.add('checked');
    spawnXPFloat(itemEl, quest.xp);
    playQuestSound();
  } else {
    state.completions = state.completions.filter(id=>id!==quest.id);
    itemEl.classList.remove('done'); checkEl.classList.remove('checked');
  }

  const cat = quest.category;
  const catBlock = itemEl.closest(`.cat--${cat}`);
  if (catBlock) {
    const catQuests    = state.quests.filter(q=>q.category===cat);
    const completedCat = catQuests.filter(q=>state.completions.includes(q.id)).length;
    catBlock.querySelector('.category-done-badge')?.classList.toggle('show', completedCat===catQuests.length);
    if (catBlock.querySelector('.category-progress')) catBlock.querySelector('.category-progress').textContent=`${completedCat}/${catQuests.length}`;
  }
  updateSummaryCard();

  try {
    const res = await apiFetch('/quests/toggle', { method:'POST', body: JSON.stringify({ questId: quest.id }) });
    state.profile.stats = { ...state.profile.stats, ...res.stats };
    state.profile.level = res.level;
    renderSidebar();

    if (res.leveledUp)    { showLevelUp(res.leveledUp); playLevelUpSound(); }
    if (res.allDoneToday) { triggerConfetti(); showToast('¡Todas las misiones completadas! 🎉', 'success', '🏆'); }
    if (res.completed)    showToast(`+${quest.xp} XP — ${quest.name}`, 'xp', '⭐');

    if (res.newAchievements?.length) {
      res.newAchievements.forEach((id, i) => setTimeout(() => showAchievementToast(id), i * 1200));
    }
  } catch {
    if (!wasDone) { state.completions=state.completions.filter(id=>id!==quest.id); itemEl.classList.remove('done'); checkEl.classList.remove('checked'); }
    else          { state.completions.push(quest.id); itemEl.classList.add('done'); checkEl.classList.add('checked'); }
    updateSummaryCard();
    showToast('Error al guardar', 'info', '⚠️');
  }
}

/* ═══════════════════════════════════════════════
   CREATE QUEST MODAL
═══════════════════════════════════════════════ */
function showCreateModal() {
  $('create-quest-form').reset();
  $('cq-error').classList.add('hidden');
  document.querySelectorAll('.cq-cat').forEach((b,i)=>b.classList.toggle('active',i===0));
  document.querySelectorAll('.cq-xp').forEach((b,i)=>b.classList.toggle('active',i===1));
  $('create-quest-bg').classList.remove('hidden');
  setTimeout(()=>$('cq-name').focus(), 100);
}
function hideCreateModal() { $('create-quest-bg').classList.add('hidden'); }

async function submitCreateQuest(e) {
  e.preventDefault();
  const errEl = $('cq-error');
  errEl.classList.add('hidden');
  const name = $('cq-name').value.trim();
  const cat  = document.querySelector('.cq-cat.active')?.dataset.cat || 'personal';
  const xp   = parseInt(document.querySelector('.cq-xp.active')?.dataset.xp || '20');
  if (!name) { errEl.textContent='Escribe un nombre para la misión'; errEl.classList.remove('hidden'); return; }
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Creando...'; btn.disabled = true;
  try {
    const data = await apiFetch('/quests/definitions', { method:'POST', body: JSON.stringify({ name, category:cat, xp }) });
    state.quests.push({ ...data.quest, id:String(data.quest.id) });
    hideCreateModal();
    renderQuests();
    showToast(`Misión creada: ${name}`, 'success', '⚔️');
  } catch (err) { errEl.textContent=err.message; errEl.classList.remove('hidden'); }
  finally { btn.innerHTML='Crear misión ⚔️'; btn.disabled=false; }
}

/* ═══════════════════════════════════════════════
   DELETE QUEST
═══════════════════════════════════════════════ */
async function deleteQuest(questId, questName) {
  if (!confirm(`¿Eliminar la misión "${questName}"?`)) return;
  try {
    await apiFetch(`/quests/definitions/${questId}`, { method:'DELETE' });
    state.quests      = state.quests.filter(q=>q.id!==questId);
    state.completions = state.completions.filter(id=>id!==questId);
    renderQuests();
    showToast('Misión eliminada', 'remove', '🗑️');
  } catch (err) { showToast(err.message,'info','⚠️'); }
}

/* ═══════════════════════════════════════════════
   STATS VIEW
═══════════════════════════════════════════════ */
async function renderStats() {
  const [statsData, weekData, achData] = await Promise.all([
    apiFetch('/stats').catch(()=>null),
    apiFetch('/stats/weekly').catch(()=>null),
    apiFetch('/achievements').catch(()=>null),
  ]);

  if (statsData) {
    const { stats, level, activity } = statsData;
    const rank = getRank(level.level);
    $('s-level').textContent  = level.level;
    $('s-xp').textContent     = stats.totalXP.toLocaleString();
    $('s-streak').textContent = stats.streak;
    $('s-best').textContent   = stats.bestStreak;
    $('s-days').textContent   = stats.daysActive;
    $('s-done').textContent   = stats.questsDone;
    $('s-level-chip').textContent = `Nv. ${level.level}`;
    $('s-rank').textContent   = rank;
    $('s-next').textContent   = `→ Nv. ${level.level+1}`;
    const pct = level.xpForNextLevel>0 ? Math.round((level.xpIntoLevel/level.xpForNextLevel)*100) : 100;
    $('s-xp-fill').style.width = pct+'%';
    $('s-xp-glow').style.width = pct+'%';
    $('s-xp-curr').textContent   = `${level.xpIntoLevel} XP`;
    $('s-xp-needed').textContent = `${level.xpForNextLevel} XP para el siguiente nivel`;

    const list = $('activity-list');
    list.innerHTML = !activity.length
      ? '<p class="empty-msg">Nada aún. ¡Completa tus primeras misiones!</p>'
      : activity.map(a => {
          const date = new Date(a.ts).toLocaleString('es-ES',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
          return `<div class="activity-item"><span>📌</span><span style="flex:1">${a.message}</span>${a.xp>0?`<span class="activity-item__xp">+${a.xp} XP</span>`:''}<span class="activity-item__time">${date}</span></div>`;
        }).join('');
  }

  // Gráfico semanal
  if (weekData) {
    const max = Math.max(...weekData.days.map(d=>d.xp), 1);
    $('week-chart').innerHTML = weekData.days.map(d => {
      const h = Math.round((d.xp / max) * 100);
      const isToday = d.date === new Date().toISOString().slice(0,10);
      return `<div class="week-col${isToday?' week-col--today':''}">
        <span class="week-xp-num">${d.xp>0?d.xp:''}</span>
        <div class="week-bar-wrap"><div class="week-bar" style="height:${h}%"></div></div>
        <span class="week-label">${d.label}</span>
      </div>`;
    }).join('');
  }

  // Logros
  if (achData) {
    const unlockedIds = new Set(achData.achievements.map(a=>a.achievement_id));
    const grid = $('achievements-grid');
    const all = Object.entries(ACHIEVEMENTS_DEF);
    if (!unlockedIds.size) {
      grid.innerHTML = '<p class="empty-msg">Completa misiones para desbloquear logros.</p>';
    } else {
      grid.innerHTML = all.map(([id, def]) => {
        const unlocked = unlockedIds.has(id);
        return `<div class="ach-card${unlocked?'':' ach-card--locked'}" title="${def.desc}">
          <div class="ach-card__icon">${def.icon}</div>
          <p class="ach-card__name">${def.name}</p>
          <p class="ach-card__desc">${def.desc}</p>
          ${unlocked?'<span class="ach-unlocked">✓</span>':''}
        </div>`;
      }).join('');
    }
  }
}

/* ═══════════════════════════════════════════════
   SETTINGS VIEW
═══════════════════════════════════════════════ */
const COLOR_PRESETS = [
  {name:'Púrpura',hue:260},{name:'Azul',hue:220},{name:'Cian',hue:185},{name:'Verde',hue:140},
  {name:'Naranja',hue:30},{name:'Rosa',hue:330},{name:'Rojo',hue:0},{name:'Amarillo',hue:55},
];

function renderSettings() {
  const { theme, displayName, avatar, sound } = state.profile;
  $('settings-name').value        = displayName;
  $('hue-slider').value           = theme.hue;
  $('dark-mode-toggle').checked   = theme.isDark;
  $('sound-toggle').checked       = sound !== false;
  state.soundEnabled              = sound !== false;
  updateHueDot(theme.hue);
  setAvatarEl($('settings-avatar'), avatar);

  const container = $('color-presets');
  container.innerHTML = '';
  for (const p of COLOR_PRESETS) {
    const dot = el('button', 'color-preset');
    dot.style.background = `hsl(${p.hue},75%,58%)`;
    dot.title = p.name;
    if (p.hue === theme.hue) dot.classList.add('active');
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-preset').forEach(d=>d.classList.remove('active'));
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
  const rank = getRank(newLevel);
  $('levelup-num').textContent  = `Nivel ${newLevel}`;
  $('levelup-rank').textContent = rank;
  const particles = $('levelup-particles');
  particles.innerHTML = '';
  for (let i=0; i<20; i++) {
    const p = el('div','particle');
    const angle = (i/20)*Math.PI*2;
    const dist  = 80 + Math.random()*120;
    p.style.cssText = `left:50%;top:50%;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;background:hsl(${Math.random()*360},80%,65%);animation-delay:${Math.random()*.3}s;`;
    particles.appendChild(p);
  }
  $('levelup-bg').classList.remove('hidden');
}

/* ═══════════════════════════════════════════════
   TOASTS
═══════════════════════════════════════════════ */
function showToast(msg, type='info', icon='ℹ️') {
  const t = el('div', `toast toast--${type}`);
  t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  $('toasts').appendChild(t);
  setTimeout(() => { t.style.animation='toastOut .3s ease forwards'; setTimeout(()=>t.remove(),300); }, 3200);
}

function spawnXPFloat(el, xp) {
  const rect  = el.getBoundingClientRect();
  const label = document.createElement('div');
  label.className = 'xp-float';
  label.textContent = `+${xp} XP`;
  label.style.left = `${rect.left + rect.width/2 - 20}px`;
  label.style.top  = `${rect.top  + rect.height/2}px`;
  document.body.appendChild(label);
  setTimeout(()=>label.remove(), 1200);
}

/* ═══════════════════════════════════════════════
   EVENTS
═══════════════════════════════════════════════ */
function bindEvents() {

  /* AUTH */
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('active'));
      tab.classList.add('active');
      $(`${tab.dataset.tab}-form`).classList.add('active');
    });
  });

  $('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('login-error'); err.classList.add('hidden');
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent='Cargando...'; btn.disabled=true;
    try { await login($('login-username').value.trim(), $('login-password').value); await initApp(); }
    catch(ex) { err.textContent=ex.message; err.classList.remove('hidden'); }
    finally { btn.innerHTML='<span>🗡️</span> Entrar al mundo'; btn.disabled=false; }
  });

  $('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('register-error'); err.classList.add('hidden');
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent='Creando cuenta...'; btn.disabled=true;
    try { await register($('register-username').value.trim(), $('register-password').value, $('register-name').value.trim()); await initApp(); }
    catch(ex) { err.textContent=ex.message; err.classList.remove('hidden'); }
    finally { btn.innerHTML='<span>🌟</span> Comenzar aventura'; btn.disabled=false; }
  });

  /* NAV */
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', ()=>showView(btn.dataset.view)));
  $('mobile-menu-btn').addEventListener('click', openSidebar);
  $('sidebar-close').addEventListener('click',   closeSidebar);
  $('sidebar-overlay').addEventListener('click', closeSidebar);
  $('logout-btn').addEventListener('click', () => {
    clearToken(); state.profile=null; state.completions=[]; state.quests=[];
    showScreen('auth-screen');
  });

  /* LEVEL UP */
  $('levelup-close').addEventListener('click', ()=>$('levelup-bg').classList.add('hidden'));

  /* CREATE QUEST */
  $('new-quest-btn').addEventListener('click', showCreateModal);
  $('cq-x-btn').addEventListener('click',      hideCreateModal);
  $('cq-cancel-btn').addEventListener('click', hideCreateModal);
  $('create-quest-bg').addEventListener('click', e => { if(e.target===$('create-quest-bg')) hideCreateModal(); });
  document.querySelectorAll('.cq-cat').forEach(btn => btn.addEventListener('click', ()=>{ document.querySelectorAll('.cq-cat').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }));
  document.querySelectorAll('.cq-xp').forEach(btn  => btn.addEventListener('click', ()=>{ document.querySelectorAll('.cq-xp').forEach(b=>b.classList.remove('active'));  btn.classList.add('active'); }));
  $('create-quest-form').addEventListener('submit', submitCreateQuest);

  /* AVATAR */
  $('change-avatar-btn').addEventListener('click', ()=>$('avatar-file-input').click());
  $('avatar-file-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8*1024*1024) { showToast('La imagen es demasiado grande (máx 8MB)','info','⚠️'); return; }
    try {
      const b64 = await resizeToBase64(file, 200);
      await apiFetch('/profile/avatar', { method:'PATCH', body: JSON.stringify({ avatar: b64 }) });
      state.profile.avatar = b64;
      setAvatarEl($('sidebar-avatar'), b64);
      setAvatarEl($('settings-avatar'), b64);
      showToast('Foto de perfil actualizada', 'success', '📷');
    } catch(ex) { showToast(ex.message,'info','⚠️'); }
    e.target.value = '';
  });
  $('remove-avatar-btn').addEventListener('click', async () => {
    try {
      await apiFetch('/profile/avatar', { method:'DELETE' });
      state.profile.avatar = null;
      setAvatarEl($('sidebar-avatar'), null);
      setAvatarEl($('settings-avatar'), null);
      showToast('Foto de perfil eliminada', 'remove', '🗑️');
    } catch(ex) { showToast(ex.message,'info','⚠️'); }
  });

  /* THEME */
  $('hue-slider').addEventListener('input', e => {
    const hue = parseInt(e.target.value);
    updateHueDot(hue); applyTheme(hue, $('dark-mode-toggle').checked);
    document.querySelectorAll('.color-preset').forEach(d=>d.classList.remove('active'));
  });
  $('hue-slider').addEventListener('change', e => saveTheme(parseInt(e.target.value), $('dark-mode-toggle').checked));
  $('dark-mode-toggle').addEventListener('change', e => saveTheme(parseInt($('hue-slider').value), e.target.checked));

  /* SOUND */
  $('sound-toggle').addEventListener('change', async e => {
    state.soundEnabled = e.target.checked;
    await apiFetch('/profile/sound', { method:'PATCH', body: JSON.stringify({ enabled: e.target.checked }) });
    if (e.target.checked) playQuestSound();
  });

  /* SAVE NAME */
  $('save-name-btn').addEventListener('click', async () => {
    const name = $('settings-name').value.trim();
    if (!name) return;
    try {
      await apiFetch('/profile/name', { method:'PATCH', body: JSON.stringify({ displayName: name }) });
      state.profile.displayName = name;
      renderSidebar();
      showToast('Nombre actualizado', 'success', '✅');
    } catch(ex) { showToast(ex.message,'info','⚠️'); }
  });

  /* RESET */
  $('reset-btn').addEventListener('click', async () => {
    if (!confirm('¿Seguro? Esto borra TODO tu progreso permanentemente.')) return;
    try {
      await apiFetch('/reset', { method:'POST' });
      await loadProfile(); await loadCompletions();
      renderSidebar(); renderQuests();
      showToast('Progreso reiniciado','info','🔄');
    } catch(ex) { showToast(ex.message,'info','⚠️'); }
  });
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
async function initApp() {
  try {
    await Promise.all([loadProfile(), loadQuestDefinitions(), loadCompletions()]);
  } catch {
    clearToken(); showScreen('auth-screen'); return;
  }
  const { theme, sound } = state.profile;
  state.soundEnabled = sound !== false;
  applyTheme(theme.hue, theme.isDark);
  renderSidebar();
  showView('quests');
  showScreen('app-screen');
}

async function main() {
  bindEvents();
  if (loadToken()) { showScreen('auth-screen'); await initApp(); }
  else showScreen('auth-screen');
}

main();
