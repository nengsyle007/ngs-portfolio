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
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let timer;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;

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
  };

  const startAutoPlay = () => {
    if (!prefersReducedMotion) {
      stopAutoPlay();
      timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
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
