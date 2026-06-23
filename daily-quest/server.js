const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const cors     = require('cors');
const path     = require('path');
const https    = require('https');
const db       = require('./database');

const app    = express();
const PORT   = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'dq_super_secret_key_2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── Auth middleware ───────────────────────────────────── */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/* ── Helpers ───────────────────────────────────────────── */
function today() {
  return new Date().toISOString().slice(0, 10);
}

function checkAchievements(userId, stats, level, allDoneToday) {
  const defs = [
    { id: 'first_quest',  ok: stats.quests_done >= 1 },
    { id: 'streak_3',     ok: stats.streak >= 3 },
    { id: 'streak_7',     ok: stats.streak >= 7 },
    { id: 'streak_30',    ok: stats.streak >= 30 },
    { id: 'perfect_day',  ok: allDoneToday },
    { id: 'quests_10',    ok: stats.quests_done >= 10 },
    { id: 'quests_50',    ok: stats.quests_done >= 50 },
    { id: 'quests_100',   ok: stats.quests_done >= 100 },
    { id: 'level_5',      ok: level >= 5 },
    { id: 'level_10',     ok: level >= 10 },
  ];
  const unlocked = [];
  for (const d of defs) {
    if (d.ok && !db.hasAchievement(userId, d.id)) {
      db.unlockAchievement(userId, d.id);
      unlocked.push(d.id);
    }
  }
  return unlocked;
}

function calcLevel(totalXP) {
  let level = 1;
  let xpNeeded = 100;
  let accumulated = 0;
  while (accumulated + xpNeeded <= totalXP) {
    accumulated += xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.2);
  }
  return {
    level,
    xpIntoLevel: totalXP - accumulated,
    xpForNextLevel: xpNeeded,
    accumulated
  };
}

/* ── AUTH ROUTES ───────────────────────────────────────── */

// Registro
app.post('/api/auth/register', async (req, res) => {
  const { username, password, displayName } = req.body;

  if (!username || !password || !displayName) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'El usuario debe tener 3-20 caracteres' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Usuario solo puede tener letras, números y _' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
  }

  const existing = db.getUserByUsername(username);
  if (existing) return res.status(409).json({ error: 'Ese usuario ya existe' });

  const hash   = await bcrypt.hash(password, 10);
  const userId = db.registerUser(username, hash, displayName.trim().slice(0, 30));
  const token  = jwt.sign({ userId, username }, SECRET, { expiresIn: '30d' });

  res.json({ token, message: '¡Bienvenido al mundo!' });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  const user = db.getUserByUsername(username);
  if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

  const token = jwt.sign({ userId: user.id, username: user.username }, SECRET, { expiresIn: '30d' });
  res.json({ token, message: 'Bienvenido de vuelta' });
});

/* ── PROFILE ROUTES ────────────────────────────────────── */

// Obtener perfil completo
app.get('/api/profile', requireAuth, (req, res) => {
  const profile = db.getFullProfile(req.user.userId);
  if (!profile) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { user, stats, theme } = profile;
  const lvl = calcLevel(stats.total_xp);
  const dateToday = today();

  // Verificar si hay que reiniciar la racha
  let updatedStats = { ...stats };
  if (stats.last_active_date && stats.last_active_date < dateToday) {
    const last = new Date(stats.last_active_date);
    const now  = new Date(dateToday);
    const diff = Math.floor((now - last) / 86400000);
    if (diff > 1) {
      updatedStats.streak = 0;
      db.updateStats(req.user.userId, updatedStats);
    }
  }

  const extras = db.getExtras(req.user.userId);

  res.json({
    username: user.username,
    displayName: user.display_name,
    avatar: extras?.avatar || null,
    sound:  extras ? extras.sound === 1 : true,
    stats: {
      totalXP:       updatedStats.total_xp,
      streak:        updatedStats.streak,
      bestStreak:    updatedStats.best_streak,
      daysActive:    updatedStats.days_active,
      questsDone:    updatedStats.quests_done,
      lastActiveDate: updatedStats.last_active_date,
      lastResetDate:  updatedStats.last_reset_date,
    },
    level: lvl,
    theme: {
      hue:    theme.hue,
      isDark: theme.is_dark === 1
    }
  });
});

