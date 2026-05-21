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

  const setTrackPosition = (index, shouldAnimate = true) => {
    if (!track) {
      return;
    }

    track.style.transition = shouldAnimate ? "" : "none";
    track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;

    if (!shouldAnimate) {
      track.offsetHeight;
      track.style.transition = "";
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

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

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
    } else if (trackIndex === 0) {
      trackIndex = slides.length;
      setTrackPosition(trackIndex, false);
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
  let waterNodes = [];
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
      masterGain.gain.value = 0.11;
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return true;
  };

  const createNoiseBuffer = (durationSeconds) => {
    const sampleRate = audioContext.sampleRate;
    const frameCount = sampleRate * durationSeconds;
    const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    return buffer;
  };

  const startAudioFile = async () => {
    if (!audioElement || useGeneratedFallback || document.hidden) {
      return false;
    }

    try {
      audioElement.loop = true;
      audioElement.volume = 0.32;
      await audioElement.play();
      return true;
    } catch {
      useGeneratedFallback = true;
      return false;
    }
  };

  const startWaterSound = () => {
    if (!audioContext || !masterGain || document.hidden) {
      return;
    }

    const now = audioContext.currentTime;
    const source = audioContext.createBufferSource();
    const highpass = audioContext.createBiquadFilter();
    const lowpass = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    source.buffer = createNoiseBuffer(3);
    source.loop = true;

    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(180, now);
    highpass.Q.setValueAtTime(0.7, now);

    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(1150, now);
    lowpass.Q.setValueAtTime(0.45, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.8);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.18, now);
    lfoGain.gain.setValueAtTime(0.08, now);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(masterGain);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    source.start(now);
    lfo.start(now);
    waterNodes = [{ source, gain, lfo }];
  };

  const stopSound = () => {
    if (audioElement) {
      audioElement.pause();
    }

    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;
    waterNodes.forEach(({ source, gain, lfo }) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0, now, 0.25);
      source.stop(now + 0.9);
      lfo.stop(now + 0.9);
    });
    waterNodes = [];
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

    startWaterSound();
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
