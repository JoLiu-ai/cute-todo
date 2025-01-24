export class StorageService {
    constructor(prefix = 'cuteTodo_') {
        this.prefix = prefix;
    }

    save(key, data) {
        localStorage.setItem(this.prefix + key, JSON.stringify(data));
    }

    get(key) {
        const data = localStorage.getItem(this.prefix + key);
        return data ? JSON.parse(data) : null;
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
} 