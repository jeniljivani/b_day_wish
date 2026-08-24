(function () {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const setupScreen = document.getElementById("setupScreen");
  const birthdayPage = document.getElementById("birthdayPage");
  const birthdayForm = document.getElementById("birthdayForm");
  const girlName = document.getElementById("girlName");
  const girlPhoto = document.getElementById("girlPhoto");
  const birthDate = document.getElementById("birthDate");
  const photoPreview = document.getElementById("photoPreview");
  const formError = document.getElementById("formError");
  const heroName = document.getElementById("heroName");
  const heroTitleLead = document.getElementById("heroTitleLead");
  const messageName = document.getElementById("messageName");
  const finalName = document.getElementById("finalName");
  const surpriseName = document.getElementById("surpriseName");
  const birthdayPhoto = document.getElementById("birthdayPhoto");
  const cakeAge = document.getElementById("cakeAge");
  const cakeTopperText = document.getElementById("cakeTopperText");
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const countdownEl = document.getElementById("countdown");
  const birthdayMessage = document.getElementById("birthdayMessage");
  const birthdayNameFinal = document.getElementById("birthdayNameFinal");
  const wishModal = document.getElementById("wishModal");
  const giftModal = document.getElementById("giftModal");
  const surpriseModal = document.getElementById("surpriseModal");
  const birthdayMusic = document.getElementById("birthdayMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicText = document.getElementById("musicText");
  const musicIcon = document.getElementById("musicIcon");
  const editDetails = document.getElementById("editDetails");
  const hourHand = document.querySelector(".hour-hand");
  const minuteHand = document.querySelector(".minute-hand");
  const secondHand = document.querySelector(".second-hand");

  const STORAGE_KEY = "luxuryBirthdayData";
  const MAX_PHOTO_BYTES = 1200000;

  let birthdayData = { name: "", birthDate: "", photo: "" };
  let countdownTimer = 0;
  let clockTimer = 0;
  let alreadyCelebrated = false;
  let musicPlaying = false;
  let lastFocus = null;
  let revealObserver = null;
  let confettiRaf = 0;
  let confettiPieces = [];
  let resizeTimer = 0;

  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || reduceMotion;
  }

  function setFormError(message) {
    if (!formError) return;
    if (!message) {
      formError.hidden = true;
      formError.textContent = "";
      return;
    }
    formError.hidden = false;
    formError.textContent = message;
  }

  function saveData() {
    try {
      const payload = {
        name: birthdayData.name,
        birthDate: birthdayData.birthDate,
        photo: birthdayData.photo || ""
      };

      if (payload.photo && payload.photo.length > MAX_PHOTO_BYTES) {
        payload.photo = "";
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            name: birthdayData.name,
            birthDate: birthdayData.birthDate,
            photo: ""
          })
        );
      } catch (ignored) {
        /* storage unavailable */
      }
    }
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      if (!parsed || !parsed.name || !parsed.birthDate) return false;
      birthdayData = {
        name: String(parsed.name),
        birthDate: String(parsed.birthDate),
        photo: parsed.photo ? String(parsed.photo) : ""
      };
      return true;
    } catch (error) {
      return false;
    }
  }

  function showPhotoPreview(src) {
    photoPreview.classList.add("has-photo");
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Photo preview";
    photoPreview.replaceChildren(img);
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = function () {
        const max = 900;
        let width = image.naturalWidth;
        let height = image.naturalHeight;

        if (width > max || height > max) {
          const scale = max / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const draw = document.createElement("canvas");
        draw.width = width;
        draw.height = height;
        const context = draw.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(draw.toDataURL("image/jpeg", 0.78));
      };

      image.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read image"));
      };

      image.src = url;
    });
  }

  girlPhoto.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      this.value = "";
      return;
    }

    setFormError("");

    compressImage(file)
      .then(function (dataUrl) {
        birthdayData.photo = dataUrl;
        showPhotoPreview(dataUrl);
      })
      .catch(function () {
        const reader = new FileReader();
        reader.onload = function (event) {
          birthdayData.photo = event.target.result;
          showPhotoPreview(birthdayData.photo);
        };
        reader.readAsDataURL(file);
      });
  });

  birthdayForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = girlName.value.trim();
    const date = birthDate.value;

    if (!name) {
      setFormError("Please enter her name.");
      girlName.focus();
      return;
    }

    if (!date) {
      setFormError("Please select her birthday.");
      birthDate.focus();
      return;
    }

    setFormError("");
    birthdayData.name = name;
    birthdayData.birthDate = date;
    saveData();
    openBirthdayPage();
  });

  function openBirthdayPage() {
    setupScreen.classList.add("hidden");
    birthdayPage.classList.remove("hidden");
    alreadyCelebrated = false;
    applyPersonalization();
    startCountdown();
    calculateAge();
    updateCakeTopper();
    createParticles();
    startClock();
    window.setTimeout(setupRevealAnimations, 200);
    window.scrollTo(0, 0);
  }

  function returnToSetup() {
    closeAllModals();
    stopCountdown();
    stopClock();
    alreadyCelebrated = false;
    birthdayPage.classList.add("hidden");
    setupScreen.classList.remove("hidden");
    window.scrollTo(0, 0);
    girlName.focus();
  }

  editDetails.addEventListener("click", returnToSetup);

  function applyPersonalization() {
    const name = birthdayData.name;
    const today = isBirthdayToday();

    heroName.textContent = name;
    messageName.textContent = name;
    finalName.textContent = name;
    surpriseName.textContent = name;
    birthdayNameFinal.textContent = name;
    birthdayPhoto.alt = name ? "Portrait of " + name : "Birthday portrait";

    if (heroTitleLead) {
      heroTitleLead.textContent = today ? "HAPPY" : "ADVANCE HAPPY";
    }

    if (birthdayData.photo) {
      birthdayPhoto.src = birthdayData.photo;
    } else {
      birthdayPhoto.src = createFallbackImage(name);
    }
  }

  function escapeXml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;"
      })[char];
    });
  }

  function createFallbackImage(name) {
    const initial = escapeXml(
      (name && name.charAt(0) ? name.charAt(0) : "?").toUpperCase()
    );

    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000">' +
      "<defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">" +
      '<stop offset="0%" stop-color="#351141"/>' +
      '<stop offset="100%" stop-color="#0b030e"/>' +
      "</linearGradient></defs>" +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      '<text x="50%" y="48%" text-anchor="middle" fill="#f8e6a0" font-family="serif" font-size="90">' +
      initial +
      "</text>" +
      '<text x="50%" y="57%" text-anchor="middle" fill="#bcaebf" font-family="Arial" font-size="22" letter-spacing="5">BIRTHDAY GIRL</text>' +
      "</svg>";

    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function parseBirthDate() {
    return new Date(birthdayData.birthDate + "T00:00:00");
  }

  function isBirthdayToday() {
    const birth = parseBirthDate();
    if (Number.isNaN(birth.getTime())) return false;
    const now = new Date();
    return (
      birth.getMonth() === now.getMonth() &&
      birth.getDate() === now.getDate()
    );
  }

  function calculateAge() {
    const birth = parseBirthDate();
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age -= 1;
    }

    if (age < 0) age = 0;
    cakeAge.textContent = String(age).padStart(2, "0");
  }

  function getNextBirthday() {
    const birth = parseBirthDate();
    const now = new Date();
    let next = new Date(
      now.getFullYear(),
      birth.getMonth(),
      birth.getDate(),
      0,
      0,
      0
    );

    if (isBirthdayToday()) {
      return next;
    }

    if (next.getTime() <= now.getTime()) {
      next = new Date(
        now.getFullYear() + 1,
        birth.getMonth(),
        birth.getDate(),
        0,
        0,
        0
      );
    }

    return next;
  }

  function updateCakeTopper() {
    if (!cakeTopperText) return;

    if (isBirthdayToday()) {
      cakeTopperText.textContent = "TODAY";
      return;
    }

    const difference = getNextBirthday().getTime() - Date.now();
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
    cakeTopperText.textContent = days <= 1 ? "TOMORROW" : "SOON";
  }

  function stopCountdown() {
    window.clearInterval(countdownTimer);
    countdownTimer = 0;
  }

  function startCountdown() {
    stopCountdown();
    updateCountdown();
    countdownTimer = window.setInterval(updateCountdown, 1000);
  }

  function showBirthdayCelebration() {
    countdownEl.classList.add("hidden");
    birthdayMessage.classList.remove("hidden");

    if (!alreadyCelebrated) {
      alreadyCelebrated = true;
      launchConfetti(280);
    }
  }

  function updateCountdown() {
    if (isBirthdayToday()) {
      showBirthdayCelebration();
      updateCakeTopper();
      return;
    }

    alreadyCelebrated = false;
    countdownEl.classList.remove("hidden");
    birthdayMessage.classList.add("hidden");

    const difference = getNextBirthday().getTime() - Date.now();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    daysEl.textContent = String(Math.max(days, 0)).padStart(2, "0");
    hoursEl.textContent = String(Math.max(hours, 0)).padStart(2, "0");
    minutesEl.textContent = String(Math.max(minutes, 0)).padStart(2, "0");
    secondsEl.textContent = String(Math.max(seconds, 0)).padStart(2, "0");
    updateCakeTopper();
  }

  document.getElementById("wishButton").addEventListener("click", function () {
    openModal(wishModal);
    launchConfetti(80);
  });

  document.getElementById("modalWishButton").addEventListener("click", function () {
    const button = this;
    closeModal(wishModal);
    createHeartBurst();
    launchConfetti(150);
    button.textContent = "YOUR WISH IS ON ITS WAY ✦";
    window.setTimeout(function () {
      button.textContent = "I MADE MY WISH ♡";
    }, 2500);
  });

  const giftMessages = [
    {
      title: "A Little Happiness ♡",
      text: "May your days be filled with tiny moments that make your heart smile for no reason. You deserve all the happiness in the world."
    },
    {
      title: "The Biggest Wish ✨",
      text: "May every dream you quietly keep in your heart find its way into your life. May this new chapter be your most beautiful one yet."
    },
    {
      title: "For The Birthday Girl 💖",
      text: "Never forget how special you are. Keep shining, keep smiling, and never stop believing in the beautiful person you are becoming."
    }
  ];

  const giftTitle = document.getElementById("giftTitle");
  const giftText = document.getElementById("giftText");

  document.querySelectorAll(".gift").forEach(function (gift, index) {
    gift.addEventListener("click", function () {
      const message = giftMessages[index];
      if (!message) return;
      giftTitle.textContent = message.title;
      giftText.textContent = message.text;
      openModal(giftModal);
      launchConfetti(60);
      createHeartBurst();
    });
  });

  document.getElementById("giftContinue").addEventListener("click", function () {
    closeModal(giftModal);
    launchConfetti(100);
  });

  document.getElementById("surpriseButton").addEventListener("click", function () {
    openModal(surpriseModal);
    launchConfetti(200);
    createHeartBurst();
  });

  document.getElementById("closeSurpriseBottom").addEventListener("click", function () {
    closeModal(surpriseModal);
  });

  function getFocusable(modal) {
    return Array.prototype.slice.call(
      modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (node) {
      return !node.disabled && node.offsetParent !== null;
    });
  }

  function openModal(modal) {
    lastFocus = document.activeElement;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    const focusable = getFocusable(modal);
    if (focusable[0]) focusable[0].focus();
  }

  function closeModal(modal) {
    modal.classList.remove("active");
    if (!document.querySelector(".modal.active")) {
      document.body.style.overflow = "";
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }
  }

  function closeAllModals() {
    document.querySelectorAll(".modal.active").forEach(closeModal);
  }

  document.getElementById("closeWish").addEventListener("click", function () {
    closeModal(wishModal);
  });
  document.getElementById("closeGift").addEventListener("click", function () {
    closeModal(giftModal);
  });
  document.getElementById("closeSurprise").addEventListener("click", function () {
    closeModal(surpriseModal);
  });

  document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
    backdrop.addEventListener("click", function () {
      closeModal(this.parentElement);
    });
  });

  document.addEventListener("keydown", function (event) {
    const activeModal = document.querySelector(".modal.active");

    if (event.key === "Escape" && activeModal) {
      closeModal(activeModal);
      return;
    }

    if (event.key !== "Tab" || !activeModal) return;

    const nodes = getFocusable(activeModal);
    if (!nodes.length) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.getElementById("startMagic").addEventListener("click", function () {
    document.querySelector(".portrait-section").scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
    createHeartBurst();
  });

  function setMusicUi(isOn) {
    musicPlaying = isOn;
    musicToggle.classList.toggle("active", isOn);
    musicToggle.setAttribute("aria-pressed", isOn ? "true" : "false");
    musicIcon.textContent = isOn ? "♫" : "♪";
    musicText.textContent = isOn ? "MUSIC ON" : "MUSIC OFF";
  }

  musicToggle.addEventListener("click", function () {
    if (!musicPlaying) {
      const playAttempt = birthdayMusic.play();
      if (playAttempt && typeof playAttempt.then === "function") {
        playAttempt
          .then(function () {
            setMusicUi(true);
          })
          .catch(function () {
            musicText.textContent = "ADD MP3";
            musicToggle.setAttribute(
              "aria-label",
              "Music file missing. Add birthday-music.mp3 next to this page."
            );
          });
      }
    } else {
      birthdayMusic.pause();
      setMusicUi(false);
    }
  });

  function createParticles() {
    const container = document.getElementById("particles");
    container.replaceChildren();
    if (prefersReducedMotion()) return;

    const count = 24;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = 8 + Math.random() * 15 + "s";
      particle.style.animationDelay = -Math.random() * 15 + "s";
      particle.style.opacity = String(Math.random());
      particle.style.transform = "scale(" + (0.5 + Math.random()) + ")";
      fragment.appendChild(particle);
    }

    container.appendChild(fragment);
  }

  function createHeartBurst() {
    if (prefersReducedMotion()) return;

    const symbols = ["♡", "♥", "✦", "✧", "❤"];

    for (let i = 0; i < 14; i += 1) {
      const heart = document.createElement("div");
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      heart.setAttribute("aria-hidden", "true");
      heart.style.position = "fixed";
      heart.style.left = "50%";
      heart.style.top = "50%";
      heart.style.zIndex = "3000";
      heart.style.pointerEvents = "none";
      heart.style.color = Math.random() > 0.5 ? "#ffe59a" : "#e9a9e6";
      heart.style.fontSize = 12 + Math.random() * 25 + "px";
      heart.style.transition = "all 1.4s cubic-bezier(.1,.8,.2,1)";
      document.body.appendChild(heart);

      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 280;

      window.setTimeout(function () {
        heart.style.transform =
          "translate(" +
          Math.cos(angle) * distance +
          "px, " +
          Math.sin(angle) * distance +
          "px) rotate(" +
          Math.random() * 360 +
          "deg) scale(.2)";
        heart.style.opacity = "0";
      }, 20);

      window.setTimeout(function () {
        heart.remove();
      }, 1500);
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 150);
  });

  resizeCanvas();

  function launchConfetti(amount) {
    if (!ctx || prefersReducedMotion()) return;
    const count = amount || 150;
    const colors = ["#ffe69a", "#c9932d", "#8e3aa8", "#ffffff", "#e7b65c", "#b76ccf"];

    for (let i = 0; i < count; i += 1) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.4,
        size: 4 + Math.random() * 8,
        speed: 2 + Math.random() * 5,
        drift: -2 + Math.random() * 4,
        rotation: Math.random() * Math.PI,
        rotationSpeed: -0.15 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1
      });
    }

    if (!confettiRaf) {
      confettiRaf = window.requestAnimationFrame(animateConfetti);
    }
  }

  function animateConfetti() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiPieces.forEach(function (piece) {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.rotation += piece.rotationSpeed;
      piece.opacity -= 0.0015;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.globalAlpha = Math.max(piece.opacity, 0);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
      ctx.restore();
    });

    confettiPieces = confettiPieces.filter(function (piece) {
      return piece.y < canvas.height + 30 && piece.opacity > 0;
    });

    if (confettiPieces.length) {
      confettiRaf = window.requestAnimationFrame(animateConfetti);
    } else {
      confettiRaf = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function setupRevealAnimations() {
    if (revealObserver) {
      revealObserver.disconnect();
    }

    const revealElements = document.querySelectorAll(".reveal");

    if (prefersReducedMotion()) {
      revealElements.forEach(function (element) {
        element.classList.add("visible");
      });
      return;
    }

    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  }

  function updateLiveClock() {
    if (!hourHand || !minuteHand || !secondHand) return;

    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();
    const secondDegree = seconds * 6;
    const minuteDegree = minutes * 6 + seconds * 0.1;
    const hourDegree = (hours % 12) * 30 + minutes * 0.5;

    secondHand.style.transform = "translateX(-50%) rotate(" + secondDegree + "deg)";
    minuteHand.style.transform = "translateX(-50%) rotate(" + minuteDegree + "deg)";
    hourHand.style.transform = "translateX(-50%) rotate(" + hourDegree + "deg)";
  }

  function startClock() {
    stopClock();
    updateLiveClock();
    clockTimer = window.setInterval(updateLiveClock, 1000);
  }

  function stopClock() {
    window.clearInterval(clockTimer);
    clockTimer = 0;
  }

  document.addEventListener("dblclick", function () {
    if (birthdayPage.classList.contains("hidden")) return;
    createHeartBurst();
  });

  (function init() {
    const hasData = loadData();
    if (!hasData) return;

    girlName.value = birthdayData.name;
    birthDate.value = birthdayData.birthDate;
    if (birthdayData.photo) {
      showPhotoPreview(birthdayData.photo);
    }
    openBirthdayPage();
  })();
})();
