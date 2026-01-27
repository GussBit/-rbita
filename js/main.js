// 1. IMPORTAÇÃO DE ESTILOS
import '../css/main.css';
import '../css/audio-toast.css';
import 'swiper/css/bundle'; 

// 2. IMPORTAÇÃO DE BIBLIOTECAS
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import Lenis from 'lenis';
import Swiper from 'swiper/bundle';

// --- CORREÇÃO DO ERRO DE TELA BRANCA ---
// Torna as bibliotecas acessíveis para os seus módulos antigos
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.TextPlugin = TextPlugin;
window.Lenis = Lenis;
window.Swiper = Swiper;
// ----------------------------------------

// 3. REGISTRO DE PLUGINS GSAP
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// 4. SEUS MÓDULOS
import { initSmoothScroll } from './modules/smoothScroll.js';
import { initCursor } from './modules/cursor.js';
import { initAudio } from './modules/audio.js';
import { initLoader } from './modules/loader.js';
import { initLegacyAnimation } from './modules/legacy.js';
import { initCasesSwiper } from './modules/cases.js';
import { initServices } from './modules/services.js';
import { initAudioToast } from './modules/audioToast.js';

// 5. EXECUÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll e UI
    initSmoothScroll();
    initCursor();
    initAudio();
    
    // Tente rodar o Toast, mas proteja caso o módulo ainda não esteja 100%
    if (typeof initAudioToast === 'function') initAudioToast();

    // 2. Animação de Entrada
    initLoader();

    // 3. Seções
    initLegacyAnimation();
    initCasesSwiper();
    initServices();
});