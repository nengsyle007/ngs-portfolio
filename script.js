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
