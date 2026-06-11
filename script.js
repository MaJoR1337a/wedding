// --- Конфігурація та константи ---
const WEDDING_DATE = new Date("2026-10-10T15:00:00+03:00");
const POST_WEDDING_DATE = new Date("2026-10-11T06:00:00+03:00");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFwd_MsQbNQnYIB-pPW8C1us2guGyNBGcHf3u65ckyKCstBO3jk72Ow2d_EnCXz3NHug/exec";

const CONFIG = {
  petalCount: 30,
  confettiCount: 100,
  fadeStep: 0.05,
  fadeInterval: 50,
  toastDuration: 3000,
  countdownUpdateRate: 60000 // оновлюємо хвилини без зайвого навантаження
};

// --- Кешування DOM елементів ---
const audio = document.getElementById("bgMusic");
const musicBtn = document.querySelector(".music-btn");
const toast = document.getElementById("toast");
const envelope = document.getElementById("envelope");
const mainContent = document.getElementById("mainContent");
const countdownDiv = document.getElementById("countdown");
const rsvpForm = document.getElementById("rsvpForm");
const alcoholWrapper = document.getElementById("alcohol-wrapper");
const thanksMessage = document.getElementById("thanks");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const introVideoContainer = document.getElementById("intro-video-container");
const heroTitle = document.querySelector(".hero h1");

// Автоматичне перенаправлення
const currentDate = new Date();
if (currentDate >= POST_WEDDING_DATE) {
  window.location.href = "post_wedding.html";
}

// Спочатку сховати конверт, показати відео
envelope.style.display = "none";
const videoContainer = document.getElementById("intro-video-container");
const introVideo = document.getElementById("intro-video");
const envelopeVideo = document.getElementById("envelope-bg-video");
let envelopeShown = false;
let envelopeTimer = null;

function showEnvelope() {
  if (envelopeShown) return;
  envelopeShown = true;
  if (envelopeTimer) {
    clearTimeout(envelopeTimer);
    envelopeTimer = null;
  }

  if (videoContainer) {
    if (introVideo) introVideo.pause();
    videoContainer.style.transition = "opacity 0.3s ease-out";
    videoContainer.style.opacity = "0";
    setTimeout(() => {
      videoContainer.style.display = "none";
      envelope.style.display = "flex";
      envelope.style.opacity = "0";
      if (envelopeVideo) {
        envelopeVideo.play().catch(() => {});
      }
      setTimeout(() => {
        envelope.style.transition = "opacity 0.3s ease-in";
        envelope.style.opacity = "1";
      }, 10);
    }, 300);
  }
}

// Показати конверт через 10 секунд
envelopeTimer = setTimeout(showEnvelope, 10000);

// Якщо відео закінчиться, також показати конверт
if (introVideo) {
  introVideo.addEventListener("ended", showEnvelope);
}

// Музика
let isPlaying = false;
let fadeInterval;

function setMusicButton(playing) {
  isPlaying = playing;
  if (musicBtn) {
    musicBtn.textContent = playing ? "🔇" : "🎵";
    musicBtn.setAttribute("aria-pressed", playing.toString());
  }
}

function playMusic() {
  if (!audio) return Promise.reject(new Error("Audio element not found"));
  clearInterval(fadeInterval);
  audio.volume = 1;
  audio.muted = false;
  return audio.play().then(() => {
    setMusicButton(true);
  });
}

function enableIntroAudio() {
  if (audio && !isPlaying) {
    playMusic().catch(() => {});
  }
}

function toggleMusic() {
  clearInterval(fadeInterval);
  if (isPlaying && audio && !audio.paused) {
    fadeInterval = setInterval(() => {
      if (audio.volume > CONFIG.fadeStep) {
        audio.volume = Math.max(0, audio.volume - CONFIG.fadeStep);
      } else {
        audio.pause();
        audio.volume = 1;
        setMusicButton(false);
        clearInterval(fadeInterval);
      }
    }, CONFIG.fadeInterval);
  } else {
    playMusic().catch(() => {
      setMusicButton(false);
      showToast("Натисніть кнопку музики ще раз, щоб увімкнути звук");
    });
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), CONFIG.toastDuration);
}

function hideAlcoholOptions() {
  alcoholWrapper.classList.remove('show');
  setTimeout(() => {
    if (!alcoholWrapper.classList.contains('show')) {
      alcoholWrapper.style.display = "none";
    }
  }, 500);
}

function showAlcoholOptions() {
  alcoholWrapper.style.display = "block";
  setTimeout(() => {
    alcoholWrapper.classList.add('show');
  }, 10);
}

async function postFormData(data) {
  const body = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => body.append(key, value));

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    body
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "(no body)");
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  let result;
  try {
    result = await response.json();
  } catch (jsonError) {
    const text = await response.text().catch(() => "(no body)");
    console.error("RSVP response parse error:", jsonError, "body:", text);
    throw new Error("Неочікуваний формат відповіді сервера.");
  }

  const success = result && (result.result === "success" || result.success === true);
  if (!success) {
    throw new Error(result && result.error ? result.error : "Server response was not successful");
  }

  return result;
}

