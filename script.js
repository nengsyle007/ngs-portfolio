const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const lifeSlider = document.querySelector("[data-life-slider]");

if (lifeSlider) {
  const track = lifeSlider.querySelector("[data-life-track]");
  const slides = Array.from(lifeSlider.querySelectorAll("[data-life-slide]"));
  const dots = Array.from(lifeSlider.querySelectorAll("[data-life-dot]"));
  const progressBars = Array.from(lifeSlider.querySelectorAll("[data-life-progress]"));
  const prev = lifeSlider.querySelector("[data-life-prev]");
  const next = lifeSlider.querySelector("[data-life-next]");
  const seconds = lifeSlider.querySelector("[data-life-seconds]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intervalSeconds = 5;
  const intervalMs = intervalSeconds * 1000;
  let activeIndex = 0;
  let timer;
  let countdown;
  let progressTimer;
  let slideStartedAt = Date.now();
  let secondsLeft = intervalSeconds;

  const updateSeconds = () => {
    if (seconds) {
      seconds.textContent = String(secondsLeft);
    }
  };

  const updateProgress = () => {
    const elapsed = Date.now() - slideStartedAt;
    const progress = prefersReducedMotion ? 1 : Math.min(elapsed / intervalMs, 1);

    progressBars.forEach((bar, index) => {
      bar.style.transform = `scaleX(${index === activeIndex ? progress : 0})`;
    });
  };

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slideStartedAt = Date.now();
    secondsLeft = intervalSeconds;
    updateSeconds();
    updateProgress();

    if (track) {
      track.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;
    }

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
  };

  const stopAutoPlay = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    if (countdown) {
      window.clearInterval(countdown);
    }
    if (progressTimer) {
      window.clearInterval(progressTimer);
    }
  };

  const startAutoPlay = () => {
    if (!prefersReducedMotion) {
      stopAutoPlay();
      slideStartedAt = Date.now();
      secondsLeft = intervalSeconds;
      updateSeconds();
      updateProgress();
      countdown = window.setInterval(() => {
        secondsLeft = Math.max(1, secondsLeft - 1);
        updateSeconds();
      }, 1000);
      progressTimer = window.setInterval(updateProgress, 80);
      timer = window.setInterval(() => showSlide(activeIndex + 1), intervalMs);
    }
  };

  prev?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startAutoPlay();
  });

  next?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startAutoPlay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startAutoPlay();
    });
  });

  lifeSlider.addEventListener("mouseenter", stopAutoPlay);
  lifeSlider.addEventListener("mouseleave", startAutoPlay);

  showSlide(0);
  startAutoPlay();
}

const soundToggle = document.querySelector("[data-sound-toggle]");

if (soundToggle) {
  const soundLabel = soundToggle.querySelector("[data-sound-label]");
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let audioContext;
  let masterGain;
  let noteTimer;
  let soundEnabled = false;
  let step = 0;
  const notes = [261.63, 329.63, 392.0, 493.88, 392.0, 329.63];

  const updateSoundButton = () => {
    soundToggle.classList.toggle("is-on", soundEnabled);
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
    if (soundLabel) {
      soundLabel.textContent = soundEnabled ? "Sound On" : "Sound Off";
    }
  };

  const ensureAudio = () => {
    if (!AudioContextClass) {
      return false;
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.045;
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return true;
  };

  const playNote = () => {
    if (!audioContext || !masterGain || document.hidden) {
      return;
    }

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(notes[step % notes.length], now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.65);

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + 1.7);
    step += 1;
  };

  const stopSound = () => {
    if (noteTimer) {
      window.clearInterval(noteTimer);
      noteTimer = undefined;
    }
  };

  const startSound = () => {
    if (!ensureAudio()) {
      soundEnabled = false;
      updateSoundButton();
      return;
    }

    stopSound();
    playNote();
    noteTimer = window.setInterval(playNote, 1850);
  };

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    updateSoundButton();

    if (soundEnabled) {
      startSound();
    } else {
      stopSound();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopSound();
    } else if (soundEnabled) {
      startSound();
    }
  });

  updateSoundButton();
}
