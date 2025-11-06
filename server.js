// ---------- server.js ----------

// Import required packages
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// ---------- TEMPORARY DATA STORAGE ----------
let items = []; // In-memory (temporary) database

// ---------- ROUTES ----------

// 🟢 Default route
app.get("/", (req, res) => {
  res.send("✅ Server is running on Render successfully!");
});

// 🟢 Add new data
app.post("/add", (req, res) => {
  const data = req.body;
  items.push(data);
  res.json({ message: "Item added successfully", data });
});

// 🟢 Get all data
app.get("/data", (req, res) => {
  res.json(items);
});

// 🟢 Modify data (by index)
app.put("/modify/:index", (req, res) => {
  const { index } = req.params;
  if (items[index]) {
    items[index] = req.body;
    res.json({ message: "Item modified successfully", data: items[index] });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// 🟢 Delete data (by index)
app.delete("/delete/:index", (req, res) => {
  const { index } = req.params;
  if (items[index]) {
    items.splice(index, 1);
    res.json({ message: "Item deleted successfully" });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// ---------- START SERVER ----------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
