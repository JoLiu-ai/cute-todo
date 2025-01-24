export class CountdownSection {
    constructor(storageService, dateService) {
        this.storageService = storageService;
        this.dateService = dateService;
        this.element = document.getElementById('countdownSection');
    }

    initialize() {
        if (!this.initialized) {
            this.render();
            this.initialized = true;
        }
        this.loadCountdowns();
    }

    render() {
        this.element.innerHTML = `
            <div class="section-container">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-lg font-semibold text-purple-600">⏰ Countdown Events</h2>
                    <button 
                        id="openNewCountdownBtn"
                        class="bg-purple-400 text-white px-4 py-2 rounded-xl hover:bg-purple-500 transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>⏰ New Countdown</span>
                    </button>
                </div>

                <!-- Countdowns Grid -->
                <div id="countdownsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const newCountdownBtn = this.element.querySelector('#openNewCountdownBtn');
        newCountdownBtn.addEventListener('click', () => this.showNewCountdownModal());
    }

    showNewCountdownModal() {
        const originalContent = this.element.innerHTML;
        
        this.element.innerHTML = `
            <div class="section-container min-h-screen">
                <!-- Header -->
                <div class="flex justify-between items-center mb-8">
                    <div class="flex items-center gap-3">
                        <button id="backToCountdowns" class="text-gray-400 hover:text-gray-600 text-xl">←</button>
                        <h2 class="text-xl font-bold text-purple-600">⏰ New Countdown</h2>
                    </div>
                    <button id="saveCountdown"
                        class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>Save Countdown</span>
                        <span>⏰</span>
                    </button>
                </div>

                <!-- Edit Form -->
                <div class="max-w-3xl mx-auto space-y-6">
                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Event Name</label>
                        <input 
                            type="text" 
                            id="eventName" 
                            placeholder="What are you counting down to? 🎯" 
                            class="w-full p-4 text-lg border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400"
                        >
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Target Date & Time</label>
                        <input 
                            type="datetime-local" 
                            id="eventDate"
                            class="w-full p-4 text-lg border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400"
                        >
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Icon</label>
                        <div class="flex flex-wrap gap-3">
                            <button data-icon="🎓" class="countdown-icon p-3 text-2xl bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">🎓</button>
                            <button data-icon="💼" class="countdown-icon p-3 text-2xl bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">💼</button>
                            <button data-icon="🎯" class="countdown-icon p-3 text-2xl bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">🎯</button>
                            <button data-icon="✈️" class="countdown-icon p-3 text-2xl bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">✈️</button>
                            <button data-icon="🏆" class="countdown-icon p-3 text-2xl bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">🏆</button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Category</label>
                        <select 
                            id="eventCategory"
                            class="w-full p-4 text-lg border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400"
                        >
                            <option value="">Select Category</option>
                            <option value="Study">📚 Study</option>
                            <option value="Work">💼 Work</option>
                            <option value="Travel">✈️ Travel</option>
                            <option value="Event">🎉 Event</option>
                            <option value="Goal">🎯 Goal</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        // 添加事件监听
        const backBtn = this.element.querySelector('#backToCountdowns');
        const saveBtn = this.element.querySelector('#saveCountdown');
        const nameInput = this.element.querySelector('#eventName');
        const dateInput = this.element.querySelector('#eventDate');
        const iconButtons = this.element.querySelectorAll('.countdown-icon');
        
        let selectedIcon = null;

        // 返回按钮
        const goBack = () => {
            this.element.innerHTML = originalContent;
            this.attachEventListeners();
            this.loadCountdowns(); // 重新加载倒计时列表
        };

        backBtn.addEventListener('click', () => {
            if (nameInput.value.trim() || dateInput.value) {
                if (confirm('Discard changes?')) {
                    goBack();
                }
            } else {
                goBack();
            }
        });

        // 图标选择
        iconButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                iconButtons.forEach(b => b.classList.remove('ring-2', 'ring-offset-2'));
                btn.classList.add('ring-2', 'ring-offset-2');
                selectedIcon = btn.dataset.icon;
            });
        });

        // 保存按钮
        saveBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const date = dateInput.value;
            const category = this.element.querySelector('#eventCategory').value;
            
            // 移除之前的错误状态
            nameInput.classList.remove('border-red-400', 'animate-shake');
            dateInput.classList.remove('border-red-400', 'animate-shake');
            const categorySelect = this.element.querySelector('#eventCategory');
            categorySelect.classList.remove('border-red-400', 'animate-shake');
            
            let hasError = false;
            
            if (!name) {
                nameInput.classList.add('border-red-400', 'animate-shake');
                hasError = true;
            }
            
            if (!date) {
                dateInput.classList.add('border-red-400', 'animate-shake');
                hasError = true;
            }
            
            if (!selectedIcon) {
                iconButtons.forEach(btn => btn.classList.add('animate-shake'));
                hasError = true;
            }

            if (!category) {
                categorySelect.classList.add('border-red-400', 'animate-shake');
                hasError = true;
            }
            
            if (hasError) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'text-red-500 text-sm mt-4 text-center animate-shake';
                errorMessage.textContent = 'Please fill in all required fields! 🥺';
                saveBtn.parentNode.insertBefore(errorMessage, saveBtn.nextSibling);
                setTimeout(() => errorMessage.remove(), 3000);
                return;
            }

            // 检查日期是否有效（不能是过去的时间）
            const targetDate = new Date(date);
            const now = new Date();
            if (targetDate <= now) {
                dateInput.classList.add('border-red-400', 'animate-shake');
                alert('Please select a future date and time!');
                return;
            }

            const countdown = {
                id: Date.now(),
                name,
                targetDate: date,
                icon: selectedIcon,
                category: category,
                createdAt: new Date().toISOString()
            };

            const countdowns = this.storageService.get('countdowns') || [];
            countdowns.push(countdown);
            this.storageService.save('countdowns', countdowns);

            goBack();
        });

        // 自动聚焦到名称输入框
        setTimeout(() => nameInput.focus(), 100);
    }

    loadCountdowns() {
        const countdowns = this.storageService.get('countdowns') || [];
        const container = this.element.querySelector('#countdownsContainer');
        
        if (!container) return;

        // 按日期排序，过滤掉已过期的倒计时
        const activeCountdowns = countdowns
            .filter(c => new Date(c.targetDate) > new Date())
            .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));

        if (activeCountdowns.length) {
            container.innerHTML = activeCountdowns.map(countdown => `
                <div class="bg-white p-4 rounded-xl shadow-sm">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">${countdown.icon}</span>
                            <div>
                                <h3 class="font-bold text-purple-600">${countdown.name}</h3>
                                <p class="text-xs text-gray-400">Target: ${new Date(countdown.targetDate).toLocaleString()}</p>
                            </div>
                        </div>
                        <button class="delete-countdown text-gray-400 hover:text-red-500 transition-colors" data-id="${countdown.id}">
                            🗑️
                        </button>
                    </div>
                    <div class="countdown-timer grid grid-cols-4 gap-2 text-center" data-target="${countdown.targetDate}">
                        <div class="bg-purple-50 rounded-lg p-2">
                            <div class="font-bold text-purple-600">--</div>
                            <div class="text-xs text-purple-400">Days</div>
                        </div>
                        <div class="bg-purple-50 rounded-lg p-2">
                            <div class="font-bold text-purple-600">--</div>
                            <div class="text-xs text-purple-400">Hours</div>
                        </div>
                        <div class="bg-purple-50 rounded-lg p-2">
                            <div class="font-bold text-purple-600">--</div>
                            <div class="text-xs text-purple-400">Mins</div>
                        </div>
                        <div class="bg-purple-50 rounded-lg p-2">
                            <div class="font-bold text-purple-600">--</div>
                            <div class="text-xs text-purple-400">Secs</div>
                        </div>
                    </div>
                </div>
            `).join('');

            // 添加删除事件监听
            container.querySelectorAll('.delete-countdown').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    this.deleteCountdown(id);
                });
            });

            // 开始倒计时更新
            this.startCountdownUpdates();
        } else {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    No active countdowns. Create one to start tracking!
                </div>
            `;
        }
    }

    startCountdownUpdates() {
        const updateTimers = () => {
            this.element.querySelectorAll('.countdown-timer').forEach(timer => {
                const target = new Date(timer.dataset.target);
                const now = new Date();
                const diff = target - now;

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                const boxes = timer.children;
                boxes[0].querySelector('div:first-child').textContent = days;
                boxes[1].querySelector('div:first-child').textContent = hours;
                boxes[2].querySelector('div:first-child').textContent = minutes;
                boxes[3].querySelector('div:first-child').textContent = seconds;
            });
        };

        // 立即更新一次
        updateTimers();
        
        // 每秒更新一次
        this.countdownInterval = setInterval(updateTimers, 1000);
    }

    deleteCountdown(id) {
        if (!confirm('Are you sure you want to delete this countdown?')) return;

        const countdowns = this.storageService.get('countdowns') || [];
        const updatedCountdowns = countdowns.filter(c => c.id !== id);
        this.storageService.save('countdowns', updatedCountdowns);
        this.loadCountdowns();
    }

    destroy() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }
} 