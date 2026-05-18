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
  const slides = Array.from(lifeSlider.querySelectorAll("[data-life-slide]"));
  const dots = Array.from(lifeSlider.querySelectorAll("[data-life-dot]"));
  const prev = lifeSlider.querySelector("[data-life-prev]");
  const next = lifeSlider.querySelector("[data-life-next]");
  const seconds = lifeSlider.querySelector("[data-life-seconds]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intervalSeconds = 5;
  let activeIndex = 0;
  let timer;
  let countdown;
  let secondsLeft = intervalSeconds;

  const updateSeconds = () => {
    if (seconds) {
      seconds.textContent = String(secondsLeft);
    }
  };

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    secondsLeft = intervalSeconds;
    updateSeconds();

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
  };

  const startAutoPlay = () => {
    if (!prefersReducedMotion) {
      stopAutoPlay();
      secondsLeft = intervalSeconds;
      updateSeconds();
      countdown = window.setInterval(() => {
        secondsLeft = Math.max(1, secondsLeft - 1);
        updateSeconds();
      }, 1000);
      timer = window.setInterval(() => showSlide(activeIndex + 1), intervalSeconds * 1000);
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
