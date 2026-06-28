const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const categoryRow = document.getElementById('categoryRow');
const saveBtn = document.getElementById('saveBtn');
const noteTitle = document.getElementById('noteTitle');
const noteDescription = document.getElementById('noteDescription');
const charCounter = document.getElementById('charCounter');
const notesCounter = document.getElementById('notesCounter');
const clearFormBtn = document.getElementById('clearForm');
const toast = document.getElementById('toast');
const tabButtons = document.querySelectorAll('.bottom-action');

let notes = JSON.parse(localStorage.getItem('notes')) || [
  {
    id: Date.now() - 300000,
    title: 'Team meeting',
    description: 'Dolor sit amet, consectetur adipiscing elit.',
    category: 'personal',
    favorite: false,
    pinned: true,
    createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: Date.now() - 240000,
    title: 'Appointment',
    description: 'Lorem ipsum dolor sit amet, consectetur.',
    category: 'work',
    favorite: false,
    pinned: false,
    createdAt: new Date(Date.now() - 240000).toISOString()
  },
  {
    id: Date.now() - 180000,
    title: 'Email team for updates',
    description: 'Lorem ipsum dolor sit amet, consectetur.',
    category: 'travel',
    favorite: true,
    pinned: false,
    createdAt: new Date(Date.now() - 180000).toISOString()
  },
  {
    id: Date.now() - 120000,
    title: 'Prepare investor pitch deck',
    description: 'Dolor sit amet, consectetur adipiscing elit.',
    category: 'health',
    favorite: false,
    pinned: false,
    createdAt: new Date(Date.now() - 120000).toISOString()
  }
];

let activeCategory = 'personal';
let activeTab = 'notes';
let currentEditId = null;

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 1800);
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function clearForm() {
  currentEditId = null;
  noteTitle.value = '';
  noteDescription.value = '';
  charCounter.textContent = `${noteDescription.value.length} / 260`;
  document.querySelectorAll('.note-card.active').forEach(card => card.classList.remove('active'));
}

function renderNotes(filterNotes = null) {
  const searchKeyword = searchInput.value.toLowerCase();
  let renderList = filterNotes || [...notes];

  if (activeTab === 'favorite') {
    renderList = renderList.filter(note => note.favorite);
  }

  if (activeCategory && activeCategory !== 'all') {
    renderList = renderList.filter(note => note.category === activeCategory);
  }

  if (searchKeyword) {
    renderList = renderList.filter(note =>
      note.title.toLowerCase().includes(searchKeyword) ||
      note.description.toLowerCase().includes(searchKeyword)
    );
  }

  renderList.sort((a, b) => {
    if (b.pinned !== a.pinned) return b.pinned - a.pinned;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  notesContainer.innerHTML = '';

  if (renderList.length === 0) {
    notesContainer.innerHTML = `
      <div class="note-card" style="text-align:center; background: rgba(255,255,255,0.92); box-shadow: 0 12px 28px rgba(0,0,0,0.05);">
        <h2>No Notes Found</h2>
        <p style="color:#6b7280; margin-top:0.5rem;">Create your first note or change the filter.</p>
      </div>
    `;
    notesCounter.textContent = notes.length;
    return;
  }

  renderList.forEach(note => {
    const card = document.createElement('article');
    card.className = `note-card${note.pinned ? ' pinned' : ''}${note.id === currentEditId ? ' active' : ''}`;
    card.innerHTML = `
      <div class="note-top">
        <h2>${note.title}</h2>
        <span class="note-date">${formatDate(note.createdAt)}</span>
      </div>
      <p class="note-copy">${note.description}</p>
      <div class="note-actions">
        <button class="note-action-btn" title="Favorite">${note.favorite ? '★' : '☆'}</button>
        <button class="note-action-btn" title="Pin">📌</button>
        <button class="note-action-btn" title="Edit">✏️</button>
        <button class="note-action-btn" title="Delete">🗑️</button>
      </div>
    `;

    const [favBtn, pinBtn, editBtn, deleteBtn] = card.querySelectorAll('.note-action-btn');

    favBtn.addEventListener('click', event => {
      event.stopPropagation();
      note.favorite = !note.favorite;
      saveNotes();
      renderNotes();
      showToast(note.favorite ? 'Added to favorites' : 'Removed from favorites');
    });

    pinBtn.addEventListener('click', event => {
      event.stopPropagation();
      note.pinned = !note.pinned;
      saveNotes();
      renderNotes();
      showToast(note.pinned ? 'Pinned note' : 'Unpinned note');
    });

    editBtn.addEventListener('click', event => {
      event.stopPropagation();
      selectNoteForEdit(note.id);
    });

    deleteBtn.addEventListener('click', event => {
      event.stopPropagation();
      deleteNote(note.id);
    });

    card.addEventListener('click', () => selectNoteForEdit(note.id));
    notesContainer.appendChild(card);
  });

  notesCounter.textContent = notes.length;
}

function selectNoteForEdit(id) {
  const note = notes.find(item => item.id === id);
  if (!note) return;
  currentEditId = id;
  noteTitle.value = note.title;
  noteDescription.value = note.description;
  charCounter.textContent = `${noteDescription.value.length} / 260`;
  document.querySelectorAll('.note-card.active').forEach(card => card.classList.remove('active'));
  const card = [...notesContainer.children].find(child => child.innerText.includes(note.title));
  if (card) card.classList.add('active');
}

function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);
  saveNotes();
  renderNotes();
  showToast('Note deleted');
  if (currentEditId === id) clearForm();
}

function addOrUpdateNote() {
  const title = noteTitle.value.trim();
  const description = noteDescription.value.trim();
  if (!title || !description) {
    showToast('Please add a title and description');
    return;
  }

  const category = activeCategory === 'all' ? 'personal' : activeCategory;

  if (currentEditId) {
    notes = notes.map(note => note.id === currentEditId ? { ...note, title, description, category } : note);
    showToast('Note updated');
  } else {
    const note = {
      id: Date.now(),
      title,
      description,
      category,
      favorite: false,
      pinned: false,
      createdAt: new Date().toISOString()
    };
    notes.push(note);
    showToast('Note saved');
  }

  saveNotes();
  renderNotes();
  clearForm();
}

function setActiveCategory(category) {
  activeCategory = category;
  document.querySelectorAll('.category-pill').forEach(button => {
    button.classList.toggle('active', button.dataset.category === category);
  });
  renderNotes();
}

function setActiveTab(tab) {
  activeTab = tab;
  tabButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  renderNotes();
}

searchInput.addEventListener('input', () => renderNotes());
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  renderNotes();
});

categoryRow.addEventListener('click', (event) => {
  const button = event.target.closest('.category-pill');
  if (!button) return;
  setActiveCategory(button.dataset.category);
});

saveBtn.addEventListener('click', addOrUpdateNote);
clearFormBtn.addEventListener('click', () => {
  clearForm();
  showToast('Draft cleared');
});

noteDescription.addEventListener('input', () => {
  charCounter.textContent = `${noteDescription.value.length} / 260`;
  localStorage.setItem('draft', noteDescription.value);
});

noteTitle.addEventListener('input', () => {
  localStorage.setItem('draftTitle', noteTitle.value);
});

tabButtons.forEach(button => {
  button.addEventListener('click', () => setActiveTab(button.dataset.tab));
});

window.addEventListener('load', () => {
  noteDescription.value = localStorage.getItem('draft') || '';
  noteTitle.value = localStorage.getItem('draftTitle') || '';
  charCounter.textContent = `${noteDescription.value.length} / 260`;
  renderNotes();
});
