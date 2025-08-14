// ScheduleNotes App - JavaScript Functionality

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const timeInput = document.getElementById('time-input');
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task');
    const scheduleList = document.getElementById('schedule-list');
    const notesArea = document.getElementById('notes-area');
    const saveNotesBtn = document.getElementById('save-notes');

    // Storage keys
    const SCHEDULE_KEY = 'scheduleNotes_schedule';
    const NOTES_KEY = 'scheduleNotes_notes';

    // Load saved data on page load
    loadSchedule();
    loadNotes();

    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    saveNotesBtn.addEventListener('click', saveNotes);
    
    // Allow adding tasks by pressing Enter in the task input
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Auto-save notes on input (with debounce)
    let notesTimeout;
    notesArea.addEventListener('input', function() {
        clearTimeout(notesTimeout);
        notesTimeout = setTimeout(saveNotes, 1000); // Auto-save after 1 second of no typing
    });

    /**
     * Add a new task to the schedule
     */
    function addTask() {
        const time = timeInput.value;
        const task = taskInput.value.trim();

        // Validation
        if (!time) {
            alert('Please select a time for your task.');
            timeInput.focus();
            return;
        }

        if (!task) {
            alert('Please enter a task description.');
            taskInput.focus();
            return;
        }

        // Create task object
        const taskObj = {
            id: Date.now(), // Simple ID using timestamp
            time: time,
            task: task
        };

        // Add to schedule
        let schedule = getScheduleFromStorage();
        schedule.push(taskObj);
        
        // Sort by time
        schedule.sort((a, b) => a.time.localeCompare(b.time));
        
        // Save and display
        saveScheduleToStorage(schedule);
        displaySchedule();
        
        // Clear inputs
        timeInput.value = '';
        taskInput.value = '';
        taskInput.focus();
    }

    /**
     * Remove a task from the schedule
     */
    function removeTask(taskId) {
        let schedule = getScheduleFromStorage();
        schedule = schedule.filter(task => task.id !== taskId);
        saveScheduleToStorage(schedule);
        displaySchedule();
    }

    /**
     * Display the schedule list
     */
    function displaySchedule() {
        const schedule = getScheduleFromStorage();
        scheduleList.innerHTML = '';

        if (schedule.length === 0) {
            scheduleList.innerHTML = '<li style="text-align: center; color: #666; font-style: italic; padding: 20px;">No tasks scheduled yet. Add your first task above!</li>';
            return;
        }

        schedule.forEach(taskObj => {
            const listItem = document.createElement('li');
            listItem.className = 'schedule-item';
            listItem.innerHTML = `
                <span class="schedule-time">${formatTime(taskObj.time)}</span>
                <span class="schedule-task">${escapeHtml(taskObj.task)}</span>
                <button class="remove-task" onclick="removeTaskById(${taskObj.id})">Remove</button>
            `;
            scheduleList.appendChild(listItem);
        });
    }

    /**
     * Global function to remove task by ID (needed for onclick)
     */
    window.removeTaskById = function(taskId) {
        removeTask(taskId);
    };

    /**
     * Format time from 24-hour to 12-hour format
     */
    function formatTime(time24) {
        if (!time24) return time24;
        
        const [hours, minutes] = time24.split(':');
        const hour12 = parseInt(hours) % 12 || 12;
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        
        return `${hour12}:${minutes} ${ampm}`;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Load schedule from localStorage
     */
    function loadSchedule() {
        displaySchedule();
    }

    /**
     * Get schedule from localStorage
     */
    function getScheduleFromStorage() {
        const saved = localStorage.getItem(SCHEDULE_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Save schedule to localStorage
     */
    function saveScheduleToStorage(schedule) {
        localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
    }

    /**
     * Load notes from localStorage
     */
    function loadNotes() {
        const saved = localStorage.getItem(NOTES_KEY);
        if (saved) {
            notesArea.value = saved;
        }
    }

    /**
     * Save notes to localStorage
     */
    function saveNotes() {
        const notes = notesArea.value;
        localStorage.setItem(NOTES_KEY, notes);
        
        // Show brief confirmation
        const originalText = saveNotesBtn.textContent;
        saveNotesBtn.textContent = 'Saved!';
        saveNotesBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        
        setTimeout(() => {
            saveNotesBtn.textContent = originalText;
            saveNotesBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 1500);
    }

    /**
     * Clear all data (for development/testing)
     */
    window.clearAllData = function() {
        if (confirm('Are you sure you want to clear all schedule and notes data? This cannot be undone.')) {
            localStorage.removeItem(SCHEDULE_KEY);
            localStorage.removeItem(NOTES_KEY);
            displaySchedule();
            notesArea.value = '';
            alert('All data cleared successfully!');
        }
    };

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save notes
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNotes();
        }
        
        // Ctrl/Cmd + Enter to add task (when focused on inputs)
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (document.activeElement === timeInput || document.activeElement === taskInput) {
                e.preventDefault();
                addTask();
            }
        }
    });

    // Welcome message for first-time users
    if (getScheduleFromStorage().length === 0 && !localStorage.getItem(NOTES_KEY)) {
        console.log('Welcome to ScheduleNotes App! 🗓️');
        console.log('Tips:');
        console.log('- Use Ctrl/Cmd + S to quickly save notes');
        console.log('- Use Ctrl/Cmd + Enter to add tasks while typing');
        console.log('- Notes auto-save after 1 second of inactivity');
        console.log('- All data is stored locally in your browser');
    }
});
