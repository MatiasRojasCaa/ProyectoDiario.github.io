/* ─────────────────────────────────────────────
   LEVARA — Servidor (sólo archivos estáticos
   y proxy de citas motivacionales ZenQuotes)
───────────────────────────────────────────── */
const express = require('express');
const path    = require('path');
const https   = require('https');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Static files ─────────────────────────── */
app.use(express.static(path.join(__dirname, 'docs')));

/* ── Daily quote proxy (ZenQuotes, gratis) ── */
const quoteCache = { date: null, quote: null };

function fetchZenQuote() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://zenquotes.io/api/today', { timeout: 5000 }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const item   = Array.isArray(parsed) ? parsed[0] : parsed;
          if (item?.q) resolve({ text: item.q, author: item.a || 'Anónimo' });
          else reject(new Error('Respuesta inesperada de ZenQuotes'));
        } catch { reject(new Error('JSON inválido')); }
      });
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

app.get('/api/quote', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  if (quoteCache.date === today && quoteCache.quote) {
    return res.json(quoteCache.quote);
  }
  try {
    const quote      = await fetchZenQuote();
    quoteCache.date  = today;
    quoteCache.quote = quote;
    res.json(quote);
  } catch (err) {
    res.status(503).json({ error: 'No se pudo obtener la cita', detail: err.message });
  }
});

/* ── SPA fallback ─────────────────────────── */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✨  Levara corriendo en http://localhost:${PORT}\n`);
});
