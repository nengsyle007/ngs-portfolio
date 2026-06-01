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
  let trackIndex = 0;
  let trackSlides = slides;

  if (track && slides.length > 1) {
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    [firstClone, lastClone].forEach((clone) => {
      clone.classList.remove("is-active");
      clone.removeAttribute("data-life-slide");
      clone.setAttribute("aria-hidden", "true");
    });

    track.append(firstClone);
    track.insertBefore(lastClone, track.firstElementChild);
    trackSlides = Array.from(track.children);
    trackIndex = 1;
    track.style.transition = "none";
    track.style.transform = "translate3d(-100%, 0, 0)";
    track.offsetHeight;
    track.style.transition = "";
  }

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

  const updateTrackSlideState = () => {
    trackSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === trackIndex);
    });
  };

  const setTrackPosition = (index, shouldAnimate = true) => {
    if (!track) {
      return;
    }

    track.style.transition = shouldAnimate ? "" : "none";
    track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;

    if (!shouldAnimate) {
      track.offsetHeight;
      window.requestAnimationFrame(() => {
        track.style.transition = "";
      });
    }
  };

  const showSlide = (index) => {
    const normalizedIndex = (index + slides.length) % slides.length;
    activeIndex = normalizedIndex;
    slideStartedAt = Date.now();
    secondsLeft = intervalSeconds;
    updateSeconds();
    updateProgress();

    if (track) {
      if (index >= slides.length) {
        trackIndex = slides.length + 1;
      } else if (index < 0) {
        trackIndex = 0;
      } else {
        trackIndex = normalizedIndex + (slides.length > 1 ? 1 : 0);
      }

      setTrackPosition(trackIndex);
    }

    updateTrackSlideState();

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
  };

  track?.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "transform" || slides.length <= 1) {
      return;
    }

    if (trackIndex === slides.length + 1) {
      trackIndex = 1;
      setTrackPosition(trackIndex, false);
      updateTrackSlideState();
    } else if (trackIndex === 0) {
      trackIndex = slides.length;
      setTrackPosition(trackIndex, false);
      updateTrackSlideState();
    }
  });

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
  const audioElement = document.querySelector("[data-portfolio-audio]");
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let audioContext;
  let masterGain;
  let welcomeNodes = [];
  let soundEnabled = false;
  let useGeneratedFallback = !audioElement;

  const updateSoundButton = () => {
    soundToggle.classList.toggle("is-on", soundEnabled);
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
    if (soundLabel) {
      soundLabel.textContent = soundEnabled ? "Sound On" : "Sound Off";
    }
  };

  if (audioElement) {
    audioElement.volume = 0.32;
    audioElement.addEventListener("error", () => {
      useGeneratedFallback = true;
    });
  }

  const ensureAudio = () => {
    if (!AudioContextClass) {
      return false;
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.18;
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return true;
  };

  const startAudioFile = async () => {
    if (!audioElement || useGeneratedFallback || document.hidden) {
      return false;
    }

    try {
      audioElement.loop = false;
      audioElement.volume = 0.32;
      audioElement.currentTime = 0;
      await audioElement.play();
      return true;
    } catch {
      useGeneratedFallback = true;
      return false;
    }
  };

  const startWelcomeSound = () => {
    if (!audioContext || !masterGain || document.hidden) {
      return;
    }

    const now = audioContext.currentTime;
    const notes = [
      { delay: 0, duration: 0.52, frequency: 523.25, peak: 0.38 },
      { delay: 0.14, duration: 0.56, frequency: 659.25, peak: 0.32 },
      { delay: 0.3, duration: 0.68, frequency: 783.99, peak: 0.28 },
      { delay: 0.52, duration: 0.78, frequency: 1046.5, peak: 0.16 },
    ];

    welcomeNodes = notes.map(({ delay, duration, frequency, peak }) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const startAt = now + delay;
      const endAt = startAt + duration;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(peak, startAt + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, endAt);

      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(startAt);
      oscillator.stop(endAt + 0.04);
      oscillator.addEventListener("ended", () => {
        welcomeNodes = welcomeNodes.filter((node) => node.oscillator !== oscillator);
      });

      return { oscillator, gain };
    });
  };

  const stopSound = () => {
    if (audioElement) {
      audioElement.pause();
    }

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;
    welcomeNodes.forEach(({ oscillator, gain }) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0, now, 0.25);
      try {
        oscillator.stop(now + 0.32);
      } catch {
        // The welcome chime may already have finished naturally.
      }
    });
    welcomeNodes = [];
  };

  const startSound = async () => {
    stopSound();

    const startedAudioFile = await startAudioFile();
    if (startedAudioFile) {
      return;
    }

    if (!ensureAudio()) {
      soundEnabled = false;
      updateSoundButton();
      return;
    }

    startWelcomeSound();
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
