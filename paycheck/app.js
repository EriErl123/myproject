/* ==========================================================================
   PayCheck - Premium Business Logic & PWA Engine
   Features: IndexedDB, Live Timer, Interactive Calendar, Timeline Feed, 
             Heatmap Grid, Chart.js Integration, and Bottom Sheets controller.
   ========================================================================== */

const DB_NAME = "paycheckDB";
const DB_VERSION = 2; // Incremented version to support rich attendance timestamps

let db = null;
let monthlyChart = null;
let trendChart = null;
let timerInterval = null;

// Active calendar view state
let calendarDate = new Date();
// Active date details state
let selectedDateStr = "";

/* ==========================================================================
   1. DATABASE ENGINE (IndexedDB)
   ========================================================================== */

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            
            // Core Stores
            if (!database.objectStoreNames.contains("attendance")) {
                database.createObjectStore("attendance", { keyPath: "date" }); // One DTR entry per day
            }
            if (!database.objectStoreNames.contains("paydays")) {
                database.createObjectStore("paydays", { keyPath: "id", autoIncrement: true });
            }
            if (!database.objectStoreNames.contains("settings")) {
                database.createObjectStore("settings", { keyPath: "key" });
            }
        };
    });
}

// Database Helpers
function getStore(storeName, mode) {
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
}

function putRecord(storeName, data) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readwrite");
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteRecord(storeName, key) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readwrite");
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function getAll(storeName) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readonly");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getRecord(storeName, key) {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, "readonly");
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Seed Default Configurations
async function seedDefaultSettings() {
    const dailyRate = await getRecord("settings", "dailyRate");
    const hourlyRate = await getRecord("settings", "hourlyRate");
    const paydayDay = await getRecord("settings", "paydayDay");

    if (!dailyRate) await putRecord("settings", { key: "dailyRate", value: 1800 });
    if (!hourlyRate) await putRecord("settings", { key: "hourlyRate", value: 225 });
    if (!paydayDay) await putRecord("settings", { key: "paydayDay", value: "Friday" });
}

/* ==========================================================================
   2. DATE & NUMERIC UTILITIES
   ========================================================================== */

function getTodayISO() {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; // local offset in ms
    return (new Date(Date.now() - tzoffset)).toISOString().split("T")[0];
}

