// js/modules/audioToast.js
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';

export function initAudioToast() {
    // 1. Setup inicial do DOM
    const container = document.createElement('div');
    container.className = 'audio-toast-wrapper';
    document.body.appendChild(container);

    const reopenBtn = document.createElement('button');
    reopenBtn.className = 'audio-toast-reopen-btn';
    reopenBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="M8 10h.01"></path>
            <path d="M12 10h.01"></path>
            <path d="M16 10h.01"></path>
        </svg>
    `;
    document.body.appendChild(reopenBtn);

    // Estado Global
    let currentIndex = 0;
    let testimonials = [];
    let wavesurfer = null;
    let isToastVisible = false;
    let rotationTimer = null; // Timer para trocar de slide
    let pulseTimer = null;    // Timer para o pulso laranja

    // Configurações
    const AUTO_ROTATE_DELAY = 10000; // 10 segundos para leitura/texto
    const PULSE_INTERVAL = 5000;    // 10 segundos entre pulsos

    // Carregar dados
    fetch('./assets/data/testimonials.json')
        .then(response => response.json())
        .then(data => {
            testimonials = data;
            if (testimonials.length > 0) {
                setTimeout(showCurrentToast, 2000);
            }
        })
        .catch(err => console.error('Erro ao carregar depoimentos:', err));

    // --- Lógica do Botão Pulsante ---
    reopenBtn.addEventListener('click', () => {
        gsap.to(reopenBtn, { autoAlpha: 0, y: 20, duration: 0.3 });
        clearInterval(pulseTimer); // Para de pulsar ao abrir
        reopenBtn.classList.remove('pulsing');
        showCurrentToast();
    });

    function startPulseEffect() {
        // Ativa um pulso a cada X segundos quando fechado
        pulseTimer = setInterval(() => {
            reopenBtn.classList.add('pulsing');
            // Remove a classe depois da animação (2s) para poder reiniciar
            setTimeout(() => reopenBtn.classList.remove('pulsing'), 2000);
        }, PULSE_INTERVAL);
    }

    // --- Lógica Principal do Toast ---
    function createToastHTML(data) {
        const hasAudio = !!data.audio_url;
        const containerClass = hasAudio ? 'audio-toast-container has-audio' : 'audio-toast-container';
        
        const playerHTML = hasAudio ? `
            <div class="audio-player-wrapper">
                <button class="play-btn" id="play-btn-${data.id}">
                    <svg class="icon-play" width="10" height="10" viewBox="0 0 12 14" fill="currentColor"><path d="M11 7L1 13L1 1L11 7Z" /></svg>
                    <svg class="icon-pause" width="10" height="10" viewBox="0 0 10 14" fill="currentColor" style="display:none;"><rect width="3" height="14" rx="1.5" /><rect x="7" width="3" height="14" rx="1.5" /></svg>
                </button>
                <div id="waveform-${data.id}" class="waveform-container"></div>
                <div class="time-display" id="time-${data.id}">00:00 / 00:00</div>
            </div>
        ` : '';

        return `
            <div class="${containerClass}" id="toast-active">
                <div class="toast-header">
                    <div class="client-info">
                        <span class="client-name">${data.cliente}</span>
                        <span class="client-role">${data.cargo || 'Cliente'}</span>
                    </div>
                    <div class="toast-controls">
                        <div class="nav-arrows">
                            <button class="nav-btn prev-btn" aria-label="Anterior">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                            </button>
                            <button class="nav-btn next-btn" aria-label="Próximo">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                            </button>
                        </div>
                        <button class="btn-close-toast" aria-label="Minimizar">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
                <div class="toast-body">
                    <p class="quote-text">"${data.depoimento}"</p>
                </div>
                ${playerHTML}
            </div>
        `;
    }

    function showCurrentToast() {
        if (rotationTimer) clearTimeout(rotationTimer); // Limpa timer anterior
        
        const data = testimonials[currentIndex];
        const hasAudio = !!data.audio_url;

        // Se já existe um toast, fazemos uma transição (saída rápida -> novo conteúdo)
        const existingToast = container.querySelector('.audio-toast-container');
        
        if (existingToast) {
            // Animação de troca (Sai pra esquerda, entra da direita ou fade simples)
            gsap.to(existingToast, {
                autoAlpha: 0,
                x: -20,
                duration: 0.3,
                onComplete: () => renderNewContent(data, hasAudio)
            });
        } else {
            renderNewContent(data, hasAudio);
        }
    }

    function renderNewContent(data, hasAudio) {
        if (wavesurfer) {
            wavesurfer.destroy();
            wavesurfer = null;
        }
        
        container.innerHTML = createToastHTML(data);
        const toastEl = container.querySelector('.audio-toast-container');
        
        // Setup Elementos
        const closeBtn = container.querySelector('.btn-close-toast');
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');

        // Animação de Entrada
        gsap.fromTo(toastEl, 
            { autoAlpha: 0, x: 20 },
            { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.out" }
        );
        isToastVisible = true;

        // Listeners de Navegação Manual
        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
            showCurrentToast();
        };
        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showCurrentToast();
        };
        closeBtn.onclick = () => minimizeToast(toastEl);

        // Setup Específico (Audio vs Texto)
        if (hasAudio) {
            setupAudioLogic(data);
        } else {
            // Se for texto, agenda a rotação automática baseada no tempo de leitura
            const readingTime = Math.max(5000, data.depoimento.length * 60); 
            rotationTimer = setTimeout(autoRotate, readingTime);
        }
    }

    function setupAudioLogic(data) {
        const waveformId = `#waveform-${data.id}`;
        const playBtn = document.getElementById(`play-btn-${data.id}`);
        const timeDisplay = document.getElementById(`time-${data.id}`);

        wavesurfer = WaveSurfer.create({
            container: waveformId,
            waveColor: 'rgba(255, 255, 255, 0.3)',
            progressColor: data.waveform_color || '#FF643B',
            cursorColor: 'transparent',
            barWidth: 2,
            barGap: 2,
            barRadius: 2,
            height: 24,
            url: data.audio_url
        });

        wavesurfer.on('ready', () => {
            const duration = formatTime(wavesurfer.getDuration());
            timeDisplay.textContent = `00:00 / ${duration}`;
        });

        wavesurfer.on('audioprocess', () => {
            const current = formatTime(wavesurfer.getCurrentTime());
            const total = formatTime(wavesurfer.getDuration());
            timeDisplay.textContent = `${current} / ${total}`;
        });

        wavesurfer.on('finish', () => {
            togglePlayIcon(playBtn, false);
            // Ao terminar o áudio, espera 1s e vai para o próximo
            rotationTimer = setTimeout(autoRotate, 1500);
        });

        playBtn.addEventListener('click', () => {
            wavesurfer.playPause();
            const isPlaying = wavesurfer.isPlaying();
            togglePlayIcon(playBtn, isPlaying);
            
            // Se o usuário interagir, paramos a rotação automática temporária (esperamos o áudio acabar)
            if (rotationTimer) clearTimeout(rotationTimer);
        });
    }

    function autoRotate() {
        // Avança índice e renderiza
        currentIndex = (currentIndex + 1) % testimonials.length;
        showCurrentToast();
    }

    function minimizeToast(element) {
        if (rotationTimer) clearTimeout(rotationTimer);
        if (wavesurfer) wavesurfer.pause();

        gsap.to(element, {
            autoAlpha: 0,
            y: 20,
            duration: 0.4,
            ease: "power3.in",
            onComplete: () => {
                container.innerHTML = '';
                isToastVisible = false;
                
                // Mostra botão de reabrir
                gsap.to(reopenBtn, { autoAlpha: 1, y: 0, duration: 0.4 });
                startPulseEffect(); // Inicia o pulso
            }
        });
    }

    function togglePlayIcon(btn, isPlaying) {
        const iconPlay = btn.querySelector('.icon-play');
        const iconPause = btn.querySelector('.icon-pause');
        if (isPlaying) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
            iconPause.style.marginLeft = '0';
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsRemainder = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secondsRemainder.toString().padStart(2, '0')}`;
    }
}
