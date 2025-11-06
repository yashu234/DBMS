const apiUrl = window.location.origin;
const tableBody = document.querySelector("#inventoryTable tbody");
const form = document.getElementById("addForm");
const searchBar = document.getElementById("searchBar");
const themeToggle = document.getElementById("themeToggle");

// ✅ Fetch and render all inventory items
async function fetchItems() {
  const res = await fetch(`${apiUrl}/items`);
  const items = await res.json();
  renderTable(items);
}

// ✅ Render inventory table rows
function renderTable(items) {
  tableBody.innerHTML = "";
  items.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td><input type="text" value="${item.name}" class="edit-name" disabled></td>
      <td><input type="number" value="${item.quantity}" class="edit-qty" disabled></td>
      <td><input type="number" value="${item.price}" class="edit-price" disabled></td>
      <td>
        <button class="action-btn edit" onclick="enableEdit(this)">✏️ Edit</button>
        <button class="action-btn update" onclick="updateItem(${item.id}, this)" disabled>💾 Update</button>
        <button class="action-btn delete" onclick="deleteItem(${item.id})">🗑️ Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// ✅ Add new item to the database
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const quantity = document.getElementById("quantity").value.trim();
  const price = document.getElementById("price").value.trim();

  if (!name || !quantity || !price) return alert("Please fill all fields");

  await fetch(`${apiUrl}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, price })
  });

  form.reset();
  showToast("✅ Item added successfully");
  fetchItems();
});

// ✅ Delete item
async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  await fetch(`${apiUrl}/delete/${id}`, { method: "DELETE" });
  showToast("🗑️ Item deleted");
  fetchItems();
}

// ✅ Enable editing
function enableEdit(btn) {
  const row = btn.closest("tr");
  row.querySelectorAll("input").forEach(i => i.disabled = false);
  row.querySelector(".update").disabled = false;
  btn.disabled = true;
}

// ✅ Update item
async function updateItem(id, btn) {
  const row = btn.closest("tr");
  const name = row.querySelector(".edit-name").value;
  const quantity = row.querySelector(".edit-qty").value;
  const price = row.querySelector(".edit-price").value;

  await fetch(`${apiUrl}/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, price })
  });

  showToast("💾 Item updated successfully");
  fetchItems();
}

// ✅ Search filter
searchBar.addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  const res = await fetch(`${apiUrl}/items`);
  const items = await res.json();
  const filtered = items.filter(i => i.name.toLowerCase().includes(term));
  renderTable(filtered);
});

// 🌗 Theme toggle (dark / light)
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});

// 🌗 Load saved theme
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
  themeToggle.textContent = "☀️";
}

// ✅ Small Toast notification for better UX
function showToast(message) {
  let toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "30px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "rgba(0,0,0,0.7)";
  toast.style.color = "#fff";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = "9999";
  toast.style.fontSize = "14px";
  toast.style.animation = "fadeInOut 3s ease forwards";

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ✅ Fade animation for toast
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  10% { opacity: 1; transform: translate(-50%, 0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, 20px); }
}`;
document.head.appendChild(style);

// ✅ Initial fetch
fetchItems();