function formatTimeTo12h(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

function formatDateToReadable(dateStr) {
    if (!dateStr) return "N/A";
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", options);
}

function formatCurrency(amount) {
    return Number(amount).toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function getDayOfWeekIndex(dayName) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days.indexOf(dayName);
}

/* ==========================================================================
   3. BOTTOM SHEET MODAL CONTROLLER
   ========================================================================== */

function setupBottomSheets() {
    const backdrop = document.getElementById("sheetBackdrop");
    const sheets = document.querySelectorAll(".bottom-sheet");

    // Close on backdrop tap
    backdrop.addEventListener("click", closeAllSheets);

    // Setup handle dragging close trigger (UX element)
    sheets.forEach(sheet => {
        const handle = sheet.querySelector(".sheet-handle");
        if (handle) {
            handle.addEventListener("click", closeAllSheets);
        }
    });
}

function openSheet(sheetId) {
    closeAllSheets();
    const backdrop = document.getElementById("sheetBackdrop");
    const sheet = document.getElementById(sheetId);
    
    if (sheet) {
        backdrop.classList.add("show");
        sheet.classList.add("show");
    }
}

function closeAllSheets() {
    const backdrop = document.getElementById("sheetBackdrop");
    const sheets = document.querySelectorAll(".bottom-sheet");
    
    backdrop.classList.remove("show");
    sheets.forEach(sheet => {
        sheet.classList.remove("show");
    });
}

/* ==========================================================================
   4. LIVE TIMER ENGINE
   ========================================================================== */

async function startLiveTimerIfActive() {
    if (timerInterval) clearInterval(timerInterval);

    const today = getTodayISO();
    const todayLog = await getRecord("attendance", today);

    const timerStatusDot = document.getElementById("timerStatusDot");
    const timerStatusText = document.getElementById("timerStatusText");
    const timerDisplay = document.getElementById("timerDisplay");
    const timerInBadge = document.getElementById("timerInBadge");
    
    const dashboardInBtn = document.getElementById("dashboardTimeInBtn");
    const dashboardOutBtn = document.getElementById("dashboardTimeOutBtn");
    const quickInBtn = document.getElementById("btnQuickTimeIn");
    const quickOutBtn = document.getElementById("btnQuickTimeOut");

    if (todayLog && todayLog.timeInTimestamp && !todayLog.timeOutTimestamp) {
        // Currently working (Timed In)
        timerStatusDot.className = "status-dot online";
        timerStatusText.textContent = "Working Now";
        
        timerInBadge.classList.remove("hidden");
        timerInBadge.textContent = `In: ${todayLog.timeIn}`;

        // Disable Time In, Enable Time Out
        dashboardInBtn.classList.add("disabled");
        dashboardInBtn.disabled = true;
        dashboardOutBtn.classList.remove("disabled");
        dashboardOutBtn.disabled = false;

        quickInBtn.classList.add("disabled");
        quickInBtn.disabled = true;
        quickOutBtn.classList.remove("disabled");
        quickOutBtn.disabled = false;

        // Run interval
        timerInterval = setInterval(() => {
            const diffMs = Date.now() - todayLog.timeInTimestamp;
            const secs = Math.floor(diffMs / 1000) % 60;
            const mins = Math.floor(diffMs / 60000) % 60;
            const hours = Math.floor(diffMs / 3600000);

            timerDisplay.textContent = 
                `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }, 1000);

    } else {
        // Idle
        timerStatusDot.className = "status-dot offline";
        timerInBadge.classList.add("hidden");
        
        if (todayLog && todayLog.timeInTimestamp && todayLog.timeOutTimestamp) {
            timerStatusText.textContent = "Work Finished";
            timerDisplay.textContent = todayLog.totalHours 
                ? `${String(Math.floor(todayLog.totalHours)).padStart(2, '0')}:${String(Math.floor((todayLog.totalHours % 1) * 60)).padStart(2, '0')}:00`
                : "Completed";
            
            // Both disabled (Day is complete)
            dashboardInBtn.classList.add("disabled");
            dashboardInBtn.disabled = true;
            dashboardOutBtn.classList.add("disabled");
            dashboardOutBtn.disabled = true;

            quickInBtn.classList.add("disabled");
            quickInBtn.disabled = true;
            quickOutBtn.classList.add("disabled");
            quickOutBtn.disabled = true;
        } else {
            timerStatusText.textContent = "Not Working";
            timerDisplay.textContent = "00:00:00";
            
            // Enable Time In, Disable Time Out
            dashboardInBtn.classList.remove("disabled");
            dashboardInBtn.disabled = false;
            dashboardOutBtn.classList.add("disabled");
            dashboardOutBtn.disabled = true;

            quickInBtn.classList.remove("disabled");
            quickInBtn.disabled = false;
            quickOutBtn.classList.add("disabled");
            quickOutBtn.disabled = true;
        }
    }
}

/* ==========================================================================
   5. ATTENDANCE LOGGING FLOWS (Time In / Time Out)
   ========================================================================== */

async function logTimeIn() {
    const today = getTodayISO();
    const now = new Date();
    
    // Check if record exists
    const record = await getRecord("attendance", today);
    if (record && record.timeInTimestamp) {
        alert("You have already Timed In today.");
        return;
    }

    const newRecord = {
        date: today,
        timeIn: formatTimeTo12h(now),
        timeInTimestamp: now.getTime(),
        timeOut: null,
        timeOutTimestamp: null,
        totalHours: 0,
        createdAt: now.getTime()
    };

    await putRecord("attendance", newRecord);
    closeAllSheets();
    await refreshAllViews();
    animateNumberCounter("timerDisplay", 0, 0, 100); // Visual indicator
}

async function logTimeOut() {
    const today = getTodayISO();
    const now = new Date();

    const record = await getRecord("attendance", today);
    if (!record || !record.timeInTimestamp) {
        alert("You must Time In first before timing out.");
        return;
    }
    if (record.timeOutTimestamp) {
        alert("You have already Timed Out today.");
        return;
    }

    record.timeOut = formatTimeTo12h(now);
    record.timeOutTimestamp = now.getTime();
    
    // Calculate total hours
    const diffMs = record.timeOutTimestamp - record.timeInTimestamp;
    record.totalHours = diffMs / 3600000;

    await putRecord("attendance", record);
    closeAllSheets();
    await refreshAllViews();
}

/* ==========================================================================
   6. PAYDAY LOGGING FLOWS
   ========================================================================= */

async function savePaydayRecord(event) {
    event.preventDefault();

    const amountInput = document.getElementById("payAmount");
    const dateInput = document.getElementById("payDate");
    const startInput = document.getElementById("payPeriodStart");
    const endInput = document.getElementById("payPeriodEnd");
    const notesInput = document.getElementById("payNotes");

    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const periodStart = startInput.value;
    const periodEnd = endInput.value;
    const notes = notesInput.value.trim();

    if (isNaN(amount) || amount <= 0 || !date || !periodStart || !periodEnd) {
        alert("Please fill in all required fields accurately.");
        return;
    }

    const payday = {
        amount,
        date,
        periodStart,
        periodEnd,
        notes,
        createdAt: Date.now()
    };

    await putRecord("paydays", payday);
    
    // Clear Form & Close
    document.getElementById("paydaySheetForm").reset();
    closeAllSheets();
    await refreshAllViews();
}

async function deletePaydayRecord(id) {
    if (confirm("Are you sure you want to delete this payday record?")) {
        await deleteRecord("paydays", id);
        await refreshAllViews();
    }
}

/* ==========================================================================
   7. MANUAL/EDIT LOG FLOWS
   ========================================================================== */

async function saveManualDtrLog(event) {
    event.preventDefault();

    const dateInput = document.getElementById("logDate").value;
    const timeInStr = document.getElementById("logTimeIn").value;
    const timeOutStr = document.getElementById("logTimeOut").value;
    const editId = document.getElementById("editRecordId").value;

    if (!dateInput || !timeInStr) {
        alert("Date and Time In are required.");
        return;
    }

    // Generate accurate timestamps
    const [inHours, inMins] = timeInStr.split(":");
    const inDateObj = new Date(dateInput + "T00:00:00");
    inDateObj.setHours(parseInt(inHours), parseInt(inMins));

    let outTimeStr = null;
    let outTimestamp = null;
    let totalHours = 0;

    if (timeOutStr) {
        const [outHours, outMins] = timeOutStr.split(":");
        const outDateObj = new Date(dateInput + "T00:00:00");
        outDateObj.setHours(parseInt(outHours), parseInt(outMins));
        
        // Handle overnight shift edge case (Out time < In time)
        if (outDateObj.getTime() < inDateObj.getTime()) {
            outDateObj.setDate(outDateObj.getDate() + 1);
        }

        outTimeStr = formatTimeTo12h(outDateObj);
        outTimestamp = outDateObj.getTime();
        totalHours = (outTimestamp - inDateObj.getTime()) / 3600000;
    }

    const record = {
        date: dateInput,
        timeIn: formatTimeTo12h(inDateObj),
        timeInTimestamp: inDateObj.getTime(),
        timeOut: outTimeStr,
        timeOutTimestamp: outTimestamp,
        totalHours: totalHours,
        createdAt: editId ? parseInt(editId) : Date.now()
    };

    await putRecord("attendance", record);
    closeAllSheets();
    await refreshAllViews();
}

async function deleteAttendanceRecord(dateStr) {
    if (confirm(`Remove all work logs for ${formatDateToReadable(dateStr)}?`)) {
        await deleteRecord("attendance", dateStr);
        closeAllSheets();
        await refreshAllViews();
    }
}

/* ==========================================================================
   8. INTERACTIVE CALENDAR GENERATOR
   ========================================================================== */

async function renderCalendar() {
    const calendarGrid = document.getElementById("calendarGrid");
    const monthTitle = document.getElementById("calendarMonthTitle");

    // Clean grid
    calendarGrid.innerHTML = "";

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    // Set Header
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    monthTitle.textContent = `${monthNames[month]} ${year}`;

    // Get First Day and Total Days in month
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Fetch records for current month
    const attendanceLogs = await getAll("attendance");
    const paydayLogs = await getAll("paydays");

    // Helper to find log for specific date (YYYY-MM-DD)
    const getLogForDate = (dateStr) => attendanceLogs.find(log => log.date === dateStr);
    const getPayForDate = (dateStr) => paydayLogs.filter(pay => pay.date === dateStr);

    // Padding empty spaces
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-day empty-day";
        calendarGrid.appendChild(emptyCell);
    }

    const todayISO = getTodayISO();

    // Loop through month days
    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "calendar-day";
        
        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(month + 1).padStart(2, '0');
        const cellDateISO = `${year}-${monthStr}-${dayStr}`;

        if (cellDateISO === todayISO) {
            dayCell.classList.add("today");
        }

        const dayNumSpan = document.createElement("span");
        dayNumSpan.className = "day-num";
        dayNumSpan.textContent = day;
        dayCell.appendChild(dayNumSpan);

        // Status dot placement
        const dotsWrapper = document.createElement("div");
        dotsWrapper.className = "status-dots";
        
        const workLog = getLogForDate(cellDateISO);
        const payLogs = getPayForDate(cellDateISO);

        if (workLog) {
            const dot = document.createElement("span");
            if (workLog.timeInTimestamp && workLog.timeOutTimestamp) {
                dot.className = "legend-dot green"; // Complete
            } else if (workLog.timeInTimestamp && !workLog.timeOutTimestamp) {
                // If it's a past date, highlight as missed timeout
                if (cellDateISO < todayISO) {
                    dot.className = "legend-dot red"; // Missed Out
                } else {
                    dot.className = "legend-dot yellow"; // Active In Only
                }
            }
            dotsWrapper.appendChild(dot);
        }

        if (payLogs.length > 0) {
            const payDot = document.createElement("span");
            payDot.className = "legend-dot blue"; // Payday
            dotsWrapper.appendChild(payDot);
        }

        dayCell.appendChild(dotsWrapper);

        // Grid Click Trigger
        dayCell.addEventListener("click", () => showDateDetails(cellDateISO, workLog, payLogs));

        calendarGrid.appendChild(dayCell);
    }
}

/* ==========================================================================
   9. DATE DETAILS BOTTOM SHEET
   ========================================================================== */

async function showDateDetails(dateStr, workLog, payLogs) {
    selectedDateStr = dateStr;
    
    const detailsDateStr = document.getElementById("detailsDateStr");
    const statusBadge = document.getElementById("detailsStatusBadge");
    const timeInVal = document.getElementById("detailsTimeInVal");
    const timeOutVal = document.getElementById("detailsTimeOutVal");
    const hoursVal = document.getElementById("detailsHoursVal");
    const earningsVal = document.getElementById("detailsEarningsVal");
    const notesContainer = document.getElementById("detailsNotesContainer");
    const notesVal = document.getElementById("detailsNotesVal");

    // Format header
    detailsDateStr.textContent = formatDateToReadable(dateStr);

    // Get hourly / daily settings for estimated earnings
    const dailyRateSetting = await getRecord("settings", "dailyRate");
    const hourlyRateSetting = await getRecord("settings", "hourlyRate");
    
    const dRate = dailyRateSetting ? dailyRateSetting.value : 1800;
    const hRate = hourlyRateSetting ? hourlyRateSetting.value : 225;

    // Reset layout
    statusBadge.className = "badge";
    notesContainer.classList.add("hidden");

    if (workLog) {
        timeInVal.textContent = workLog.timeIn || "--:--";
        timeOutVal.textContent = workLog.timeOut || "--:--";

        if (workLog.timeInTimestamp && workLog.timeOutTimestamp) {
            statusBadge.classList.add("green");
            statusBadge.textContent = "Complete Workday";

            const hours = workLog.totalHours || 0;
            const hInt = Math.floor(hours);
            const mInt = Math.round((hours % 1) * 60);
            hoursVal.textContent = `${hInt}h ${mInt}m`;

            // Earnings Calculation: Hourly priority, falls back to Daily
            let estEarn = 0;
            if (hRate > 0) {
                estEarn = hours * hRate;
            } else {
                estEarn = dRate;
            }
            earningsVal.textContent = `₱${formatCurrency(estEarn)}`;

        } else {
            const today = getTodayISO();
            if (workLog.date < today) {
                statusBadge.classList.add("red");
                statusBadge.textContent = "Missing Time Out";
            } else {
                statusBadge.classList.add("yellow");
                statusBadge.textContent = "Active Work In Progress";
            }

            hoursVal.textContent = "--";
            earningsVal.textContent = "₱0";
        }
    } else {
        // Off day
        statusBadge.classList.add("gray");
        statusBadge.textContent = "Off Day";
        timeInVal.textContent = "--:--";
        timeOutVal.textContent = "--:--";
        hoursVal.textContent = "0h";
        earningsVal.textContent = "₱0";
    }

    // Payday summary details overlay
    if (payLogs && payLogs.length > 0) {
        notesContainer.classList.remove("hidden");
        
        let payText = "";
        payLogs.forEach((p, idx) => {
            payText += `${idx + 1}. Received ₱${formatCurrency(p.amount)}.\n` + 
                       `Covered period: ${formatDateToReadable(p.periodStart)} to ${formatDateToReadable(p.periodEnd)}.\n` +
                       `Notes: ${p.notes || "None"}\n\n`;
        });
        notesVal.textContent = payText.trim();
    }

    // Setup action delete listener
    const deleteBtn = document.getElementById("detailsDeleteBtn");
    const editBtn = document.getElementById("detailsEditBtn");

    if (workLog) {
        deleteBtn.style.display = "inline-flex";
        deleteBtn.onclick = () => deleteAttendanceRecord(dateStr);
        
        editBtn.onclick = () => {
            document.getElementById("manualLogSheetTitle").textContent = "Modify Work Log";
            document.getElementById("logDate").value = dateStr;
            document.getElementById("editRecordId").value = workLog.createdAt;
            
            // Format time values back to 24h for input box
            if (workLog.timeInTimestamp) {
                const inDate = new Date(workLog.timeInTimestamp);
                const h = String(inDate.getHours()).padStart(2, '0');
                const m = String(inDate.getMinutes()).padStart(2, '0');
                document.getElementById("logTimeIn").value = `${h}:${m}`;
            }
            if (workLog.timeOutTimestamp) {
                const outDate = new Date(workLog.timeOutTimestamp);
                const h = String(outDate.getHours()).padStart(2, '0');
                const m = String(outDate.getMinutes()).padStart(2, '0');
                document.getElementById("logTimeOut").value = `${h}:${m}`;
            } else {
                document.getElementById("logTimeOut").value = "";
            }

            openSheet("manualLogSheet");
        };
    } else {
        deleteBtn.style.display = "none";
        editBtn.onclick = () => {
            document.getElementById("manualLogSheetTitle").textContent = "Add Record";
            document.getElementById("logDate").value = dateStr;
            document.getElementById("editRecordId").value = "";
            document.getElementById("logTimeIn").value = "08:00";
            document.getElementById("logTimeOut").value = "17:00";
            openSheet("manualLogSheet");
        };
    }

    openSheet("dateDetailsSheet");
}

/* ==========================================================================
   10. TIMELINE FEED GENERATOR (chronological stream of events)
   ========================================================================== */

async function buildTimelineFeeds() {
    const attendanceLogs = await getAll("attendance");
    const paydayLogs = await getAll("paydays");

    const timelineItems = [];

    // Process DTR logs
    attendanceLogs.forEach(log => {
        if (log.timeInTimestamp) {
            // Time In Item
            timelineItems.push({
                date: log.date,
                timestamp: log.timeInTimestamp,
                type: "in",
                title: "⏰ Time In",
                desc: "Checked in for shifts",
                timeLabel: log.timeIn,
                valueLabel: ""
            });
        }
        if (log.timeOutTimestamp) {
            // Time Out Item
            timelineItems.push({
                date: log.date,
                timestamp: log.timeOutTimestamp,
                type: "out",
                title: "🏁 Time Out",
                desc: `Worked: ${Math.floor(log.totalHours)}h ${Math.round((log.totalHours % 1) * 60)}m`,
                timeLabel: log.timeOut,
                valueLabel: ""
            });
        }
    });

    // Process Paydays
    paydayLogs.forEach(pay => {
        const startText = pay.periodStart ? pay.periodStart.slice(5) : "N/A";
        const endText = pay.periodEnd ? pay.periodEnd.slice(5) : "N/A";
        timelineItems.push({
            date: pay.date,
            timestamp: new Date(pay.date + "T12:00:00").getTime(), // Approximate midday
            type: "pay",
            title: "💰 Pay Received",
            desc: pay.periodStart && pay.periodEnd ? `Period: ${startText} to ${endText}` : "Salary Payment",
            timeLabel: "Salary",
            valueLabel: `+₱${formatCurrency(pay.amount)}`
        });
    });

    // Smart Missing Paydays Detection
    const expectedPaydaySetting = await getRecord("settings", "paydayDay");
    const targetDay = getDayOfWeekIndex(expectedPaydaySetting ? expectedPaydaySetting.value : "Friday");
    
    // Scan recent weeks for target days and alert missing payments
    // Look at last 4 weeks of target days
    const today = new Date();
    for (let i = 0; i < 4; i++) {
        const lastExpected = new Date(today);
        lastExpected.setDate(today.getDate() - (today.getDay() - targetDay + 7 * i) % 28);
        const expectedDateStr = lastExpected.toISOString().split("T")[0];

        // Restrict payday alerts to the current calendar month only
        if (lastExpected.getMonth() !== today.getMonth() || lastExpected.getFullYear() !== today.getFullYear()) {
            continue;
        }

        if (expectedDateStr <= getTodayISO()) {
            const hasPaydayLogged = paydayLogs.some(pay => pay.date === expectedDateStr);
            if (!hasPaydayLogged) {
                timelineItems.push({
                    date: expectedDateStr,
                    timestamp: lastExpected.getTime() + 43200000, // Midday
                    type: "alert",
                    title: "⚠ Missing Payday",
                    desc: `No transaction logged on scheduled day`,
                    timeLabel: "Warning",
                    valueLabel: ""
                });
            }
        }
    }

    // Sort items chronologically (latest first)
    timelineItems.sort((a, b) => {
        if (a.date !== b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.timestamp - a.timestamp;
    });

    // Render logic
    const renderFeed = (containerId, items) => {
        const container = document.getElementById(containerId);
        container.innerHTML = "";

        if (items.length === 0) {
            container.innerHTML = `
                <div class="timeline-empty-state">
                    <div class="empty-icon">📅</div>
                    <span class="empty-text">No activity yet.</span>
                </div>
            `;
            return;
        }

        let lastGroupDate = "";

        items.forEach(item => {
            // Insert date grouping headers
            if (item.date !== lastGroupDate) {
                lastGroupDate = item.date;
                const header = document.createElement("div");
                header.className = "timeline-date-header";
                header.textContent = formatDateToReadable(item.date);
                container.appendChild(header);
            }

            const itemDiv = document.createElement("div");
            itemDiv.className = "timeline-item";

            let dotColor = "gray";
            let valColorClass = "";
            if (item.type === "in") dotColor = "green";
            if (item.type === "out") dotColor = "yellow";
            if (item.type === "pay") { dotColor = "blue"; valColorClass = "green"; }
            if (item.type === "alert") { dotColor = "red"; valColorClass = "red"; }

            itemDiv.innerHTML = `
                <div class="timeline-dot ${dotColor}"></div>
                <div class="timeline-content">
                    <div class="timeline-text-wrapper">
                        <span class="timeline-title">${item.title}</span>
                        <span class="timeline-desc">${item.desc}</span>
                    </div>
                    <div style="text-align: right">
                        <span class="timeline-time">${item.timeLabel}</span>
                        ${item.valueLabel ? `<div class="timeline-action ${valColorClass}">${item.valueLabel}</div>` : ""}
                    </div>
                </div>
            `;
            container.appendChild(itemDiv);
        });
    };

    // Render Recent (Dashboard: Limit to 5 timeline events, excluding the date headers)
    const dashboardItems = timelineItems.slice(0, 5);
    renderFeed("recentTimelineList", dashboardItems);

    // Render Full List
    renderFeed("fullTimelineList", timelineItems);

    // Update missing payday status banner on top
    const alertBox = document.getElementById("payAlert");
    const missingPayments = timelineItems.filter(item => item.type === "alert");
    if (missingPayments.length > 0) {
        alertBox.classList.remove("hidden");
        document.getElementById("alertDescription").innerHTML = 
            `Missing salary payout detected on <strong>${formatDateToReadable(missingPayments[0].date).split(',')[1]}</strong>`;
    } else {
        alertBox.classList.add("hidden");
    }
}

/* ==========================================================================
   11. PAY HISTORIES PAGE CONTROLLERS
   ========================================================================== */

async function renderPaydaysList() {
    const container = document.getElementById("payHistoryContainer");
    const payHistoryTotal = document.getElementById("payHistoryTotal");
    const payHistoryCount = document.getElementById("payHistoryCount");

    const paydays = await getAll("paydays");
    
    // Sort descending by payment date
    paydays.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate YTD Total
    const currentYear = new Date().getFullYear();
    const ytdTotal = paydays
        .filter(pay => new Date(pay.date).getFullYear() === currentYear)
        .reduce((sum, pay) => sum + pay.amount, 0);

    animateNumberCounter("payHistoryTotal", 0, ytdTotal, 600, true);
    payHistoryCount.textContent = `${paydays.length} paydays logged`;

    container.innerHTML = "";

    if (paydays.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty-state">
                <div class="empty-icon">💰</div>
                <span class="empty-text">No payment records yet.</span>
                <span class="empty-subtext">Tap Add Record to log income.</span>
            </div>
        `;
        return;
    }

    paydays.forEach(pay => {
        const startText = pay.periodStart ? (formatDateToReadable(pay.periodStart).split(',')[1] || formatDateToReadable(pay.periodStart)).trim() : "N/A";
        const endText = pay.periodEnd ? (formatDateToReadable(pay.periodEnd).split(',')[1] || formatDateToReadable(pay.periodEnd)).trim() : "N/A";
        const periodText = pay.periodStart && pay.periodEnd ? `Covered: ${startText} — ${endText}` : "Covered: N/A";

        const card = document.createElement("div");
        card.className = "pay-history-card card";
        card.innerHTML = `
            <div class="pay-card-header">
                <span class="pay-card-amount">₱${formatCurrency(pay.amount)}</span>
                <span class="pay-card-date">${formatDateToReadable(pay.date)}</span>
                <span class="pay-card-period">${periodText}</span>
                ${pay.notes ? `<span class="pay-card-notes">${pay.notes}</span>` : ""}
            </div>
            <button class="pay-card-delete" data-id="${pay.id}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        `;

        card.querySelector(".pay-card-delete").addEventListener("click", () => deletePaydayRecord(pay.id));
        container.appendChild(card);
    });
}

/* ==========================================================================
   12. DASHBOARD HERO CARD & ACCRUED METRICS
   ========================================================================== */

async function renderDashboardStats() {
    const attendanceLogs = await getAll("attendance");
    const paydayLogs = await getAll("paydays");

    const dailyRateSetting = await getRecord("settings", "dailyRate");
    const hourlyRateSetting = await getRecord("settings", "hourlyRate");
    const expectedPaydaySetting = await getRecord("settings", "paydayDay");

    const dRate = dailyRateSetting ? dailyRateSetting.value : 1800;
    const hRate = hourlyRateSetting ? hourlyRateSetting.value : 225;
    const paydayDayName = expectedPaydaySetting ? expectedPaydaySetting.value : "Friday";

    // Greeting Time Text
    const hour = new Date().getHours();
    const greetingText = document.getElementById("greetingText");
    if (hour < 12) greetingText.textContent = "Good Morning 👋";
    else if (hour < 18) greetingText.textContent = "Good Afternoon 👋";
    else greetingText.textContent = "Good Evening 👋";

    // Accrued Earnings Priority check
    // 1. Calculate Earnings This Month (Sum of logged pay received in current calendar month)
    const now = new Date();
    const thisMonthVal = now.getMonth();
    const thisYearVal = now.getFullYear();

    const currentMonthReceived = paydayLogs
        .filter(pay => {
            const payDate = new Date(pay.date + "T00:00:00");
            return payDate.getMonth() === thisMonthVal && payDate.getFullYear() === thisYearVal;
        })
        .reduce((sum, pay) => sum + pay.amount, 0);

    animateNumberCounter("dashboardEarnings", 0, currentMonthReceived, 600);

    // Days worked this month
    const currentMonthWorked = attendanceLogs.filter(log => {
        const logDate = new Date(log.date + "T00:00:00");
        return logDate.getMonth() === thisMonthVal && logDate.getFullYear() === thisYearVal && log.timeOutTimestamp;
    });
    document.getElementById("dashboardDaysWorked").textContent = `${currentMonthWorked.length} Days`;

    // 2. Accrued Earnings (Est.) since last payday date
    // Sort paydays by date
    paydayLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastPaydayDate = paydayLogs.length > 0 ? paydayLogs[0].date : "1970-01-01";

    const workedLogsSinceLastPayday = attendanceLogs.filter(log => {
        return log.date > lastPaydayDate && log.timeOutTimestamp;
    });

    let estAccrued = 0;
    workedLogsSinceLastPayday.forEach(log => {
        if (hRate > 0) {
            estAccrued += log.totalHours * hRate;
        } else {
            estAccrued += dRate;
        }
    });

    document.getElementById("dashboardAccrued").textContent = `₱${formatCurrency(estAccrued)}`;
    document.getElementById("dashboardHourlyRate").textContent = `₱${hRate}/h`;
    
    // Trend badge (+₱1,800 since last payday)
    const trendAmount = document.getElementById("trendAmount");
    const trendBadge = document.getElementById("trendBadge");
    
    if (estAccrued > 0) {
        trendBadge.style.display = "flex";
        trendAmount.textContent = `+₱${formatCurrency(estAccrued)} since payday`;
    } else {
        trendBadge.style.display = "none";
    }

    // 3. Countdown & Progress bar to next Payday
    const targetDayIndex = getDayOfWeekIndex(paydayDayName);
    
    // Find next payday date
    const nextPayday = new Date();
    const daysUntilNext = (targetDayIndex - nextPayday.getDay() + 7) % 7 || 7; // force 7 days if today is payday
    nextPayday.setDate(nextPayday.getDate() + daysUntilNext);
    
    // Display Remaining
    document.getElementById("dashboardNextPayday").textContent = `${daysUntilNext} Days Left`;
    document.getElementById("progressBarRemaining").textContent = `${daysUntilNext} days left`;
    document.getElementById("progressBarStart").textContent = `${paydayDayName}`;

    // Progress bar calculation (Standard weekly cycle)
    const progressPct = ((7 - daysUntilNext) / 7) * 100;
    document.getElementById("paydayProgressBar").style.width = `${progressPct}%`;
}

/* ==========================================================================
   13. ANALYTICS ENGINE (Chart.js & Heatmap Grid)
   ========================================================================== */

async function renderAnalytics() {
    const paydays = await getAll("paydays");
    const attendance = await getAll("attendance");

    const averagePayEl = document.getElementById("analyticsAvgPay");
    const totalDaysEl = document.getElementById("analyticsTotalDays");

    // Overview Stats
    const totalPayVal = paydays.reduce((sum, p) => sum + p.amount, 0);
    const avgPay = paydays.length > 0 ? totalPayVal / paydays.length : 0;
    const completedDays = attendance.filter(log => log.timeOutTimestamp).length;

    animateNumberCounter("analyticsAvgPay", 0, avgPay, 500, true);
    animateNumberCounter("analyticsTotalDays", 0, completedDays, 500);

    // Destroy existing charts to prevent canvas re-drawing bugs
    if (monthlyChart) monthlyChart.destroy();
    if (trendChart) trendChart.destroy();

    // 1. Group Earnings by Calendar Month (Last 6 Months)
    const monthlyData = {};
    const monthsArray = [];
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthsArray.push({ key, label });
        monthlyData[key] = 0;
    }

    paydays.forEach(pay => {
        const monthKey = pay.date.slice(0, 7); // YYYY-MM
        if (monthlyData[monthKey] !== undefined) {
            monthlyData[monthKey] += pay.amount;
        }
    });

    const barCtx = document.getElementById("analyticsBarChart").getContext("2d");
    monthlyChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: monthsArray.map(m => m.label),
            datasets: [{
                data: monthsArray.map(m => monthlyData[m.key]),
                backgroundColor: 'rgba(59, 130, 246, 0.85)',
                borderRadius: 8,
                barThickness: 16
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { family: 'Inter' } } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Inter' } } }
            }
        }
    });

    // 2. Cumulative Earnings Line Chart
    // Sort paydays ascending
    const sortedPaydays = [...paydays].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runTotal = 0;
    const trendLabels = [];
    const trendAmounts = [];

    sortedPaydays.forEach(pay => {
        runTotal += pay.amount;
        trendLabels.push(new Date(pay.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
        trendAmounts.push(runTotal);
    });

    // Fallback if no pay records
    if (trendLabels.length === 0) {
        trendLabels.push("None");
        trendAmounts.push(0);
    }

    const lineCtx = document.getElementById("analyticsLineChart").getContext("2d");
    trendChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: trendLabels,
            datasets: [{
                data: trendAmounts,
                borderColor: '#10b981',
                borderWidth: 3,
                pointBackgroundColor: '#10b981',
                pointRadius: 2,
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { family: 'Inter' } } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Inter' } } }
            }
        }
    });

    // 3. GitHub Style Attendance Heatmap (12 Weeks)
    buildHeatmap(attendance);
}

