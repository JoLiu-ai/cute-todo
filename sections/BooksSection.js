export class BooksSection {
    constructor(storageService) {
        this.storageService = storageService;
        this.element = document.getElementById('booksSection');
        this.categories = this.storageService.get('bookCategories') || [
            { name: '心理学', color: 'pink', icon: '🧠' },
            { name: '效率管理', color: 'blue', icon: '⚡' },
            { name: '认知科学', color: 'purple', icon: '🔮' },
            { name: '神经科学', color: 'indigo', icon: '🧬' },
            { name: '行为经济学', color: 'green', icon: '📊' },
            { name: '习惯养成', color: 'yellow', icon: '🌱' }
        ];
        this.storageService.save('bookCategories', this.categories);
        this.activeCategory = null;
        this.viewMode = 'grid'; // 'grid', 'list' or 'table'
        this.statusGroups = [
            { id: 'reading', name: 'Currently Reading', icon: '📖' },
            { id: 'toread', name: 'To Read', icon: '📚' },
            { id: 'completed', name: 'Completed', icon: '✅' }
        ];
        this.activeStatus = null;
    }

    initialize() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const books = this.storageService.get('books') || [];
        
        // 根据分类筛选
        const filteredBooks = this.activeCategory ? 
            books.filter(book => book.category === this.activeCategory) : 
            books;

        // 如果是表格视图，不需要按状态分组
        if (this.viewMode === 'table') {
            this.element.innerHTML = `
                <div class="p-6 space-y-6">
                    <!-- Header -->
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-800">📚 Reading List</h2>
                        <div class="flex items-center gap-2">
                            <div class="flex items-center bg-gray-100 rounded-lg p-1">
                                <button class="view-mode-btn p-2 rounded-lg ${this.viewMode === 'grid' ? 'bg-white shadow-sm' : ''}"
                                    data-mode="grid">
                                    Grid
                                </button>
                                <button class="view-mode-btn p-2 rounded-lg ${this.viewMode === 'list' ? 'bg-white shadow-sm' : ''}"
                                    data-mode="list">
                                    List
                                </button>
                                <button class="view-mode-btn p-2 rounded-lg ${this.viewMode === 'table' ? 'bg-white shadow-sm' : ''}"
                                    data-mode="table">
                                    Table
                                </button>
                            </div>
                            <button id="manageCategoriesBtn" 
                                class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg 
                                       hover:bg-gray-200 transition-colors">
                                <span>🏷️</span>
                                <span>Categories</span>
                            </button>
                            <button id="addBookBtn" 
                                class="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg 
                                       hover:bg-pink-600 transition-colors">
                                <span>+</span>
                                <span>Add Book</span>
                            </button>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-500">Filter by:</span>
                            <button id="categoryFilterBtn" 
                                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                                    ${this.activeCategory ? 
                                        `bg-${(this.categories.find(c => c.name === this.activeCategory) || {color: 'gray'}).color}-50 
                                         text-${(this.categories.find(c => c.name === this.activeCategory) || {color: 'gray'}).color}-600` : 
                                        'bg-gray-50 text-gray-600'} 
                                    hover:bg-gray-100 transition-colors">
                                ${this.activeCategory ? 
                                    `${(this.categories.find(c => c.name === this.activeCategory) || {icon: '🔍'}).icon} 
                                     ${this.activeCategory}` : 
                                    '🔍 All Categories'}
                                <span class="ml-1 opacity-60">▼</span>
                            </button>
                            <button id="statusFilterBtn" 
                                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                                    ${this.activeStatus ? 
                                        `bg-${this.activeStatus === 'reading' ? 'yellow' : 
                                             this.activeStatus === 'completed' ? 'green' : 'gray'}-50 
                                        text-${this.activeStatus === 'reading' ? 'yellow' : 
                                            this.activeStatus === 'completed' ? 'green' : 'gray'}-600` : 
                                        'bg-gray-50 text-gray-600'} 
                                    hover:bg-gray-100 transition-colors">
                                ${this.activeStatus ? 
                                    `${this.getStatusIcon(this.activeStatus)} 
                                     ${this.getStatusName(this.activeStatus)}` : 
                                    '📚 All Status'}
                                <span class="ml-1 opacity-60">▼</span>
                            </button>
                        </div>
                        ${this.activeCategory || this.activeStatus ? `
                            <button id="clearFiltersBtn" 
                                class="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                Clear filters
                            </button>
                        ` : ''}
                    </div>

                    <!-- Table -->
                    <div class="bg-white rounded-lg shadow overflow-hidden relative">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-gray-50 border-b border-gray-100">
                                        <th class="text-left p-4 font-medium text-gray-600">Title</th>
                                        <th class="text-left p-4 font-medium text-gray-600">Author</th>
                                        <th class="text-left p-4 font-medium text-gray-600">Category</th>
                                        <th class="text-left p-4 font-medium text-gray-600">Status</th>
                                        <th class="text-left p-4 font-medium text-gray-600">Pages</th>
                                        <th class="text-left p-4 font-medium text-gray-600">Added</th>
                                        <th class="text-right p-4 font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    ${filteredBooks
                                        .filter(book => !this.activeStatus || book.status === this.activeStatus)
                                        .map(book => this.createBookTableRow(book))
                                        .join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 按状态分组
            const groupedBooks = this.statusGroups.reduce((acc, group) => {
                acc[group.id] = filteredBooks.filter(book => book.status === group.id);
                return acc;
            }, {});

            this.element.innerHTML = `
                <div class="p-6 space-y-6">
                    <!-- Header -->
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-800">📚 Reading List</h2>
                        <div class="flex items-center gap-2">
                            <div class="flex items-center bg-gray-100 rounded-lg p-1">
                                <button class="view-mode-btn p-2 rounded-lg ${this.viewMode === 'grid' ? 'bg-white shadow-sm' : ''}"
                                    data-mode="grid">
                                    Grid
                                </button>
                                <button class="view-mode-btn p-2 rounded-lg ${this.viewMode === 'list' ? 'bg-white shadow-sm' : ''}"
                                    data-mode="list">
                                    List
                                </button>
                                <button class="view-mode-btn p-2 rounded-lg ${this.viewMode === 'table' ? 'bg-white shadow-sm' : ''}"
                                    data-mode="table">
                                    Table
                                </button>
                            </div>
                            <button id="manageCategoriesBtn" 
                                class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg 
                                       hover:bg-gray-200 transition-colors">
                                <span>🏷️</span>
                                <span>Categories</span>
                            </button>
                            <button id="addBookBtn" 
                                class="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg 
                                       hover:bg-pink-600 transition-colors">
                                <span>+</span>
                                <span>Add Book</span>
                            </button>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-500">Filter by:</span>
                            <button id="categoryFilterBtn" 
                                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                                    ${this.activeCategory ? 
                                        `bg-${(this.categories.find(c => c.name === this.activeCategory) || {color: 'gray'}).color}-50 
                                         text-${(this.categories.find(c => c.name === this.activeCategory) || {color: 'gray'}).color}-600` : 
                                        'bg-gray-50 text-gray-600'} 
                                    hover:bg-gray-100 transition-colors">
                                ${this.activeCategory ? 
                                    `${(this.categories.find(c => c.name === this.activeCategory) || {icon: '🔍'}).icon} 
                                     ${this.activeCategory}` : 
                                    '🔍 All Categories'}
                                <span class="ml-1 opacity-60">▼</span>
                            </button>
                            <button id="statusFilterBtn" 
                                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                                    ${this.activeStatus ? 
                                        `bg-${this.activeStatus === 'reading' ? 'yellow' : 
                                             this.activeStatus === 'completed' ? 'green' : 'gray'}-50 
                                        text-${this.activeStatus === 'reading' ? 'yellow' : 
                                            this.activeStatus === 'completed' ? 'green' : 'gray'}-600` : 
                                        'bg-gray-50 text-gray-600'} 
                                    hover:bg-gray-100 transition-colors">
                                ${this.activeStatus ? 
                                    `${this.getStatusIcon(this.activeStatus)} 
                                     ${this.getStatusName(this.activeStatus)}` : 
                                    '📚 All Status'}
                                <span class="ml-1 opacity-60">▼</span>
                            </button>
                        </div>
                        ${this.activeCategory || this.activeStatus ? `
                            <button id="clearFiltersBtn" 
                                class="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                Clear filters
                            </button>
                        ` : ''}
                    </div>

                    <!-- Books by Status -->
                    <div class="space-y-8">
                        ${this.statusGroups.map(group => `
                            <div class="space-y-4">
                                <h3 class="text-lg font-medium text-gray-700 flex items-center gap-2">
                                    <span>${group.icon}</span>
                                    <span>${group.name}</span>
                                    <span class="text-sm text-gray-400">(${groupedBooks[group.id].length})</span>
                                </h3>
                                ${this.viewMode === 'grid' ? `
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        ${groupedBooks[group.id].map(book => this.createBookCard(book)).join('')}
                                    </div>
                                ` : this.viewMode === 'list' ? `
                                    <div class="space-y-3">
                                        ${groupedBooks[group.id].map(book => this.createBookListItem(book)).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    createBookCard(book) {
        const category = this.categories.find(c => c.name === book.category) || this.categories[0];
        return `
            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="aspect-[4/3] bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 
                    flex items-center justify-center relative p-4">
                    ${book.cover ? `
                        <img src="${book.cover}" alt="${book.title}" 
                            class="w-full h-full object-cover rounded-lg"
                        >
                    ` : `
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-3xl opacity-50">📖</span>
                            <span class="text-xs text-${category.color}-400">${category.icon} ${category.name}</span>
                        </div>
                    `}
                </div>
                <div class="p-4 space-y-2">
                    <h3 class="font-bold text-gray-800 line-clamp-1">${book.title}</h3>
                    <p class="text-sm text-gray-500 line-clamp-1">${book.author}</p>
                    <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-1">
                            ${book.status === 'reading' ? 
                                '<span class="text-yellow-500">📖 Reading</span>' : 
                                book.status === 'completed' ? 
                                '<span class="text-green-500">✅ Done</span>' : 
                                '<span class="text-gray-400">📚 To Read</span>'}
                        </div>
                        <button class="edit-book hover:text-blue-500 p-1" data-id="${book.id}">✏️</button>
                    </div>
                </div>
            </div>
        `;
    }

    createBookListItem(book) {
        const category = this.categories.find(c => c.name === book.category) || this.categories[0];
        return `
            <div class="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 
                    flex items-center justify-center text-2xl rounded-lg">
                    ${book.cover || '📖'}
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 truncate">${book.title}</h3>
                    <p class="text-sm text-gray-500">${book.author}</p>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 text-xs rounded-full 
                            bg-${category.color}-50 text-${category.color}-600">
                            ${category.icon} ${book.category}
                        </span>
                        ${book.pages ? `
                            <span class="text-xs text-gray-400">${book.pages} pages</span>
                        ` : ''}
                    </div>
                </div>
                <button class="edit-book p-2 text-blue-500 hover:bg-blue-50 rounded-lg" 
                    data-id="${book.id}">
                    ✏️
                </button>
            </div>
        `;
    }

    createBookTableRow(book) {
        const category = this.categories.find(c => c.name === book.category) || this.categories[0];
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        ${book.cover ? `
                            <img src="${book.cover}" alt="" class="w-10 h-10 rounded object-cover">
                        ` : `
                            <div class="w-10 h-10 rounded bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 
                                flex items-center justify-center text-lg">
                                📖
                            </div>
                        `}
                        <div class="font-medium text-gray-900">${book.title}</div>
                    </div>
                </td>
                <td class="p-4 text-gray-600">${book.author}</td>
                <td class="p-4">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                        bg-${category.color}-50 text-${category.color}-600">
                        ${category.icon} ${book.category}
                    </span>
                </td>
                <td class="p-4">
                    <div class="inline-block">
                        <button class="status-dropdown-btn inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                            ${book.status === 'reading' ? 'bg-yellow-50 text-yellow-600' :
                              book.status === 'completed' ? 'bg-green-50 text-green-600' :
                              'bg-gray-50 text-gray-600'}"
                            data-book-id="${book.id}">
                            ${this.getStatusIcon(book.status)}
                            ${this.getStatusName(book.status)}
                            <span class="ml-1">▼</span>
                        </button>
                    </div>
                </td>
                <td class="p-4 text-gray-600">${book.pages || '-'}</td>
                <td class="p-4 text-gray-600">
                    ${new Date(book.addedAt).toLocaleDateString()}
                </td>
                <td class="p-4">
                    <div class="flex items-center justify-end gap-2">
                        <button class="edit-book p-1.5 text-blue-500 hover:bg-blue-50 rounded" 
                            data-id="${book.id}" title="Edit">
                            ✏️
                        </button>
                        <button class="delete-book p-1.5 text-red-500 hover:bg-red-50 rounded" 
                            data-id="${book.id}" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // 添加辅助方法
    getStatusIcon(status) {
        const statusGroup = this.statusGroups.find(s => s.id === status);
        return statusGroup ? statusGroup.icon : '📚';
    }

    getStatusName(status) {
        const statusGroup = this.statusGroups.find(s => s.id === status);
        return statusGroup ? statusGroup.name : 'Unknown';
    }

    // 更新状态的方法
    updateBookStatus(bookId, newStatus) {
        const books = this.storageService.get('books') || [];
        const index = books.findIndex(b => b.id === parseInt(bookId));
        if (index !== -1) {
            books[index] = {
                ...books[index],
                status: newStatus
            };
            this.storageService.save('books', books);
            this.render();
        }
    }

    showAddBookModal() {
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-lg">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Add New Book</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input type="text" id="bookTitle" class="w-full p-2 border rounded-lg" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                            <input type="text" id="bookAuthor" class="w-full p-2 border rounded-lg" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select id="bookCategory" class="w-full p-2 border rounded-lg" required>
                                ${this.categories.map(cat => `
                                    <option value="${cat.name}">${cat.icon} ${cat.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Cover Image (Optional)</label>
                            <div class="flex items-center gap-2">
                                <input type="text" id="bookCover" 
                                    class="flex-1 p-2 border rounded-lg text-gray-600"
                                    placeholder="Enter image URL"
                                    value="">
                                <button type="button" id="previewCover" 
                                    class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                    Preview
                                </button>
                            </div>
                            <div id="coverPreview" class="mt-2 hidden">
                                <img id="coverPreviewImage" 
                                    class="w-24 h-24 object-cover rounded-lg border"
                                    onerror="this.style.display='none'">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Pages (Optional)</label>
                            <input type="number" id="bookPages" 
                                class="w-full p-2 border rounded-lg text-gray-600"
                                placeholder="e.g., 300"
                                min="1">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <select id="bookStatus" class="w-full p-2 border rounded-lg" required>
                                <option value="toread">To Read</option>
                                <option value="reading">Currently Reading</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="saveBookBtn" 
                            class="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            Save Book
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        const saveBtn = modal.querySelector('#saveBookBtn');
        saveBtn.addEventListener('click', () => {
            const title = modal.querySelector('#bookTitle').value;
            const author = modal.querySelector('#bookAuthor').value;
            const category = modal.querySelector('#bookCategory').value;
            const pages = modal.querySelector('#bookPages').value;
            const status = modal.querySelector('#bookStatus').value;
            const cover = modal.querySelector('#bookCover').value;

            if (title && author && category && status) {
                this.storageService.save('books', [
                    ...(this.storageService.get('books') || []),
                    {
                        id: Date.now(),
                        title,
                        author,
                        category,
                        pages: pages || null,
                        status,
                        addedAt: new Date().toISOString(),
                        cover
                    }
                ]);
                modal.classList.add('hidden');
                this.render();
            }
        });

        const previewBtn = modal.querySelector('#previewCover');
        const coverInput = modal.querySelector('#bookCover');
        const previewContainer = modal.querySelector('#coverPreview');
        
        if (previewBtn && coverInput) {
            previewBtn.addEventListener('click', () => {
                const url = coverInput.value;
                if (url) {
                    previewContainer.innerHTML = `
                        <img src="${url}" 
                            class="w-24 h-24 object-cover rounded-lg border"
                            onerror="this.style.display='none'">
                    `;
                    previewContainer.classList.remove('hidden');
                }
            });
        }

        modal.classList.remove('hidden');
    }

    showEditBookModal(bookId) {
        const books = this.storageService.get('books') || [];
        const book = books.find(b => b.id === parseInt(bookId));
        if (!book) return;

        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-lg">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Edit Book</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <input type="text" id="bookTitle" class="w-full p-2 border rounded-lg" 
                                required value="${book.title}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                            <input type="text" id="bookAuthor" class="w-full p-2 border rounded-lg" 
                                required value="${book.author}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select id="bookCategory" class="w-full p-2 border rounded-lg" required>
                                ${this.categories.map(cat => `
                                    <option value="${cat.name}" ${cat.name === book.category ? 'selected' : ''}>
                                        ${cat.icon} ${cat.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Cover Image (Optional)</label>
                            <div class="flex items-center gap-2">
                                <input type="text" id="bookCover" 
                                    class="flex-1 p-2 border rounded-lg text-gray-600"
                                    placeholder="Enter image URL"
                                    value="${book.cover || ''}">
                                <button type="button" id="previewCover" 
                                    class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                    Preview
                                </button>
                            </div>
                            <div id="coverPreview" class="mt-2 ${book && book.cover ? '' : 'hidden'}">
                                <img src="${book.cover || ''}" 
                                    class="w-24 h-24 object-cover rounded-lg border"
                                    onerror="this.style.display='none'">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Pages (Optional)</label>
                            <input type="number" id="bookPages" 
                                class="w-full p-2 border rounded-lg text-gray-600"
                                placeholder="e.g., 300"
                                min="1"
                                value="${book.pages || ''}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <select id="bookStatus" class="w-full p-2 border rounded-lg" required>
                                <option value="toread" ${book.status === 'toread' ? 'selected' : ''}>To Read</option>
                                <option value="reading" ${book.status === 'reading' ? 'selected' : ''}>Currently Reading</option>
                                <option value="completed" ${book.status === 'completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="updateBookBtn" 
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            Update Book
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

        const updateBtn = modal.querySelector('#updateBookBtn');
        updateBtn.addEventListener('click', () => {
            const title = modal.querySelector('#bookTitle').value;
            const author = modal.querySelector('#bookAuthor').value;
            const category = modal.querySelector('#bookCategory').value;
            const pages = modal.querySelector('#bookPages').value;
            const status = modal.querySelector('#bookStatus').value;
            const cover = modal.querySelector('#bookCover').value;

            if (title && author && category && status) {
                const books = this.storageService.get('books') || [];
                const index = books.findIndex(b => b.id === parseInt(bookId));
                if (index !== -1) {
                    books[index] = {
                        ...books[index],
                        title,
                        author,
                        category,
                        pages: pages || null,
                        status,
                        cover
                    };
                    this.storageService.save('books', books);
                    modal.classList.add('hidden');
                    this.render();
                }
            }
        });

        const previewBtn = modal.querySelector('#previewCover');
        const coverInput = modal.querySelector('#bookCover');
        const previewContainer = modal.querySelector('#coverPreview');
        
        if (previewBtn && coverInput) {
            previewBtn.addEventListener('click', () => {
                const url = coverInput.value;
                if (url) {
                    previewContainer.innerHTML = `
                        <img src="${url}" 
                            class="w-24 h-24 object-cover rounded-lg border"
                            onerror="this.style.display='none'">
                    `;
                    previewContainer.classList.remove('hidden');
                }
            });
        }

        modal.classList.remove('hidden');
    }

    showCategoryManagerModal() {
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-lg">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Manage Categories</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    
                    <!-- Add New Category Form -->
                    <div class="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h4 class="font-medium text-gray-700">Add New Category</h4>
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Name *</label>
                                <input type="text" id="categoryName" class="w-full p-2 border rounded-lg text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Icon *</label>
                                <input type="text" id="categoryIcon" class="w-full p-2 border rounded-lg text-sm"
                                    placeholder="e.g., 📚">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Color *</label>
                                <select id="categoryColor" class="w-full p-2 border rounded-lg text-sm">
                                    <option value="pink">Pink</option>
                                    <option value="blue">Blue</option>
                                    <option value="purple">Purple</option>
                                    <option value="green">Green</option>
                                    <option value="yellow">Yellow</option>
                                    <option value="indigo">Indigo</option>
                                    <option value="red">Red</option>
                                    <option value="orange">Orange</option>
                                </select>
                            </div>
                        </div>
                        <button id="addCategoryBtn" 
                            class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                            Add Category
                        </button>
                    </div>

                    <!-- Existing Categories List -->
                    <div class="mt-6">
                        <h4 class="font-medium text-gray-700 mb-3">Existing Categories</h4>
                        <div class="space-y-2" id="categoriesList">
                            ${this.categories.map(cat => `
                                <div class="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div class="flex items-center gap-3">
                                        <span class="text-xl">${cat.icon}</span>
                                        <span class="font-medium text-gray-700">${cat.name}</span>
                                        <span class="px-2 py-1 text-xs rounded-full bg-${cat.color}-50 text-${cat.color}-600">
                                            ${cat.color}
                                        </span>
                                    </div>
                                    <button class="delete-category text-red-400 hover:text-red-600" 
                                        data-name="${cat.name}">
                                        🗑️
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 处理添加新类别
        const addCategoryBtn = modal.querySelector('#addCategoryBtn');
        addCategoryBtn.addEventListener('click', () => {
            const name = modal.querySelector('#categoryName').value;
            const icon = modal.querySelector('#categoryIcon').value;
            const color = modal.querySelector('#categoryColor').value;

            if (name && icon && color) {
                this.categories.push({ name, icon, color });
                this.storageService.save('bookCategories', this.categories);
                this.showCategoryManagerModal(); // 刷新模态框
            }
        });

        // 处理删除类别
        modal.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                this.categories = this.categories.filter(c => c.name !== name);
                this.storageService.save('bookCategories', this.categories);
                this.showCategoryManagerModal(); // 刷新模态框
            });
        });

        // 处理关闭按钮
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
                this.render(); // 刷新主页面
            });
        });

        modal.classList.remove('hidden');
    }

    showStatusPopup(button, bookId, currentStatus) {
        // 先移除已存在的弹窗
        const existingPopup = document.getElementById('statusPopup');
        if (existingPopup) existingPopup.remove();

        // 获取按钮位置
        const rect = button.getBoundingClientRect();

        // 创建弹窗
        const popup = document.createElement('div');
        popup.id = 'statusPopup';
        popup.className = 'fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50';
        popup.style.cssText = `
            top: ${rect.bottom + window.scrollY + 5}px;
            left: ${rect.left + window.scrollX}px;
            min-width: 200px;
        `;

        // 添加弹窗内容
        popup.innerHTML = `
            <div class="p-2 space-y-1">
                ${this.statusGroups.map(status => `
                    <button class="status-option w-full text-left px-3 py-2 text-sm rounded-lg
                        ${status.id === currentStatus ? 'bg-gray-100' : 'hover:bg-gray-50'}"
                        data-book-id="${bookId}" 
                        data-status="${status.id}">
                        <span class="inline-flex items-center gap-2">
                            ${status.icon} ${status.name}
                            ${status.id === currentStatus ? '<span class="ml-auto">✓</span>' : ''}
                        </span>
                    </button>
                `).join('')}
            </div>
        `;

        // 添加遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-40';
        overlay.addEventListener('click', () => {
            popup.remove();
            overlay.remove();
        });

        // 添加到文档
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        // 处理选项点击
        popup.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', () => {
                const newStatus = option.dataset.status;
                const bookId = option.dataset.bookId;
                this.updateBookStatus(bookId, newStatus);
                popup.remove();
                overlay.remove();
            });
        });
    }

    showCategoryPopup(button) {
        const existingPopup = document.getElementById('categoryPopup');
        if (existingPopup) existingPopup.remove();

        const rect = button.getBoundingClientRect();

        const popup = document.createElement('div');
        popup.id = 'categoryPopup';
        popup.className = 'fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50';
        popup.style.cssText = `
            top: ${rect.bottom + window.scrollY + 5}px;
            left: ${rect.left + window.scrollX}px;
            min-width: 200px;
        `;

        popup.innerHTML = `
            <div class="p-2 space-y-1">
                <button class="category-option w-full text-left px-3 py-2 text-sm rounded-lg
                    ${!this.activeCategory ? 'bg-gray-100' : 'hover:bg-gray-50'}"
                    data-category="">
                    <span class="inline-flex items-center gap-2">
                        🔍 All Categories
                        ${!this.activeCategory ? '<span class="ml-auto">✓</span>' : ''}
                    </span>
                </button>
                ${this.categories.map(cat => `
                    <button class="category-option w-full text-left px-3 py-2 text-sm rounded-lg
                        ${this.activeCategory === cat.name ? 'bg-gray-100' : 'hover:bg-gray-50'}"
                        data-category="${cat.name}">
                        <span class="inline-flex items-center gap-2">
                            ${cat.icon} ${cat.name}
                            ${this.activeCategory === cat.name ? '<span class="ml-auto">✓</span>' : ''}
                        </span>
                    </button>
                `).join('')}
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-40';
        overlay.addEventListener('click', () => {
            popup.remove();
            overlay.remove();
        });

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        popup.querySelectorAll('.category-option').forEach(option => {
            option.addEventListener('click', () => {
                const category = option.dataset.category;
                this.activeCategory = category || null;
                this.render();
                popup.remove();
                overlay.remove();
            });
        });
    }

    showStatusFilterPopup(button) {
        const existingPopup = document.getElementById('statusFilterPopup');
        if (existingPopup) existingPopup.remove();

        const rect = button.getBoundingClientRect();

        const popup = document.createElement('div');
        popup.id = 'statusFilterPopup';
        popup.className = 'fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50';
        popup.style.cssText = `
            top: ${rect.bottom + window.scrollY + 5}px;
            left: ${rect.left + window.scrollX}px;
            min-width: 200px;
        `;

        popup.innerHTML = `
            <div class="p-2 space-y-1">
                <button class="status-filter-option w-full text-left px-3 py-2 text-sm rounded-lg
                    ${!this.activeStatus ? 'bg-gray-100' : 'hover:bg-gray-50'}"
                    data-status="">
                    <span class="inline-flex items-center gap-2">
                        📚 All Status
                        ${!this.activeStatus ? '<span class="ml-auto">✓</span>' : ''}
                    </span>
                </button>
                ${this.statusGroups.map(status => `
                    <button class="status-filter-option w-full text-left px-3 py-2 text-sm rounded-lg
                        ${this.activeStatus === status.id ? 'bg-gray-100' : 'hover:bg-gray-50'}"
                        data-status="${status.id}">
                        <span class="inline-flex items-center gap-2">
                            ${status.icon} ${status.name}
                            ${this.activeStatus === status.id ? '<span class="ml-auto">✓</span>' : ''}
                        </span>
                    </button>
                `).join('')}
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-40';
        overlay.addEventListener('click', () => {
            popup.remove();
            overlay.remove();
        });

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        popup.querySelectorAll('.status-filter-option').forEach(option => {
            option.addEventListener('click', () => {
                const status = option.dataset.status;
                this.activeStatus = status || null;
                this.render();
                popup.remove();
                overlay.remove();
            });
        });
    }

    attachEventListeners() {
        this.element.addEventListener('click', (e) => {
            const addBtn = e.target.closest('#addBookBtn');
            const editBtn = e.target.closest('.edit-book');
            const manageCategoriesBtn = e.target.closest('#manageCategoriesBtn');
            const categoryFilterBtn = e.target.closest('#categoryFilterBtn');
            const viewModeBtn = e.target.closest('.view-mode-btn');

            if (addBtn) {
                this.showAddBookModal();
            }

            if (editBtn) {
                const bookId = editBtn.dataset.id;
                this.showEditBookModal(bookId);
            }

            if (manageCategoriesBtn) {
                this.showCategoryManagerModal();
            }

            if (categoryFilterBtn) {
                this.showCategoryPopup(categoryFilterBtn);
                e.stopPropagation();
            }

            if (viewModeBtn) {
                this.viewMode = viewModeBtn.dataset.mode;
                this.render();
            }

            // 修改状态按钮点击处理
            const statusBtn = e.target.closest('.status-dropdown-btn');
            if (statusBtn) {
                const bookId = statusBtn.dataset.bookId;
                const books = this.storageService.get('books') || [];
                const book = books.find(b => b.id === parseInt(bookId));
                if (book) {
                    this.showStatusPopup(statusBtn, bookId, book.status);
                }
                e.stopPropagation();
            }

            const statusFilterBtn = e.target.closest('#statusFilterBtn');
            if (statusFilterBtn) {
                this.showStatusFilterPopup(statusFilterBtn);
                e.stopPropagation();
            }

            const clearFiltersBtn = e.target.closest('#clearFiltersBtn');
            if (clearFiltersBtn) {
                this.activeCategory = null;
                this.activeStatus = null;
                this.render();
            }
        });
    }
} 