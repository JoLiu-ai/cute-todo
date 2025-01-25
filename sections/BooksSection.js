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
        this.statusGroups = [
            { id: 'reading', name: 'Currently Reading', icon: '📖' },
            { id: 'toread', name: 'To Read', icon: '📚' },
            { id: 'completed', name: 'Completed', icon: '✅' }
        ];
        this.movieStatusGroups = [
            { id: 'watching', name: 'Currently Watching', icon: '🎬' },
            { id: 'towatch', name: 'To Watch', icon: '🎥' },
            { id: 'completed', name: 'Completed', icon: '✅' }
        ];
        this.movieCategories = this.storageService.get('movieCategories') || [
            { name: '动作', color: 'red', icon: '💥' },
            { name: '科幻', color: 'blue', icon: '🚀' },
            { name: '剧情', color: 'purple', icon: '🎭' },
            { name: '喜剧', color: 'yellow', icon: '😄' },
            { name: '纪录片', color: 'green', icon: '🎥' },
            { name: '动画', color: 'pink', icon: '🌈' }
        ];
        this.storageService.save('movieCategories', this.movieCategories);
        this.activeCategory = null;
        this.viewMode = 'grid'; // 'grid', 'list', 'table' or 'wall'
        this.activeStatus = null;
        this.contentType = 'books'; // 'books' or 'movies'
    }

    getFilteredItems() {
        const isBooks = this.contentType === 'books';
        const items = this.storageService.get(isBooks ? 'books' : 'movies') || [];
        return this.activeCategory ? 
            items.filter(item => item.category === this.activeCategory) : 
            items;
    }

    initialize() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const isBooks = this.contentType === 'books';
        const items = this.getFilteredItems();
        const categories = isBooks ? this.categories : this.movieCategories;
        const statusGroups = isBooks ? this.statusGroups : this.movieStatusGroups;
        
        // 按状态分组
        const groupedItems = {};
        statusGroups.forEach(group => {
            groupedItems[group.id] = items.filter(item => item.status === group.id);
        });

        // 获取统计数据
        const stats = {
            reading: items.filter(item => item.status === 'reading').length,
            watching: items.filter(item => item.status === 'watching').length,
            completed: items.filter(item => item.status === 'completed').length,
            toRead: items.filter(item => item.status === 'toread').length,
            monthlyCompleted: items.filter(item => {
                if (item.status !== 'completed' || !item.completedAt) return false;
                const completedDate = new Date(item.completedAt);
                const now = new Date();
                return completedDate.getMonth() === now.getMonth() && 
                       completedDate.getFullYear() === now.getFullYear();
            }).length,
            total: items.length,
            monthlyReadingTime: 0 // 这里可以添加阅读时间的计算逻辑
        };

        // 修改添加按钮的文本
        const addBtnText = isBooks ? 'Add Book' : 'Add Movie';
        const addBtnId = isBooks ? 'addBookBtn' : 'addMovieBtn';

        this.element.innerHTML = `
            <div class="p-6 space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <h2 class="text-2xl font-bold text-gray-800">
                            ${isBooks ? '📚 Book Library' : '🎬 Movie Library'}
                        </h2>
                        <div class="flex bg-gray-100 rounded-lg p-1">
                            <button class="content-type-btn px-3 py-1.5 text-sm rounded-lg transition-colors
                                ${this.contentType === 'books' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:bg-gray-200'}"
                                data-type="books">
                                📚 Books
                            </button>
                            <button class="content-type-btn px-3 py-1.5 text-sm rounded-lg transition-colors
                                ${this.contentType === 'movies' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:bg-gray-200'}"
                                data-type="movies">
                                🎬 Movies
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="manageCategoriesBtn" 
                            class="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg 
                                hover:bg-gray-200 transition-colors text-sm">
                            <span>🏷️</span>
                            <span>Manage Tags</span>
                        </button>
                        <button id="${addBtnId}" 
                            class="flex items-center gap-2 px-4 py-2.5 bg-pink-500 text-white rounded-lg 
                                hover:bg-pink-600 transition-colors text-sm">
                            <span>+</span>
                            <span>${addBtnText}</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-sm text-gray-500">
                            ${isBooks ? 'Currently Reading' : 'Currently Watching'}
                        </div>
                        <div class="text-2xl font-bold text-yellow-500">
                            ${isBooks ? stats.reading : stats.watching}
                        </div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-sm text-gray-500">Completed This Month</div>
                        <div class="text-2xl font-bold text-green-500">${stats.monthlyCompleted}</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-sm text-gray-500">Reading Time This Month</div>
                        <div class="text-2xl font-bold text-blue-500">
                            ${Math.round(stats.monthlyReadingTime / 60)}h ${stats.monthlyReadingTime % 60}m
                        </div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-sm text-gray-500">Total Items</div>
                        <div class="text-2xl font-bold text-gray-700">${stats.total}</div>
                    </div>
                </div>

                <!-- Content -->
                ${items.length ? `
                    <div class="space-y-8">
                        ${statusGroups.map(group => `
                            <div class="space-y-4">
                                <h3 class="text-lg font-medium text-gray-700 flex items-center gap-2">
                                    <span>${group.icon}</span>
                                    <span>${group.name}</span>
                                    <span class="text-sm text-gray-400">(${groupedItems[group.id].length})</span>
                                </h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    ${groupedItems[group.id].map(item => 
                                        isBooks ? this.createBookCard(item) : this.createMovieCard(item)
                                    ).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-12">
                        <p class="text-gray-400 mb-4">Add some ${isBooks ? 'books' : 'movies'} to your collection.</p>
                        <button id="empty${isBooks ? 'Book' : 'Movie'}Btn" 
                            class="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            Add Your First ${isBooks ? 'Book' : 'Movie'}
                        </button>
                    </div>
                `}
            </div>
        `;
    }

    createBookCard(item) {
        const category = this.categories.find(c => c.name === item.category) || { color: 'gray', icon: '📚' };
        return `
            <div class="book-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                <div class="aspect-[4/3] bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 
                    flex items-center justify-center relative p-4">
                    ${item.cover ? `
                        <img src="${item.cover}" alt="${item.title}" 
                            class="w-full h-full object-cover rounded-lg"
                        >
                    ` : `
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-3xl opacity-50">📖</span>
                            <span class="text-xs text-${category.color}-400">${category.icon} ${item.category || '未分类'}</span>
                        </div>
                    `}
                    <button type="button"
                        class="view-detail-btn absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg 
                            hover:bg-white hover:shadow-sm active:scale-95 transition-all z-10"
                        data-id="${item.id}">
                        <span class="text-gray-600">👁️</span>
                    </button>
                </div>
                <div class="p-4 space-y-2">
                    <h3 class="font-bold text-gray-800 line-clamp-1">${item.title}</h3>
                    <p class="text-sm text-gray-500 line-clamp-1">${item.author}</p>
                    <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-1">
                            ${item.status === 'reading' ? 
                                '<span class="text-yellow-500">📖 Reading</span>' : 
                                item.status === 'completed' ? 
                                '<span class="text-green-500">✅ Done</span>' : 
                                '<span class="text-gray-400">📚 To Read</span>'}
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="add-note hover:text-blue-500 p-1" data-book-id="${item.id}">📝</button>
                            <button class="edit-book hover:text-blue-500 p-1" data-id="${item.id}">✏️</button>
                        </div>
                    </div>
                    ${item.notes && item.notes.length ? `
                        <div class="mt-2 pt-2 border-t border-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                            data-book-id="${item.id}" data-action="view-notes">
                            <div class="text-xs text-gray-400 mb-1">Latest Note:</div>
                            <p class="text-sm text-gray-600 italic line-clamp-2">
                                ${item.notes[item.notes.length - 1].content}
                            </p>
                            <div class="text-xs text-blue-400 mt-1 flex items-center justify-between">
                                <span>Click to view all notes →</span>
                                <span class="text-gray-400 text-xs">
                                    ${item.notes.length} notes • 
                                    ${new Date(item.notes[item.notes.length - 1].createdAt).toLocaleDateString('zh-CN')}
                                </span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createBookListItem(item) {
        const category = categories.find(c => c.name === item.category) || categories[0];
        return `
            <div class="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div class="w-16 h-16 bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 
                    flex items-center justify-center text-2xl rounded-lg">
                    ${item.cover || '📖'}
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 truncate">${item.title}</h3>
                    <p class="text-sm text-gray-500">${item.author}</p>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 text-xs rounded-full 
                            bg-${category.color}-50 text-${category.color}-600">
                            ${category.icon} ${item.category}
                        </span>
                        ${item.pages ? `
                            <span class="text-xs text-gray-400">${item.pages} pages</span>
                        ` : ''}
                    </div>
                </div>
                <button class="edit-book p-2 text-blue-500 hover:bg-blue-50 rounded-lg" 
                    data-id="${item.id}">
                    ✏️
                </button>
            </div>
        `;
    }

    createBookTableRow(item) {
        const category = categories.find(c => c.name === item.category) || categories[0];
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        ${item.cover ? `
                            <img src="${item.cover}" alt="" class="w-10 h-10 rounded object-cover">
                        ` : `
                            <div class="w-10 h-10 rounded bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 
                                flex items-center justify-center text-lg">
                                📖
                            </div>
                        `}
                        <div class="font-medium text-gray-900">${item.title}</div>
                    </div>
                </td>
                <td class="p-4 text-gray-600">${item.author}</td>
                <td class="p-4">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                        bg-${category.color}-50 text-${category.color}-600">
                        ${category.icon} ${item.category}
                    </span>
                </td>
                <td class="p-4">
                    <div class="inline-block">
                        <button class="status-dropdown-btn inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                            ${item.status === 'reading' ? 'bg-yellow-50 text-yellow-600' :
                              item.status === 'completed' ? 'bg-green-50 text-green-600' :
                              'bg-gray-50 text-gray-600'}"
                            data-book-id="${item.id}">
                            ${this.getStatusIcon(item.status)}
                            ${this.getStatusName(item.status)}
                            <span class="ml-1">▼</span>
                        </button>
                    </div>
                </td>
                <td class="p-4 text-gray-600">${item.pages || '-'}</td>
                <td class="p-4">
                    ${item.status === 'reading' ? `
                        <div class="flex items-center gap-2">
                            <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full bg-yellow-400 rounded-full" 
                                    style="width: ${item.progress || 0}%"></div>
                            </div>
                            <span class="text-sm text-gray-500">
                                ${item.currentPage || 0}/${item.pages || '?'}
                            </span>
                            <button class="update-progress p-1.5 text-yellow-500 hover:bg-yellow-50 rounded"
                                data-id="${item.id}" title="Update Progress">
                                📝
                            </button>
                        </div>
                    ` : item.status === 'completed' ? `
                        <span class="text-green-500">100%</span>
                    ` : '-'}
                </td>
                <td class="p-4 text-gray-600">
                    ${new Date(item.addedAt).toLocaleDateString()}
                </td>
                <td class="p-4">
                    <div class="flex items-center justify-end gap-2">
                        <button class="edit-book p-1.5 text-blue-500 hover:bg-blue-50 rounded" 
                            data-id="${item.id}" title="Edit">
                            ✏️
                        </button>
                        <button class="delete-book p-1.5 text-red-500 hover:bg-red-50 rounded" 
                            data-id="${item.id}" title="Delete">
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
        const items = this.storageService.get(this.contentType === 'books' ? 'books' : 'movies') || [];
        const index = items.findIndex(b => b.id === parseInt(bookId));
        if (index !== -1) {
            const item = items[index];
            const itemData = {
                ...item,
                status: newStatus,
                startedAt: newStatus === 'reading' ? new Date().toISOString() : null,
                completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
                lastReadAt: new Date().toISOString()
            };
            const updatedItems = [
                ...items.slice(0, index),
                itemData,
                ...items.slice(index + 1)
            ];
            this.storageService.save(this.contentType === 'books' ? 'books' : 'movies', updatedItems);
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
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select id="bookStatus" class="w-full p-2 border rounded-lg" required>
                            <option value="toread">To Read</option>
                            <option value="reading">Currently Reading</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="saveBookBtn" 
                            class="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            Add Book
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 添加事件监听器
        const saveBtn = modal.querySelector('#saveBookBtn');
        saveBtn.addEventListener('click', () => {
            const title = modal.querySelector('#bookTitle').value;
            const author = modal.querySelector('#bookAuthor').value;
            const category = modal.querySelector('#bookCategory').value;
            const status = modal.querySelector('#bookStatus').value;

            if (title && author && category && status) {
                const books = this.storageService.get(this.contentType === 'books' ? 'books' : 'movies') || [];
                books.push({
                    id: Date.now(),
                    title,
                    author,
                    category,
                    status,
                    addedAt: new Date().toISOString()
                });
                this.storageService.save(this.contentType === 'books' ? 'books' : 'movies', books);
                modal.classList.add('hidden');
                this.render();
            }
        });

        // 关闭按钮事件
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        modal.classList.remove('hidden');
    }

    showEditBookModal(bookId) {
        const items = this.storageService.get(this.contentType === 'books' ? 'books' : 'movies') || [];
        const item = items.find(b => b.id === parseInt(bookId));
        if (!item) return;

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
                                required value="${item.title}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                            <input type="text" id="bookAuthor" class="w-full p-2 border rounded-lg" 
                                required value="${item.author}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select id="bookCategory" class="w-full p-2 border rounded-lg" required>
                                ${this.categories.map(cat => `
                                    <option value="${cat.name}" ${cat.name === item.category ? 'selected' : ''}>
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
                                    value="${item.cover || ''}">
                                <button type="button" id="previewCover" 
                                    class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                    Preview
                                </button>
                            </div>
                            <div id="coverPreview" class="mt-2 ${item && item.cover ? '' : 'hidden'}">
                                <img src="${item.cover || ''}" 
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
                                value="${item.pages || ''}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <select id="bookStatus" class="w-full p-2 border rounded-lg" required>
                                <option value="toread" ${item.status === 'toread' ? 'selected' : ''}>To Read</option>
                                <option value="reading" ${item.status === 'reading' ? 'selected' : ''}>Currently Reading</option>
                                <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
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
                const items = this.storageService.get(this.contentType === 'books' ? 'books' : 'movies') || [];
                const index = items.findIndex(b => b.id === parseInt(bookId));
                if (index !== -1) {
                    const itemData = {
                        ...items[index],
                        title,
                        author,
                        category,
                        cover: cover || null,
                        pages: pages ? parseInt(pages) : null,
                        status,
                        startedAt: status === 'reading' ? new Date().toISOString() : null,
                        completedAt: status === 'completed' ? new Date().toISOString() : null,
                        lastReadAt: new Date().toISOString()
                    };
                    const updatedItems = [
                        ...items.slice(0, index),
                        itemData,
                        ...items.slice(index + 1)
                    ];
                    this.storageService.save(this.contentType === 'books' ? 'books' : 'movies', updatedItems);
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

    // 添加新方法：创建知识墙卡片
    createKnowledgeCard(item) {
        const category = this.categories.find(c => c.name === item.category) || this.categories[0];
        const notes = item.notes || [];
        
        return `
            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="p-4 space-y-4">
                    <!-- Book Info Header -->
                    <div class="flex items-center gap-3">
                        ${item.cover ? `
                            <img src="${item.cover}" alt="" class="w-12 h-12 rounded object-cover">
                        ` : `
                            <div class="w-12 h-12 rounded bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 
                                flex items-center justify-center text-xl">
                                📖
                            </div>
                        `}
                        <div>
                            <h3 class="font-bold text-gray-800">${item.title}</h3>
                            <p class="text-sm text-gray-500">${item.author}</p>
                        </div>
                    </div>

                    <!-- Notes List -->
                    <div class="space-y-3">
                        ${notes.length ? notes.map(note => `
                            <div class="p-3 bg-gray-50 rounded-lg">
                                <div class="text-gray-600">${note.content}</div>
                                ${note.images && note.images.length ? `
                                    <div class="mt-2 flex flex-wrap gap-2">
                                        ${note.images.map(img => `
                                            <img src="${img.data}" alt="" 
                                                class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-90"
                                                onclick="window.open('${img.data}', '_blank')">
                                        `).join('')}
                                    </div>
                                ` : ''}
                                <div class="mt-2 flex items-center justify-between text-xs">
                                    ${note.page ? `
                                        <span class="text-gray-400">Page ${note.page}</span>
                                    ` : `
                                        <span></span>
                                    `}
                                    <span class="text-gray-400">
                                        ${new Date(note.addedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="text-center py-4 text-gray-400">
                                No notes yet
                                <button class="add-note ml-2 text-blue-500 hover:underline"
                                    data-book-id="${item.id}">
                                    Add note
                                </button>
                            </div>
                        `}
                    </div>

                    <!-- Add Note Button -->
                    ${notes.length ? `
                        <button class="add-note w-full px-4 py-2 text-sm text-blue-500 hover:bg-blue-50 rounded-lg"
                            data-book-id="${item.id}">
                            + Add Note
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 修改笔记模态框，添加图片上传功能
    showAddNoteModal(bookId) {
        const items = this.storageService.get(this.contentType === 'books' ? 'books' : 'movies') || [];
        const item = items.find(b => b.id === parseInt(bookId));
        if (!item) return;

        const category = this.categories.find(c => c.name === item.category) || this.categories[0];
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-lg">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Add Reading Note</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div class="text-sm text-gray-600 mb-2">
                        Adding note for: ${item.title}
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Note Content *</label>
                        <textarea id="noteContent" 
                            class="w-full p-2 border rounded-lg min-h-[120px] resize-y"
                            placeholder="Write your thoughts about the book..."
                            required
                        ></textarea>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="saveNoteBtn" 
                            class="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            Save Note
                        </button>
                    </div>
                </div>
            </div>
        `;

        const saveBtn = modal.querySelector('#saveNoteBtn');
        saveBtn.addEventListener('click', () => {
            const content = modal.querySelector('#noteContent').value;
            if (content) {
                const items = this.storageService.get(this.contentType === 'books' ? 'books' : 'movies') || [];
                const index = items.findIndex(b => b.id === parseInt(bookId));
                if (index !== -1) {
                    const bookData = {
                        ...items[index],
                        notes: [
                            ...(items[index].notes || []),
                            {
                                id: Date.now(),
                                content,
                                createdAt: new Date().toISOString()
                            }
                        ]
                    };
                    const updatedItems = [
                        ...items.slice(0, index),
                        bookData,
                        ...items.slice(index + 1)
                    ];
                    this.storageService.save(this.contentType === 'books' ? 'books' : 'movies', updatedItems);
                    modal.classList.add('hidden');
                    this.render();
                }
            }
        });

        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        modal.classList.remove('hidden');
    }

    // 辅助方法：将文件转换为Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    attachEventListeners() {
        this.element.addEventListener('click', (e) => {
            // 详情按钮点击事件
            const detailBtn = e.target.closest('.view-detail-btn');
            if (detailBtn) {
                const itemId = detailBtn.dataset.id;
                // 直接调用 App.js 中的 showDetailView 函数
                window.showDetailView(this.contentType, itemId);
                return;
            }

            const contentTypeBtn = e.target.closest('.content-type-btn');
            if (contentTypeBtn) {
                this.contentType = contentTypeBtn.dataset.type;
                this.render();
            }

            // 添加按钮点击事件
            const addBtn = e.target.closest('#addBookBtn, #addMovieBtn');
            if (addBtn) {
                if (this.contentType === 'books') {
                    this.showAddBookModal();
                } else {
                    this.showAddMovieModal();
                }
            }

            // 编辑按钮点击事件
            const editBtn = e.target.closest('.edit-book, .edit-movie');
            if (editBtn) {
                const itemId = editBtn.dataset.id;
                if (this.contentType === 'books') {
                    this.showEditBookModal(itemId);
                } else {
                    this.showEditMovieModal(itemId);
                }
            }

            // 分类管理按钮点击事件
            const manageCategoriesBtn = e.target.closest('#manageCategoriesBtn');
            if (manageCategoriesBtn) {
                this.showCategoryManagerModal();
            }

            // 修改状态按钮点击处理
            const statusBtn = e.target.closest('.status-dropdown-btn');
            if (statusBtn) {
                const bookId = statusBtn.dataset.bookId;
                const items = this.storageService.get(this.contentType === 'books' ? 'books' : 'movies') || [];
                const item = items.find(b => b.id === parseInt(bookId));
                if (item) {
                    this.showStatusPopup(statusBtn, bookId, item.status);
                }
            }

            const statusFilterBtn = e.target.closest('#statusFilterBtn');
            if (statusFilterBtn) {
                this.showStatusFilterPopup(statusFilterBtn);
            }

            const clearFiltersBtn = e.target.closest('#clearFiltersBtn');
            if (clearFiltersBtn) {
                this.activeCategory = null;
                this.activeStatus = null;
                this.render();
            }

            const addNoteBtn = e.target.closest('.add-note');
            if (addNoteBtn) {
                const bookId = addNoteBtn.dataset.bookId;
                this.showAddNoteModal(bookId);
            }

            const updateProgressBtn = e.target.closest('.update-progress');
            if (updateProgressBtn) {
                const bookId = updateProgressBtn.dataset.id;
                this.showUpdateProgressModal(bookId);
            }

            // 空状态添加按钮点击事件
            const emptyStateBtn = e.target.closest('#emptyBookBtn, #emptyMovieBtn');
            if (emptyStateBtn) {
                if (this.contentType === 'books') {
                    this.showAddBookModal();
                } else {
                    this.showAddMovieModal();
                }
            }

            // 查看笔记详情
            const viewNotesArea = e.target.closest('[data-action="view-notes"]');
            if (viewNotesArea) {
                const bookId = viewNotesArea.dataset.bookId;
                this.showNotesDetailModal(bookId);
            }

            // 处理笔记编辑/删除按钮
            if (e.target.closest('.edit-note')) {
                const bookId = e.target.closest('[data-book-id]').dataset.bookId;
                const noteIndex = e.target.dataset.index;
                this.showEditNoteModal(bookId, noteIndex);
            }
            if (e.target.closest('.delete-note')) {
                const bookId = e.target.closest('[data-book-id]').dataset.bookId;
                const noteIndex = e.target.dataset.index;
                if (confirm('Are you sure you want to delete this note?')) {
                    this.deleteNote(bookId, noteIndex);
                }
            }
        });
    }

    // 添加更新进度的模态框
    showUpdateProgressModal(bookId) {
        const items = this.storageService.get(this.contentType === 'books' ? 'books' : 'movies') || [];
        const item = items.find(b => b.id === parseInt(bookId));
        if (!item) return;

        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-md">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Update Reading Progress</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div class="space-y-4">
                        <div class="text-sm text-gray-600">
                            Reading: ${item.title}
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Current Page</label>
                            <input type="number" id="currentPage" 
                                class="w-full p-2 border rounded-lg"
                                min="1" max="${item.pages || 1000}"
                                value="${item.currentPage || 0}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Reading Time (minutes)</label>
                            <input type="number" id="readingTime" 
                                class="w-full p-2 border rounded-lg"
                                min="1"
                                placeholder="How long did you read?">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Quick Note (optional)</label>
                            <textarea id="quickNote" rows="2" 
                                class="w-full p-2 border rounded-lg resize-none"
                                placeholder="Any thoughts or insights?"></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="saveProgressBtn" 
                            class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                            Save Progress
                        </button>
                    </div>
                </div>
            </div>
        `;

        const saveBtn = modal.querySelector('#saveProgressBtn');
        saveBtn.addEventListener('click', () => {
            const currentPage = parseInt(modal.querySelector('#currentPage').value);
            const readingTime = parseInt(modal.querySelector('#readingTime').value);
            const quickNote = modal.querySelector('#quickNote').value;

            if (currentPage) {
                const items = this.storageService.get(this.contentType === 'books' ? 'books' : 'movies') || [];
                const index = items.findIndex(b => b.id === parseInt(bookId));
                if (index !== -1) {
                    // 更新进度
                    const progress = item.pages ? Math.round((currentPage / item.pages) * 100) : 0;
                    const itemData = {
                        ...items[index],
                        currentPage,
                        progress,
                        readingHistory: [
                            ...(items[index].readingHistory || []),
                            {
                                date: new Date().toISOString(),
                                page: currentPage,
                                time: readingTime || 0,
                                note: quickNote || null
                            }
                        ]
                    };

                    // 如果读完了，自动更新状态
                    if (item.pages && currentPage >= item.pages) {
                        itemData.status = 'completed';
                        itemData.completedAt = new Date().toISOString();
                    }

                    const updatedItems = [
                        ...items.slice(0, index),
                        itemData,
                        ...items.slice(index + 1)
                    ];
                    this.storageService.save(this.contentType === 'books' ? 'books' : 'movies', updatedItems);
                    modal.classList.add('hidden');
                    this.render();
                }
            }
        });

        modal.classList.remove('hidden');
    }

    // 添加电影相关的方法
    showAddMovieModal() {
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-lg">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Add New Movie</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input type="text" id="movieTitle" class="w-full p-2 border rounded-lg" required>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Director</label>
                        <input type="text" id="movieDirector" class="w-full p-2 border rounded-lg" 
                            placeholder="Optional">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Link</label>
                        <input type="url" id="movieLink" class="w-full p-2 border rounded-lg" 
                            placeholder="Optional - Movie URL">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select id="movieCategory" class="w-full p-2 border rounded-lg" required>
                            ${this.movieCategories.map(cat => `
                                <option value="${cat.name}">${cat.icon} ${cat.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select id="movieStatus" class="w-full p-2 border rounded-lg" required>
                            <option value="towatch">To Watch</option>
                            <option value="watching">Currently Watching</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="saveMovieBtn" 
                            class="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            Add Movie
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 添加事件监听器
        const saveBtn = modal.querySelector('#saveMovieBtn');
        saveBtn.addEventListener('click', () => {
            const title = modal.querySelector('#movieTitle').value;
            const director = modal.querySelector('#movieDirector').value;
            const link = modal.querySelector('#movieLink').value;
            const category = modal.querySelector('#movieCategory').value;
            const status = modal.querySelector('#movieStatus').value;

            if (title && category && status) {
                const movies = this.storageService.get('movies') || [];
                movies.push({
                    id: Date.now(),
                    title,
                    director: director || null,
                    link: link || null,
                    category,
                    status,
                    addedAt: new Date().toISOString()
                });
                this.storageService.save('movies', movies);
                modal.classList.add('hidden');
                this.render();
            }
        });

        // 关闭按钮事件
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        modal.classList.remove('hidden');
    }

    // 添加电影卡片渲染方法
    createMovieCard(item) {
        const category = this.movieCategories.find(c => c.name === item.category) || this.movieCategories[0];
        return `
            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div class="aspect-[16/9] bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 
                    flex items-center justify-center relative p-4">
                    ${item.poster ? `
                        <img src="${item.poster}" alt="${item.title}" 
                            class="w-full h-full object-cover rounded-lg"
                        >
                    ` : `
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-3xl opacity-50">🎬</span>
                            <span class="text-xs text-${category.color}-400">${category.icon} ${category.name}</span>
                        </div>
                    `}
                    <button type="button"
                        class="view-detail-btn absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg 
                            opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        data-id="${item.id}">
                        <span class="text-gray-600">👁️</span>
                    </button>
                </div>
                <div class="p-4 space-y-2">
                    <h3 class="font-bold text-gray-800 line-clamp-1">
                        ${item.link ? `
                            <a href="${item.link}" target="_blank" class="hover:text-blue-500 transition-colors">
                                ${item.title}
                            </a>
                        ` : item.title}
                    </h3>
                    ${item.director ? `
                        <p class="text-sm text-gray-500 line-clamp-1">${item.director}</p>
                    ` : ''}
                    <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-1">
                            ${item.status === 'watching' ? 
                                '<span class="text-yellow-500">🎬 Watching</span>' : 
                                item.status === 'completed' ? 
                                '<span class="text-green-500">✅ Done</span>' : 
                                '<span class="text-gray-400">📚 To Watch</span>'}
                        </div>
                        <button class="edit-movie hover:text-blue-500 p-1" data-id="${item.id}">✏️</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 修改状态图标获取方法
    getStatusIcon(status) {
        if (this.contentType === 'books') {
            return status === 'reading' ? '📖' :
                   status === 'completed' ? '✅' : '📚';
        } else {
            return status === 'watching' ? '🎬' :
                   status === 'completed' ? '✅' : '🎥';
        }
    }

    // 修改状态更新方法
    updateItemStatus(id, newStatus) {
        const isBooks = this.contentType === 'books';
        const items = this.storageService.get(isBooks ? 'books' : 'movies') || [];
        const index = items.findIndex(item => item.id === parseInt(id));
        
        if (index !== -1) {
            const item = items[index];
            const itemData = {
                ...item,
                status: newStatus,
                startedAt: newStatus === (isBooks ? 'reading' : 'watching') ? new Date().toISOString() : null,
                completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
                lastReadAt: isBooks ? new Date().toISOString() : item.lastReadAt,
                lastWatchedAt: !isBooks ? new Date().toISOString() : item.lastWatchedAt
            };
            
            const updatedItems = [
                ...items.slice(0, index),
                itemData,
                ...items.slice(index + 1)
            ];
            
            this.storageService.save(isBooks ? 'books' : 'movies', updatedItems);
            this.render();
        }
    }

    showEditMovieModal(movieId) {
        const movies = this.storageService.get('movies') || [];
        const movie = movies.find(m => m.id === parseInt(movieId));
        if (!movie) return;

        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-lg">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Edit Movie</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input type="text" id="movieTitle" class="w-full p-2 border rounded-lg" 
                            required value="${movie.title}">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Director</label>
                        <input type="text" id="movieDirector" class="w-full p-2 border rounded-lg" 
                            placeholder="Optional" value="${movie.director || ''}">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Link</label>
                        <input type="url" id="movieLink" class="w-full p-2 border rounded-lg" 
                            placeholder="Optional - Movie URL" value="${movie.link || ''}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select id="movieCategory" class="w-full p-2 border rounded-lg" required>
                            ${this.movieCategories.map(cat => `
                                <option value="${cat.name}" ${cat.name === movie.category ? 'selected' : ''}>
                                    ${cat.icon} ${cat.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select id="movieStatus" class="w-full p-2 border rounded-lg" required>
                            <option value="towatch" ${movie.status === 'towatch' ? 'selected' : ''}>To Watch</option>
                            <option value="watching" ${movie.status === 'watching' ? 'selected' : ''}>Currently Watching</option>
                            <option value="completed" ${movie.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button id="saveMovieBtn" 
                            class="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 添加事件监听器
        const saveBtn = modal.querySelector('#saveMovieBtn');
        saveBtn.addEventListener('click', () => {
            const title = modal.querySelector('#movieTitle').value;
            const director = modal.querySelector('#movieDirector').value;
            const link = modal.querySelector('#movieLink').value;
            const category = modal.querySelector('#movieCategory').value;
            const status = modal.querySelector('#movieStatus').value;

            if (title && category && status) {
                const movies = this.storageService.get('movies') || [];
                const index = movies.findIndex(m => m.id === parseInt(movieId));
                if (index !== -1) {
                    const updatedMovie = {
                        ...movies[index],
                        title,
                        director: director || null,
                        link: link || null,
                        category,
                        status,
                        updatedAt: new Date().toISOString()
                    };
                    const updatedMovies = [
                        ...movies.slice(0, index),
                        updatedMovie,
                        ...movies.slice(index + 1)
                    ];
                    this.storageService.save('movies', updatedMovies);
                    modal.classList.add('hidden');
                    this.render();
                }
            }
        });

        // 关闭按钮事件
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        modal.classList.remove('hidden');
    }

    showNotesDetailModal(bookId) {
        const books = this.storageService.get('books') || [];
        const book = books.find(b => b.id === parseInt(bookId));
        if (!book || !book.notes || !book.notes.length) return;

        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-2xl">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">Reading Notes</h3>
                            <p class="text-sm text-gray-600">for ${book.title}</p>
                        </div>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div class="space-y-4 max-h-[60vh] overflow-y-auto">
                        ${book.notes.reverse().map(note => `
                            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div class="text-sm text-gray-600">
                                    ${new Date(note.createdAt).toLocaleString()}
                                </div>
                                <p class="text-gray-800">${note.content}</p>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Close
                        </button>
                        <button class="add-note px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                            data-book-id="${bookId}">
                            Add New Note
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 关闭按钮事件
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        // 添加新笔记按钮事件
        const addNoteBtn = modal.querySelector('.add-note');
        addNoteBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            this.showAddNoteModal(bookId);
        });

        modal.classList.remove('hidden');
    }

    showEditNoteModal(bookId, noteIndex) {
        const books = this.storageService.get('books') || [];
        const book = books.find(b => b.id === parseInt(bookId));
        if (!book || !book.notes?.[noteIndex]) return;

        const note = book.notes[noteIndex];
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="modal-content w-full max-w-2xl">
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Edit Note</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <textarea 
                        id="noteContent" 
                        class="w-full h-48 p-4 border rounded-lg" 
                        placeholder="Write your note here...">${note.content}</textarea>
                    <div class="flex justify-end gap-2 mt-4">
                        <button class="modal-close px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button class="save-note px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                            data-book-id="${bookId}" data-note-index="${noteIndex}">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;

        const saveBtn = modal.querySelector('.save-note');
        saveBtn.addEventListener('click', () => {
            const content = modal.querySelector('#noteContent').value.trim();
            if (content) {
                const books = this.storageService.get('books') || [];
                const bookIndex = books.findIndex(b => b.id === parseInt(bookId));
                if (bookIndex !== -1) {
                    const updatedNotes = [...books[bookIndex].notes];
                    updatedNotes[noteIndex] = {
                        ...updatedNotes[noteIndex],
                        content,
                        updatedAt: new Date().toISOString()
                    };
                    books[bookIndex].notes = updatedNotes;
                    this.storageService.save('books', books);
                    modal.classList.add('hidden');
                    this.render();
                }
            }
        });

        // 关闭逻辑...
    }

    deleteNote(bookId, noteIndex) {
        const books = this.storageService.get('books') || [];
        const bookIndex = books.findIndex(b => b.id === parseInt(bookId));
        if (bookIndex !== -1) {
            const updatedNotes = books[bookIndex].notes.filter((_, i) => i !== noteIndex);
            books[bookIndex].notes = updatedNotes;
            this.storageService.save('books', books);
            this.render();
        }
    }
} 