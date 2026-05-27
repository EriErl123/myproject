const monthName = 'May';
const year = 2026;
const monthIndex = 4;
const daysInMonth = 31;
const storageKey = 'dutycalendarEntries';

const baseEntries = {
  '2026-05-02': { status: 'DUTY', hours: '', location: '', notes: '' },
  '2026-05-10': { status: 'OFF', hours: '', location: '', notes: '' },
  '2026-05-13': { status: 'OFF', hours: '', location: '', notes: '' },
  '2026-05-20': { status: 'OFF', hours: '', location: '', notes: '' },
};

const grid = document.getElementById('calendarGrid');
const detailsBody = document.getElementById('detailsBody');
const form = document.getElementById('quickEntryForm');
const clearButton = document.getElementById('clearEntries');
const summaryDuty = document.getElementById('summaryDuty');
const summaryOff = document.getElementById('summaryOff');
const summaryEntries = document.getElementById('summaryEntries');
const summaryNextOff = document.getElementById('summaryNextOff');
const dateInput = document.getElementById('todayDate');

const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

let entries = loadEntries();

function pad(value) {
  return String(value).padStart(2, '0');
}

function makeDateKey(yearValue, monthValue, dayValue) {
  return `${yearValue}-${pad(monthValue + 1)}-${pad(dayValue)}`;
}

function parseDateKey(key) {
  return new Date(`${key}T00:00:00`);
}

function formatDate(date) {
  return formatter.format(date);
}

function loadStoredEntries() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function loadEntries() {
  return { ...baseEntries, ...loadStoredEntries() };
}

function saveEntries() {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function setDefaultDate() {
  if (!dateInput) return;
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  dateInput.value = local.toISOString().slice(0, 10);
}

function createLabelCell(text) {
  const cell = document.createElement('div');
  cell.className = 'label-cell';
  cell.textContent = text;
  return cell;
}

function isToday(dayValue) {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === monthIndex &&
    today.getDate() === dayValue
  );
}

function renderCalendar() {
  grid.innerHTML = '';
  labels.forEach(label => grid.appendChild(createLabelCell(label)));

  const firstDay = new Date(year, monthIndex, 1).getDay();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cell';
    empty.style.visibility = 'hidden';
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    const key = makeDateKey(year, monthIndex, day);
    const entry = entries[key];
    const status = entry?.status;

    cell.className = 'cell';
    if (status === 'OFF') cell.classList.add('off');
    if (status === 'DUTY') cell.classList.add('duty');
    if (isToday(day)) cell.classList.add('today');

    const dayLabel = document.createElement('div');
    dayLabel.className = 'day';
    dayLabel.textContent = day;
    cell.appendChild(dayLabel);

    if (status === 'OFF') {
      const badge = document.createElement('span');
      badge.className = 'badge off';
      badge.textContent = 'OFF';
      cell.appendChild(badge);
    }

    if (status === 'DUTY') {
      const badge = document.createElement('span');
      badge.className = 'badge duty';
      badge.textContent = 'DUTY';
      cell.appendChild(badge);
    }

    grid.appendChild(cell);
  }
}

function renderDetails() {
  detailsBody.innerHTML = '';
  const keys = Object.keys(entries).sort();

  keys.forEach((key) => {
    const entry = entries[key];
    const date = parseDateKey(key);
    const row = document.createElement('tr');
    const statusClass = entry.status ? entry.status.toLowerCase() : '';
    row.innerHTML = `
      <td>${formatDate(date)}</td>
      <td><span class="status-pill ${statusClass}">${entry.status || ''}</span></td>
      <td>${entry.hours || ''}</td>
      <td>${entry.location || ''}</td>
      <td>${entry.notes || ''}</td>
    `;
    detailsBody.appendChild(row);
  });
}

function updateSummary() {
  const monthKey = `${year}-${pad(monthIndex + 1)}`;
  const monthlyEntries = Object.entries(entries)
    .filter(([key]) => key.startsWith(monthKey))
    .map(([key, entry]) => ({ key, entry }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const dutyCount = monthlyEntries.filter(({ entry }) => entry.status === 'DUTY').length;
  const offCount = monthlyEntries.filter(({ entry }) => entry.status === 'OFF').length;
  const offDates = monthlyEntries
    .filter(({ entry }) => entry.status === 'OFF')
    .map(({ key }) => parseDateKey(key));

  summaryDuty.textContent = dutyCount;
  summaryOff.textContent = offCount;
  summaryEntries.textContent = monthlyEntries.length;

  if (offDates.length === 0) {
    summaryNextOff.textContent = '—';
    return;
  }

  const today = new Date();
  const next = offDates.find((date) => date >= today) || offDates[0];
  summaryNextOff.textContent = formatDate(next);
}

function upsertEntry(data) {
  entries[data.dateKey] = {
    status: data.status,
    hours: data.hours,
    location: data.location,
    notes: data.notes,
  };
  saveEntries();
  renderCalendar();
  renderDetails();
  updateSummary();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const dateValue = document.getElementById('todayDate').value;
  const status = document.getElementById('todayStatus').value;
  const hours = document.getElementById('todayHours').value.trim();
  const location = document.getElementById('todayLocation').value.trim();
  const notes = document.getElementById('todayNotes').value.trim();

  if (!dateValue) {
    alert('Please select a date.');
    return;
  }

  if (!status) {
    alert('Please select a status.');
    return;
  }

  upsertEntry({
    dateKey: dateValue,
    status,
    hours,
    location,
    notes,
  });

  form.reset();
  setDefaultDate();
});

clearButton.addEventListener('click', () => {
  const shouldClear = confirm('Clear all saved entries and reset to defaults?');
  if (!shouldClear) return;
  entries = { ...baseEntries };
  saveEntries();
  renderCalendar();
  renderDetails();
  updateSummary();
  setDefaultDate();
});

setDefaultDate();
renderCalendar();
renderDetails();
updateSummary();
