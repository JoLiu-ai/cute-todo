export class QuotesSection {
    constructor(storageService, quotesService) {
        this.storageService = storageService;
        this.quotesService = quotesService;
        this.element = document.getElementById('quotesSection');
        this.activeCategory = null; // 当前选中的分类
        this.categories = [
            { name: '脑科学', color: 'purple', icon: '🧠' },
            { name: '效率管理', color: 'blue', icon: '⚡' },
            { name: '心理学', color: 'pink', icon: '💭' },
            { name: '认知科学', color: 'indigo', icon: '🔮' },
            { name: '习惯养成', color: 'green', icon: '🌱' },
            { name: '情绪管理', color: 'yellow', icon: '🌈' }
        ];
        this.currentView = 'wall'; // 'wall' or 'manage'
    }

    initialize() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        if (this.currentView === 'wall') {
            this.renderWall();
        } else {
            this.renderManage();
        }
    }

    renderWall() {
        let quotes = this.quotesService.getAllQuotes();
        
        // 根据选中的分类筛选
        if (this.activeCategory) {
            quotes = quotes.filter(quote => quote.category === this.activeCategory);
        }
        
        this.element.innerHTML = `
            <div class="p-6 space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-800">Knowledge Wall</h2>
                    <button id="switchToManageBtn" 
                        class="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-600 rounded-lg 
                               hover:bg-pink-200 transition-colors">
                        <span>✏️</span>
                        <span>Manage Quotes</span>
                    </button>
                </div>

                <!-- Category Filters -->
                <div class="flex flex-wrap gap-2" id="categoryFilters">
                    <button class="category-filter px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5
                        ${!this.activeCategory ? 'bg-gray-100 text-gray-600 ring-2 ring-gray-300' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'} 
                        transition-colors"
                        data-category="">
                        <span>🔍</span>
                        <span>All</span>
                    </button>
                    ${this.categories.map(cat => `
                        <button class="category-filter px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5
                            ${this.activeCategory === cat.name ? 
                                `bg-${cat.color}-100 text-${cat.color}-600 ring-2 ring-${cat.color}-300` : 
                                `bg-${cat.color}-50 text-${cat.color}-500 hover:bg-${cat.color}-100`}
                            transition-colors"
                            data-category="${cat.name}">
                            <span>${cat.icon}</span>
                            <span>${cat.name}</span>
                        </button>
                    `).join('')}
                </div>

                <!-- Results Count -->
                <div class="text-sm text-gray-500">
                    Showing ${quotes.length} ${this.activeCategory ? `quotes in "${this.activeCategory}"` : 'quotes'}
                </div>

                <!-- Quotes Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${quotes.length ? 
                        quotes.map(quote => this.createQuoteCard(quote)).join('') :
                        `<div class="col-span-full text-center py-8 text-gray-400">
                            No quotes found ${this.activeCategory ? `in "${this.activeCategory}"` : ''}
                        </div>`
                    }
                </div>
            </div>
        `;
    }

    renderManage() {
        const quotes = this.quotesService.getAllQuotes();
        
        this.element.innerHTML = `
            <div class="p-6 space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <button id="backToWallBtn" class="text-gray-400 hover:text-gray-600">
                            ← Back
                        </button>
                        <h2 class="text-2xl font-bold text-gray-800">Manage Knowledge</h2>
                    </div>
                    <button id="addQuoteBtn" 
                        class="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg 
                               hover:bg-pink-600 transition-colors">
                        <span>+</span>
                        <span>New Quote</span>
                    </button>
                </div>

                <!-- Quotes List -->
                <div class="space-y-4">
                    ${quotes.map(quote => this.createQuoteManageRow(quote)).join('')}
                </div>
            </div>
        `;
    }

    createQuoteManageRow(quote) {
        const category = this.categories.find(c => c.name === quote.category) || this.categories[0];
        return `
            <div class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 space-y-2">
                        <span class="px-2 py-1 text-sm rounded-lg inline-flex items-center gap-1.5
                            bg-${category.color}-50 text-${category.color}-600">
                            ${category.icon} ${quote.category}
                        </span>
                        <p class="text-gray-600">${quote.content}</p>
                        <div class="text-sm text-gray-400 italic">
                            —— ${quote.source}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" class="edit-quote p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                            data-id="${quote.id}">
                            <span class="pointer-events-none">✏️</span>
                        </button>
                        <button type="button" class="delete-quote p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            data-id="${quote.id}">
                            <span class="pointer-events-none">🗑️</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        document.addEventListener('click', (e) => {
            console.log('Clicked element:', e.target);
            const target = e.target;

            // 如果点击的是模态框外部，关闭模态框
            const modal = document.getElementById('modal');
            if (modal && !modal.classList.contains('hidden') && e.target === modal) {
                modal.classList.add('hidden');
            }

            // 只处理当前 section 内的点击
            if (!this.element.contains(target)) return;

            const backBtn = target.closest('#backToWallBtn');
            const switchBtn = target.closest('#switchToManageBtn');
            const addBtn = target.closest('#addQuoteBtn');
            const editBtn = target.closest('.edit-quote');
            const deleteBtn = target.closest('.delete-quote');
            const categoryBtn = target.closest('.category-filter');

            console.log('Found buttons:', {
                backBtn,
                switchBtn,
                addBtn,
                editBtn,
                deleteBtn,
                categoryBtn
            });

            // 分类筛选按钮
            if (categoryBtn) {
                console.log('Category button clicked:', categoryBtn.dataset.category);
                const category = categoryBtn.dataset.category;
                this.activeCategory = category || null;
                this.render();
                return;
            }

            // 返回按钮
            if (backBtn) {
                console.log('Back button clicked');
                this.currentView = 'wall';
                this.render();
            }
            
            // 切换到管理视图按钮
            if (switchBtn) {
                this.currentView = 'manage';
                this.render();
            }
            
            // 添加新知识按钮
            if (addBtn) {
                this.showAddQuoteModal();
            }
            
            // 编辑按钮
            if (editBtn) {
                console.log('Edit button clicked, id:', editBtn.dataset.id);
                const quoteId = editBtn.dataset.id;
                this.showEditQuoteModal(quoteId);
            }
            
            // 删除按钮
            if (deleteBtn) {
                console.log('Delete button clicked, id:', deleteBtn.dataset.id);
                const quoteId = deleteBtn.dataset.id;
                this.deleteQuote(quoteId);
            }
        });
    }

    showAddQuoteModal() {
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-lg">
                <div class="p-6 space-y-4">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Add New Quote</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="quoteCategory" class="w-full p-2 border rounded-lg">
                                ${this.categories.map(cat => `
                                    <option value="${cat.name}">${cat.icon} ${cat.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea id="quoteContent" rows="3" 
                                class="w-full p-2 border rounded-lg resize-none"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
                            <input type="text" id="quoteSource" 
                                class="w-full p-2 border rounded-lg">
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="saveQuoteBtn" 
                            class="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            Save Quote
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 处理关闭按钮
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        const saveBtn = modal.querySelector('#saveQuoteBtn');
        saveBtn.addEventListener('click', () => {
            const category = modal.querySelector('#quoteCategory').value;
            const content = modal.querySelector('#quoteContent').value;
            const source = modal.querySelector('#quoteSource').value;

            if (content && source) {
                this.quotesService.addQuote({ category, content, source });
                modal.classList.add('hidden');
                this.render();
            }
        });

        modal.classList.remove('hidden');
    }

    createQuoteCard(quote) {
        const category = this.categories.find(c => c.name === quote.category) || this.categories[0];
        return `
            <div class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div class="space-y-3">
                    <div class="flex items-start justify-between">
                        <span class="px-2 py-1 text-sm rounded-lg 
                            bg-${category.color}-50 text-${category.color}-600">
                            ${category.icon} ${quote.category}
                        </span>
                        <button class="text-gray-400 hover:text-gray-600">⋮</button>
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed">${quote.content}</p>
                    <div class="text-xs text-gray-400 italic">
                        —— ${quote.source}
                    </div>
                </div>
            </div>
        `;
    }

    showEditQuoteModal(quoteId) {
        const quote = this.quotesService.getQuoteById(quoteId);
        if (!quote) return;

        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-lg">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Edit Quote</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="quoteCategory" class="w-full p-2 border rounded-lg">
                                ${this.categories.map(cat => `
                                    <option value="${cat.name}" ${cat.name === quote.category ? 'selected' : ''}>
                                        ${cat.icon} ${cat.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea id="quoteContent" rows="3" 
                                class="w-full p-2 border rounded-lg resize-none">${quote.content}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
                            <input type="text" id="quoteSource" 
                                class="w-full p-2 border rounded-lg"
                                value="${quote.source}">
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="updateQuoteBtn" 
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            Update Quote
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 处理关闭按钮
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        // 处理点击遮罩层关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        const updateBtn = modal.querySelector('#updateQuoteBtn');
        updateBtn.addEventListener('click', () => {
            const category = modal.querySelector('#quoteCategory').value;
            const content = modal.querySelector('#quoteContent').value;
            const source = modal.querySelector('#quoteSource').value;

            if (content && source) {
                this.quotesService.editQuote(quoteId, { category, content, source });
                modal.classList.add('hidden');
                this.render();
            }
        });

        modal.classList.remove('hidden');
    }

    deleteQuote(quoteId) {
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-md">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Delete Quote</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <p class="text-gray-600">Are you sure you want to delete this quote? This action cannot be undone.</p>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="confirmDeleteBtn" 
                            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 处理关闭按钮
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        // 处理点击遮罩层关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        const confirmBtn = modal.querySelector('#confirmDeleteBtn');
        confirmBtn.addEventListener('click', () => {
            this.quotesService.deleteQuote(quoteId);
            modal.classList.add('hidden');
            this.render();
        });

        modal.classList.remove('hidden');
    }
} 