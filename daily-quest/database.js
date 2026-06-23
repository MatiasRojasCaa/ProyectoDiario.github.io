const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'dailyquest.db');

const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password   TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_stats (
    user_id      INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_xp     INTEGER NOT NULL DEFAULT 0,
    streak       INTEGER NOT NULL DEFAULT 0,
    best_streak  INTEGER NOT NULL DEFAULT 0,
    days_active  INTEGER NOT NULL DEFAULT 0,
    quests_done  INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    last_reset_date  TEXT
  );

  CREATE TABLE IF NOT EXISTS user_theme (
    user_id  INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    hue      INTEGER NOT NULL DEFAULT 260,
    is_dark  INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS daily_completions (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL,
    date     TEXT NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, quest_id, date)
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message  TEXT NOT NULL,
    xp       INTEGER NOT NULL DEFAULT 0,
    ts       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_quests (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    category   TEXT NOT NULL DEFAULT 'personal',
    xp         INTEGER NOT NULL DEFAULT 20,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_extras (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    avatar  TEXT,
    sound   INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at    TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, achievement_id)
  );
`);

/* ── Prepared statements ──────────────────────────────── */

const stmts = {
  createUser: db.prepare(
    `INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)`
  ),
  initStats: db.prepare(
    `INSERT INTO user_stats (user_id) VALUES (?)`
  ),
  initTheme: db.prepare(
    `INSERT INTO user_theme (user_id) VALUES (?)`
  ),
  getUserByUsername: db.prepare(
    `SELECT * FROM users WHERE username = ?`
  ),
  getUserById: db.prepare(
    `SELECT * FROM users WHERE id = ?`
  ),
  getStats: db.prepare(
    `SELECT * FROM user_stats WHERE user_id = ?`
  ),
  getTheme: db.prepare(
    `SELECT * FROM user_theme WHERE user_id = ?`
  ),
  updateStats: db.prepare(`
    UPDATE user_stats
    SET total_xp = ?, streak = ?, best_streak = ?, days_active = ?,
        quests_done = ?, last_active_date = ?, last_reset_date = ?
    WHERE user_id = ?
  `),
  updateTheme: db.prepare(`
    UPDATE user_theme SET hue = ?, is_dark = ? WHERE user_id = ?
  `),
  updateDisplayName: db.prepare(`
    UPDATE users SET display_name = ? WHERE id = ?
  `),
  getCompletionsForDate: db.prepare(`
    SELECT quest_id FROM daily_completions WHERE user_id = ? AND date = ?
  `),
  addCompletion: db.prepare(`
    INSERT OR IGNORE INTO daily_completions (user_id, quest_id, date, xp_earned)
    VALUES (?, ?, ?, ?)
  `),
  removeCompletion: db.prepare(`
    DELETE FROM daily_completions WHERE user_id = ? AND quest_id = ? AND date = ?
  `),
  addLog: db.prepare(`
    INSERT INTO activity_log (user_id, message, xp) VALUES (?, ?, ?)
  `),
  getRecentLog: db.prepare(`
    SELECT message, xp, ts FROM activity_log
    WHERE user_id = ? ORDER BY ts DESC LIMIT 20
  `),
  resetUserProgress: db.prepare(`
    UPDATE user_stats SET total_xp=0, streak=0, best_streak=0,
      days_active=0, quests_done=0, last_active_date=NULL, last_reset_date=NULL
    WHERE user_id = ?
  `),
  deleteCompletions: db.prepare(`
    DELETE FROM daily_completions WHERE user_id = ?
  `),
  deleteLog: db.prepare(`
    DELETE FROM activity_log WHERE user_id = ?
  `),
  getUserQuests: db.prepare(`
    SELECT * FROM user_quests WHERE user_id = ? ORDER BY category, created_at
  `),
  createQuest: db.prepare(`
    INSERT INTO user_quests (user_id, name, category, xp) VALUES (?, ?, ?, ?)
  `),
  getQuestById: db.prepare(`
    SELECT * FROM user_quests WHERE id = ? AND user_id = ?
  `),
  deleteQuest: db.prepare(`
    DELETE FROM user_quests WHERE id = ? AND user_id = ?
  `),
  deleteQuestCompletions: db.prepare(`
    DELETE FROM daily_completions WHERE user_id = ? AND quest_id = ?
  `),
  deleteAllQuests: db.prepare(`
    DELETE FROM user_quests WHERE user_id = ?
  `),
  initExtras: db.prepare(`INSERT OR IGNORE INTO user_extras (user_id) VALUES (?)`),
  getExtras:  db.prepare(`SELECT * FROM user_extras WHERE user_id = ?`),
  setAvatar:  db.prepare(`UPDATE user_extras SET avatar = ? WHERE user_id = ?`),
  setSound:   db.prepare(`UPDATE user_extras SET sound = ? WHERE user_id = ?`),
  hasAchievement:    db.prepare(`SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?`),
  unlockAchievement: db.prepare(`INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`),
  getAchievements:   db.prepare(`SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at`),
  getDailyXP: db.prepare(`SELECT COALESCE(SUM(xp_earned),0) as xp FROM daily_completions WHERE user_id = ? AND date = ?`)
};

/* ── Public API ───────────────────────────────────────── */

function registerUser(username, passwordHash, displayName) {
  const info = stmts.createUser.run(username, passwordHash, displayName);
  const userId = info.lastInsertRowid;
  stmts.initStats.run(userId);
  stmts.initTheme.run(userId);
  stmts.initExtras.run(userId);
  return userId;
}

function getUserByUsername(username) {
  return stmts.getUserByUsername.get(username);
}

function getUserById(id) {
  return stmts.getUserById.get(id);
}

function getFullProfile(userId) {
  const user  = stmts.getUserById.get(userId);
  const stats = stmts.getStats.get(userId);
  const theme = stmts.getTheme.get(userId);
  if (!user) return null;
  return { user, stats, theme };
}

function updateStats(userId, statsObj) {
  stmts.updateStats.run(
    statsObj.total_xp, statsObj.streak, statsObj.best_streak,
    statsObj.days_active, statsObj.quests_done,
    statsObj.last_active_date, statsObj.last_reset_date,
    userId
  );
}

function updateTheme(userId, hue, isDark) {
  stmts.updateTheme.run(hue, isDark ? 1 : 0, userId);
}

function updateDisplayName(userId, name) {
  stmts.updateDisplayName.run(name, userId);
}

function getCompletionsForDate(userId, date) {
  return stmts.getCompletionsForDate.all(userId, date).map(r => r.quest_id);
}

function addCompletion(userId, questId, date, xpEarned) {
  stmts.addCompletion.run(userId, questId, date, xpEarned);
}

function removeCompletion(userId, questId, date) {
  stmts.removeCompletion.run(userId, questId, date);
}

function addLog(userId, message, xp) {
  stmts.addLog.run(userId, message, xp);
}

function getRecentLog(userId) {
  return stmts.getRecentLog.all(userId);
}

function resetProgress(userId) {
  stmts.resetUserProgress.run(userId);
  stmts.deleteCompletions.run(userId);
  stmts.deleteLog.run(userId);
  stmts.updateTheme.run(260, 1, userId);
}

function getUserQuests(userId) {
  return stmts.getUserQuests.all(userId);
}

function createQuest(userId, name, category, xp) {
  const info = stmts.createQuest.run(userId, name, category, xp);
  return info.lastInsertRowid;
}

function getQuestById(userId, questId) {
  return stmts.getQuestById.get(questId, userId);
}

function deleteQuest(userId, questId) {
  stmts.deleteQuestCompletions.run(userId, String(questId));
  stmts.deleteQuest.run(questId, userId);
}

function getExtras(userId) {
  stmts.initExtras.run(userId); // ensure row exists for older users
  return stmts.getExtras.get(userId);
}

function setAvatar(userId, avatarDataUrl) {
  stmts.initExtras.run(userId);
  stmts.setAvatar.run(avatarDataUrl, userId);
}

function setSound(userId, enabled) {
  stmts.initExtras.run(userId);
  stmts.setSound.run(enabled ? 1 : 0, userId);
}

function hasAchievement(userId, id) {
  return !!stmts.hasAchievement.get(userId, id);
}

function unlockAchievement(userId, id) {
  stmts.unlockAchievement.run(userId, id);
}

function getAchievements(userId) {
  return stmts.getAchievements.all(userId);
}

function getDailyXP(userId, date) {
  return stmts.getDailyXP.get(userId, date).xp;
}

module.exports = {
  registerUser, getUserByUsername, getUserById, getFullProfile,
  updateStats, updateTheme, updateDisplayName,
  getCompletionsForDate, addCompletion, removeCompletion,
  addLog, getRecentLog, resetProgress,
  getUserQuests, createQuest, getQuestById, deleteQuest,
  getExtras, setAvatar, setSound,
  hasAchievement, unlockAchievement, getAchievements, getDailyXP
};
