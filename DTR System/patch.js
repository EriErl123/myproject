const fs = require('fs');

const indexFile = 'index.html';
const jsonFile = 'dtr_data.json';

let html = fs.readFileSync(indexFile, 'utf8');
const data = fs.readFileSync(jsonFile, 'utf8');

// 1. Footer actions
const oldFooter = `  <!-- FOOTER ACTIONS -->
  <div class="footer-actions">
    <button class="btn btn-print"  onclick="printRecord()">🖨 Print Record</button>
    <button class="btn btn-export" onclick="exportCSV()">⬇ Export CSV</button>
  </div>`;

const newFooter = `  <!-- FOOTER ACTIONS -->
  <div class="footer-actions">
    <button class="btn btn-print"  onclick="printRecord()">🖨 Print</button>
    <button class="btn btn-export" onclick="exportCSV()">⬇ CSV</button>
    <button class="btn btn-export" style="background: linear-gradient(135deg, #ea580c, #f97316); box-shadow: 0 8px 24px rgba(249,115,22,0.3);" onclick="exportJSON()">⬇ JSON</button>
    <button class="btn btn-export" style="background: linear-gradient(135deg, #0d9488, #14b8a6); box-shadow: 0 8px 24px rgba(20,184,166,0.3);" onclick="document.getElementById('importJsonFile').click()">⬆ Import</button>
    <input type="file" id="importJsonFile" accept=".json" style="display:none;" onchange="importJSON(event)" />
  </div>`;

html = html.replace(oldFooter, newFooter);

// 2. Data load logic
const oldLoad = `function loadRecords() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}`;

const newLoad = `const DEFAULT_RECORDS = ${data};

function loadRecords() {
  try { 
    const stored = localStorage.getItem(STORE_KEY);
    if (!stored) {
      // First load: seed with default records
      localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_RECORDS));
      return DEFAULT_RECORDS;
    }
    return JSON.parse(stored) || []; 
  }
  catch { return []; }
}`;

html = html.replace(oldLoad, newLoad);

// 3. Export/Import logic at the bottom
const oldExport = `}

/* =============================================
   INIT
   ============================================= */`;

const newExport = `}

/* =============================================
   EXPORT & IMPORT JSON
   ============================================= */
function exportJSON() {
  if (!records.length) { showToast('No records to export.', 'error'); return; }
  
  const search     = document.getElementById('searchInput').value.trim().toLowerCase();
  const dateFilter = document.getElementById('filterDate').value;
  let dataExport = records;
  if (search)     dataExport = dataExport.filter(r => r.name.toLowerCase().includes(search));
  if (dateFilter) dataExport = dataExport.filter(r => r.dateKey === dateFilter);

  const json = JSON.stringify(dataExport, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = \`DTR_\${formatDateKey(new Date())}.json\`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('JSON exported successfully!', 'success');
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      
      // Basic merge (could also just replace)
      // Here we append preventing exact ID duplicates
      let added = 0;
      imported.forEach(imp => {
         if (!records.find(r => r.id === imp.id)) {
            records.push(imp);
            added++;
         }
      });
      
      records.sort((a,b) => b.timeInRaw - a.timeInRaw);
      saveRecords(records);
      renderTable();
      updateStats();
      showToast(\`✅ Imported \${added} new records!\`, 'success');
    } catch (err) {
      showToast('⚠️ Invalid JSON file.', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = ""; // reset input
}

/* =============================================
   INIT
   ============================================= */`;

html = html.replace(oldExport, newExport);

fs.writeFileSync(indexFile, html);
console.log('Successfully patched index.html');
