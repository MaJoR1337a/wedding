let isPlaying = false;
        let fadeInterval;
        const audio = document.getElementById("postWeddingMusic");
        const musicBtn = document.querySelector(".music-btn");
        const playerControls = document.querySelector(".player-controls");
        const progressBar = document.getElementById("progress-bar");
        const toast = document.getElementById("toast"); // Кешуємо елемент toast
        const TOAST_DURATION = 3000; // Тривалість показу тосту
        const INITIAL_COMMENTS_COUNT = 10;
        const timeRemainingText = document.getElementById("time-remaining");

        let allCommentsData = [];
        let commentsToShow = INITIAL_COMMENTS_COUNT;

        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx14oOQFi8vcdM_nU2eQ4sLX3icVHjpJs63BuLW1RAeTyj3sKQhKh-dQLzb8u38wfnryg/exec"; // Використовуйте той самий URL

        function formatTime(seconds) {
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        }

        // Допоміжна функція для форматування дати та часу коментаря
        function formatCommentTimestamp(dateString) {
            const date = new Date(dateString);
            const options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('uk-UA', options);
        }

        function showToast(message) {
            toast.textContent = message;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), TOAST_DURATION);
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
                });
            }
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

        // Обробка форми коментарів
        document.getElementById("commentForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const name = this.querySelector("input[name='name']").value.trim();
            const wishes = this.querySelector("textarea[name='wishes']").value.trim();
            const submitBtn = this.querySelector("button[type='submit']");
            
            if (name.length < 2) {
                showToast("Будь ласка, введіть ім'я (мінімум 2 символи).");
                return;
            }

            if (wishes.length < 5) {
                showToast("Ваше побажання занадто коротке (мінімум 5 символів).");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "Надсилаю...";

            const data = {
                name: name,
                attendance: "comment_only", // Мітка для Google Таблиці
                alcohol: "—",
                wishes: wishes
            };

            try {
                // Використовуємо ваш існуючий скрипт
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify(data)
                });

                // Додаємо новий коментар в початок локального масиву
                allCommentsData.unshift({
                    name: name,
                    wishes: wishes,
                    timestamp: new Date().toISOString()
                });

                // Оновлюємо відображення (збільшуємо ліміт, щоб новий коментар був видимим)
                commentsToShow++;
                displayComments();

                // Очищуємо форму
                this.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = "Надіслано! ✨";
                setTimeout(() => { submitBtn.textContent = "Надіслати ще 💌"; }, 3000);

            } catch (error) {
                console.error("Помилка:", error);
                showToast("Сталася помилка при відправці. Спробуйте ще раз.");
                submitBtn.disabled = false;
                submitBtn.textContent = "Надіслати 💌";
            }
        });

// Функція для відображення коментарів на основі поточного ліміту
function displayComments() {
    const commentsList = document.getElementById("commentsList");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    
    commentsList.innerHTML = "";
    const slice = allCommentsData.slice(0, commentsToShow);

    if (slice.length === 0) {
        commentsList.innerHTML = "<p style='text-align:center; opacity:0.6;'>Поки що немає коментарів. Будьте першими! ✨</p>";
        loadMoreBtn.style.display = "none";
        return;
    }

    slice.forEach(comment => {
        const commentItem = document.createElement("div");
        commentItem.className = "comment-item animate-in";

        const commentHeader = document.createElement("div");
        commentHeader.className = "comment-header";

        const commentName = document.createElement("span");
        commentName.className = "comment-name";
        commentName.textContent = comment.name;

        const commentTimestamp = document.createElement("span");
        commentTimestamp.className = "comment-timestamp";
        commentTimestamp.textContent = formatCommentTimestamp(comment.timestamp);

        commentHeader.append(commentName, commentTimestamp);

        const commentText = document.createElement("div");
        commentText.className = "comment-text";
        commentText.textContent = comment.wishes;

        commentItem.append(commentHeader, commentText);
        commentsList.appendChild(commentItem);
    });

    // Показуємо кнопку, якщо є ще приховані коментарі
    loadMoreBtn.style.display = (commentsToShow < allCommentsData.length) ? "block" : "none";
}

// Обробка натискання кнопки "Показати більше"
document.getElementById("loadMoreBtn").addEventListener("click", function() {
    commentsToShow += 10;
    displayComments();
});

// Функція для завантаження існуючих коментарів з Google Таблиці
async function loadComments() {
    const commentsList = document.getElementById("commentsList");
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            allCommentsData = data;
            displayComments();
        }
    } catch (error) {
        console.error("Помилка при завантаженні коментарів:", error);
        commentsList.innerHTML = "<p style='text-align:center; opacity:0.6;'>Не вдалося завантажити коментарі 😢</p>";
    }
}

// Викликаємо завантаження коментарів при запуску сторінки
loadComments();
