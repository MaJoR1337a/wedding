// --- Конфігурація та константи ---
const WEDDING_DATE = new Date("2026-10-10T15:00:00");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwFwd_MsQbNQnYIB-pPW8C1us2guGyNBGcHf3u65ckyKCstBO3jk72Ow2d_EnCXz3NHug/exec";

const CONFIG = {
  petalCount: 30,
  confettiCount: 100,
  fadeStep: 0.05,
  fadeInterval: 50,
  toastDuration: 3000,
  countdownUpdateRate: 1000 // 1 секунда
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

// Автоматичне перенаправлення
const currentDate = new Date();
if (currentDate >= WEDDING_DATE) {
  window.location.href = "post_wedding.html";
}

// Спочатку сховати конверт, показати відео
envelope.style.display = "none";
const videoContainer = document.getElementById("intro-video-container");
const introVideo = document.getElementById("intro-video");

// Показати конверт через 5 секунд або коли відео закінчиться
function showEnvelope() {
  if (videoContainer) {
    videoContainer.style.transition = "opacity 0.8s ease-out";
    videoContainer.style.opacity = "0";
    setTimeout(() => {
      videoContainer.style.display = "none";
      envelope.style.display = "flex";
      envelope.style.opacity = "0";
      setTimeout(() => {
        envelope.style.transition = "opacity 0.8s ease-in";
        envelope.style.opacity = "1";
      }, 10);
    }, 800);
  }
}

// Показати конверт через 5 секунд
setTimeout(showEnvelope, 5000);

// Якщо відео закінчиться, також показати конверт
if (introVideo) {
  introVideo.addEventListener("ended", showEnvelope);
}

// Музика
let isPlaying = false;
let fadeInterval;

function toggleMusic() {
  clearInterval(fadeInterval);
  if (isPlaying) {
    fadeInterval = setInterval(() => {
      if (audio.volume > CONFIG.fadeStep) {
        audio.volume -= CONFIG.fadeStep;
      } else {
        audio.pause();
        audio.volume = 1;
        isPlaying = false;
        musicBtn.textContent = "🎵";
        clearInterval(fadeInterval);
      }
    }, CONFIG.fadeInterval);
  } else {
    audio.volume = 1;
    audio.muted = false;
    audio.play().then(() => {
      isPlaying = true;
      musicBtn.textContent = "🔇";
    }).catch(err => console.log("Music play blocked:", err));
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), CONFIG.toastDuration);
}

async function postFormData(data) {
  console.log("RSVP post data:", data);
  const body = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => body.append(key, value));

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body
    });

    console.log("Fetch response:", response);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    console.log("Server response:", json);
    return json;
  } catch (error) {
    console.warn("Primary POST failed, retrying with no-cors fallback:", error);
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body
    });
    console.log("No-cors response:", response);
    return { type: response.type || "opaque", result: "success" };
  }
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
      }, 2000);
    }, 1000);
  }, 1000);
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
function updateCountdown(){
  const now = new Date().getTime();
  const distance = WEDDING_DATE.getTime() - now;

  if(distance < 0){
    countdownDiv.innerHTML = "Наш день настав 🤍";
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

setInterval(updateCountdown, CONFIG.countdownUpdateRate);
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
  fireConfetti(submitBtn); // Запуск конфетті
  
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
    const result = await postFormData(data);
    const success = result && (result.result === "success" || result.type === "opaque");

    if (!success) {
      throw new Error(result && result.error ? result.error : "Server response was not successful");
    }

    thanksMessage.style.display="block";
    this.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "Надіслати";
  } catch (error) {
    showToast("Помилка відправки 😢 Перевірте підключення або налаштування CORS.");
    console.error("Помилка:", error);
    submitBtn.disabled = false;
    submitBtn.textContent = "Надіслати";
  }
});

// Логіка для форми: ховаємо алкоголь, якщо гість не прийде
document.querySelector("select[name='attendance']").addEventListener("change", function() {
  if (this.value === "no") {
    alcoholWrapper.classList.remove('show');
    setTimeout(() => {
      if(this.value === "no") alcoholWrapper.style.display = "none";
    }, 500); 
  } else {
    alcoholWrapper.style.display = "block";
    setTimeout(() => {
      alcoholWrapper.classList.add('show');
    }, 10); // Невелика затримка, щоб display:block застосувався до початку transition
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
