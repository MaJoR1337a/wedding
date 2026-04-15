// Музика
let isPlaying = false;
const audio = document.getElementById("bgMusic");
const musicBtn = document.querySelector(".music-btn");

function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    musicBtn.textContent = "🎵";
  } else {
    audio.muted = false;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.then(() => {
        isPlaying = true;
        musicBtn.textContent = "🔇";
      }).catch(error => {
        console.log("Помилка:", error);
      });
    }
  }
}

function openInvite(){
  const env = document.getElementById("envelope");
  const main = document.getElementById("mainContent");
  
  if (env.classList.contains("open")) return; // Запобігаємо повторному натисканню

  env.classList.add("open"); // Запускаємо анімацію клапана
  env.style.pointerEvents = "none"; // Вимикаємо кліки по конверту
  
  // Починаємо робити конверт прозорим раніше, щоб бачити контент під ним
  setTimeout(() => {
    env.style.opacity = "0";
    main.style.display = "block"; // Сайт з'являється "під" напівпрозорим конвертом

    setTimeout(() => {
      env.style.display = "none";
      createPetals();
      // Вмикаємо музику
      audio.muted = false;
      audio.play().then(() => {
        isPlaying = true;
        musicBtn.textContent = "🔇";
      });
      
      // Підказка про звук
      setTimeout(() => {
        const toast = document.getElementById("toast");
        toast.textContent = "Натисніть 🎵, якщо не чуєте музику";
        toast.className = "show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 4000);
      }, 2000);
    }, 1000); // Даємо 1с на плавний перехід opacity
  }, 1000); // Починаємо зникати, поки лист ще в русі
} 

function createPetals(){
  for(let i=0;i<30;i++){
    let petal=document.createElement("div");
    petal.className="petal";
    petal.style.left=Math.random()*100+"vw";
    petal.style.animationDuration=(5+Math.random()*5)+"s";
    document.body.appendChild(petal);
    // Видаляємо пелюстку після завершення анімації для очищення пам'яті
    setTimeout(() => { petal.remove(); }, 10000);
  }
}

let countdownAnimated = false;

