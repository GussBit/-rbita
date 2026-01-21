export function initLegacyAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    // EFEITO STACK: Hero sendo coberta pela Legacy
    ScrollTrigger.create({
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        pin: true,
        pinSpacing: false,
        scrub: true
    });

    // Animação das cartas e texto
    const legacyTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#legacy",
            start: "top top", 
            end: "+=3000", 
            pin: true, 
            scrub: 1, 
            anticipatePin: 1
        }
    });

    legacyTl.to(".legacy-text-intro", { opacity: 1, scale: 1, duration: 2 })
            .to(".legacy-text-intro", { opacity: 0, scale: 0.9, duration: 2, delay: 1 })
            .to(".stack-wrapper", { opacity: 1, duration: 1 });
            
    const cards = gsap.utils.toArray(".insta-card");
    
    cards.forEach((card, i) => {
        legacyTl.to(card, {
            y: i * -15,
            scale: 1 - (cards.length - i) * 0.05,
            opacity: 1,
            duration: 2,
            ease: "power2.out"
        }, "<+=0.5");

        legacyTl.to(".glow-layer", {
            opacity: (i + 1) / cards.length,
            duration: 2
        }, "<");
    });

    legacyTl.to(".stack-wrapper", { 
        scale: 1.5, opacity: 0, filter: "blur(20px)", duration: 2, delay: 0.5 
    })
    .to(".legacy-outro", { opacity: 1, scale: 1, duration: 2 });
}