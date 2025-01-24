export class QuotesSection {
    constructor(storageService, quotesService) {
        this.storageService = storageService;
        this.quotesService = quotesService;
        this.element = document.getElementById('quotesSection');
    }

    initialize() {
        if (!this.initialized) {
            this.render();
            this.initialized = true;
        }
        this.update();
    }

    render() {
        this.element.innerHTML = `
            <div class="p-8 space-y-6">
                <!-- 标题栏 -->
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-orange-600">Knowledge Wall 📚</h2>
                    <button id="addQuoteBtn" class="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                        Add Quote
                    </button>
                </div>

                <!-- 照片墙布局 -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="quotesWall">
                    <!-- 引用卡片将通过 JavaScript 动态添加 -->
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    update() {
        const quotes = this.quotesService.getAllQuotes();
        const wallElement = this.element.querySelector('#quotesWall');
        
        if (wallElement) {
            wallElement.innerHTML = quotes.map(quote => this.createQuoteCard(quote)).join('');
        }
    }

    createQuoteCard(quote) {
        // 随机选择一个较小的旋转角度
        const rotation = Math.random() * 4 - 2; // -2° 到 2° 之间
        
        return `
            <div class="group relative bg-white p-4 transition-all duration-300 transform hover:-translate-y-1 hover:z-10"
                style="transform: rotate(${rotation}deg)">
                <!-- 照片效果 -->
                <div class="relative bg-white p-3 shadow-md">
                    <!-- 白色边框 -->
                    <div class="absolute inset-0 border-[12px] border-white"></div>
                
                    <!-- 内容区域 -->
                    <div class="relative space-y-3">
                        <blockquote class="text-sm text-gray-700 leading-relaxed">
                            "${quote.content}"
                        </blockquote>
                    
                        <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                            <span class="px-2 py-0.5 bg-gray-50 rounded-full">
                                ${quote.category}
                            </span>
                            <span class="italic">
                                —— ${quote.source}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 胶带效果 -->
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-4">
                    <div class="absolute inset-0 bg-amber-100/60 transform rotate-2"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const addButton = this.element.querySelector('#addQuoteBtn');
        if (addButton) {
            addButton.addEventListener('click', () => this.showAddQuoteModal());
        }
    }

    showAddQuoteModal() {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 class="text-xl font-bold text-orange-600 mb-4">Add New Quote</h3>
                <form id="addQuoteForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea 
                            class="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                            rows="3"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input type="text" class="w-full p-2 border border-gray-200 rounded-lg" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <input type="text" class="w-full p-2 border border-gray-200 rounded-lg" required>
                    </div>
                    <div class="flex justify-end gap-2 pt-4">
                        <button type="button" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg" id="cancelBtn">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                            Add Quote
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // 处理表单提交
        const form = modal.querySelector('#addQuoteForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const [content, category, source] = [
                form.querySelector('textarea').value,
                form.querySelector('input[type="text"]').value,
                form.querySelector('input[type="text"]:last-of-type').value
            ];

            this.quotesService.addQuote({
                content,
                category,
                source,
                tag: category // 可以根据需要调整
            });

            this.update();
            modal.remove();
        });

        // 处理取消按钮
        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            modal.remove();
        });
    }
} 