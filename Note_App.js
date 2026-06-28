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
const exportBtn = document.getElementById('exportBtn');
const liveClock = document.getElementById('liveClock');
const progressFill = document.getElementById('progressFill');
const recentActivityList = document.getElementById('recentActivityList');
const viewModal = document.getElementById('viewModal');
const closeViewBtn = document.getElementById('closeViewBtn');
const viewTitle = document.getElementById('viewTitle');
const viewCategory = document.getElementById('viewCategory');
const viewDate = document.getElementById('viewDate');
const viewPinStatus = document.getElementById('viewPinStatus');
const viewDescription = document.getElementById('viewDescription');

const colorMap = {
  purple: '#8b5cf6',
  green: '#22c55e',
  blue: '#2563eb',
  yellow: '#facc15',
  red: '#ef4444'
};

let notes = JSON.parse(localStorage.getItem('notes')) || [];
let activities = JSON.parse(localStorage.getItem('noteActivities')) || [];
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
  return date.toLocaleString();
}

function formatHeaderDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function updateNotesCounter() {
  notesCounter.textContent = `${notes.length}`;
  updateStats();
}

function saveActivities() {
  localStorage.setItem('noteActivities', JSON.stringify(activities));
}

function addActivity(message) {
  const timestamp = new Date().toLocaleString();
  activities.unshift(`${timestamp} — ${message}`);
  if (activities.length > 6) activities.length = 6;
  saveActivities();
  updateActivityList();
}

function updateActivityList() {
  if (!activities.length) {
    recentActivityList.innerHTML = '<li class="activity-empty">No activity yet. Create your first note.</li>';
    return;
  }

  recentActivityList.innerHTML = activities.map(item => `<li>${item}</li>`).join('');
}

function updateStats() {
  const total = notes.length;
  const pinned = notes.filter(note => note.pinned).length;
  const personal = notes.filter(note => note.category === 'personal').length;
  const work = notes.filter(note => note.category === 'work').length;

  document.getElementById('totalNotes').textContent = total;
  document.getElementById('pinnedCount').textContent = pinned;
  document.getElementById('personalCount').textContent = personal;
  document.getElementById('workCount').textContent = work;
}


function getFilteredNotes() {
  return notes
    .filter(note => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'favorites') return note.favorite;
      return note.category === activeCategory;
    })
    .filter(note => {
      const query = searchInput.value.toLowerCase();
      return note.title.toLowerCase().includes(query) || note.description.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

function renderNotes() {
  const filtered = getFilteredNotes();
  notesContainer.innerHTML = '';

  if (filtered.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect x='10' y='14' width='72' height='92' rx='16' fill='%23ede9fe'/%3E%3Cpath d='M34 24h44v72H34z' fill='%23c7d2fe'/%3E%3Cpath d='M42 38h32M42 56h32M42 74h32' stroke='%235a26c1' stroke-width='4' stroke-linecap='round'/%3E%3Crect x='84' y='18' width='20' height='84' rx='10' fill='%238b5cf6'/%3E%3C/svg%3E" alt="No notes illustration" />
        <h3>No notes yet</h3>
        <p>Create your first note to keep ideas, tasks, and reminders in one place.</p>
      </div>
    `;
    updateNotesCounter();
    return;
  }

  filtered.forEach(note => {
    const card = document.createElement('article');
    card.className = 'note-card';
    card.dataset.id = note.id;
    card.style.borderColor = note.color ? `${note.color}30` : 'rgba(148, 163, 184, 0.18)';
    card.style.background = note.color ? `${note.color}10` : 'rgba(255, 255, 255, 0.85)';
    card.innerHTML = `
      <div class="note-top">
        <h2>${note.title}</h2>
        <span class="note-date">${formatCreatedAt(note.createdAt)}</span>
      </div>
      <div class="note-meta-row">
        <span class="category-tag">${note.category.charAt(0).toUpperCase() + note.category.slice(1)}</span>
        ${note.pinned ? '<span class="category-tag pinned-tag">Pinned</span>' : ''}
        ${note.favorite ? '<span class="category-tag fav-tag">Favorite</span>' : ''}
      </div>
      <p class="note-copy">${note.description}</p>
      <div class="note-actions">
        <button class="note-action-btn pin-note" data-id="${note.id}" title="${note.pinned ? 'Unpin' : 'Pin'}">📌</button>
        <button class="note-action-btn fav-note" data-id="${note.id}" title="${note.favorite ? 'Unfavorite' : 'Favorite'}">⭐</button>
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
  progressFill.style.width = '0%';
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
function togglePin(id) {
  notes = notes.map(note => note.id === id ? { ...note, pinned: !note.pinned } : note);
  saveNotes();
  addActivity(notes.find(note => note.id === id).pinned ? 'Note pinned' : 'Note unpinned');
  renderNotes();
}

function toggleFavorite(id) {
  notes = notes.map(note => note.id === id ? { ...note, favorite: !note.favorite } : note);
  saveNotes();
  addActivity(notes.find(note => note.id === id).favorite ? 'Note favorited' : 'Note unfavorited');
  renderNotes();
}
