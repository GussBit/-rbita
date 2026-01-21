// js/modules/services.js

export function initServices() {
    const tabs = document.querySelectorAll('.tab-item');
    
    // Elementos de Texto (Detalhes)
    const details = document.querySelectorAll('.service-detail');
    
    // Elementos Visuais (Vídeos/Imagens)
    const visuals = document.querySelectorAll('.visual-item');

    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetKey = tab.getAttribute('data-target'); // ex: "sites"

                // 1. Remove Ativo de TUDO
                tabs.forEach(t => t.classList.remove('active'));
                details.forEach(d => d.classList.remove('active'));
                visuals.forEach(v => v.classList.remove('active'));

                // 2. Ativa o Botão Clicado
                tab.classList.add('active');

                // 3. Ativa o Detalhe de Texto correspondente
                const targetDetail = document.getElementById(`detail-${targetKey}`);
                if (targetDetail) targetDetail.classList.add('active');

                // 4. Ativa o Visual correspondente
                const targetVisual = document.getElementById(`visual-${targetKey}`);
                if (targetVisual) {
                    targetVisual.classList.add('active');
                    
                    // Se for vídeo, reinicia o play para dar impacto
                    const video = targetVisual.querySelector('video');
                    if(video) {
                        video.currentTime = 0;
                        video.play();
                    }
                }
            });
        });
    }
}