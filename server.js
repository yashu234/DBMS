const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Serves index.html, script.js, style.css

// Connect / create database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("❌ Database error:", err.message);
  else console.log("✅ Connected to SQLite database.");
});

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  )
`);

// API: Get all items
app.get("/api/items", (req, res) => {
  db.all("SELECT * FROM items ORDER BY id DESC", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// API: Add new item
app.post("/api/items", (req, res) => {
  const { name, quantity, price } = req.body;
  if (!name || !quantity || !price)
    return res.status(400).json({ error: "All fields are required" });

  db.run(
    "INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)",
    [name, quantity, price],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID, name, quantity, price });
    }
  );
});

// API: Delete item
app.delete("/api/items/:id", (req, res) => {
  db.run("DELETE FROM items WHERE id = ?", [req.params.id], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ deletedID: req.params.id });
  });
});

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}\n🌐 Ready for Render deployment`)
);
