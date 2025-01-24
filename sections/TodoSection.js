export class TodoSection {
    constructor(storageService, dateService) {
        this.storageService = storageService;
        this.dateService = dateService;
        this.element = document.getElementById('todoSection');
    }

    initialize() {
        if (!this.initialized) {
            this.render();
            this.initialized = true;
        }
        this.loadTasks();
    }

    render() {
        this.element.innerHTML = `
            <!-- Input Section -->
            <div class="section-container mb-6">
                <div class="flex gap-2 items-center">
                    <input 
                        type="text" 
                        id="taskInput" 
                        placeholder="What's your next cute task? 🍄" 
                        class="flex-1 p-2.5 text-sm border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400"
                        autocomplete="off"
                    >
                    <select 
                        id="taskCategory"
                        class="p-2.5 text-sm border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 w-28"
                    >
                        <option value="🌸">🌸 Normal</option>
                        <option value="🛒">🛒 Shopping</option>
                        <option value="📚">📚 Study</option>
                        <option value="💼">💼 Work</option>
                    </select>
                    <input 
                        type="datetime-local" 
                        id="taskTargetTime"
                        class="p-2.5 text-sm border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 w-40"
                    >
                    <button 
                        id="addTaskBtn"
                        class="bg-pink-400 text-white px-4 py-2.5 rounded-xl hover:bg-pink-500 transition-colors flex items-center text-sm"
                    >
                        Add 🌟
                    </button>
                </div>
            </div>

            <!-- Task Lists -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-4 col-span-2">
                    <div class="bg-yellow-100 rounded-2xl p-4">
                        <h2 class="text-xl font-bold text-yellow-600 mb-4">🎯 Pending Cuteness</h2>
                        <div id="pendingTasks" class="space-y-2"></div>
                    </div>

                    <div class="bg-green-100 rounded-2xl p-4">
                        <h2 class="text-xl font-bold text-green-600 mb-4">🎉 Completed Cuteness</h2>
                        <div id="completedTasks" class="space-y-2"></div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const addBtn = this.element.querySelector('#addTaskBtn');
        const taskInput = this.element.querySelector('#taskInput');

        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
    }

    addTask() {
        const input = this.element.querySelector('#taskInput');
        const category = this.element.querySelector('#taskCategory');
        const targetTime = this.element.querySelector('#taskTargetTime');
        const content = input.value.trim();
        
        input.classList.remove('border-red-400', 'animate-shake');
        
        if (!content) {
            input.classList.add('border-red-400', 'animate-shake');
            input.placeholder = 'Please enter a task! 🥺';
            
            setTimeout(() => {
                input.classList.remove('border-red-400', 'animate-shake');
                input.placeholder = "What's your next cute task? 🍄";
            }, 2000);
            
            return;
        }
        
        const tasks = this.storageService.get('tasks') || [];
        tasks.push({
            id: Date.now(),
            content,
            category: category.value,
            completed: false,
            time: this.dateService.getFormattedTime(),
            targetTime: targetTime.value || null
        });
        
        this.storageService.save('tasks', tasks);
        this.loadTasks();
        
        input.value = '';
        targetTime.value = '';
    }

    loadTasks() {
        const tasks = this.storageService.get('tasks') || [];
        const pendingTasks = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);

        this.renderTaskList(pendingTasks, 'pendingTasks');
        this.renderTaskList(completedTasks, 'completedTasks');
    }

    renderTaskList(tasks, containerId) {
        const container = this.element.querySelector(`#${containerId}`);
        container.innerHTML = tasks.map(task => this.createTaskElement(task)).join('');
        
        // Reattach event listeners
        container.querySelectorAll('.task-item').forEach(taskElement => {
            const taskId = parseInt(taskElement.dataset.taskId);
            const task = tasks.find(t => t.id === taskId);
            
            const checkbox = taskElement.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => this.toggleTask(task));
            
            const deleteBtn = taskElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteTask(task));
        });
    }

    createTaskElement(task) {
        return `
            <div class="task-item flex items-center bg-white p-3 rounded-lg gap-3" data-task-id="${task.id}">
                <input type="checkbox" class="w-5 h-5 accent-pink-400" ${task.completed ? 'checked' : ''}>
                <span class="flex-1">${task.category} ${task.content}</span>
                <span class="text-sm text-gray-500">${task.time}</span>
                <button class="delete-btn text-pink-400 hover:text-pink-600">🗑️</button>
            </div>
        `;
    }

    toggleTask(task) {
        const tasks = this.storageService.get('tasks') || [];
        const taskIndex = tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            this.storageService.save('tasks', tasks);
            this.loadTasks();
        }
    }

    deleteTask(task) {
        const tasks = this.storageService.get('tasks') || [];
        const updatedTasks = tasks.filter(t => t.id !== task.id);
        this.storageService.save('tasks', updatedTasks);
        this.loadTasks();
    }
} 