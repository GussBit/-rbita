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

// --- WEBGL LENS EFFECT (THREE.JS) ---

class WebGLApp {
    constructor() {
        this.canvas = document.querySelector('#webgl-canvas');
        this.container = document.querySelector('.bento-grid');
        this.images = [...document.querySelectorAll('.webgl-img')];
        this.meshes = [];
        
        // Setup Básico
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 2000);
        this.camera.position.z = 600;
        this.camera.fov = 2 * Math.atan((window.innerHeight / 2) / 600) * (180 / Math.PI);

        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Inicia
        this.createPlanes();
        this.addEvents();
        this.render();
    }

    createPlanes() {
        // Carregador de Texturas
        const loader = new THREE.TextureLoader();

        this.images.forEach((img, index) => {
            const bounds = img.getBoundingClientRect();
            
            // Geometria do tamanho da imagem
            const geometry = new THREE.PlaneBufferGeometry(bounds.width, bounds.height, 16, 16);
            
            // Textura
            const texture = loader.load(img.src);
            texture.needsUpdate = true;

            // SHADER MATERIAL (A Mágica da Lente)
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: texture },
                    uMouse: { value: new THREE.Vector2(0.5, 0.5) }, // Posição do mouse na imagem
                    uHover: { value: 0 }, // Força do efeito (0 a 1)
                    uResolution: { value: new THREE.Vector2(bounds.width, bounds.height) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D uTexture;
                    uniform vec2 uMouse;
                    uniform float uHover;
                    uniform vec2 uResolution;
                    varying vec2 vUv;

                    void main() {
                        vec2 uv = vUv;
                        
                        // Lógica da Distorção de Lente
                        // Calcula a distância do pixel atual até o mouse
                        float dist = distance(uv, uMouse);
                        
                        // Cria um raio de efeito (0.4 = tamanho da lente)
                        float radius = 0.4;
                        
                        // Suaviza a borda da lente
                        float lens = smoothstep(radius, 0.0, dist);
                        
                        // Aplica a distorção: "empurra" os pixels baseado na lente
                        // Multiplicado por uHover para só acontecer quando passar o mouse
                        uv += (uv - uMouse) * lens * 0.3 * uHover;

                        vec4 color = texture2D(uTexture, uv);
                        gl_FragColor = color;
                    }
                `
            });

            const mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);
            
            // Guardamos referência para atualizar posição depois
            this.meshes.push({
                mesh: mesh,
                img: img,
                material: material
            });
        });
    }

    updatePlanes() {
        // Sincroniza posição do WebGL com o HTML (Scroll e Resize)
        this.meshes.forEach(({ mesh, img }) => {
            const bounds = img.getBoundingClientRect();
            
            // Atualiza tamanho se mudar (responsivo)
            mesh.scale.set(1, 1, 1); // Simplificação
            
            // Converte coordenadas da tela para coordenadas do Three.js
            mesh.position.y = -bounds.top + window.innerHeight / 2 - bounds.height / 2;
            mesh.position.x = bounds.left - window.innerWidth / 2 + bounds.width / 2;
        });
    }

    addEvents() {
        // Atualiza shader com posição do mouse
        window.addEventListener('mousemove', (e) => {
            this.meshes.forEach(({ mesh, img, material }) => {
                const bounds = img.getBoundingClientRect();
                
                // Verifica se mouse está dentro da imagem
                const isHovering = 
                    e.clientX >= bounds.left && 
                    e.clientX <= bounds.right && 
                    e.clientY >= bounds.top && 
                    e.clientY <= bounds.bottom;

                // Anima a variável uHover (GSAP para suavidade)
                gsap.to(material.uniforms.uHover, {
                    value: isHovering ? 1 : 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });

                if (isHovering) {
                    // Normaliza posição do mouse dentro da imagem (0 a 1)
                    const x = (e.clientX - bounds.left) / bounds.width;
                    const y = 1.0 - ((e.clientY - bounds.top) / bounds.height); // Inverte Y para WebGL
                    
                    // Suaviza o movimento do "centro da lente"
                    gsap.to(material.uniforms.uMouse.value, {
                        x: x,
                        y: y,
                        duration: 0.5
                    });
                }
            });
        });

        // Resize
        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            // Recalcula FOV para manter escala 1:1 pixel
            this.camera.fov = 2 * Math.atan((window.innerHeight / 2) / 600) * (180 / Math.PI);
        });
    }

    render() {
        this.updatePlanes();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // ... seu código anterior do Loader ...
    
    // Inicia o WebGL após um pequeno delay para garantir carregamento das imagens
    setTimeout(() => {
        if(document.querySelector('.bento-grid')) {
            new WebGLApp();
        }
    }, 500);
});