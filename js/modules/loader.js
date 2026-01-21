export function initLoader() {
    gsap.registerPlugin();

    const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        onComplete: () => {
            document.body.style.overflow = 'auto';
            if(window.lenis) window.lenis.start();
        }
    });

    if(document.querySelector('.loader-container')) {
        tl.to(".char", { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 })
          .to(".loader-line", { width: "100%", duration: 0.8 }, "-=0.4")
          .to({}, { duration: 0.5 })
          .to(".loader-text, .loader-line", { y: -50, opacity: 0, duration: 0.5 })
          .to(".loader-container", { clipPath: "circle(0% at 50% 50%)", duration: 1.5, ease: "expo.inOut" })
          .to(".hero-content-center", { opacity: 1, y: 0, duration: 1.5 }, "-=0.8")
          .to(".orbit-nav", { transform: "translateY(0)", duration: 1 }, "-=1.2")
          .to(".scroll-indicator", { opacity: 1, duration: 1 }, "-=0.5");
    }
}