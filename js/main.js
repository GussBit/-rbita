import { initSmoothScroll } from './modules/smoothScroll.js';
import { initCursor } from './modules/cursor.js';
import { initAudio } from './modules/audio.js';
import { initLoader } from './modules/loader.js';
import { initLegacyAnimation } from './modules/legacy.js';
import { initCasesSwiper } from './modules/cases.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa Scroll (Lenis)
    initSmoothScroll();

    // 2. UI Elements
    initCursor();
    initAudio();

    // 3. Animação de Entrada
    initLoader();

    // 4. Animações de Seção
    initLegacyAnimation();
    initCasesSwiper();
});