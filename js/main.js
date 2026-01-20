document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SETUP LENIS (SMOOTH SCROLL) ---
    const lenis = new Lenis({
        duration: 1.2, // Velocidade (quanto maior, mais suave/lento)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });

    // Conectar Lenis ao GSAP ScrollTrigger (importante se for usar ScrollTrigger depois)
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);


    // --- 2. CUSTOM CURSOR & LIGHT LOGIC ---
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    const lightEffect = document.querySelector('.mouse-light');
    
    // Move o cursor e a luz
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Animação instantânea para o ponto
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Animação com delay (smooth) para o círculo usando GSAP
        gsap.to(cursorOutline, {
            x: posX,
            y: posY,
            duration: 0.15,
            ease: "power2.out"
        });

        // Atualiza a posição da luz de fundo
        lightEffect.style.setProperty('--x', `${posX}px`);
        lightEffect.style.setProperty('--y', `${posY}px`);
    });

    // Efeito Hover em Links e Botões
    const interactables = document.querySelectorAll('a, button, .hover-target');
    
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering');
            // Aumenta levemente a escala do elemento
            gsap.to(el, { scale: 1.05, duration: 0.3 });
        });
        
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering');
            gsap.to(el, { scale: 1, duration: 0.3 });
        });
    });


    // --- 3. AUDIO PLAYER ---
    const audioBtn = document.getElementById('audio-btn');
    const audio = document.getElementById('ambient-music');
    const playerContainer = document.querySelector('.audio-player');
    let isPlaying = false;

    // Reduz volume para não assustar (música ambiente deve ser sutil)
    audio.volume = 0.4; 

    audioBtn.addEventListener('click', () => {
        if (!isPlaying) {
            audio.play().then(() => {
                isPlaying = true;
                playerContainer.classList.add('playing');
                document.querySelector('.audio-label').textContent = "PAUSE";
            }).catch(e => console.log("Erro ao reproduzir áudio:", e));
        } else {
            audio.pause();
            isPlaying = false;
            playerContainer.classList.remove('playing');
            document.querySelector('.audio-label').textContent = "PLAY";
        }
    });


    // --- 4. LOADER & HERO ENTRANCE (Mantido do anterior) ---
    gsap.registerPlugin(); // Certifica que GSAP está pronto

    const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        onComplete: () => {
            document.body.style.overflow = 'auto'; // Libera scroll nativo
            lenis.start(); // Inicia o Lenis
        }
    });

    // Inicialmente para o Lenis para não rolar durante o loader
    lenis.stop();

    tl.to(".char", { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 })
      .to(".loader-line", { width: "100%", duration: 0.8 }, "-=0.4")
      .to({}, { duration: 1.5 }) // Wait
      .to(".loader-text, .loader-line", { y: -50, opacity: 0, duration: 0.5 })
      .to(".loader-container", { 
          clipPath: "circle(0% at 50% 50%)", 
          duration: 1.5, 
          ease: "expo.inOut" 
      })
      .to(".hero-content-center", { opacity: 1, y: 0, duration: 1.5 }, "-=0.8")
      .to(".orbit-nav", { transform: "translateY(0)", duration: 1 }, "-=1.2")
      .to(".scroll-indicator", { opacity: 1, duration: 1 }, "-=0.5");
});