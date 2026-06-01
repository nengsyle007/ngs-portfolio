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
