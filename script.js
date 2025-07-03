// Set today's date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});

// Save entry
function saveEntry() {
    const todayWork = document.getElementById('todayWork').value;
    const blockers = document.getElementById('blockers').value;
    
    if (!todayWork.trim()) {
        alert('Please enter what you worked on today!');
        return;
    }
    
    const entry = {
        date: new Date().toISOString(),
        work: todayWork,
        blockers: blockers,
        timestamp: Date.now()
    };
    
    // Save to localStorage
    const key = `standup_${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(key, JSON.stringify(entry));
    
    // Clear form
    document.getElementById('todayWork').value = '';
    document.getElementById('blockers').value = '';
    
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

// Tab switching
function showTab(tab) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide views
    if (tab === 'today') {
        document.getElementById('todayView').classList.remove('hidden');
        document.getElementById('weekView').classList.add('hidden');
        showTodayEntry();
    } else {
        document.getElementById('todayView').classList.add('hidden');
        document.getElementById('weekView').classList.remove('hidden');
        showWeekEntries();
    }
}

// Show today's entry
function showTodayEntry() {
    const key = `standup_${new Date().toISOString().split('T')[0]}`;
    const entry = localStorage.getItem(key);
    
    const todayView = document.getElementById('todayView');
    
    if (entry) {
        const data = JSON.parse(entry);
        todayView.innerHTML = `
            <div class="entry-card">
                <div class="entry-date">Today's Entry</div>
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
        const key = `standup_${date.toISOString().split('T')[0]}`;
        const entry = localStorage.getItem(key);
        
        if (entry) {
            entries.push(JSON.parse(entry));
        }
    }
    
    const weekView = document.getElementById('weeklyReport');
    weekView.innerHTML = entries.length ? '' : '<p style="text-align: center; color: #86868b;">No entries this week yet.</p>';
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

// Initialize
showTodayEntry();