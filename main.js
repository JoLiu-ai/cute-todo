import { initializeApp } from './components/App.js';
import { StorageService } from './services/StorageService.js';
import { DateService } from './services/DateService.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize services
    const storageService = new StorageService();
    const dateService = new DateService();

    // Initialize app
    initializeApp({
        storageService,
        dateService
    });
}); 