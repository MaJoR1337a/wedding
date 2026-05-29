let isPlaying = false;
        let fadeInterval;
        const audio = document.getElementById("postWeddingMusic");
        const musicBtn = document.querySelector(".music-btn");
        const playerControls = document.querySelector(".player-controls");
        const progressBar = document.getElementById("progress-bar");
        const timeRemainingText = document.getElementById("time-remaining");

        function formatTime(seconds) {
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        }

        function toggleMusic() {
            clearInterval(fadeInterval);
            if (isPlaying) {
                // Плавне згасання (Fade Out) перед паузою
                const fadeStep = 0.05;
                fadeInterval = setInterval(() => {
                    if (audio.volume > fadeStep) {
                        audio.volume -= fadeStep;
                    } else {
                        audio.pause();
                        audio.volume = 1; // Скидаємо гучність для наступного включення
                        isPlaying = false;
                        musicBtn.textContent = "🎵";
                        playerControls.classList.remove("active");
                        clearInterval(fadeInterval);
                    }
                }, 50); // Повне згасання приблизно за 1 секунду
            } else {
                // При включенні повертаємо повну гучність
                audio.volume = 1;
                
                audio.play().then(() => {
                    isPlaying = true;
                    musicBtn.textContent = "🔇";
                    playerControls.classList.add("active");
                }).catch(err => {
                    console.info("Відтворення заблоковано браузером. Потрібна взаємодія користувача.", err);
                    // Відновлюємо стан кнопки при помилці
                    isPlaying = false;
                    musicBtn.textContent = "🎵";
                });
            }
        }

        function attemptAutoPlay() {
            if (isPlaying) return;
            audio.play().then(() => {
                isPlaying = true;
                musicBtn.textContent = "🔇";
                playerControls.classList.add("active");
            }).catch(err => {
                console.info("Автовідтворення заблоковано браузером. Музика почнеться після першої взаємодії.", err);
            });
        }

        audio.ontimeupdate = () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = progress + "%";
                
                const remaining = audio.duration - audio.currentTime;
                timeRemainingText.textContent = "-" + formatTime(remaining);
            }
        };

        // Коли музика закінчиться, повертаємо плеєр у початковий стан
        audio.onended = () => {
            isPlaying = false;
            musicBtn.textContent = "🎵";
            playerControls.classList.remove("active");
        };

        // Автоматичний запуск музики після першого кліку користувача по будь-якому місцю сторінки
        document.addEventListener('click', () => {
            if (!isPlaying) toggleMusic();
        }, { once: true });

        // Спроба автоматичного відтворення при завантаженні сторінки
        attemptAutoPlay();

