const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".main-nav");
const revealItems = document.querySelectorAll("[data-reveal]");
const slider = document.querySelector("[data-slider]");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState);

const revealOnView = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealOnView.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25 }
);

revealItems.forEach((item) => revealOnView.observe(item));

if (slider) {
  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-dot]"));
  const progressFill = slider.querySelector(".slider-progress-fill");
  const mediaItems = slider.querySelectorAll(".slide-media");
  const supportedExtensions = ["jpg", "jpeg", "png", "webp"];
  const autoplayDelay = 5200;
  let currentIndex = 0;
  let autoplayTimer = null;

  const resetProgress = () => {
    if (!progressFill) return;
    progressFill.classList.remove("run");
    progressFill.style.setProperty("--duration", `${autoplayDelay}ms`);
    void progressFill.offsetWidth;
    progressFill.classList.add("run");
  };

  const setActiveSlide = (nextIndex) => {
    currentIndex = nextIndex;

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === currentIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });

    resetProgress();
  };

  const startAutoplay = () => {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setActiveSlide(nextIndex);
    }, autoplayDelay);
  };

  const stopAutoplay = () => {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
    if (progressFill) {
      progressFill.classList.remove("run");
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setActiveSlide(index);
      startAutoplay();
    });
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }
    startAutoplay();
    resetProgress();
  });

  mediaItems.forEach((item) => {
    const image = item.querySelector("img");
    if (!image) return;

    const loadNextExtension = () => {
      const basePath = image.dataset.base;
      if (!basePath) {
        item.classList.add("is-fallback");
        return;
      }

      const currentExtIndex = Number(image.dataset.extIndex || "0");
      const nextExtIndex = currentExtIndex + 1;

      if (nextExtIndex >= supportedExtensions.length) {
        item.classList.add("is-fallback");
        return;
      }

      image.dataset.extIndex = String(nextExtIndex);
      image.src = `${basePath}.${supportedExtensions[nextExtIndex]}`;
    };

    image.addEventListener("error", () => {
      loadNextExtension();
    });

    image.addEventListener("load", () => {
      item.classList.remove("is-fallback");
    });
  });

  setActiveSlide(0);
  startAutoplay();
}
