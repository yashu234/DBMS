const apiUrl = window.location.origin;

const tableBody = document.querySelector("#inventoryTable tbody");
const form = document.getElementById("addForm");

async function fetchItems() {
  const res = await fetch(`${apiUrl}/items`);
  const items = await res.json();
  renderTable(items);
}

function renderTable(items) {
  tableBody.innerHTML = "";
  items.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td><input type="text" value="${item.name}" class="edit-name"></td>
      <td><input type="number" value="${item.quantity}" class="edit-qty"></td>
      <td><input type="number" value="${item.price}" class="edit-price"></td>
      <td>
        <button class="action-btn" onclick="updateItem(${item.id}, this)">💾 Save</button>
        <button class="action-btn delete" onclick="deleteItem(${item.id})">🗑️ Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const quantity = document.getElementById("quantity").value;
  const price = document.getElementById("price").value;

  await fetch(`${apiUrl}/add`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, quantity, price })
  });

  form.reset();
  fetchItems();
});

async function updateItem(id, btn) {
  const row = btn.closest("tr");
  const name = row.querySelector(".edit-name").value;
  const quantity = row.querySelector(".edit-qty").value;
  const price = row.querySelector(".edit-price").value;

  await fetch(`${apiUrl}/update/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, quantity, price })
  });
  fetchItems();
}

async function deleteItem(id) {
  await fetch(`${apiUrl}/delete/${id}`, { method: "DELETE" });
  fetchItems();
}

fetchItems();
