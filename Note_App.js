const notesContainer = document.getElementById('notesContainer');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const categoryRow = document.getElementById('categoryRow');
const saveBtn = document.getElementById('saveBtn');
const noteTitle = document.getElementById('noteTitle');
const noteDescription = document.getElementById('noteDescription');
const noteCategory = document.getElementById('noteCategory');
const charCounter = document.getElementById('charCounter');
const notesCounter = document.getElementById('notesCounter');
const newNoteBtn = document.getElementById('newNoteBtn');
const backBtn = document.getElementById('backBtn');
const floatingAddBtn = document.getElementById('floatingAddBtn');
const themeToggle = document.getElementById('themeToggle');
const pageNotes = document.querySelector('.page-notes');
const pageAdd = document.querySelector('.page-add');
const colorRow = document.getElementById('colorRow');
const createdAtText = document.getElementById('createdAtText');
const addPageTitle = document.getElementById('addPageTitle');
const toast = document.getElementById('toast');
const confirmModal = document.getElementById('confirmModal');
const confirmCancel = document.getElementById('confirmCancel');
const confirmDelete = document.getElementById('confirmDelete');

const colorMap = {
  purple: '#8b5cf6',
  green: '#22c55e',
  blue: '#2563eb',
  yellow: '#facc15',
  red: '#ef4444'
};

let notes = JSON.parse(localStorage.getItem('notes')) || [];
let activeCategory = 'all';
let activeColor = 'purple';
let currentEditId = null;
let deleteTargetId = null;

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

function saveDraft() {
  localStorage.setItem('draftTitle', noteTitle.value);
  localStorage.setItem('draftDescription', noteDescription.value);
  localStorage.setItem('draftCategory', noteCategory.value);
  localStorage.setItem('draftColor', activeColor);
}

function loadDraft() {
  noteTitle.value = localStorage.getItem('draftTitle') || '';
  noteDescription.value = localStorage.getItem('draftDescription') || '';
  noteCategory.value = localStorage.getItem('draftCategory') || 'personal';
  activeColor = localStorage.getItem('draftColor') || 'purple';
  applyColorSelection();
  charCounter.textContent = `${noteDescription.value.length} / 260`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 1800);
}

function formatCreatedAt(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const label = isToday ? 'Today' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${label} • ${time}`;
}

function formatHeaderDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ` • ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
}

function updateNotesCounter() {
  notesCounter.textContent = `${notes.length}`;
}

