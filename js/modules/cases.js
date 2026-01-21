// js/modules/cases.js

// 1. CMS Mock (JSON Data)
const casesData = [
    {
        id: 1,
        client: "Clínica Dermato",
        type: "Rebranding Completo",
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068",
        method: "orbita", // orbita, elite, starter, craft
        challenge: "A clínica possuía alta tecnologia, mas sua marca visual transmitia frieza e distanciamento.",
        process: "Redesenhamos toda a identidade com tons terrosos e tipografia serifada, focando na experiência sensorial.",
        result: { value: "+145%", label: "Faturamento" },
        techStack: ["html", "css", "gsap"]
    },
    {
        id: 2,
        client: "Dr. Silva",
        type: "Landing Page High-Ticket",
        image: "https://images.unsplash.com/photo-1579168765470-501499b5d724?q=80&w=1962",
        method: "elite",
        challenge: "O Dr. Silva tinha muito tráfego, mas perdia pacientes no agendamento por falta de filtro.",
        process: "Criamos uma LP de alta conversão com copy persuasiva, quebrando objeções e qualificando leads.",
        result: { value: "3x", label: "Mais Cirurgias" },
        techStack: ["html", "js", "swiper"]
    },
    {
        id: 3,
        client: "Ortopedia Vital",
        type: "Identidade Visual",
        image: "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1932",
        method: "craft",
        challenge: "Clínica tradicional de 20 anos perdendo espaço para concorrentes mais jovens e digitais.",
        process: "Modernização visual preservando a tradição, com cores sólidas e fotografia humanizada.",
        result: { value: "Top 1", label: "Na Região" },
        techStack: ["figma", "ai", "ps"]
    }
];

// Helper para pegar cor e nome do método
const getMethodInfo = (method) => {
    const map = {
        'orbita': { name: 'Órbita Ascent', color: 'var(--color-method-orbita)' },
        'elite': { name: 'Elite', color: 'var(--color-method-elite)' },
        'starter': { name: 'Starter', color: 'var(--color-method-starter)' },
        'craft': { name: 'Craft', color: 'var(--color-method-craft)' }
    };
    return map[method] || map['orbita'];
};

// Helper para gerar SVGs das tecnologias (Simulados para exemplo)
const getTechIcon = (tech) => {
    // Aqui você colocaria os SVGs reais. Usarei texto estilizado como placeholder visual.
    return `<div style="font-size:10px; font-weight:700; color:white; border:1px solid rgba(255,255,255,0.3); padding:2px 6px; border-radius:4px; text-transform:uppercase;">${tech}</div>`;
};

export function initCasesSwiper() {
    const wrapper = document.querySelector('.casesSwiper .swiper-wrapper');
    if (!wrapper) return;

    // 2. Gerar HTML Dinâmico
    wrapper.innerHTML = casesData.map(item => {
        const methodInfo = getMethodInfo(item.method);
        const techIcons = item.techStack.map(t => getTechIcon(t)).join('');

        return `
            <div class="swiper-slide">
                <div class="case-card">
                    <div class="case-visual">
                        <img src="${item.image}" alt="${item.client}" class="case-img">
                        <div class="method-badge">
                            <span class="method-dot" style="background-color: ${methodInfo.color}"></span>
                            <span class="method-name">${methodInfo.name}</span>
                        </div>
                    </div>

                    <div class="case-content">
                        <div>
                            <div class="content-header">
                                <h3>${item.client}</h3>
                                <p class="project-type">${item.type}</p>
                            </div>
                            
                            <button class="btn-view-more">
                                Ver detalhes 
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>
                            </button>

                            <div class="content-grid">
                                <div class="info-block">
                                    <h4>O Desafio</h4>
                                    <p>${item.challenge}</p>
                                </div>
                                <div class="info-block">
                                    <h4>O Processo</h4>
                                    <p>${item.process}</p>
                                </div>
                                <div class="result-block">
                                    <div class="chart-stat">
                                        <span>${item.result.value}</span>
                                        <small>${item.result.label}</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="tech-stack">
                            ${techIcons}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 3. Inicializar Swiper com Efeito "Cards" (Empilhado)
    const swiper = new Swiper(".casesSwiper", {
        effect: "cards", // O segredo do empilhamento
        grabCursor: true,
        cardsEffect: {
            perSlideOffset: 10, // Distância entre cards
            perSlideRotate: 2,  // Rotação sutil
            slideShadows: true,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        // Opcional: Navegação nas setas
        // navigation: { nextEl: "...", prevEl: "..." }
    });

    // 4. Lógica Mobile "Ver Mais"
    document.querySelectorAll('.btn-view-more').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.case-card');
            card.classList.toggle('expanded');
            
            const text = card.classList.contains('expanded') ? 'Fechar' : 'Ver detalhes';
            btn.firstChild.textContent = text;
        });
    });
}