// ---------- server.js ----------

// Import required packages
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // if you're using MongoDB
require("dotenv").config(); // optional, only if using .env file

const app = express();
const PORT = process.env.PORT || 10000; // Render will use its own PORT

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- DATABASE CONNECTION ----------
// 🔹 OPTION 1: If you are using MongoDB Atlas
// Change the connection string below with your own
/*
mongoose.connect(process.env.MONGO_URI || "your_mongo_connection_string_here", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection failed:", err));
*/

// 🔹 OPTION 2: If NOT using database, comment out Mongo part above
// and you can store data in a temporary array instead
let items = []; // temporary in-memory storage

// ---------- ROUTES ----------

// 🟢 Home route
app.get("/", (req, res) => {
  res.send("✅ Server is running successfully on Render!");
});

// 🟢 Add data
app.post("/add", (req, res) => {
  const newItem = req.body;
  items.push(newItem);
  res.json({ message: "Item added successfully!", data: newItem });
});

// 🟢 Get all data
app.get("/data", (req, res) => {
  res.json(items);
});

// 🟢 Modify data (example: update by index)
app.put("/modify/:index", (req, res) => {
  const index = req.params.index;
  if (items[index]) {
    items[index] = req.body;
    res.json({ message: "Item modified successfully!", data: items[index] });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// 🟢 Delete data
app.delete("/delete/:index", (req, res) => {
  const index = req.params.index;
  if (items[index]) {
    items.splice(index, 1);
    res.json({ message: "Item deleted successfully!" });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