function openInvite(){
  if (envelope.classList.contains("open")) return;

  envelope.classList.add("open");
  envelope.style.pointerEvents = "none";
  
  setTimeout(() => {
    envelope.style.opacity = "0";
    mainContent.style.display = "block";

    setTimeout(() => {
      envelope.style.display = "none";
      createPetals();
      audio.muted = false;
      audio.play().then(() => {
        isPlaying = true;
        musicBtn.textContent = "🔇";
      }).catch(error => {
        console.error("Помилка:", error);
      });

      setTimeout(() => {
        showToast("Натисніть 🎵, якщо не чуєте музику");
      }, 1000);
    }, 500);
  }, 500);
} 

function createPetals(){
  for(let i=0; i < CONFIG.petalCount; i++){
    let petal=document.createElement("div");
    petal.className="petal";
    petal.style.left=Math.random()*100+"vw";
    petal.style.animationDuration=(5+Math.random()*5)+"s";
    document.body.appendChild(petal);
    setTimeout(() => { petal.remove(); }, 10000);
  }
}

let countdownAnimated = false;
let countdownInterval = null;
function updateCountdown(){
  const now = new Date().getTime();
  const distance = WEDDING_DATE.getTime() - now;

  if (distance < 0) {
    const finishedMessage = `<div class="countdown-complete">Наш день настав 🤍</div>`;
    if (countdownDiv.innerHTML !== finishedMessage) {
      countdownDiv.innerHTML = finishedMessage;
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  if (countdownDiv.children.length === 0) {
    countdownDiv.innerHTML = `
      <div class="countdown-item" style="--i: 0;"><span>${days}</span>днів</div>
      <div class="countdown-item" style="--i: 1;"><span>${hours}</span>годин</div>
      <div class="countdown-item" style="--i: 2;"><span>${minutes}</span>хвилин</div>
    `;
    if (!countdownAnimated) {
      const items = document.querySelectorAll('.countdown-item');
      items.forEach((item, index) => {
        item.classList.add('animate');
      });
      countdownAnimated = true;
    }
  } else {
    countdownDiv.children[0].querySelector('span').textContent = days;
    countdownDiv.children[1].querySelector('span').textContent = hours;
    countdownDiv.children[2].querySelector('span').textContent = minutes;
  }
}

countdownInterval = setInterval(updateCountdown, CONFIG.countdownUpdateRate);
updateCountdown();

// Эффект параллакса для фотографий (тільки на десктопі)
if (window.innerWidth > 768) {
  document.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      const translateX = (x - centerX) / 20;
      const translateY = (y - centerY) / 20;
      
      this.style.transform = `scale(1.15) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${translateX}px, ${translateY}px)`;
    });
    
    img.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg) translate(0px, 0px)';
    });
  });
}

rsvpForm.addEventListener("submit", async function(e){
  e.preventDefault();

  const name = this.querySelector("input[name='name']").value.trim();
  const attendance = this.querySelector("select[name='attendance']").value;
  const wishes = this.querySelector("textarea[name='wishes']").value.trim();
  
  // Збираємо всі вибрані чекбокси в один рядок
  const alcoholChecked = this.querySelectorAll("input[name='alcohol']:checked");
  
  if (name.length < 2) {
    showToast("Будь ласка, введіть коректне ім'я (мінімум 2 символи).");
    return;
  }

  if (!attendance) {
    showToast("Будь ласка, оберіть варіант присутності.");
    return;
  }
  
  if (attendance === "yes" && alcoholChecked.length === 0) {
    showToast("Будь ласка, оберіть напій 🥂");
    return;
  }

  if (wishes.length > 0 && wishes.length < 5) {
    showToast("Побажання занадто коротке (мінімум 5 символів).");
    return;
  }

  let alcohol = Array.from(alcoholChecked).map(cb => cb.value).join(", ");

  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Надсилаю...";

  if (attendance === "no") alcohol = "—";

  const data = {
    name,
    attendance,
    alcohol,
    wishes
  };

  try {
    await postFormData(data);
    fireConfetti(submitBtn);
    thanksMessage.style.display="block";
    this.reset();
    hideAlcoholOptions();
    submitBtn.disabled = false;
    submitBtn.textContent = "Надіслати";
  } catch (error) {
    console.error("Помилка:", error);
    submitBtn.disabled = false;
    submitBtn.textContent = "Надіслати";
  }
});

// Логіка для форми: ховаємо алкоголь, якщо гість не прийде
document.querySelector("select[name='attendance']").addEventListener("change", function() {
  if (this.value === "no") {
    hideAlcoholOptions();
  } else {
    showAlcoholOptions();
  }
});

// Функції для lightbox
let currentImageIndex = 0;
let currentGalleryImages = [];

