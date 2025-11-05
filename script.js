// script.js

const baseURL = window.location.origin; // works both locally and on Render

// Load items when the page starts
async function loadItems() {
  const response = await fetch(`${baseURL}/api/items`);
  const items = await response.json();

  const tableBody = document.getElementById('item-table-body');
  tableBody.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price}</td>
      <td><button onclick="deleteItem(${item.id})">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
}

// Add new item
async function addItem(event) {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const quantity = document.getElementById('quantity').value;
  const price = document.getElementById('price').value;

  if (!name || !quantity || !price) {
    alert("Please fill all fields");
    return;
  }

  const response = await fetch(`${baseURL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, quantity, price })
  });

  if (response.ok) {
    document.getElementById('add-form').reset();
    loadItems();
  } else {
    alert("Failed to add item");
  }
}

// Delete item
async function deleteItem(id) {
  if (!confirm("Delete this item?")) return;

  const response = await fetch(`${baseURL}/api/items/${id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    loadItems();
  } else {
    alert("Failed to delete item");
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadItems);
document.getElementById('add-form').addEventListener('submit', addItem);
