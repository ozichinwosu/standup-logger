// Set today's date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});

// Global variable to track if we're editing
let editingDate = null;

// Save entry
function saveEntry() {
    const todayWork = document.getElementById('todayWork').value;
    const blockers = document.getElementById('blockers').value;
    
    if (!todayWork.trim()) {
        alert('Please enter what you worked on today!');
        return;
    }
    
    // Use editing date if we're in edit mode, otherwise use today
    const targetDate = editingDate || new Date().toISOString().split('T')[0];
    
    const entry = {
        date: new Date(targetDate).toISOString(),
        work: todayWork,
        blockers: blockers,
        timestamp: Date.now()
    };
    
    // Save to localStorage
    const key = `standup_${targetDate}`;
    localStorage.setItem(key, JSON.stringify(entry));
    
    // Clear form and reset edit mode
    document.getElementById('todayWork').value = '';
    document.getElementById('blockers').value = '';
    editingDate = null;
    
    // Show success
    const btn = document.getElementById('saveBtn');
    btn.textContent = '✓ Saved!';
    btn.style.background = '#34C759';
    
    setTimeout(() => {
        btn.textContent = 'Save Today\'s Entry';
        btn.style.background = '#007AFF';
    }, 2000);
    
    // Refresh view
    showTab('today');
}

// Edit entry function
function editEntry(date) {
    const key = `standup_${date}`;
    const entry = localStorage.getItem(key);
    
    if (entry) {
        const data = JSON.parse(entry);
        document.getElementById('todayWork').value = data.work;
        document.getElementById('blockers').value = data.blockers || '';
        editingDate = date;
        
        // Update button text
        document.getElementById('saveBtn').textContent = `Update Entry for ${date}`;
        
        // Switch to input section
        showTab('today');
    }
}

// Delete entry function
function deleteEntry(date) {
    if (confirm(`Are you sure you want to delete the entry for ${date}?`)) {
        const key = `standup_${date}`;
        localStorage.removeItem(key);
        
        // Refresh current view
        const activeTab = document.querySelector('.tab.active').textContent.toLowerCase();
        showTab(activeTab.includes('today') ? 'today' : 'week');
    }
}

// Move entry to different date
function moveEntry(fromDate, toDate) {
    const fromKey = `standup_${fromDate}`;
    const toKey = `standup_${toDate}`;
    
    const entry = localStorage.getItem(fromKey);
    if (entry) {
        const data = JSON.parse(entry);
        data.date = new Date(toDate).toISOString();
        
        // Save to new date
        localStorage.setItem(toKey, JSON.stringify(data));
        
        // Remove from old date
        localStorage.removeItem(fromKey);
        
        alert(`Entry moved from ${fromDate} to ${toDate}`);
        
        // Refresh view
        const activeTab = document.querySelector('.tab.active').textContent.toLowerCase();
        showTab(activeTab.includes('today') ? 'today' : 'week');
    }
}

// Tab switching
function showTab(tab) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    // Find the correct tab button to mark as active
    if (tab === 'today') {
        document.querySelector('.tab[onclick="showTab(\'today\')"]').classList.add('active');
        document.getElementById('todayView').classList.remove('hidden');
        document.getElementById('weekView').classList.add('hidden');
        showTodayEntry();
    } else {
        document.querySelector('.tab[onclick="showTab(\'week\')"]').classList.add('active');
        document.getElementById('todayView').classList.add('hidden');
        document.getElementById('weekView').classList.remove('hidden');
        showWeekEntries();
    }
}

