const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // safe for dev; optional if serving frontend from same origin
app.use(express.static(path.join(__dirname, 'public')));

// Open (or create) SQLite database file
const DBSOURCE = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log('Connected to SQLite database.');
});

// Create items table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL DEFAULT 0.0,
      supplier TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Table create error', err);
    else console.log('Items table ready.');
  });

  // Insert sample data if table empty
  db.get("SELECT COUNT(*) as count FROM items", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const insert = db.prepare(`INSERT INTO items (name, description, quantity, price, supplier) VALUES (?,?,?,?,?)`);
      insert.run("USB Cable", "1m USB-C cable", 50, 2.5, "CableCorp");
      insert.run("Wireless Mouse", "Bluetooth mouse", 30, 12.99, "Peripherals Inc");
      insert.run("Laptop Stand", "Aluminium stand", 15, 29.99, "OfficeWare");
      insert.finalize();
      console.log('Inserted sample data.');
    }
  });
});

// API Routes

// Get all items (optionally ?q=search)
app.get('/api/items', (req, res) => {
  const q = (req.query.q || '').trim();
  if (q) {
    const like = `%${q}%`;
    db.all(
      `SELECT * FROM items WHERE name LIKE ? OR description LIKE ? OR supplier LIKE ? ORDER BY created_at DESC`,
      [like, like, like],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  } else {
    db.all(`SELECT * FROM items ORDER BY created_at DESC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

// Get single item by id
app.get('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  db.get(`SELECT * FROM items WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item not found' });
    res.json(row);
  });
});

// Create an item
app.post('/api/items', (req, res) => {
  const { name, description = '', quantity = 0, price = 0, supplier = '' } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'Name required' });

  const sql = `INSERT INTO items (name, description, quantity, price, supplier) VALUES (?,?,?,?,?)`;
  db.run(sql, [name.trim(), description.trim(), Number(quantity), Number(price), supplier.trim()], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get(`SELECT * FROM items WHERE id = ?`, [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(row);
    });
  });
});

// Update item
app.put('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, description = '', quantity = 0, price = 0, supplier = '' } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'Name required' });

  const sql = `UPDATE items SET name = ?, description = ?, quantity = ?, price = ?, supplier = ? WHERE id = ?`;
  db.run(sql, [name.trim(), description.trim(), Number(quantity), Number(price), supplier.trim(), id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
    db.get(`SELECT * FROM items WHERE id = ?`, [id], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(row);
    });
  });
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run(`DELETE FROM items WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true });
  });
});

// Fallback to index.html for any other routes (single-page feel)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
