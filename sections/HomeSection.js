export class HomeSection {
    constructor(storageService, dateService) {
        this.storageService = storageService;
        this.dateService = dateService;
        this.element = document.getElementById('homeSection');
    }

    initialize() {
        if (!this.initialized) {
            this.render();
            this.initialized = true;
        }
        this.update();
    }

    render() {
        const tasks = this.storageService.get('tasks') || [];
        const notes = this.storageService.get('notes') || [];
        const completedTasks = tasks.filter(t => t.completed).length;
        
        this.element.innerHTML = `
            <div class="space-y-8">
                <!-- Welcome & Progress -->
                <div class="section-container bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                    <div class="absolute -top-12 -right-10 text-9xl text-white/10 select-none animate-float">🌸</div>
                    
                    <div class="relative space-y-8">
                        <!-- Welcome Header -->
                        <div class="flex justify-between items-center">
                            <div class="flex items-baseline gap-3 px-4">
                                <h2 class="text-2xl font-bold text-blue-600">Welcome Back! ✨</h2>
                                <p class="text-sm text-blue-400">Let's make today fun!</p>
                            </div>
                            <div class="flex items-center gap-6">
                                <div class="flex flex-col items-end">
                                    <div class="text-sm text-blue-400">
                                        ${this.dateService.getFormattedDate()}
                                    </div>
                                    <div class="text-xs text-pink-400 mt-1" id="countdown">
                                        Loading...
                                    </div>
                                </div>
                                <div class="bunny-progress select-none relative">
                                    <div class="text-5xl animate-proper-bounce">🐰</div>
                                    <div class="carrot absolute -bottom-1 -right-2 text-xl animate-spin-slow">🥕</div>
                                </div>
                            </div>
                        </div>

                        <!-- Task Progress -->
                        <div class="bg-white/50 p-6 rounded-xl backdrop-blur-sm">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-sm font-medium text-purple-600">Task Completion</h3>
                                <div class="text-xl font-bold text-purple-600 tabular-nums" id="completionRate">0%</div>
                            </div>
                            <div class="h-3 bg-purple-100 rounded-full overflow-hidden">
                                <div class="h-full bg-purple-400 rounded-full transition-all duration-500" id="completionBar"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Access Panels -->
                <div class="grid grid-cols-2 gap-6">
                    <!-- Tasks Panel -->
                    <div class="section-container bg-gradient-to-br from-blue-50 to-green-50">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-lg font-bold text-blue-600">
                                🎯 Tasks <span class="text-sm font-normal text-blue-400">(${tasks.length})</span>
                            </h2>
                            <button data-section="todo" data-action="new"
                                class="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                Add Task
                            </button>
                        </div>
                        <div id="recentTasks" class="space-y-2 px-2"></div>
                    </div>

                    <!-- Notes Panel -->
                    <div class="section-container bg-gradient-to-br from-green-50 to-blue-50">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-lg font-bold text-green-600">
                                📝 Notes <span class="text-sm font-normal text-green-400">(${notes.length})</span>
                            </h2>
                            <button data-section="notes" data-action="new"
                                class="text-sm px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                Add Note
                            </button>
                        </div>
                        <div id="recentNotes" class="space-y-2 px-2"></div>
                    </div>
                </div>

                <!-- Stats & Achievements -->
                <div class="section-container bg-gradient-to-br from-purple-50 to-pink-50">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-purple-600 px-4">✨ Achievement Wall</h2>
                        <div class="text-sm text-purple-400" id="lastUpdated"></div>
                    </div>

                    <div class="grid grid-cols-4 gap-4">
                        <!-- Current Streak -->
                        <div class="bg-white/50 backdrop-blur-sm p-4 rounded-xl">
                            <div class="flex flex-col items-center text-center">
                                <span class="text-2xl mb-2">🔥</span>
                                <span class="text-2xl font-bold text-orange-500 tabular-nums" id="currentStreak">0</span>
                                <span class="text-xs text-orange-400">Day Streak</span>
                            </div>
                        </div>

                        <!-- Total Focus Time -->
                        <div class="bg-white/50 backdrop-blur-sm p-4 rounded-xl">
                            <div class="flex flex-col items-center text-center">
                                <span class="text-2xl mb-2">⏰</span>
                                <span class="text-2xl font-bold text-blue-500 tabular-nums" id="totalFocusTime">0h</span>
                                <span class="text-xs text-blue-400">Focus Time</span>
                            </div>
                        </div>

                        <!-- Total Tasks -->
                        <div class="bg-white/50 backdrop-blur-sm p-4 rounded-xl">
                            <div class="flex flex-col items-center text-center">
                                <span class="text-2xl mb-2">📝</span>
                                <div id="totalTasks" class="text-center">
                                    <div class="flex items-center gap-1 justify-center">
                                        <span class="text-2xl font-bold text-yellow-500">0</span>
                                        <span class="text-xs text-gray-400">/</span>
                                        <span class="text-2xl font-bold text-green-500">0</span>
                                    </div>
                                    <div class="text-xs text-gray-400 mt-1">Pending / Done</div>
                                </div>
                            </div>
                        </div>

                        <!-- Pomodoro Sessions -->
                        <div class="bg-white/50 backdrop-blur-sm p-4 rounded-xl">
                            <div class="flex flex-col items-center text-center">
                                <span class="text-2xl mb-2">🍅</span>
                                <span class="text-2xl font-bold text-red-500 tabular-nums" id="pomodoroCount">0</span>
                                <span class="text-xs text-red-400">Pomodoros</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Weekly Activity -->
                <div class="section-container bg-gradient-to-br from-indigo-50 to-blue-50">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-bold text-indigo-600 px-4">📊 Weekly Activity</h2>
                        <div class="text-sm text-indigo-400">Activity Overview</div>
                    </div>
                    <div class="grid grid-cols-7 gap-2 p-4" id="weeklyActivity">
                        ${this.generateWeeklyActivity()}
                    </div>
                </div>
            </div>
        `;
        this.attachEventListeners();
        this.startCountdown();
    }

    attachEventListeners() {
        const buttons = this.element.querySelectorAll('[data-section]');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionId = button.dataset.section;
                const action = button.dataset.action;
                
                // 找到对应的导航按钮
                const navButton = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
                if (navButton) {
                    navButton.click();
                    
                    // 如果是新建操作，触发相应的新建功能
                    if (action === 'new') {
                        setTimeout(() => {
                            const addButton = document.querySelector(
                                sectionId === 'todo' ? '#addTaskBtn' : '#addNoteBtn'
                            );
                            if (addButton) {
                                // 自动聚焦到输入框
                                const input = document.querySelector(
                                    sectionId === 'todo' ? '#taskInput' : '#noteInput'
                                );
                                if (input) {
                                    input.focus();
                                }
                            }
                        }, 100); // 给页面切换一点时间
                    }
                }
            });
        });
    }

    updateStats() {
        const stats = this.storageService.get('stats') || {
            pomodoros: 0,
            totalFocusTime: 0,
            currentStreak: 0
        };

        const tasks = this.storageService.get('tasks') || [];
        const completedTasks = tasks.filter(task => task.completed).length;
        const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

        this.element.querySelector('#pomodoroCount').textContent = stats.pomodoros;
        this.element.querySelector('#totalFocusTime').textContent = `${stats.totalFocusTime}m`;
        this.element.querySelector('#completionRate').textContent = `${completionRate}%`;
        this.element.querySelector('#currentStreak').textContent = stats.currentStreak;
    }

    update() {
        // 获取数据
        const stats = this.storageService.get('stats') || {};
        const tasks = this.storageService.get('tasks') || [];
        const completedCount = tasks.filter(t => t.completed).length;
        const pendingCount = tasks.length - completedCount;
        const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

        // 更新进度条
        const completionRate = this.element.querySelector('#completionRate');
        const completionBar = this.element.querySelector('#completionBar');
        if (completionRate) completionRate.textContent = `${progress}%`;
        if (completionBar) completionBar.style.width = `${progress}%`;

        // 更新任务统计
        const totalTasksElement = this.element.querySelector('#totalTasks');
        if (totalTasksElement) {
            totalTasksElement.innerHTML = `
                <div class="flex items-center gap-1 justify-center">
                    <span class="text-2xl font-bold text-yellow-500">${pendingCount}</span>
                    <span class="text-xs text-gray-400">/</span>
                    <span class="text-2xl font-bold text-green-500">${completedCount}</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">Pending / Done</div>
            `;
        }

        // 更新其他统计
        const streakElement = this.element.querySelector('#currentStreak');
        const focusTimeElement = this.element.querySelector('#totalFocusTime');
        const pomodoroElement = this.element.querySelector('#pomodoroCount');
        
        if (streakElement) streakElement.textContent = stats.currentStreak || 0;
        if (focusTimeElement) {
            const hours = Math.floor((stats.totalFocusTime || 0) / 60);
            const minutes = (stats.totalFocusTime || 0) % 60;
            focusTimeElement.textContent = `${hours}h ${minutes}m`;
        }
        if (pomodoroElement) pomodoroElement.textContent = stats.pomodoros || 0;

        // 更新最近的任务
        const recentTasks = tasks.slice(-3).reverse();
        const recentTasksContainer = this.element.querySelector('#recentTasks');
        if (recentTasksContainer) {
            recentTasksContainer.innerHTML = recentTasks.length ? 
                recentTasks.map(task => this.createRecentTaskElement(task)).join('') :
                '<p class="text-xs text-gray-400 text-center py-2">No tasks yet! Add your first task.</p>';
        }

        // 更新最近的笔记
        const notes = this.storageService.get('notes') || [];
        const recentNotes = notes.slice(-3).reverse();
        const recentNotesContainer = this.element.querySelector('#recentNotes');
        if (recentNotesContainer) {
            recentNotesContainer.innerHTML = recentNotes.length ?
                recentNotes.map(note => this.createRecentNoteElement(note)).join('') :
                '<p class="text-xs text-gray-400 text-center py-2">No notes yet! Write something.</p>';
        }

        // 更新日期和最后更新时间
        const dateElement = this.element.querySelector('#todayDate');
        const lastUpdatedElement = this.element.querySelector('#lastUpdated');
        
        if (dateElement) dateElement.textContent = this.dateService.getFormattedDate();
        if (lastUpdatedElement) lastUpdatedElement.textContent = `Last updated: ${this.dateService.getFormattedTime()}`;

        // Update countdowns
        const countdowns = this.storageService.get('countdowns') || [];
        const container = this.element.querySelector('#homeCountdowns');
        if (container) {
            // 只显示最近的两个倒计时
            const recentCountdowns = countdowns
                .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
                .slice(0, 2);
            
            if (recentCountdowns.length) {
                container.innerHTML = recentCountdowns
                    .map(countdown => this.createCountdownElement(countdown))
                    .join('');
            } else {
                container.innerHTML = `
                    <div class="col-span-2 text-center text-gray-400 py-8">
                        No active countdowns. <button data-section="countdown" class="text-purple-500 hover:underline">Add one</button>
                    </div>
                `;
            }
        }
    }

    createRecentTaskElement(task) {
        const timeLeft = this.getTimeLeft(task.targetTime);
        const isUrgent = timeLeft && timeLeft.hours < 2;
        
        return `
            <div class="bg-white p-3 rounded-lg text-sm">
                <div class="flex items-center gap-3">
                    <span class="text-lg leading-none">${task.completed ? '✅' : '⭕'}</span>
                    <span class="text-xs px-2 py-1 rounded-lg bg-yellow-50 text-yellow-600">${task.category}</span>
                    <span class="flex-1 truncate">${task.content}</span>
                    ${task.targetTime ? `
                        <span class="text-xs ${isUrgent ? 'text-red-400 animate-pulse' : 'text-gray-400'} whitespace-nowrap">
                            🕒 ${timeLeft ? `${timeLeft.hours}h ${timeLeft.minutes}m left` : 'Time\'s up!'}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getTimeLeft(targetTime) {
        if (!targetTime) return null;
        
        const now = new Date();
        const target = new Date(targetTime);
        const diff = target - now;
        
        if (diff <= 0) return null;
        
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        };
    }

    createRecentNoteElement(note) {
        const categoryClasses = {
            '💭 Thought': 'bg-blue-50 text-blue-500',
            '💡 Idea': 'bg-purple-50 text-purple-500',
            '❤️ Memory': 'bg-pink-50 text-pink-500',
            ' Task': 'bg-green-50 text-green-500'
        };

        return `
            <div class="bg-white p-3 rounded-lg text-sm">
                <div class="flex items-center gap-3">
                    <span class="px-2 py-1 rounded-lg text-[10px] whitespace-nowrap ${categoryClasses[note.category] || categoryClasses['💭 Thought']}">
                        ${note.category}
                    </span>
                    <span class="flex-1 truncate">${note.content}</span>
                </div>
            </div>
        `;
    }

    generateWeeklyActivity() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const stats = this.storageService.get('stats') || {};
        const weeklyStats = stats.weeklyActivity || {};

        return days.map((day, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (today.getDay() - index));
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === today.toISOString().split('T')[0];
            const activity = weeklyStats[dateStr] || 0;

            return `
                <div class="flex flex-col items-center">
                    <div class="text-xs text-purple-400 mb-1">${day}</div>
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center ${
                        isToday ? 'bg-purple-100 text-purple-600' : 
                        activity > 0 ? 'bg-purple-50 text-purple-500' : 'bg-white/50 text-purple-300'
                    }">
                        ${activity || '·'}
                    </div>
                </div>
            `;
        }).join('');
    }

    startCountdown() {
        const updateCountdown = () => {
            const now = new Date();
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            
            const diff = endOfDay - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            const countdownElement = this.element.querySelector('#countdown');
            if (countdownElement) {
                countdownElement.textContent = `🕒 ${hours}h ${minutes}m left today`;
                
                // 添加动画效果当时间少于2小时
                if (hours < 2) {
                    countdownElement.classList.add('text-red-400', 'animate-pulse');
                } else {
                    countdownElement.classList.remove('text-red-400', 'animate-pulse');
                }
            }
        };

        // 立即更新一次
        updateCountdown();
        
        // 每分钟更新一次
        this.countdownInterval = setInterval(updateCountdown, 60000);
    }

    startTaskCountdown() {
        const updateTaskCountdowns = () => {
            const recentTasksContainer = this.element.querySelector('#recentTasks');
            if (recentTasksContainer) {
                const tasks = this.storageService.get('tasks') || [];
                const recentTasks = tasks.slice(-3).reverse();
                recentTasksContainer.innerHTML = recentTasks.length ? 
                    recentTasks.map(task => this.createRecentTaskElement(task)).join('') :
                    '<p class="text-xs text-gray-400 text-center py-2">No tasks yet! Add your first task.</p>';
            }
        };

        // 每分钟更新一次倒计时
        this.taskCountdownInterval = setInterval(updateTaskCountdowns, 60000);
        // 立即更新一次
        updateTaskCountdowns();
    }

    // 在组件销毁时清理定时器
    destroy() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        if (this.taskCountdownInterval) {
            clearInterval(this.taskCountdownInterval);
        }
    }

    createCountdownElement(countdown) {
        // Implementation of createCountdownElement method
    }
} 