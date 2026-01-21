// js/modules/services.js

export function initServices() {
    // 1. TABS LOGIC
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.service-pane');

    if(tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove ativo de todos
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));

                // Adiciona ativo no clicado
                tab.classList.add('active');
                
                // Ativa o conteúdo correspondente
                const targetId = tab.getAttribute('data-target');
                const targetPane = document.getElementById(targetId);
                if(targetPane) targetPane.classList.add('active');
            });
        });
    }

    // 2. MOUSE BACKGROUND EFFECT
    const section = document.querySelector('.services-section');
    const bgFx = document.querySelector('.services-bg-fx');

    if(section && bgFx) {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            // Calcula X e Y relativos à seção (0% a 100%)
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            // Atualiza variáveis CSS
            section.style.setProperty('--mouse-x', `${x}%`);
            section.style.setProperty('--mouse-y', `${y}%`);
        });
    }
}