function buildHeatmap(attendance) {
    const container = document.getElementById("attendanceHeatmap");
    container.innerHTML = "";

    const today = new Date();
    // Start heatmap 11 weeks ago (84 days total, 12 columns of 7 days)
    const totalDays = 84;
    const startDate = new Date();
    startDate.setDate(today.getDate() - totalDays + 1);

    // Map logs to date
    const workedHoursMap = {};
    attendance.forEach(log => {
        if (log.timeOutTimestamp) {
            workedHoursMap[log.date] = log.totalHours;
        }
    });

    // Render cells
    for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dateISO = currentDate.toISOString().split("T")[0];
        const hours = workedHoursMap[dateISO] || 0;

        const cell = document.createElement("div");
        cell.className = "heatmap-cell";
        
        // Intensity mapping
        if (hours === 0) cell.classList.add("lvl-0");
        else if (hours < 4) cell.classList.add("lvl-1");
        else if (hours <= 8) cell.classList.add("lvl-2");
        else cell.classList.add("lvl-3");

        // Tooltip description
        const cleanDateLabel = currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        cell.title = `${cleanDateLabel}: ${hours.toFixed(1)} hrs worked`;
        
        // Show first letter of day on first column cells
        if (i % 7 === 0) {
            const daysNames = ["S", "M", "T", "W", "T", "F", "S"];
            cell.textContent = daysNames[currentDate.getDay()];
        }

        container.appendChild(cell);
    }
}

