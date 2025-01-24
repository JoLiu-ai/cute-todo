export class NotesSection {
    constructor(storageService, dateService) {
        this.storageService = storageService;
        this.dateService = dateService;
        this.element = document.getElementById('notesSection');
        this.selectedCategory = null;
    }

    initialize() {
        if (!this.initialized) {
            this.render();
            this.initialized = true;
        }
        this.loadNotes();
    }

    render() {
        this.element.innerHTML = `
            <div class="section-container">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-lg font-semibold text-blue-600">📝 Fluffy Notes</h2>
                    <button 
                        id="openNewNoteBtn"
                        class="bg-blue-400 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>✨ New Note</span>
                    </button>
                </div>

                <!-- Notes Wall -->
                <div id="notesContainer" class="notes-wall"></div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const openNewNoteBtn = this.element.querySelector('#openNewNoteBtn');
        
        openNewNoteBtn.addEventListener('click', () => this.showNewNoteModal());

        // Category selection
        this.element.querySelectorAll('.category-pill').forEach(pill => {
            pill.addEventListener('click', () => this.setCategory(pill));
        });
    }

    setCategory(pillElement) {
        // Remove highlight from all pills
        this.element.querySelectorAll('.category-pill').forEach(pill => {
            pill.classList.remove('ring-2');
        });

        // Highlight selected pill
        pillElement.classList.add('ring-2');
        this.selectedCategory = pillElement.dataset.category;
    }

    showNewNoteModal() {
        // 保存当前内容
        const originalContent = this.element.innerHTML;
        
        // 切换到编辑模式
        this.element.innerHTML = `
            <div class="section-container min-h-screen">
                <!-- Header -->
                <div class="flex justify-between items-center mb-8">
                    <div class="flex items-center gap-3">
                        <button id="backToNotes" class="text-gray-400 hover:text-gray-600 text-xl">←</button>
                        <h2 class="text-xl font-bold text-blue-600">✨ New Note</h2>
                    </div>
                    <button id="saveNewNote"
                        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>Save Note</span>
                        <span>📝</span>
                    </button>
                </div>

                <!-- Edit Form -->
                <div class="max-w-3xl mx-auto space-y-6">
                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Title (Optional)</label>
                        <input 
                            type="text" 
                            id="noteTitle" 
                            placeholder="Give your note a title ✨" 
                            class="w-full p-4 text-lg border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400"
                        >
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Content</label>
                        <textarea 
                            id="noteInput"
                            placeholder="What's on your mind? 💭"
                            class="w-full p-4 text-lg border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 min-h-[300px] resize-y"
                        ></textarea>
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Category</label>
                        <div class="flex flex-wrap gap-3">
                            <button data-category="💭 Thought" 
                                class="category-pill px-4 py-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                                💭 Thought
                            </button>
                            <button data-category="💡 Idea" 
                                class="category-pill px-4 py-2 rounded-xl bg-purple-50 text-purple-500 hover:bg-purple-100 transition-colors">
                                💡 Idea
                            </button>
                            <button data-category="❤️ Memory" 
                                class="category-pill px-4 py-2 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors">
                                ❤️ Memory
                            </button>
                            <button data-category="📝 Task" 
                                class="category-pill px-4 py-2 rounded-xl bg-green-50 text-green-500 hover:bg-green-100 transition-colors">
                                📝 Task
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加事件监听
        const backBtn = this.element.querySelector('#backToNotes');
        const saveBtn = this.element.querySelector('#saveNewNote');
        const input = this.element.querySelector('#noteInput');
        const title = this.element.querySelector('#noteTitle');
        const categoryPills = this.element.querySelectorAll('.category-pill');
        
        let selectedCategory = null;

        // 返回按钮
        const goBack = () => {
            this.element.innerHTML = originalContent;
            this.attachEventListeners();
        };

        backBtn.addEventListener('click', () => {
            if (input.value.trim() || title.value.trim()) {
                if (confirm('Discard changes?')) {
                    goBack();
                }
            } else {
                goBack();
            }
        });

        // 分类选择
        categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                categoryPills.forEach(p => p.classList.remove('ring-2', 'ring-offset-2'));
                pill.classList.add('ring-2', 'ring-offset-2');
                selectedCategory = pill.dataset.category;
            });
        });

        // 保存按钮
        saveBtn.addEventListener('click', () => {
            const content = input.value.trim();
            
            // 移除之前的错误状态
            input.classList.remove('border-red-400', 'animate-shake');
            
            let hasError = false;
            
            if (!content) {
                input.classList.add('border-red-400', 'animate-shake');
                hasError = true;
            }
            
            if (!selectedCategory) {
                categoryPills.forEach(pill => {
                    pill.classList.add('animate-shake');
                });
                hasError = true;
            }
            
            if (hasError) return;

            const note = {
                id: Date.now(),
                title: title.value.trim(),
                content: content,
                category: selectedCategory,
                time: this.dateService.getFormattedTime(),
                createdAt: new Date().toISOString()
            };

            const notes = this.storageService.get('notes') || [];
            notes.push(note);
            this.storageService.save('notes', notes);

            goBack();
            this.loadNotes();
        });

        // 自动聚焦到标题输入框
        setTimeout(() => title.focus(), 100);
    }

    loadNotes() {
        const notes = this.storageService.get('notes') || [];
        // 按创建时间降序排序（新到旧）
        const sortedNotes = notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const container = this.element.querySelector('#notesContainer');
        
        container.innerHTML = sortedNotes
            .map((note, index) => {
                const element = this.createNoteElement(note);
                return element.replace(
                    'note-container',
                    `note-container style="animation-delay: ${index * 0.05}s"`
                );
            })
            .join('');
        
        // Reattach event listeners
        container.querySelectorAll('.note-container').forEach(noteElement => {
            const noteId = parseInt(noteElement.dataset.noteId);
            const note = notes.find(n => n.id === noteId);
            
            const editBtn = noteElement.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => this.editNote(note));
            
            const deleteBtn = noteElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteNote(note));
        });
    }

    createNoteElement(note) {
        return `
            <div class="note-container" data-note-id="${note.id}">
                <div class="note-card">
                    <div class="note-content">
                        <div class="note-category" data-category="${note.category}">
                            ${note.category}
                        </div>
                        <p class="note-text">${note.content}</p>
                        <div class="note-footer">
                            <span>${note.time}</span>
                            <div class="note-actions">
                                <button class="edit-btn hover:text-blue-500 transition-colors">✏️</button>
                                <button class="delete-btn hover:text-red-500 transition-colors">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCategoryClass(category) {
        const classes = {
            '💭 Thought': 'bg-blue-50 text-blue-600',
            '💡 Idea': 'bg-purple-50 text-purple-600',
            '❤️ Memory': 'bg-pink-50 text-pink-600',
            '📝 Task': 'bg-green-50 text-green-600'
        };
        return classes[category] || classes['💭 Thought'];
    }

    editNote(note) {
        // 保存当前内容
        const originalContent = this.element.innerHTML;
        
        // 切换到编辑模式
        this.element.innerHTML = `
            <div class="section-container min-h-screen">
                <!-- Header -->
                <div class="flex justify-between items-center mb-8">
                    <div class="flex items-center gap-3">
                        <button id="backToNotes" class="text-gray-400 hover:text-gray-600 text-xl">←</button>
                        <h2 class="text-xl font-bold text-blue-600">✏️ Edit Note</h2>
                    </div>
                    <button id="saveEditNote"
                        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>Save Changes</span>
                        <span>💫</span>
                    </button>
                </div>

                <!-- Edit Form -->
                <div class="max-w-3xl mx-auto space-y-6">
                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Title (Optional)</label>
                        <input 
                            type="text" 
                            id="noteTitle" 
                            value="${note.title || ''}"
                            placeholder="Give your note a title ✨" 
                            class="w-full p-4 text-lg border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400"
                        >
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Content</label>
                        <textarea 
                            id="noteInput"
                            placeholder="What's on your mind? 💭"
                            class="w-full p-4 text-lg border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400 min-h-[300px] resize-y"
                        >${note.content}</textarea>
                    </div>

                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Category</label>
                        <div class="flex flex-wrap gap-3">
                            <button data-category="💭 Thought" 
                                class="category-pill px-4 py-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors ${note.category === '💭 Thought' ? 'ring-2 ring-offset-2' : ''}">
                                💭 Thought
                            </button>
                            <button data-category="💡 Idea" 
                                class="category-pill px-4 py-2 rounded-xl bg-purple-50 text-purple-500 hover:bg-purple-100 transition-colors ${note.category === '💡 Idea' ? 'ring-2 ring-offset-2' : ''}">
                                💡 Idea
                            </button>
                            <button data-category="❤️ Memory" 
                                class="category-pill px-4 py-2 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors ${note.category === '❤️ Memory' ? 'ring-2 ring-offset-2' : ''}">
                                ❤️ Memory
                            </button>
                            <button data-category="📝 Task" 
                                class="category-pill px-4 py-2 rounded-xl bg-green-50 text-green-500 hover:bg-green-100 transition-colors ${note.category === '📝 Task' ? 'ring-2 ring-offset-2' : ''}">
                                📝 Task
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加事件监听
        const backBtn = this.element.querySelector('#backToNotes');
        const saveBtn = this.element.querySelector('#saveEditNote');
        const input = this.element.querySelector('#noteInput');
        const title = this.element.querySelector('#noteTitle');
        const categoryPills = this.element.querySelectorAll('.category-pill');
        
        let selectedCategory = note.category;

        // 返回按钮
        const goBack = () => {
            this.element.innerHTML = originalContent;
            this.attachEventListeners();
        };

        backBtn.addEventListener('click', () => {
            if (input.value !== note.content || title.value !== (note.title || '')) {
                if (confirm('Discard changes?')) {
                    goBack();
                }
            } else {
                goBack();
            }
        });

        // 分类选择
        categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                categoryPills.forEach(p => p.classList.remove('ring-2', 'ring-offset-2'));
                pill.classList.add('ring-2', 'ring-offset-2');
                selectedCategory = pill.dataset.category;
            });
        });

        // 保存按钮
        saveBtn.addEventListener('click', () => {
            const content = input.value.trim();
            
            // 移除之前的错误状态
            input.classList.remove('border-red-400', 'animate-shake');
            
            let hasError = false;
            
            if (!content) {
                input.classList.add('border-red-400', 'animate-shake');
                hasError = true;
            }
            
            if (!selectedCategory) {
                categoryPills.forEach(pill => {
                    pill.classList.add('animate-shake');
                });
                hasError = true;
            }
            
            if (hasError) return;

            const notes = this.storageService.get('notes') || [];
            const noteIndex = notes.findIndex(n => n.id === note.id);
            
            if (noteIndex !== -1) {
                notes[noteIndex] = {
                    ...notes[noteIndex],
                    title: title.value.trim(),
                    content: content,
                    category: selectedCategory,
                    time: this.dateService.getFormattedTime()
                };
                
                this.storageService.save('notes', notes);
                goBack();
                this.loadNotes();
            }
        });

        // 自动聚焦到标题输入框
        setTimeout(() => title.focus(), 100);
    }

    deleteNote(note) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        const notes = this.storageService.get('notes') || [];
        const updatedNotes = notes.filter(n => n.id !== note.id);
        this.storageService.save('notes', updatedNotes);
        this.loadNotes();
    }
} 