// Show today's entry
function showTodayEntry() {
    const today = new Date().toISOString().split('T')[0];
    const key = `standup_${today}`;
    const entry = localStorage.getItem(key);
    
    const todayView = document.getElementById('todayView');
    
    if (entry) {
        const data = JSON.parse(entry);
        todayView.innerHTML = `
            <div class="entry-card">
                <div class="entry-date">
                    Today's Entry
                    <div style="float: right;">
                        <button onclick="editEntry('${today}')" style="background: #FF9500; padding: 4px 8px; font-size: 12px; margin-left: 5px;">Edit</button>
                        <button onclick="deleteEntry('${today}')" style="background: #FF3B30; padding: 4px 8px; font-size: 12px; margin-left: 5px;">Delete</button>
                    </div>
                </div>
                <div class="entry-content">
                    <strong>Work Done:</strong><br>
                    ${data.work}
                    ${data.blockers ? `<br><br><strong>Blockers:</strong><br>${data.blockers}` : ''}
                </div>
            </div>
        `;
    } else {
        todayView.innerHTML = '<p style="text-align: center; color: #86868b;">No entry for today yet.</p>';
    }
}

// Show week entries
function showWeekEntries() {
    const entries = [];
    const today = new Date();
    
    // Get last 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const key = `standup_${dateStr}`;
        const entry = localStorage.getItem(key);
        
        if (entry) {
            const data = JSON.parse(entry);
            data.dateStr = dateStr;
            entries.push(data);
        }
    }
    
    const weekView = document.getElementById('weeklyReport');
    
    if (entries.length > 0) {
        let html = '<h3>This Week\'s Entries:</h3>';
        entries.forEach(entry => {
            const displayDate = new Date(entry.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
            });
            
            html += `
                <div class="entry-card">
                    <div class="entry-date">
                        ${displayDate}
                        <div style="float: right;">
                            <button onclick="editEntry('${entry.dateStr}')" style="background: #FF9500; padding: 4px 8px; font-size: 12px; margin-left: 5px;">Edit</button>
                            <button onclick="deleteEntry('${entry.dateStr}')" style="background: #FF3B30; padding: 4px 8px; font-size: 12px; margin-left: 5px;">Delete</button>
                            <button onclick="promptMoveEntry('${entry.dateStr}')" style="background: #34C759; padding: 4px 8px; font-size: 12px; margin-left: 5px;">Move</button>
                        </div>
                    </div>
                    <div class="entry-content">
                        <strong>Work Done:</strong><br>
                        ${entry.work}
                        ${entry.blockers ? `<br><br><strong>Blockers:</strong><br>${entry.blockers}` : ''}
                    </div>
                </div>
            `;
        });
        weekView.innerHTML = html;
    } else {
        weekView.innerHTML = '<p style="text-align: center; color: #86868b;">No entries this week yet.</p>';
    }
}

// Prompt to move entry
function promptMoveEntry(fromDate) {
    const toDate = prompt(`Move entry from ${fromDate} to which date? (YYYY-MM-DD format):`);
    if (toDate && toDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        moveEntry(fromDate, toDate);
    } else if (toDate) {
        alert('Please enter date in YYYY-MM-DD format');
    }
}

// Generate weekly report
function generateWeeklyReport() {
    const entries = [];
    const today = new Date();
    
    // Get this week's entries
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = `standup_${date.toISOString().split('T')[0]}`;
        const entry = localStorage.getItem(key);
        
        if (entry) {
            entries.push(JSON.parse(entry));
        }
    }
    
    if (entries.length === 0) {
        alert('No entries to generate report from!');
        return;
    }
    
    // Format report
    let report = `WEEKLY ACCOMPLISHMENTS (Week of ${today.toLocaleDateString()}):\n\n`;
    
    entries.reverse().forEach(entry => {
        const date = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        report += `${date}:\n${entry.work}\n\n`;
    });
    
    // Add blockers section
    const blockers = entries.filter(e => e.blockers).map(e => e.blockers);
    if (blockers.length > 0) {
        report += `BLOCKERS/CHALLENGES:\n${blockers.join('\n')}\n`;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(report).then(() => {
        alert('Report copied to clipboard! Paste it in Teams/Slack/Email');
    });
}

// Quick fix for your current date issue
function fixTodayDate() {
    const yesterday = '2025-07-10';
    const today = '2025-07-11';
    
    if (confirm('Move yesterday\'s entry to today?')) {
        moveEntry(yesterday, today);
    }
}

// Initialize
showTodayEntry();

// Add a quick fix button (you can call this in console or add to your HTML)
console.log('To fix your date issue, run: fixTodayDate()');