function getFilteredNotes() {
  return notes
    .filter(note => activeCategory === 'all' || note.category === activeCategory)
    .filter(note => {
      const query = searchInput.value.toLowerCase();
      return note.title.toLowerCase().includes(query) || note.description.toLowerCase().includes(query);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderNotes() {
  const filtered = getFilteredNotes();
  notesContainer.innerHTML = '';

  if (filtered.length === 0) {
    notesContainer.innerHTML = `
      <div class="note-card">
        <p class="note-copy" style="text-align:center; margin:0;">📝 No Notes Yet<br><span style="font-size:0.95rem; color:#64748b;">Click + to create your first note</span></p>
      </div>
    `;
    updateNotesCounter();
    return;
  }

  filtered.forEach(note => {
    const card = document.createElement('article');
    card.className = 'note-card';
    card.style.borderColor = note.color ? `${note.color}30` : 'rgba(148, 163, 184, 0.18)';
    card.innerHTML = `
      <div class="note-top">
        <h2>${note.title}</h2>
        <span class="note-date">${formatCreatedAt(note.createdAt)}</span>
      </div>
      <p class="note-copy">${note.description}</p>
      <div class="note-actions">
        <button class="note-action-btn edit-note" data-id="${note.id}" title="Edit">✏️</button>
        <button class="note-action-btn delete-note" data-id="${note.id}" title="Delete">🗑️</button>
      </div>
    `;

    const actionRow = card.querySelector('.note-actions');
    actionRow.style.background = note.color ? `${note.color}1A` : 'transparent';
    notesContainer.appendChild(card);
  });

  updateNotesCounter();
}

function openAddPage(editId = null) {
  pageNotes.classList.remove('active');
  pageAdd.classList.add('active');
  document.body.classList.add('page-add-open');
  if (editId) {
    const note = notes.find(item => item.id === editId);
    if (!note) return;
    currentEditId = editId;
    addPageTitle.textContent = 'Edit Note';
    noteTitle.value = note.title;
    noteDescription.value = note.description;
    noteCategory.value = note.category;
    activeColor = note.color || 'purple';
    createdAtText.textContent = formatHeaderDate(note.createdAt);
  } else {
    currentEditId = null;
    addPageTitle.textContent = 'Add Note';
    noteTitle.value = localStorage.getItem('draftTitle') || '';
    noteDescription.value = localStorage.getItem('draftDescription') || '';
    noteCategory.value = localStorage.getItem('draftCategory') || 'personal';
    activeColor = localStorage.getItem('draftColor') || 'purple';
    const now = new Date().toISOString();
    createdAtText.textContent = formatHeaderDate(now);
  }
  applyColorSelection();
  charCounter.textContent = `${noteDescription.value.length} / 260`;
}

function closeAddPage() {
  pageAdd.classList.remove('active');
  pageNotes.classList.add('active');
  document.body.classList.remove('page-add-open');
  currentEditId = null;
  noteTitle.value = '';
  noteDescription.value = '';
  noteCategory.value = 'personal';
  activeColor = 'purple';
  applyColorSelection();
  charCounter.textContent = '0 / 260';
  localStorage.removeItem('draftTitle');
  localStorage.removeItem('draftDescription');
  localStorage.removeItem('draftCategory');
  localStorage.removeItem('draftColor');
}

function applyColorSelection() {
  document.querySelectorAll('.color-swatch').forEach(button => {
    const isActive = button.dataset.color === activeColor;
    button.classList.toggle('active', isActive);
  });
}

function addOrUpdateNote() {
  const title = noteTitle.value.trim();
  const description = noteDescription.value.trim();
  const category = noteCategory.value;

  if (!title || !description) {
    showToast('Please add a title and description');
    return;
  }

  const now = new Date().toISOString();

  if (currentEditId) {
    notes = notes.map(note => note.id === currentEditId ? { ...note, title, description, category, color: colorMap[activeColor] || '#8b5cf6' } : note);
    showToast('Note updated');
  } else {
    notes.unshift({
      id: Date.now(),
      title,
      description,
      category,
      color: colorMap[activeColor] || '#8b5cf6',
      createdAt: now
    });
    showToast('Note saved');
  }

  saveNotes();
  renderNotes();
  closeAddPage();
}

function confirmDeleteNote(id) {
  deleteTargetId = id;
  confirmModal.hidden = false;
}

function deleteNote() {
  if (deleteTargetId === null) return;
  notes = notes.filter(note => note.id !== deleteTargetId);
  saveNotes();
  renderNotes();
  confirmModal.hidden = true;
  deleteTargetId = null;
  showToast('Note deleted');
}

function setActiveCategory(category) {
  activeCategory = category;
  document.querySelectorAll('.category-pill').forEach(button => {
    button.classList.toggle('active', button.dataset.category === category);
  });
  renderNotes();
}

function setupTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('theme-dark', saved === 'dark');
  themeToggle.textContent = saved === 'dark' ? '🌙' : '☀';
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('theme-dark');
  themeToggle.textContent = isDark ? '🌙' : '☀';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

searchInput.addEventListener('input', () => renderNotes());
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  renderNotes();
});

categoryRow.addEventListener('click', event => {
  const button = event.target.closest('.category-pill');
  if (!button) return;
  setActiveCategory(button.dataset.category);
});

newNoteBtn.addEventListener('click', () => openAddPage());
floatingAddBtn.addEventListener('click', () => openAddPage());
backBtn.addEventListener('click', closeAddPage);

noteDescription.addEventListener('input', () => {
  charCounter.textContent = `${noteDescription.value.length} / 260`;
  saveDraft();
});
noteTitle.addEventListener('input', saveDraft);
noteCategory.addEventListener('change', saveDraft);

colorRow.addEventListener('click', event => {
  const button = event.target.closest('.color-swatch');
  if (!button) return;
  activeColor = button.dataset.color;
  applyColorSelection();
  saveDraft();
});

saveBtn.addEventListener('click', addOrUpdateNote);

document.addEventListener('click', event => {
  const editBtn = event.target.closest('.edit-note');
  const deleteBtn = event.target.closest('.delete-note');
  if (editBtn) {
    openAddPage(Number(editBtn.dataset.id));
  }
  if (deleteBtn) {
    confirmDeleteNote(Number(deleteBtn.dataset.id));
  }
});

confirmCancel.addEventListener('click', () => {
  confirmModal.hidden = true;
  deleteTargetId = null;
});
confirmDelete.addEventListener('click', deleteNote);

themeToggle.addEventListener('click', toggleTheme);

window.addEventListener('keydown', event => {
  if (event.ctrlKey && event.key.toLowerCase() === 'n') {
    event.preventDefault();
    openAddPage();
  }
  if (event.ctrlKey && event.key.toLowerCase() === 's') {
    if (pageAdd.classList.contains('active')) {
      event.preventDefault();
      addOrUpdateNote();
    }
  }
  if (event.key === 'Escape' && pageAdd.classList.contains('active')) {
    closeAddPage();
  }
});

window.addEventListener('load', () => {
  setupTheme();
  loadDraft();
  renderNotes();
});
