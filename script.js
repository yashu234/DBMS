const baseURL = window.location.origin;
let editMode = false;
let editID = null;

const modal = document.getElementById("itemModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.querySelector(".close");
const modalTitle = document.getElementById("modalTitle");
const form = document.getElementById("add-form");

openModalBtn.onclick = () => {
  modal.style.display = "flex";
  form.reset();
  editMode = false;
  modalTitle.textContent = "Add Item";
  document.getElementById("submit-btn").textContent = "Add";
};
closeModalBtn.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target == modal) modal.style.display = "none";
};

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
        <button class="edit" onclick="editItem(${item.id}, '${item.name}', ${item.quantity}, ${item.price})">✏️</button>
        <button class="delete" onclick="deleteItem(${item.id})">🗑️</button>
      </td>
    `;
    tableBody.appendChild(row);
    totalValue += item.quantity * item.price;
  });

  document.getElementById(
    "total-value"
  ).innerHTML = `<strong>Total Inventory Value: ₹${totalValue.toFixed(2)}</strong>`;
}

async function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);
  const url = editMode ? `${baseURL}/api/items/${editID}` : `${baseURL}/api/items`;
  const method = editMode ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, price }),
  });

  if (res.ok) {
    modal.style.display = "none";
    loadItems();
  }
}

function editItem(id, name, quantity, price) {
  modal.style.display = "flex";
  document.getElementById("name").value = name;
  document.getElementById("quantity").value = quantity;
  document.getElementById("price").value = price;
  editMode = true;
  editID = id;
  modalTitle.textContent = "Edit Item";
  document.getElementById("submit-btn").textContent = "Save";
}

async function deleteItem(id) {
  if (!confirm("Delete this item?")) return;
  const res = await fetch(`${baseURL}/api/items/${id}`, { method: "DELETE" });
  if (res.ok) loadItems();
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
form.addEventListener("submit", handleSubmit);