function openLightbox(index, imagesArray) {
  currentGalleryImages = imagesArray;
  currentImageIndex = index;
  updateLightboxImage();
  
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Блокуємо скрол сторінки
  setTimeout(() => {
    lightbox.classList.add('show');
  }, 10);
}

function closeLightbox() {
  lightbox.classList.remove('show');
  document.body.style.overflow = ''; // Відновлюємо скрол
  setTimeout(() => {
    lightbox.style.display = 'none';
  }, 300);
}

function changeSlide(n) {
  currentImageIndex += n;
  if (currentImageIndex >= currentGalleryImages.length) currentImageIndex = 0;
  if (currentImageIndex < 0) currentImageIndex = currentGalleryImages.length - 1;
  updateLightboxImage();
}

function updateLightboxImage() {
  lightboxImg.style.opacity = 0;
  setTimeout(() => {
    const src = currentGalleryImages[currentImageIndex];
    if (src) {
      lightboxImg.src = src;
      lightboxImg.onerror = () => console.error("Не вдалося завантажити зображення:", src);
      lightboxImg.style.opacity = 1;
    } else {
      console.error("Помилка: індекс зображення поза межами");
      closeLightbox();
    }
  }, 150);
}

// Клавіатура (стрілки) та свайпи
document.addEventListener('keydown', function(e) {
  if (lightbox.style.display === 'flex') {
    if (e.key === 'ArrowLeft') changeSlide(-1);
    if (e.key === 'ArrowRight') changeSlide(1);
    if (e.key === 'Escape') closeLightbox();
  }
});

let touchStartX = 0;

lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

lightbox.addEventListener('touchend', e => {
  const touchEndX = e.changedTouches[0].screenX;
  if (touchEndX < touchStartX - 50) changeSlide(1); // Свайп вліво (наступне)
  if (touchEndX > touchStartX + 50) changeSlide(-1); // Свайп вправо (попереднє)
});

// Функція запуску конфетті
function fireConfetti(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const colors = ['#ffe6d1', '#9d806e', '#724032', '#490018', '#320010', '#ffd700'];

  for (let i = 0; i < CONFIG.confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = centerX + 'px';
    confetti.style.top = centerY + 'px';
    
    // Випадковий напрямок розльоту
    confetti.style.setProperty('--tx', (Math.random() - 0.5) * 300 + 'px');
    confetti.style.setProperty('--ty', (Math.random() - 1) * 300 + 'px'); // Більше вгору
    
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1000);
  }
}

// Анімація появи секцій при скроллі
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Анімація тільки один раз
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(section => {
  observer.observe(section);
});

// Функція копіювання адреси
function copyAddress() {
  const text = "Ресторан Сім-Сім, м. Харків";
  navigator.clipboard.writeText(text).then(() => {
    showToast("Адресу скопійовано!");
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Логіка кнопки "Вгору"
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Покращена зупинка музики для мобільних (згортання, блокування екрану)
function handleBackgroundMusic() {
  if (document.hidden || document.visibilityState === 'hidden') {
    audio.pause();
  } else if (isPlaying) {
    audio.play().catch(err => console.log("Помилка при відновленні музики:", err));
  }
}

document.addEventListener("visibilitychange", handleBackgroundMusic);
window.addEventListener("pagehide", handleBackgroundMusic);

// Lazy loading для зображень
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.add('loaded');
      }
      observer.unobserve(img);
    }
  });
}, { rootMargin: '50px 0px' });

document.querySelectorAll('img.lazy').forEach(img => {
  imageObserver.observe(img);
});

if (introVideoContainer) {
  introVideoContainer.addEventListener('click', enableIntroAudio);
}

if (heroTitle) {
  heroTitle.addEventListener('click', enableIntroAudio);
}

// Код для відкриття лайтбоксу на клік по зображеннях
document.querySelectorAll('.gallery, .location-grid').forEach(container => {
  const images = Array.from(container.querySelectorAll('img.view-img, img.style-img'));
  const sources = images.map((img) => img.dataset.src || img.currentSrc || img.src);
  images.forEach((img, index) => {
    img.addEventListener('click', () => {
      if (sources[index]) {
        openLightbox(index, sources);
      } else {
        console.warn("Помилка: зображення не завантажилось", img);
      }
    });
  });
});

// Кнопка для примусового переходу на сторінку спогадів (працює і локально, і на хостингу)
const postWeddingManualBtn = document.createElement("button");
postWeddingManualBtn.innerHTML = "📸 Спогади";
postWeddingManualBtn.className = "manual-memories-btn";

postWeddingManualBtn.onclick = () => { window.location.href = "post_wedding.html"; };
postWeddingManualBtn.onmouseenter = () => postWeddingManualBtn.style.transform = "scale(1.1)";
postWeddingManualBtn.onmouseleave = () => postWeddingManualBtn.style.transform = "scale(1)";
document.body.appendChild(postWeddingManualBtn);