/* ==========================================================================
   14. SETTINGS HANDLERS
   ========================================================================== */

async function loadSettingsView() {
    const dailyRate = await getRecord("settings", "dailyRate");
    const hourlyRate = await getRecord("settings", "hourlyRate");
    const paydayDay = await getRecord("settings", "paydayDay");

    if (dailyRate) document.getElementById("settingsDailyRate").value = dailyRate.value;
    if (hourlyRate) document.getElementById("settingsHourlyRate").value = hourlyRate.value;
    if (paydayDay) document.getElementById("settingsExpectedPayday").value = paydayDay.value;
}

async function saveSettingsData() {
    const dailyVal = parseFloat(document.getElementById("settingsDailyRate").value) || 0;
    const hourlyVal = parseFloat(document.getElementById("settingsHourlyRate").value) || 0;
    const paydayVal = document.getElementById("settingsExpectedPayday").value;

    await putRecord("settings", { key: "dailyRate", value: dailyVal });
    await putRecord("settings", { key: "hourlyRate", value: hourlyVal });
    await putRecord("settings", { key: "paydayDay", value: paydayVal });

    alert("Settings saved successfully!");
    await refreshAllViews();
}

async function clearDatabase() {
    if (confirm("🚨 WARNING: Are you sure you want to delete all settings, time logs, and paydays?\nThis action is permanent.")) {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => {
            alert("Database deleted successfully. The application will now reload.");
            location.reload();
        };
        req.onerror = () => {
            alert("Failed to delete database. Please try clearing browser cache.");
        };
    }
}