// Actualizar nombre
app.patch('/api/profile/name', requireAuth, (req, res) => {
  const { displayName } = req.body;
  if (!displayName || displayName.trim().length < 1) {
    return res.status(400).json({ error: 'Nombre inválido' });
  }
  db.updateDisplayName(req.user.userId, displayName.trim().slice(0, 30));
  res.json({ message: 'Nombre actualizado' });
});

// Subir avatar (base64)
app.patch('/api/profile/avatar', requireAuth, (req, res) => {
  const { avatar } = req.body;
  if (!avatar) return res.status(400).json({ error: 'avatar requerido' });
  if (!avatar.startsWith('data:image/')) return res.status(400).json({ error: 'Formato inválido' });
  if (Buffer.byteLength(avatar, 'utf8') > 300 * 1024) return res.status(400).json({ error: 'Imagen demasiado grande (máx 300KB)' });
  db.setAvatar(req.user.userId, avatar);
  res.json({ message: 'Avatar actualizado' });
});

// Quitar avatar
app.delete('/api/profile/avatar', requireAuth, (req, res) => {
  db.setAvatar(req.user.userId, null);
  res.json({ message: 'Avatar eliminado' });
});

// Guardar preferencia de sonido
app.patch('/api/profile/sound', requireAuth, (req, res) => {
  const { enabled } = req.body;
  db.setSound(req.user.userId, !!enabled);
  res.json({ message: 'Preferencia guardada' });
});

// Actualizar tema
app.patch('/api/profile/theme', requireAuth, (req, res) => {
  const { hue, isDark } = req.body;
  if (hue === undefined || isDark === undefined) {
    return res.status(400).json({ error: 'hue e isDark requeridos' });
  }
  db.updateTheme(req.user.userId, Math.max(0, Math.min(360, parseInt(hue))), isDark);
  res.json({ message: 'Tema actualizado' });
});

/* ── QUEST DEFINITION ROUTES ────────────────────────────── */

// Listar misiones del usuario
app.get('/api/quests/definitions', requireAuth, (req, res) => {
  const quests = db.getUserQuests(req.user.userId);
  res.json({ quests });
});

// Crear misión
app.post('/api/quests/definitions', requireAuth, (req, res) => {
  const { name, category, xp } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nombre requerido' });

  const validCats = ['salud', 'productividad', 'aprendizaje', 'personal'];
  const cat = validCats.includes(category) ? category : 'personal';
  const xpVal = Math.max(5, Math.min(200, parseInt(xp) || 20));

  const id = db.createQuest(req.user.userId, name.trim().slice(0, 80), cat, xpVal);
  res.json({ quest: { id, name: name.trim(), category: cat, xp: xpVal } });
});

// Eliminar misión
app.delete('/api/quests/definitions/:id', requireAuth, (req, res) => {
  const questId = parseInt(req.params.id);
  if (!questId) return res.status(400).json({ error: 'ID inválido' });
  db.deleteQuest(req.user.userId, questId);
  res.json({ message: 'Misión eliminada' });
});

/* ── QUEST COMPLETION ROUTES ────────────────────────────── */

// Obtener completados de hoy
app.get('/api/quests/today', requireAuth, (req, res) => {
  const completed = db.getCompletionsForDate(req.user.userId, today());
  res.json({ date: today(), completed });
});

