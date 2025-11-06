const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error(err.message);
});

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  )
`);

app.get("/api/items", (req, res) => {
  db.all("SELECT * FROM items ORDER BY id DESC", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post("/api/items", (req, res) => {
  const { name, quantity, price } = req.body;
  if (!name || !quantity || !price)
    return res.status(400).json({ error: "All fields required" });

  db.run(
    "INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)",
    [name, quantity, price],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID, name, quantity, price });
    }
  );
});

app.put("/api/items/:id", (req, res) => {
  const { name, quantity, price } = req.body;
  db.run(
    "UPDATE items SET name=?, quantity=?, price=? WHERE id=?",
    [name, quantity, price, req.params.id],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ updatedID: req.params.id });
    }
  );
});

app.delete("/api/items/:id", (req, res) => {
  db.run("DELETE FROM items WHERE id=?", [req.params.id], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ deletedID: req.params.id });
  });
});

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