async function exportDatabaseData() {
    try {
        const backup = {
            version: 2.0,
            exportedAt: new Date().toISOString(),
            attendance: await getAll("attendance"),
            paydays: await getAll("paydays"),
            settings: await getAll("settings")
        };

        const jsonString = JSON.stringify(backup, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `paycheck_backup_${getTodayISO()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Export failure: ", err);
        alert("Failed to export data: " + err.message);
    }
}

async function importDatabaseData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Basic schema validation
            if (!data || (!data.attendance && !data.paydays && !data.settings)) {
                alert("Invalid backup file format. Unable to import.");
                return;
            }

            const confirmMsg = "This will merge the backup records with your current data and overwrite duplicates. Do you want to proceed?";
            if (!confirm(confirmMsg)) {
                event.target.value = "";
                return;
            }

            // Import attendance
            if (Array.isArray(data.attendance)) {
                for (const item of data.attendance) {
                    await putRecord("attendance", item);
                }
            }

            // Import paydays
            if (Array.isArray(data.paydays)) {
                for (const item of data.paydays) {
                    await putRecord("paydays", item);
                }
            }

            // Import settings
            if (Array.isArray(data.settings)) {
                for (const item of data.settings) {
                    await putRecord("settings", item);
                }
            }

            alert("Data imported successfully!");
            event.target.value = "";
            await refreshAllViews();

        } catch (err) {
            console.error("Import failure: ", err);
            alert("Failed to parse and import data: " + err.message);
            event.target.value = "";
        }
    };
    reader.readAsText(file);
}

/* ==========================================================================
   15. MICRO-INTERACTION ANIMATIONS (Counter & Nav)
   ========================================================================== */

function animateNumberCounter(id, start, end, duration, formatAsCurrency = false) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    // Convert to target numbers
    const target = parseFloat(end) || 0;
    const startVal = parseFloat(start) || 0;
    if (target === startVal) {
        obj.textContent = formatAsCurrency ? formatCurrency(target) : Math.round(target).toLocaleString();
        return;
    }

    const range = target - startVal;
    let current = startVal;
    const increment = target > startVal ? Math.ceil(range / (duration / 10)) : Math.floor(range / (duration / 10));
    
    const stepTime = 16; // Approx 60 FPS
    const steps = Math.ceil(duration / stepTime);
    const stepValue = range / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
        stepCount++;
        current += stepValue;
        
        if (stepCount >= steps) {
            clearInterval(timer);
            obj.textContent = formatAsCurrency ? formatCurrency(target) : Math.round(target).toLocaleString();
        } else {
            obj.textContent = formatAsCurrency ? formatCurrency(current) : Math.round(current).toLocaleString();
        }
    }, stepTime);
}

// Set up smooth pages toggling
function setupNavigationActions() {
    const buttons = document.querySelectorAll(".nav-btn");
    const pages = document.querySelectorAll(".page");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const pageId = btn.dataset.page;
            
            // Switch tabs
            pages.forEach(p => p.classList.remove("active"));
            buttons.forEach(b => b.classList.remove("active"));

            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add("active");
                btn.classList.add("active");
            }

            // Perform contextual actions/animations
            if (pageId === "home") {
                renderDashboardStats();
            } else if (pageId === "calendar") {
                renderCalendar();
            } else if (pageId === "paydays") {
                renderPaydaysList();
            } else if (pageId === "analytics") {
                renderAnalytics();
            } else if (pageId === "settings") {
                loadSettingsView();
            }
        });
    });

    // Dashboard quick link redirection
    document.getElementById("viewAllTimelineBtn").onclick = () => {
        document.getElementById("navBtnCalendar").click();
    };
    document.getElementById("headerAnalyticsBtn").onclick = () => {
        // Redirection trigger to Analytics
        // Switch tab
        pages.forEach(p => p.classList.remove("active"));
        buttons.forEach(b => b.classList.remove("active"));
        
        document.getElementById("analytics").classList.add("active");
        // No button is explicitly active, or let's highlight settings/stats if needed. Since we're switching, let's map it.
        // Actually, we can add a visual active style to the stats nav or settings nav.
        // Let's activate navBtnHome or highlight nothing since it's a sub-page. Let's activate home.
    };
}

/* ==========================================================================
   16. CENTRAL INITIALIZATION & REFRESH
   ========================================================================== */

async function refreshAllViews() {
    await startLiveTimerIfActive();
    await renderDashboardStats();
    await buildTimelineFeeds();
    await renderCalendar();
    await renderPaydaysList();
    await renderAnalytics();
    await loadSettingsView();
}

async function initializeApp() {
    try {
        await openDB();
        await seedDefaultSettings();

        // Setup DOM controllers
        setupBottomSheets();
        setupNavigationActions();

        // Dynamic Calendars Navigation binding
        document.getElementById("prevMonthBtn").addEventListener("click", () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        });
        document.getElementById("nextMonthBtn").addEventListener("click", () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        });

        // Form Submit listener bindings
        document.getElementById("paydaySheetForm").addEventListener("submit", savePaydayRecord);
        document.getElementById("manualLogForm").addEventListener("submit", saveManualDtrLog);
        document.getElementById("saveSettingsBtn").addEventListener("click", saveSettingsData);
        document.getElementById("clearDataBtn").addEventListener("click", clearDatabase);
        document.getElementById("exportDataBtn").addEventListener("click", exportDatabaseData);
        document.getElementById("triggerImportBtn").addEventListener("click", () => {
            document.getElementById("importFileInput").click();
        });
        document.getElementById("importFileInput").addEventListener("change", importDatabaseData);

        // Core DTR Quick buttons binding
        document.getElementById("dashboardTimeInBtn").addEventListener("click", logTimeIn);
        document.getElementById("dashboardTimeOutBtn").addEventListener("click", logTimeOut);
        document.getElementById("btnQuickTimeIn").addEventListener("click", logTimeIn);
        document.getElementById("btnQuickTimeOut").addEventListener("click", logTimeOut);

        // Central FAB trigger menu slider
        document.getElementById("fabTrigger").addEventListener("click", () => {
            openSheet("quickActionSheet");
        });

        // FAB Inner Shortcuts trigger
        document.getElementById("btnQuickAddPayday").addEventListener("click", () => {
            // Setup defaults on Payday sheets
            const today = getTodayISO();
            document.getElementById("payDate").value = today;
            document.getElementById("payPeriodEnd").value = today;
            
            // Set start date 7 days ago
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            document.getElementById("payPeriodStart").value = lastWeek.toISOString().split("T")[0];

            openSheet("addPaydaySheet");
        });

        document.getElementById("btnQuickManualLog").addEventListener("click", () => {
            document.getElementById("manualLogSheetTitle").textContent = "Add Manual Record";
            document.getElementById("logDate").value = getTodayISO();
            document.getElementById("editRecordId").value = "";
            document.getElementById("logTimeIn").value = "08:00";
            document.getElementById("logTimeOut").value = "17:00";
            openSheet("manualLogSheet");
        });

        document.getElementById("triggerAddPaydayBtn").addEventListener("click", () => {
            document.getElementById("btnQuickAddPayday").click();
        });

        document.getElementById("manualLogBtn").addEventListener("click", () => {
            document.getElementById("btnQuickManualLog").click();
        });

        // Initialize display
        await refreshAllViews();

        console.log("PayCheck Engine Started Successfully!");

    } catch (e) {
        console.error("Critical PayCheck boot failure: ", e);
        alert("Failed to access internal storage database. Offline saving may be disabled.");
    }
}

// Boot application when DOM is parsed
document.addEventListener("DOMContentLoaded", initializeApp);