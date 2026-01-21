export function initSmoothScroll() {
    const lenis = new Lenis({
        duration: 0.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    }); 

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Exporta o lenis caso precise parar/iniciar em outros lugares
    window.lenis = lenis; 
    
    // Parar o scroll inicialmente (para o loader)
    lenis.stop();
}