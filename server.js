const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Connect database
const db = new sqlite3.Database('inventory.db', (err) => {
    if (err) console.error('❌ Database error:', err);
    else console.log('✅ Connected to SQLite database.');
});

// Create table if not exists
db.run(`
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
)
`);

// ➕ Add new item
app.post('/add', (req, res) => {
    const { name, quantity, price } = req.body;
    db.run('INSERT INTO inventory (name, quantity, price) VALUES (?, ?, ?)',
        [name, quantity, price],
        (err) => {
            if (err) return res.status(500).send('Error adding item');
            res.send('Item added');
        }
    );
});

// 📦 Fetch all items
app.get('/items', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) return res.status(500).send('Error fetching items');
        res.json(rows);
    });
});

// ✏️ Update item
app.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, quantity, price } = req.body;
    db.run('UPDATE inventory SET name=?, quantity=?, price=? WHERE id=?',
        [name, quantity, price, id],
        function (err) {
            if (err) return res.status(500).send('Error updating item');
            res.send('Item updated');
        }
    );
});

// ❌ Delete item
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM inventory WHERE id=?', [id], function (err) {
        if (err) return res.status(500).send('Error deleting item');
        res.send('Item deleted');
    });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
