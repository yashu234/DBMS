// script.js
const baseURL = window.location.origin;

// Load items
async function loadItems() {
  const res = await fetch(`${baseURL}/api/items`);
  const items = await res.json();

  const tableBody = document.getElementById("item-table-body");
  tableBody.innerHTML = "";

  let totalValue = 0;

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td><button onclick="deleteItem(${item.id})">Delete</button></td>
    `;
    tableBody.appendChild(row);
    totalValue += item.quantity * item.price;
  });

  document.getElementById(
    "total-value"
  ).innerHTML = `<strong>Total Inventory Value: ₹${totalValue.toFixed(2)}</strong>`;
}

// Add item
async function addItem(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);

  if (!name || !quantity || !price) {
    alert("Please fill all fields!");
    return;
  }

  const res = await fetch(`${baseURL}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, price }),
  });

  if (res.ok) {
    document.getElementById("add-form").reset();
    loadItems();
  } else {
    alert("Failed to add item.");
  }
}

// Delete item
async function deleteItem(id) {
  if (!confirm("Delete this item?")) return;

  const res = await fetch(`${baseURL}/api/items/${id}`, { method: "DELETE" });
  if (res.ok) loadItems();
  else alert("Failed to delete item.");
}

// Search / filter
function filterItems() {
  const query = document.getElementById("search").value.toLowerCase();
  const rows = document.querySelectorAll("#item-table-body tr");

  rows.forEach((row) => {
    const name = row.children[1].textContent.toLowerCase();
    row.style.display = name.includes(query) ? "" : "none";
  });
}

document.addEventListener("DOMContentLoaded", loadItems);
document.getElementById("add-form").addEventListener("submit", addItem);
