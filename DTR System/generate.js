const fs = require('fs');

const userName = "Erl Ramas";
const records = [];
let idCounter = 1713000000000; // Mock timestamp base

// Helper to add a record
function addRecord(year, month, day) {
    const date = new Date(year, month - 1, day);
    
    // Time In: 7:56 AM - 8:00 AM
    // 7 hours, 56-60 mins
    const inMinute = 56 + Math.floor(Math.random() * 5); // 56, 57, 58, 59, 60
    const inHour = inMinute === 60 ? 8 : 7;
    const inMinStr = inMinute === 60 ? 0 : inMinute;
    
    const timeInDate = new Date(year, month - 1, day, inHour, inMinStr, Math.floor(Math.random() * 60));
    
    // Time out: 4:55 PM - 5:00 PM
    // 16 hours, 55-60 mins
    const outMinute = 55 + Math.floor(Math.random() * 6); // 55, 56, 57, 58, 59, 60
    const outHour = outMinute === 60 ? 17 : 16;
    const outMinStr = outMinute === 60 ? 0 : outMinute;
    
    const timeOutDate = new Date(year, month - 1, day, outHour, outMinStr, Math.floor(Math.random() * 60));

    // Formatters
    const pad = (n) => String(n).padStart(2, '0');
    
    const formatDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const formatDateShort = (d) => d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    const formatTime12 = (d) => {
        let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${pad(h)}:${pad(m)}:${pad(s)} ${ampm}`;
    };

    const diffMs = timeOutDate.getTime() - timeInDate.getTime();
    const totalMin = Math.floor(diffMs / 60000);
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    
    records.push({
        id: idCounter++,
        name: userName,
        dateKey: formatDateKey(date),
        dateDisp: formatDateShort(date),
        timeIn: formatTime12(timeInDate),
        timeInRaw: timeInDate.getTime(),
        timeOut: formatTime12(timeOutDate),
        timeOutRaw: timeOutDate.getTime(),
        hours: `${hh}h ${pad(mm)}m`
    });
}

// Jan 26-30
for(let d=26; d<=30; d++) addRecord(2026, 1, d);

// Feb 2-27 (weekdays only)
for(let d=2; d<=27; d++) {
    const date = new Date(2026, 1, d); // Month is 0-indexed, so 1 is Feb
    if (date.getDay() !== 0 && date.getDay() !== 6) addRecord(2026, 2, d);
}

// Mar 2-31 (weekdays only)
for(let d=2; d<=31; d++) {
    const date = new Date(2026, 2, d); // 2 is Mar
    if (date.getDay() !== 0 && date.getDay() !== 6) addRecord(2026, 3, d);
}

// Apr 1-2, 6-10 (weekdays only, skip 3)
const aprDates = [1, 2, 6, 7, 8, 9, 10];
for(let d of aprDates) {
    const date = new Date(2026, 3, d); // 3 is Apr
    if (date.getDay() !== 0 && date.getDay() !== 6) addRecord(2026, 4, d);
}

// Sort in descending order like the app
records.sort((a,b) => b.timeInRaw - a.timeInRaw);

fs.writeFileSync('dtr_data.json', JSON.stringify(records, null, 2));
console.log(`Generated ${records.length} records in dtr_data.json`);
