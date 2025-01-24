import { HomeSection } from '../sections/HomeSection.js';
import { TodoSection } from '../sections/TodoSection.js';
import { NotesSection } from '../sections/NotesSection.js';
import { CountdownSection } from '../sections/CountdownSection.js';
import { QuotesSection } from '../sections/QuotesSection.js';
import { QuotesService } from '../services/QuotesService.js';

export function initializeApp({ storageService, dateService }) {
    const quotesService = new QuotesService(storageService);
    
    const sections = {
        home: new HomeSection(storageService, dateService, quotesService),
        todo: new TodoSection(storageService, dateService),
        countdown: new CountdownSection(storageService, dateService),
        notes: new NotesSection(storageService, dateService),
        quotes: new QuotesSection(storageService, quotesService)
    };

    // Initialize Pomodoro
    initializePomodoro(storageService);

    // Initialize sidebar countdowns
    initializeSidebarCountdowns(storageService);

    // Initialize navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            showSection(sectionId);
        });
    });

    function showSection(sectionId) {
        // Hide all sections
        Object.keys(sections).forEach(key => {
            if (sections[key].destroy) {
                sections[key].destroy();
            }
            const element = document.getElementById(`${key}Section`);
            element.classList.toggle('hidden', key !== sectionId);
        });

        // Initialize section content if needed
        sections[sectionId].initialize();
    }

    // Show home section by default
    showSection('home');
}

function initializePomodoro(storageService) {
    let timer = null;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    const timerDisplay = document.getElementById('pomodoroTimer');
    const startBtn = document.getElementById('startPomodoroBtn');
    const resetBtn = document.getElementById('resetPomodoroBtn');

    const updateTimerDisplay = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const completePomodoroSession = () => {
        const stats = storageService.get('stats') || {
            pomodoros: 0,
            totalFocusTime: 0,
            currentStreak: 0,
            lastCompleted: null
        };

        stats.pomodoros++;
        stats.totalFocusTime += 25; // 25 minutes

        // Update streak
        const today = new Date().toDateString();
        if (stats.lastCompleted !== today) {
            if (stats.lastCompleted === new Date(Date.now() - 86400000).toDateString()) {
                stats.currentStreak++;
            } else {
                stats.currentStreak = 1;
            }
            stats.lastCompleted = today;
        }

        storageService.save('stats', stats);
        updateStats();
    };

    const updateStats = () => {
        const stats = storageService.get('stats') || {
            pomodoros: 0,
            totalFocusTime: 0
        };
        document.getElementById('pomodoroCount').textContent = stats.pomodoros;
        document.getElementById('totalFocusTime').textContent = `${stats.totalFocusTime}m`;
    };

    startBtn.addEventListener('click', () => {
        if (timer) {
            // Pause
            clearInterval(timer);
            timer = null;
            startBtn.textContent = '▶';
        } else {
            // Start
            timer = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    timer = null;
                    completePomodoroSession();
                    timeLeft = 25 * 60;
                    updateTimerDisplay();
                    startBtn.textContent = '▶';
                    // Play notification sound or show notification
                    new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=').play();
                }
            }, 1000);
            startBtn.textContent = '⏸';
        }
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timer);
        timer = null;
        timeLeft = 25 * 60;
        updateTimerDisplay();
        startBtn.textContent = '▶';
    });

    // Initialize stats
    updateStats();
}

function initializeSidebarCountdowns(storageService) {
    function updateSidebarCountdowns() {
        const container = document.getElementById('sidebarCountdowns');
        if (!container) return;

        const countdowns = storageService.get('countdowns') || [];
        const activeCountdowns = countdowns
            .filter(c => new Date(c.targetDate) > new Date())
            .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
            .slice(0, 1);

        if (activeCountdowns.length) {
            container.innerHTML = activeCountdowns.map(countdown => `
                <div class="bg-gradient-to-br from-purple-50 to-pink-50/30 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex flex-col items-center">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-lg">${countdown.icon}</span>
                            <span class="text-sm font-medium text-purple-500">${countdown.name}</span>
                        </div>

                        <div class="countdown-timer font-bold text-2xl text-purple-600 tabular-nums mb-2 tracking-wider" data-target="${countdown.targetDate}">${
                            (() => {
                                const target = new Date(countdown.targetDate);
                                const now = new Date();
                                const diff = target - now;
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                return days > 0 ? 
                                    `${days}d ${hours.toString().padStart(2, '0')}h` : 
                                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            })()
                        }</div>

                        <div class="grid grid-cols-2 gap-2 w-full text-center text-xs">
                            <div class="bg-white/50 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                                <div class="text-purple-400 mb-1">Category</div>
                                <div class="text-purple-500 font-medium">${countdown.category}</div>
                            </div>
                            <div class="bg-white/50 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                                <div class="text-purple-400 mb-1">Due</div>
                                <div class="text-purple-500 font-medium">${new Date(countdown.targetDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        } else {
            container.innerHTML = `
                <div class="text-center text-xs text-purple-400 py-3">
                    No active countdowns
                </div>
            `;
        }
    }

    // Update immediately and every minute
    updateSidebarCountdowns();
    setInterval(updateSidebarCountdowns, 60000);
} 