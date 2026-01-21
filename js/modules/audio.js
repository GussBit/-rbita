export function initAudio() {
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
                }).catch(e => console.log("Erro áudio:", e));
            } else {
                audio.pause();
                isPlaying = false;
                playerContainer.classList.remove('playing');
                document.querySelector('.audio-label').textContent = "SOUND";
            }
        });
    }
}