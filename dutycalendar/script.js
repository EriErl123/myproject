const offDays = new Set([10, 13, 20]);
const dutyDays = new Set([2]);

const grid = document.getElementById('calendarGrid');
const detailsBody = document.getElementById('detailsBody');
const form = document.getElementById('quickEntryForm');

const monthName = 'May';
const year = 2026;
const daysInMonth = 31;

const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function createLabelCell(text) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.style.background = 'transparent';
  cell.style.border = 'none';
  cell.style.minHeight = 'auto';
  cell.style.padding = '0 8px 8px';
  cell.style.color = 'var(--muted)';
  cell.textContent = text;
  return cell;
}

function renderCalendar() {
  grid.innerHTML = '';

  labels.forEach(label => grid.appendChild(createLabelCell(label)));

  const firstDay = new Date(year, 4, 1).getDay(); // May is month 4 (0-based)

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cell';
    empty.style.visibility = 'hidden';
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    const isOff = offDays.has(day);
    const isDuty = dutyDays.has(day);

    cell.className = 'cell' + (isOff ? ' off' : '') + (isDuty ? ' duty' : '');

    const dayLabel = document.createElement('div');
    dayLabel.className = 'day';
    dayLabel.textContent = day;

    cell.appendChild(dayLabel);

    if (isOff) {
      const badge = document.createElement('span');
      badge.className = 'badge off';
      badge.textContent = 'OFF';
      cell.appendChild(badge);
    }

    if (isDuty) {
      const badge = document.createElement('span');
      badge.className = 'badge duty';
      badge.textContent = 'DUTY';
      cell.appendChild(badge);
    }

    grid.appendChild(cell);
  }
}

function addDetailRow({ date, status, hours, location, notes }) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${date}</td>
    <td>${status || ''}</td>
    <td>${hours || ''}</td>
    <td>${location || ''}</td>
    <td>${notes || ''}</td>
  `;
  detailsBody.appendChild(row);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const dateValue = document.getElementById('todayDate').value;
  const status = document.getElementById('todayStatus').value;
  const hours = document.getElementById('todayHours').value;
  const location = document.getElementById('todayLocation').value;
  const notes = document.getElementById('todayNotes').value;

  if (!dateValue) {
    alert('Please select a date.');
    return;
  }

  const date = new Date(dateValue);
  const formatted = `${monthName} ${date.getDate()}, ${date.getFullYear()}`;

  addDetailRow({
    date: formatted,
    status,
    hours,
    location,
    notes,
  });

  form.reset();
});

renderCalendar();