// Completar o descompletar quest
app.post('/api/quests/toggle', requireAuth, (req, res) => {
  const { questId } = req.body;
  if (!questId) return res.status(400).json({ error: 'questId requerido' });

  const questDef = db.getQuestById(req.user.userId, parseInt(questId));
  if (!questDef) return res.status(404).json({ error: 'Misión no encontrada' });
  const xp = questDef.xp;

  const dateToday    = today();
  const completions  = db.getCompletionsForDate(req.user.userId, dateToday);
  const wasCompleted = completions.includes(questId);
  const profile      = db.getFullProfile(req.user.userId);
  const stats        = { ...profile.stats };

  let xpDelta   = 0;
  let leveledUp = null;
  const oldLevel = calcLevel(stats.total_xp).level;

  if (!wasCompleted) {
    db.addCompletion(req.user.userId, questId, dateToday, xp);
    stats.total_xp   += xp;
    stats.quests_done += 1;
    xpDelta = xp;

    if (stats.last_active_date !== dateToday) {
      const last = stats.last_active_date;
      if (last) {
        const diff = Math.floor((new Date(dateToday) - new Date(last)) / 86400000);
        stats.streak = diff === 1 ? stats.streak + 1 : 1;
      } else {
        stats.streak = 1;
      }
      stats.days_active += 1;
      stats.last_active_date = dateToday;
    }
    if (stats.streak > stats.best_streak) stats.best_streak = stats.streak;

    const newLevel = calcLevel(stats.total_xp).level;
    if (newLevel > oldLevel) leveledUp = newLevel;

    db.addLog(req.user.userId, `${questDef.name} — +${xp} XP`, xp);
  } else {
    db.removeCompletion(req.user.userId, questId, dateToday);
    stats.total_xp    = Math.max(0, stats.total_xp - xp);
    stats.quests_done = Math.max(0, stats.quests_done - 1);
    xpDelta = -xp;
  }

  // Verificar si completó todas las misiones hoy (solo al completar)
  let allDoneToday = false;
  if (!wasCompleted) {
    const totalQ    = db.getUserQuests(req.user.userId).length;
    const doneToday = db.getCompletionsForDate(req.user.userId, dateToday).length;
    allDoneToday = totalQ > 0 && doneToday >= totalQ;
  }

  // Verificar logros (solo al completar)
  const newAchievements = !wasCompleted
    ? checkAchievements(req.user.userId, stats, calcLevel(stats.total_xp).level, allDoneToday)
    : [];

  stats.last_reset_date = stats.last_reset_date || dateToday;
  db.updateStats(req.user.userId, stats);

  const lvl = calcLevel(stats.total_xp);
  res.json({
    completed: !wasCompleted,
    xpDelta,
    leveledUp,
    allDoneToday,
    newAchievements,
    stats: {
      totalXP:    stats.total_xp,
      streak:     stats.streak,
      bestStreak: stats.best_streak,
      daysActive: stats.days_active,
      questsDone: stats.quests_done,
    },
    level: lvl
  });
});

/* ── STATS & ACTIVITY ───────────────────────────────────── */

app.get('/api/stats', requireAuth, (req, res) => {
  const profile = db.getFullProfile(req.user.userId);
  if (!profile) return res.status(404).json({ error: 'No encontrado' });

  const lvl      = calcLevel(profile.stats.total_xp);
  const activity = db.getRecentLog(req.user.userId);

  res.json({
    stats: {
      totalXP:    profile.stats.total_xp,
      streak:     profile.stats.streak,
      bestStreak: profile.stats.best_streak,
      daysActive: profile.stats.days_active,
      questsDone: profile.stats.quests_done,
    },
    level: lvl,
    activity
  });
});

/* ── ACHIEVEMENTS ────────────────────────────────────────── */

app.get('/api/achievements', requireAuth, (req, res) => {
  const rows = db.getAchievements(req.user.userId);
  res.json({ achievements: rows });
});

/* ── WEEKLY STATS ────────────────────────────────────────── */

app.get('/api/stats/weekly', requireAuth, (req, res) => {
  const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const xp      = db.getDailyXP(req.user.userId, dateStr);
    days.push({ date: dateStr, label: DAY_NAMES[d.getDay()], xp });
  }
  res.json({ days });
});

/* ── RESET PROGRESS ─────────────────────────────────────── */

app.post('/api/reset', requireAuth, (req, res) => {
  db.resetProgress(req.user.userId);
  res.json({ message: 'Progreso reiniciado' });
});

/* ── DAILY QUOTE (ZenQuotes proxy) ───────────────────────── */

const quoteCache = { date: null, quote: null };

function fetchZenQuote() {
  return new Promise((resolve, reject) => {
    https.get('https://zenquotes.io/api/today', { timeout: 5000 }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const item = Array.isArray(parsed) ? parsed[0] : parsed;
          if (item && item.q) {
            resolve({ text: item.q, author: item.a || 'Anónimo' });
          } else {
            reject(new Error('Respuesta inesperada'));
          }
        } catch { reject(new Error('JSON inválido')); }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
}

app.get('/api/quote', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  if (quoteCache.date === today && quoteCache.quote) {
    return res.json(quoteCache.quote);
  }
  try {
    const quote = await fetchZenQuote();
    quoteCache.date  = today;
    quoteCache.quote = quote;
    res.json(quote);
  } catch (err) {
    res.status(503).json({ error: 'No se pudo obtener la cita', detail: err.message });
  }
});

/* ── SPA fallback ───────────────────────────────────────── */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n⚔️  Daily Quest corriendo en http://localhost:${PORT}\n`);
});
