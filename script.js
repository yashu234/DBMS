const baseURL = window.location.origin;
let editMode = false;
let editID = null;

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
      <td>
        <button onclick="editItem(${item.id}, '${item.name}', ${item.quantity}, ${item.price})">Modify</button>
        <button onclick="deleteItem(${item.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
    totalValue += item.quantity * item.price;
  });
  document.getElementById("total-value").innerHTML = `<strong>Total Inventory Value: ₹${totalValue.toFixed(2)}</strong>`;
}

async function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);
  if (!name || !quantity || !price) {
    alert("Please fill all fields!");
    return;
  }
  const url = editMode ? `${baseURL}/api/items/${editID}` : `${baseURL}/api/items`;
  const method = editMode ? "PUT" : "POST";
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, price }),
  });
  if (res.ok) {
    document.getElementById("add-form").reset();
    editMode = false;
    editID = null;
    document.getElementById("submit-btn").textContent = "Add Item";
    document.getElementById("cancel-edit").style.display = "none";
    loadItems();
  } else {
    alert("Failed to save item.");
  }
}

function editItem(id, name, quantity, price) {
  document.getElementById("name").value = name;
  document.getElementById("quantity").value = quantity;
  document.getElementById("price").value = price;
  editMode = true;
  editID = id;
  document.getElementById("submit-btn").textContent = "Save Changes";
  document.getElementById("cancel-edit").style.display = "inline-block";
}

function cancelEdit() {
  editMode = false;
  editID = null;
  document.getElementById("add-form").reset();
  document.getElementById("submit-btn").textContent = "Add Item";
  document.getElementById("cancel-edit").style.display = "none";
}

async function deleteItem(id) {
  if (!confirm("Delete this item?")) return;
  const res = await fetch(`${baseURL}/api/items/${id}`, { method: "DELETE" });
  if (res.ok) loadItems();
  else alert("Failed to delete item.");
}

function filterItems() {
  const query = document.getElementById("search").value.toLowerCase();
  const rows = document.querySelectorAll("#item-table-body tr");
  rows.forEach((row) => {
    const name = row.children[1].textContent.toLowerCase();
    row.style.display = name.includes(query) ? "" : "none";
  });
}

document.addEventListener("DOMContentLoaded", loadItems);
document.getElementById("add-form").addEventListener("submit", handleSubmit);
document.getElementById("cancel-edit").addEventListener("click", cancelEdit);
