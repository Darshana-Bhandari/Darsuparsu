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
