document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CONFIGURACIÓN ---
    const fotos = [
        { src: "img/foto1.jpg", caption: "Uno de mis días favoritos contigo ♡" },
        { src: "img/foto2.jpg", caption: "Tu sonrisa favorita" },
        { src: "img/foto3.jpg", caption: "Un recuerdo que nunca quiero olvidar" },
        { src: "img/foto4.jpg", caption: "Nuestro pequeño mundo" },
        { src: "img/foto5.jpg", caption: "Y todavía nos faltan muchos más..." }
    ];

    const razones = [
        "Porque haces mis días mejores.", "Porque me desestresas.", "Por tu sonrisa que ilumina todo.",
        "Por cómo buscas a Dios.", "Por tu corazón noble.", "Por cómo me haces sentir.",
        "Porque puedo ser yo mismo.", "Por cada aventura juntos.", "Por tus locuras.",
        "Por tu risa contagiosa.", "Por tu inteligencia.", "Por la paz que me da abrazarte.",
        "Porque siempre me animas.", "Por lo especial que eres para mi 💕.", "Por tu fuerza y valentía.",
        "Porque a tu lado el tiempo vuela.", "Por las ganas de salir adelante.", "Por tu paciencia(aunque no sea mucha😂).",
        "Porque me haces ser mejor persona.", "Y simplemente... porque sos vos mi niña linda"
    ];

    const sobres = [
        { titulo: "Para cuando estés triste", mensaje: "Recuerda que Dios y las personas que te queremos estamos aquí para ti. Esta tristeza es pasajera. Te abrazo a la distancia. ♡" },
        { titulo: "Para cuando dudes de ti", mensaje: "Mírate con mis ojos. Eres increíble y capaz de lograr todo. Yo creo en ti." },
        { titulo: "Para cuando no estemos cerca", mensaje: "Cierra los ojos y recuerda mi voz. Mi corazón está contigo." },
        { titulo: "Para cuando tengas un mal día", mensaje: "Respira profundo. Dios tiene el control y yo estoy aquí para escucharte. Todo estará bien." },
        { titulo: "Para recordar el propósito", mensaje: "Dios no se equivoca. El lugar donde estás es parte de Su plan. Confía en Su tiempo. ✝" }
    ];

    const coloresParticulas = ['#35CFC4', '#BDF5F0', '#D9B96E', '#FFFFFF'];

    // --- 2. FONDO INTERACTIVO DE PANTALLA INICIAL ---
    const canvasBg = document.getElementById('particle-canvas');
    const ctxBg = canvasBg.getContext('2d');
    canvasBg.width = window.innerWidth; canvasBg.height = window.innerHeight;
    let particlesArray = [];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvasBg.width;
            this.y = Math.random() * canvasBg.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.size > 0.2) this.size -= 0.005;
        }
        draw() {
            ctxBg.fillStyle = 'rgba(255,255,255,0.5)';
            ctxBg.beginPath(); ctxBg.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctxBg.fill();
        }
    }
    function initParticles() { for (let i = 0; i < 50; i++) particlesArray.push(new Particle()); }
    function animateParticles() {
        ctxBg.clearRect(0, 0, canvasBg.width, canvasBg.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update(); particlesArray[i].draw();
            if (particlesArray[i].size <= 0.2) { particlesArray.splice(i, 1); i--; particlesArray.push(new Particle()); }
        }
        requestAnimationFrame(animateParticles);
    }
    initParticles(); animateParticles();

    // --- 3. APERTURA Y MÚSICA ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    const musicIcon = document.getElementById('music-icon');
    const updateMusicButton = () => {
        const isPlaying = !bgMusic.paused;
        musicIcon.textContent = isPlaying ? '⏸' : '🎵';
        musicBtn.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    };
    const playMusic = async () => {
        bgMusic.volume = 0.4;
        try {
            await bgMusic.play();
        } catch (error) {
            if (error.name !== 'NotAllowedError') {
                console.error('No se pudo reproducir audio/CumpleVale.mp3:', error);
            }
        }
        updateMusicButton();
    };

    bgMusic.addEventListener('play', updateMusicButton);
    bgMusic.addEventListener('pause', updateMusicButton);
    bgMusic.addEventListener('ended', updateMusicButton);
    playMusic();

    document.getElementById('open-gift-btn').addEventListener('click', () => {
        playMusic();
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            mainContent.classList.remove('hidden-element');
            musicBtn.classList.remove('hidden-element');
            document.body.classList.remove('no-scroll');
        }, 1000);
    });

    musicBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            playMusic();
        } else {
            bgMusic.pause();
        }
    });

    // --- 4. MINIJUEGO 1: TOCA Y DESCUBRE ---
    const scratchPad = document.getElementById('scratch-pad');
    scratchPad.addEventListener('click', () => {
        scratchPad.disabled = true;
        scratchPad.parentElement.querySelector('.scratch-secret').setAttribute('aria-hidden', 'false');
        scratchPad.parentElement.classList.add('revealed');
    });

    // --- 5. MINIJUEGO 2: TABLERO DE MEMORIA ---
    const memorySymbols = ['🌷', '💍', '✝️', '✈️'];
    let gameCards = [...memorySymbols, ...memorySymbols]; // 4 pares (8 cartas)
    gameCards.sort(() => 0.5 - Math.random()); // Mezclar
    
    const memoryBoard = document.getElementById('memory-board');
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let matchesFound = 0;

    gameCards.forEach(symbol => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">♡</div>
                <div class="memory-card-back">${symbol}</div>
            </div>
        `;
        card.addEventListener('click', flipCard);
        memoryBoard.appendChild(card);
    });

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.innerHTML === secondCard.innerHTML;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetBoard();
        matchesFound++;
        if (matchesFound === 4) {
            setTimeout(() => {
                document.getElementById('memory-success').classList.remove('hidden-element');
                document.getElementById('gallery-section').classList.add('unlocked'); // Desbloquea la galería
            }, 500);
        }
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() { [hasFlippedCard, lockBoard] = [false, false]; [firstCard, secondCard] = [null, null]; }

    // --- 6. GENERACIÓN DINÁMICA DE SECCIONES ---
    
    // Galería
    const carousel = document.getElementById('photo-carousel');
    fotos.forEach((foto, i) => {
        const div = document.createElement('div');
        div.className = 'photo-card';
        div.style.setProperty('--rot', Math.random() * 6 - 3);
        div.innerHTML = `<img src="${foto.src}" onerror="this.src='https://via.placeholder.com/300x400/BDF5F0/168F8A?text=Foto+${i+1}'"><p class="photo-caption">${foto.caption}</p>`;
        carousel.appendChild(div);
    });

    // 20 Razones
    const reasonsGrid = document.getElementById('reasons-grid');
    const modal = document.getElementById('reason-modal');
    razones.forEach((razon, i) => {
        const btn = document.createElement('div');
        btn.className = 'reason-item'; btn.textContent = i + 1;
        btn.addEventListener('click', () => {
            btn.classList.add('opened');
            document.getElementById('reason-text').textContent = razon;
            modal.style.display = 'flex';
        });
        reasonsGrid.appendChild(btn);
    });
    document.querySelector('.close-modal').addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Sobres
    const envelopesContainer = document.getElementById('envelopes-container');
    sobres.forEach(sobre => {
        const div = document.createElement('div');
        div.className = 'envelope';
        div.innerHTML = `<div class="envelope-title">💌 ${sobre.titulo}</div><div class="envelope-msg">${sobre.mensaje}</div>`;
        div.addEventListener('click', () => div.classList.toggle('open'));
        envelopesContainer.appendChild(div);
    });

    // --- 7. MINIJUEGO 3: BOTONES ESCURRIDIZOS ---
    const moveBtn = (btn) => {
        const parent = btn.parentElement;
        btn.style.left = Math.floor(Math.random() * (parent.clientWidth - btn.clientWidth)) + 'px';
        btn.style.top = Math.floor(Math.random() * (parent.clientHeight - btn.clientHeight)) + 'px';
    };
    document.querySelectorAll('.runaway').forEach(btn => {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); moveBtn(btn); });
        btn.addEventListener('mouseover', () => moveBtn(btn));
    });
    document.getElementById('btn-infinito').addEventListener('click', () => {
        document.getElementById('game-result').classList.remove('hidden-element');
        lanzarConfeti(15);
    });

    // --- 8. SORPRESA FINAL ---
    const surpriseBtn = document.getElementById('surprise-btn');
    const finalMessage = document.getElementById('final-message');
    surpriseBtn.addEventListener('click', () => {
        surpriseBtn.classList.add('hidden-element');
        finalMessage.classList.remove('hidden-element');
        finalMessage.classList.add('reveal-animation');
        lanzarConfeti(60);
        setTimeout(() => finalMessage.scrollIntoView({ behavior: 'smooth' }), 200);
    });

    // Utilidades comunes (Observer de scroll y Confeti)
    window.addEventListener('scroll', () => {
        const wScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        document.getElementById("progress-bar").style.width = (wScroll / height) * 100 + "%";
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.observe').forEach(sec => observer.observe(sec));

    function lanzarConfeti(cantidad) {
        for (let i = 0; i < cantidad; i++) {
            const p = document.createElement('div');
            p.classList.add('particle-confetti');
            const size = Math.random() * 8 + 6;
            p.style.width = `${size}px`; p.style.height = `${size}px`;
            p.style.background = coloresParticulas[Math.floor(Math.random() * coloresParticulas.length)];
            p.style.left = `${Math.random() * 100}vw`; p.style.top = `-10px`;
            p.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
            p.style.animationDuration = `${Math.random() * 2 + 2}s`;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 4000);
        }
    }
});