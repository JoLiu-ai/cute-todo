export class Note {
    constructor(storageService) {
        this.storageService = storageService;
        this.notes = [];
    }

    createNoteElement(note) {
        const element = document.createElement('div');
        element.className = 'note-container';
        element.innerHTML = `
            <div class="note-content">
                <div class="category-label ${this.getCategoryClass(note.category)}">
                    ${note.category}
                </div>
                <p class="note-text">${note.content}</p>
                <div class="note-footer">
                    <span class="note-time">${note.time}</span>
                    <div class="note-actions">
                        <button class="edit-btn">✏️</button>
                        <button class="delete-btn">🗑️</button>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners(element, note);
        return element;
    }

    getCategoryClass(category) {
        const classes = {
            '💭': 'category-thought',
            '💡': 'category-idea',
            '❤️': 'category-memory',
            '📝': 'category-task'
        };
        return classes[category] || 'category-thought';
    }

    attachEventListeners(element, note) {
        element.querySelector('.edit-btn').addEventListener('click', () => {
            this.editNote(note);
        });

        element.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteNote(note);
        });
    }

    renderEditModal() {
        return `
            <div class="modal-content edit-note">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-blue-600">✏️ Edit Note</h2>
                    <button class="text-gray-400 hover:text-gray-600" id="closeEditModal">✕</button>
                </div>
                <input 
                    type="text" 
                    id="editNoteTitle" 
                    value="${this.note.title || ''}"
                    placeholder="Note title (optional) ✨" 
                    class="w-full p-2.5 text-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 mb-3"
                >
                <textarea 
                    id="editNoteContent"
                    class="w-full p-2.5 text-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 mb-3 min-h-[200px] resize-y"
                >${this.note.content}</textarea>
                <select 
                    id="editNoteCategory"
                    class="w-full p-2.5 text-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 mb-4"
                >
                    <!-- ... options ... -->
                </select>
                <div class="flex justify-end gap-2">
                    <button class="btn-secondary" id="closeEditModal">Cancel</button>
                    <button class="btn-primary" id="saveEditNote">Save Changes 💫</button>
                </div>
            </div>
        `;
    }

    // ... 其他方法
} 