function updateCountdown(){
  const weddingDate = new Date("2026-10-10T15:00:00").getTime();
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if(distance < 0){
    document.getElementById("countdown").innerHTML = "Наш день настав 🤍";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  // Оновлюємо тільки текст, а не весь HTML
  const countdownDiv = document.getElementById("countdown");
  if (countdownDiv.children.length === 0) {
    countdownDiv.innerHTML = `
      <div class="countdown-item" style="--i: 0;"><span>${days}</span>днів</div>
      <div class="countdown-item" style="--i: 1;"><span>${hours}</span>годин</div>
      <div class="countdown-item" style="--i: 2;"><span>${minutes}</span>хвилин</div>
    `;
    // Анімація тільки при першому завантаженні
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

setInterval(updateCountdown,10000);
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

document.getElementById("rsvpForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const name = this.querySelector("input[name='name']").value.trim();
  const attendance = this.querySelector("select[name='attendance']").value;
  const wishes = this.querySelector("textarea[name='wishes']").value.trim();
  
  // Збираємо всі вибрані чекбокси в один рядок
  const alcoholChecked = this.querySelectorAll("input[name='alcohol']:checked");
  
  if (!name || !attendance) {
    alert("Будь ласка, заповніть обов'язкові поля.");
    return;
  }
  
  if (attendance === "yes" && alcoholChecked.length === 0) {
    alert("Будь ласка, оберіть хоча б один напій (можна 'Без алкоголю') 🥂");
    return;
  }

  let alcohol = Array.from(alcoholChecked).map(cb => cb.value).join(", ");

  const submitBtn = this.querySelector("button[type='submit']");
  fireConfetti(submitBtn); // Запуск конфетті
  
  submitBtn.disabled = true;
  submitBtn.textContent = "Надсилаю...";

  if (attendance === "no") alcohol = "—";

  const data = {
    name: name,
    attendance: attendance,
    alcohol: alcohol,
    wishes: wishes
  };

  try {
    await fetch("https://script.google.com/macros/s/AKfycbwKaxAWQrS76ueztsFH8YB2_Pq_9-yxpq5f-c5mYwFtgc0fjZEjR8wMO7O9rVd1J7W0LA/exec", {
      method: "POST",
      body: JSON.stringify(data)
    });

    document.getElementById("thanks").style.display="block";
    this.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "Надіслати";
  } catch (error) {
    alert("Помилка відправки 😢");
    console.log("Помилка:", error);
    submitBtn.disabled = false;
    submitBtn.textContent = "Надіслати";
  }
});

// Логіка для форми: ховаємо алкоголь, якщо гість не прийде
const attendanceSelect = document.querySelector("select[name='attendance']");
const alcoholWrapper = document.getElementById("alcohol-wrapper");

attendanceSelect.addEventListener("change", function() {
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

// Функція для Google Календаря
function openGoogleCalendar() {
  const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
  const text = encodeURIComponent("Весілля Олександра та Альони");
  const dates = "20261010T120000Z/20261010T200000Z";
  const details = encodeURIComponent("Запрошуємо вас розділити з нами наш особливий день!");
  const location = encodeURIComponent("Ресторан Сім-Сім, м. Харків");
  window.open(`${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${location}`, '_blank');
}

// Функції для lightbox
let currentImageIndex = 0;
let currentGalleryImages = [];

function openLightbox(index, imagesArray) {
  currentGalleryImages = imagesArray;
  currentImageIndex = index;
  updateLightboxImage();
  
  const lightbox = document.getElementById('lightbox');
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Блокуємо скрол сторінки
  setTimeout(() => {
    lightbox.classList.add('show');
  }, 10);
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('show');
  document.body.style.overflow = ''; // Відновлюємо скрол
  setTimeout(() => {
    lightbox.display = 'none';
  }, 300);
}

function changeSlide(n) {
  currentImageIndex += n;
  if (currentImageIndex >= currentGalleryImages.length) currentImageIndex = 0;
  if (currentImageIndex < 0) currentImageIndex = currentGalleryImages.length - 1;
  updateLightboxImage();
}

function updateLightboxImage() {
  const lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.style.opacity = 0;
  setTimeout(() => {
    lightboxImg.src = currentGalleryImages[currentImageIndex];
    lightboxImg.style.opacity = 1;
  }, 150);
}

// Клавіатура (стрілки) та свайпи
document.addEventListener('keydown', function(e) {
  if (document.getElementById('lightbox').style.display === 'flex') {
    if (e.key === 'ArrowLeft') changeSlide(-1);
    if (e.key === 'ArrowRight') changeSlide(1);
    if (e.key === 'Escape') closeLightbox();
  }
});

let touchStartX = 0;
const lightboxEl = document.getElementById('lightbox');

lightboxEl.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

lightboxEl.addEventListener('touchend', e => {
  const touchEndX = e.changedTouches[0].screenX;
  if (touchEndX < touchStartX - 50) changeSlide(1); // Свайп вліво (наступне)
  if (touchEndX > touchStartX + 50) changeSlide(-1); // Свайп вправо (попереднє)
});

// Генерація файлу для календаря (Apple/Outlook)
async function downloadICS() {
  const eventData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "DTSTART:20261010T120000Z",
    "DTEND:20261010T200000Z",
    "SUMMARY:Весілля Олександра та Альони",
    "DESCRIPTION:Запрошуємо вас розділити з нами наш особливий день!",
    "LOCATION:Ресторан Сім-Сім, м. Харків",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const fileName = "wedding_invite.ics";
  const isChromeIOS = /CriOS/i.test(navigator.userAgent);

  // 1. Спроба через нативний шеринг (найкраще для Safari на iOS та Android Chrome)
  if (!isChromeIOS && navigator.share) {
    try {
      const file = new File([eventData], fileName, { type: "text/calendar" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Запрошення на весілля' });
        return;
      }
    } catch (err) {
      console.error('Sharing failed', err);
    }
  }

  // 2. Метод для Chrome на iOS та інших (Base64)
  // Використовуємо application/octet-stream, щоб змусити Chrome iOS запропонувати "Відкрити в..."
  const base64Data = btoa(unescape(encodeURIComponent(eventData)));
  const dataUri = `data:application/octet-stream;base64,${base64Data}`;
  
  if (isChromeIOS) {
    window.location.href = dataUri;
  } else {
    const blob = new Blob([eventData], { type: "text/calendar" });
    const link = document.createElement("a");
    if (window.URL) {
      link.href = window.URL.createObjectURL(blob);
    } else {
      link.href = dataUri;
    }
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  }

  // Підказка для користувача
  const toast = document.getElementById("toast");
  toast.textContent = "Файл збережено! Відкрийте його, щоб додати подію.";
  toast.className = "show";
  setTimeout(() => { 
    toast.className = toast.className.replace("show", ""); 
    // Повертаємо старий текст для копіювання адреси
    setTimeout(() => { toast.textContent = "Адресу скопійовано!"; }, 500);
  }, 4000);
}

// Функція запуску конфетті
function fireConfetti(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const colors = ['#ffe6d1', '#9d806e', '#724032', '#490018', '#320010', '#ffd700'];

  for (let i = 0; i < 100; i++) {
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

// Ініціалізація галереї (збираємо всі фото)
document.querySelectorAll('.gallery, .location-grid').forEach((galleryContainer) => {
    const imgs = Array.from(galleryContainer.querySelectorAll('img.view-img, img.style-img'));
    const srcArray = imgs.map(img => img.dataset.src || img.src);
    
    imgs.forEach((img, index) => {
        img.addEventListener('click', () => openLightbox(index, srcArray));
    });
});

// Lazy loading для изображений
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
    const toast = document.getElementById("toast");
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Логіка кнопки "Вгору"
const scrollBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
});

scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Покращена зупинка музики для мобільних (згортання, блокування екрану)
function handleBackgroundMusic() {
  if (document.hidden || document.visibilityState === 'hidden') {
    audio.pause();
  } else if (isPlaying) {
    audio.play();
  }
}

document.addEventListener("visibilitychange", handleBackgroundMusic);
window.addEventListener("pagehide", handleBackgroundMusic); // Додаткова перевірка для iOS/Android