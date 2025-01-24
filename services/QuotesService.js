export class QuotesService {
    constructor(storageService) {
        this.storageService = storageService;
        this.initializeQuotes();
    }

    initializeQuotes() {
        const quotes = this.storageService.get('quotes');
        if (!quotes) {
            // 预设一些默认的知识库内容
            const defaultQuotes = [
                {
                    id: 1,
                    content: "胡萝卜色能激发创造力，暖色调有助于保持积极心态。",
                    category: "色彩心理学",
                    tag: "设计原则",
                    source: "《色彩与情绪》"
                },
                {
                    id: 2,
                    content: "橙色代表活力与热情，是提升工作效率的理想配色。",
                    category: "视觉设计",
                    tag: "配色方案",
                    source: "《UI设计原则》"
                },
                {
                    id: 3,
                    content: "在橙色环境中工作，大脑的创造性思维活跃度提升23%。",
                    category: "神经科学",
                    tag: "环境因素",
                    source: "《环境心理学研究》"
                }
            ];
            this.storageService.save('quotes', defaultQuotes);
        }
    }

    getAllQuotes() {
        return this.storageService.get('quotes') || [];
    }

    getRandomQuote() {
        const quotes = this.storageService.get('quotes') || [];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    addQuote(quote) {
        const quotes = this.storageService.get('quotes') || [];
        const newQuote = {
            id: Date.now(),
            ...quote,
            addedAt: new Date().toISOString()
        };
        quotes.push(newQuote);
        this.storageService.save('quotes', quotes);
    }
} 