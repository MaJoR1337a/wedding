let isPlaying = false;
let fadeInterval;
let audioUnlocked = false;
const audio = document.getElementById("postWeddingMusic");
if (audio) {
    audio.muted = true;
}
const musicBtn = document.getElementById("musicToggleBtn");
const musicHint = document.getElementById("musicHint");
const playerControls = document.querySelector(".player-controls");
const progressBar = document.getElementById("progress-bar");
const timeRemainingText = document.getElementById("time-remaining");

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function setMusicState(playing) {
    isPlaying = playing;
    musicBtn.textContent = playing ? "🔇" : "🎵";
    musicBtn.setAttribute("aria-pressed", playing.toString());
    playerControls.classList.toggle("active", playing);
    if (musicHint) {
        musicHint.textContent = playing ? "Натисніть кнопку, щоб вимкнути звук" : "Натисніть кнопку, щоб увімкнути звук";
    }
}

function updateProgress() {
    if (!audio.duration || isNaN(audio.duration)) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progress + "%";
    const remaining = Math.max(0, audio.duration - audio.currentTime);
    timeRemainingText.textContent = "-" + formatTime(remaining);
}

function isAudioPlaying() {
    return !audio.paused && !audio.ended;
}

function unlockAudioOnGesture() {
    if (audioUnlocked) return;
    if (playerControls) {
        playerControls.classList.add('visible');
    }
    if (audio) {
        audio.muted = false;
        audio.play().then(() => {
            setMusicState(true);
            audioUnlocked = true;
            if (musicHint) {
                musicHint.textContent = "Музика грає";
            }
        }).catch(() => {
            if (musicHint) {
                musicHint.textContent = "Торкніться екрану ще раз, щоб увімкнути звук";
            }
        });
    }
}

function toggleMusic() {
    clearInterval(fadeInterval);
    if (isAudioPlaying()) {
        const fadeStep = 0.05;
        fadeInterval = setInterval(() => {
            if (audio.volume > fadeStep) {
                audio.volume = Math.max(0, audio.volume - fadeStep);
            } else {
                audio.pause();
                audio.volume = 1;
                setMusicState(false);
                clearInterval(fadeInterval);
            }
        }, 50);
    } else {
        audio.volume = 1;
        if (audio.ended) {
            audio.currentTime = 0;
        }
        audio.play().then(() => {
            setMusicState(true);
            updateProgress();
        }).catch(err => {
            console.info("Відтворення заблоковано браузером. Потрібна взаємодія користувача.", err);
            setMusicState(false);
        });
    }
}

function attemptAutoPlay() {
    if (isAudioPlaying()) {
        setMusicState(true);
        return;
    }

    audio.play().then(() => {
        setMusicState(true);
        updateProgress();
    }).catch(err => {
        console.info("Автовідтворення заблоковано браузером. Музика почнеться після натискання кнопки.", err);
        setMusicState(false);
    });
}

audio.addEventListener("loadedmetadata", updateProgress);
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", () => setMusicState(false));

document.addEventListener("click", unlockAudioOnGesture, { once: true });
document.addEventListener("touchend", unlockAudioOnGesture, { once: true });

const postWeddingHeader = document.querySelector("h1");
if (postWeddingHeader) {
    postWeddingHeader.addEventListener("click", unlockAudioOnGesture, { once: true });
}

attemptAutoPlay();
