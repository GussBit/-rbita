document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SETUP LENIS (SMOOTH SCROLL MAIS RÁPIDO) ---
    const lenis = new Lenis({
        duration: 0.6, // Reduzido de 1.2 para 0.6 para scroll mais ágil
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);


    // --- 2. CUSTOM CURSOR & LIGHT LOGIC ---
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    const lightEffect = document.querySelector('.mouse-light');
    
    const moveCursor = (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        gsap.to(cursorOutline, {
            x: posX,
            y: posY,
            duration: 0.15,
            ease: "power2.out"
        });

        lightEffect.style.setProperty('--x', `${posX}px`);
        lightEffect.style.setProperty('--y', `${posY}px`);
    }

    window.addEventListener('mousemove', moveCursor);

    // Efeito Hover em Links e Botões
    const interactables = document.querySelectorAll('a, button, .hover-target');
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


    // --- 3. AUDIO PLAYER ---
    const audioBtn = document.getElementById('audio-btn');
    const audio = document.getElementById('ambient-music');
    const playerContainer = document.querySelector('.audio-player');
    let isPlaying = false;

    if(audio) audio.volume = 0.4; 

    if(audioBtn) {
        audioBtn.addEventListener('click', () => {
            if (!isPlaying) {
                audio.play().then(() => {
                    isPlaying = true;
                    playerContainer.classList.add('playing');
                    document.querySelector('.audio-label').textContent = "PAUSE";
                }).catch(e => console.log("Erro ao reproduzir áudio (falta arquivo?):", e));
            } else {
                audio.pause();
                isPlaying = false;
                playerContainer.classList.remove('playing');
                document.querySelector('.audio-label').textContent = "SOUND";
            }
        });
    }

    // --- 4. LOADER & ENTRADA ---
    gsap.registerPlugin();

    const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        onComplete: () => {
            document.body.style.overflow = 'auto';
            lenis.start();
            // Inicia o WebGL apenas após o site carregar para garantir performance
            initWebGL();
        }
    });

    lenis.stop(); // Trava scroll no início

    tl.to(".char", { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 })
      .to(".loader-line", { width: "100%", duration: 0.8 }, "-=0.4")
      .to({}, { duration: 1.0 }) // Tempo de espera reduzido levemente
      .to(".loader-text, .loader-line", { y: -50, opacity: 0, duration: 0.5 })
      .to(".loader-container", { clipPath: "circle(0% at 50% 50%)", duration: 1.5, ease: "expo.inOut" })
      .to(".hero-content-center", { opacity: 1, y: 0, duration: 1.5 }, "-=0.8")
      .to(".orbit-nav", { transform: "translateY(0)", duration: 1 }, "-=1.2")
      .to(".scroll-indicator", { opacity: 1, duration: 1 }, "-=0.5");
});


// --- 5. WEBGL APP (LENS EFFECT) ---
function initWebGL() {
    // Verifica se a seção existe antes de iniciar
    if(!document.querySelector('.bento-grid')) return;

    class WebGLApp {
        constructor() {
            this.canvas = document.querySelector('#webgl-canvas');
            this.container = document.querySelector('.bento-grid');
            this.images = [...document.querySelectorAll('.webgl-img')];
            this.meshes = [];
            
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 2000);
            this.camera.position.z = 600;
            // Cálculo correto do FOV para pixel-perfect match
            this.camera.fov = 2 * Math.atan((window.innerHeight / 2) / 600) * (180 / Math.PI);

            this.renderer = new THREE.WebGLRenderer({ 
                canvas: this.canvas, alpha: true, antialias: true 
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            this.createPlanes();
            this.addEvents();
            this.render();
        }

        createPlanes() {
    const loader = new THREE.TextureLoader();
    // 1. Configura o CrossOrigin ANTES do load
    loader.setCrossOrigin('anonymous'); 

    this.images.forEach((img) => {
        // 2. Só inicia o Three.js após garantir que o link da imagem existe
        if (!img.src) return;

        loader.load(
            img.src, 
            (texture) => {
                const bounds = img.getBoundingClientRect();
                const geometry = new THREE.PlaneBufferGeometry(bounds.width, bounds.height, 16, 16);
                
                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        uTexture: { value: texture },
                        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                        uHover: { value: 0 },
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
                        varying vec2 vUv;
                        void main() {
                            vec2 uv = vUv;
                            float dist = distance(uv, uMouse);
                            float lens = smoothstep(0.4, 0.0, dist);
                            uv += (uv - uMouse) * lens * 0.25 * uHover;
                            gl_FragColor = texture2D(uTexture, uv);
                        }
                    `
                });

                const mesh = new THREE.Mesh(geometry, material);
                this.scene.add(mesh);
                this.meshes.push({ mesh, img, material });
            },
            undefined,
            (err) => console.error("Erro ao carregar textura:", img.src)
        );
    });
}
        updatePlanes() {
            this.meshes.forEach(({ mesh, img }) => {
                const bounds = img.getBoundingClientRect();
                mesh.position.y = -bounds.top + window.innerHeight / 2 - bounds.height / 2;
                mesh.position.x = bounds.left - window.innerWidth / 2 + bounds.width / 2;
                mesh.scale.set(1, 1, 1); // Garante escala correta no resize
            });
        }

        addEvents() {
            window.addEventListener('mousemove', (e) => {
                this.meshes.forEach(({ mesh, img, material }) => {
                    const bounds = img.getBoundingClientRect();
                    const isHovering = 
                        e.clientX >= bounds.left && e.clientX <= bounds.right && 
                        e.clientY >= bounds.top && e.clientY <= bounds.bottom;

                    gsap.to(material.uniforms.uHover, {
                        value: isHovering ? 1 : 0, duration: 0.5, ease: 'power2.out'
                    });

                    if (isHovering) {
                        const x = (e.clientX - bounds.left) / bounds.width;
                        const y = 1.0 - ((e.clientY - bounds.top) / bounds.height);
                        gsap.to(material.uniforms.uMouse.value, { x, y, duration: 0.5 });
                    }
                });
            });

            window.addEventListener('resize', () => {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.camera.fov = 2 * Math.atan((window.innerHeight / 2) / 600) * (180 / Math.PI);
            });
        }

        render() {
            this.updatePlanes();
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.render.bind(this));
        }
    }

    new WebGLApp();
}