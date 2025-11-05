const API = '/api/items';
const $ = (sel) => document.querySelector(sel);
const $all = (sel) => Array.from(document.querySelectorAll(sel));

const form = $('#itemForm');
const itemId = $('#itemId');
const nameIn = $('#name');
const descIn = $('#description');
const qtyIn = $('#quantity');
const priceIn = $('#price');
const supplierIn = $('#supplier');
const itemsTableBody = document.querySelector('#itemsTable tbody');
const formTitle = $('#formTitle');
const cancelEditBtn = $('#cancelEdit');
const searchInput = $('#search');
const refreshBtn = $('#refreshBtn');

let editing = false;

async function fetchItems(q = '') {
  const url = q ? `${API}?q=${encodeURIComponent(q)}` : API;
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Failed fetching items', await res.text());
    return [];
  }
  return res.json();
}

function renderTable(items) {
  itemsTableBody.innerHTML = '';
  if (!items.length) {
    itemsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#6b7280">No items found</td></tr>`;
    return;
  }
  items.forEach(it => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(it.name)}</td>
      <td>${escapeHtml(it.description || '')}</td>
      <td>${Number(it.quantity)}</td>
      <td>${Number(it.price).toFixed(2)}</td>
      <td>${escapeHtml(it.supplier || '')}</td>
      <td class="actions">
        <button class="edit" data-id="${it.id}">Edit</button>
        <button class="del" data-id="${it.id}">Delete</button>
      </td>
    `;
    itemsTableBody.appendChild(tr);
  });
}

function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

async function loadAndRender(q = '') {
  const items = await fetchItems(q);
  renderTable(items);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: nameIn.value.trim(),
    description: descIn.value.trim(),
    quantity: Number(qtyIn.value) || 0,
    price: parseFloat(priceIn.value) || 0,
    supplier: supplierIn.value.trim()
  };
  try {
    if (editing && itemId.value) {
      const id = itemId.value;
      const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      resetForm();
      await loadAndRender(searchInput.value.trim());
    } else {
      const res = await fetch(API, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      form.reset();
      await loadAndRender(searchInput.value.trim());
    }
  } catch (err) {
    alert('Error: ' + err.message);
    console.error(err);
  }
});

itemsTableBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.classList.contains('edit')) {
    // populate form
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) { alert('Failed to fetch item'); return; }
    const it = await res.json();
    itemId.value = it.id;
    nameIn.value = it.name;
    descIn.value = it.description || '';
    qtyIn.value = it.quantity;
    priceIn.value = Number(it.price).toFixed(2);
    supplierIn.value = it.supplier || '';
    editing = true;
    formTitle.textContent = 'Edit Item';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (btn.classList.contains('del')) {
    if (!confirm('Delete this item?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      await loadAndRender(searchInput.value.trim());
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }
});

cancelEditBtn.addEventListener('click', (e) => {
  e.preventDefault();
  resetForm();
});

function resetForm(){
  form.reset();
  itemId.value = '';
  editing = false;
  formTitle.textContent = 'Add Item';
}

// search on Enter; live on typing with small debounce
let debounceTimer = null;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => loadAndRender(searchInput.value.trim()), 300);
});
refreshBtn.addEventListener('click', () => {
  searchInput.value = '';
  loadAndRender();
});

// initial load
loadAndRender();
