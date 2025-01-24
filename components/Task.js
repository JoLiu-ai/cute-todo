export class Task {
    constructor(storageService) {
        this.storageService = storageService;
        this.tasks = [];
    }

    createTaskElement(task) {
        const element = document.createElement('div');
        element.className = 'task-item';
        element.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-category">${task.category}</span>
            <span class="task-content">${task.content}</span>
            <span class="task-time">${task.time}</span>
            <button class="delete-btn">🗑️</button>
        `;

        this.attachEventListeners(element, task);
        return element;
    }

    attachEventListeners(element, task) {
        element.querySelector('.task-checkbox').addEventListener('change', (e) => {
            this.toggleTask(task, e.target.checked);
        });

        element.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteTask(task);
        });
    }

    // ... 其他方法
} 