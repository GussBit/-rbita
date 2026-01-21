export function initCursor() {
    // desativa em mobile e tablet (toque)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        return;
    }

    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    const lightEffect = document.querySelector('.mouse-light');

    const moveCursor = (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        if (cursorDot) {
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
        }

        if (cursorOutline) {
            gsap.to(cursorOutline, {
                x: posX,
                y: posY,
                duration: 0.15,
                ease: 'power2.out'
            });
        }

        if (lightEffect) {
            lightEffect.style.setProperty('--x', `${posX}px`);
            lightEffect.style.setProperty('--y', `${posY}px`);
        }
    };

    window.addEventListener('mousemove', moveCursor);

    const interactables = document.querySelectorAll(
        'a, button, .hover-target, .swiper-button-prev-custom, .swiper-button-next-custom'
    );

    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering');
            gsap.to(el, { scale: 1.05, duration: 0.3 });
        });

        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering');
            gsap.to(el, { scale: 1, duration: 0.3 });
        });
    });
}
