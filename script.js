const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".main-nav");
const revealItems = document.querySelectorAll("[data-reveal]");
const slider = document.querySelector("[data-slider]");
const hero = document.querySelector(".hero-main");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

if (navToggle && navMenu) {
  const closeMenu = () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.classList.contains("open")) return;
    if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeMenu();
  });
}

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState);

if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add("revealed"));
} else {
  const revealOnView = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealOnView.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => revealOnView.observe(item));
}

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

if (hero && !reduceMotion) {
  const heroBg = hero.querySelector(".hero-bg-layer");
  const mistLayer = hero.querySelector(".hero-mist");
  const maxShift = 14;

  const handleHeroMove = (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (heroBg) {
      heroBg.style.transform = `translate3d(${x * maxShift}px, ${y * maxShift}px, 0) scale(1.03)`;
    }

    if (mistLayer) {
      mistLayer.style.transform = `translate3d(${x * 8}px, ${y * 8}px, 0)`;
    }
  };

  const resetHeroMove = () => {
    if (heroBg) {
      heroBg.style.transform = "translate3d(0, 0, 0) scale(1)";
    }

    if (mistLayer) {
      mistLayer.style.transform = "translate3d(0, 0, 0)";
    }
  };

  hero.addEventListener("pointermove", handleHeroMove);
  hero.addEventListener("pointerleave", resetHeroMove);
}

if (!reduceMotion && window.matchMedia("(min-width: 1025px)").matches) {
  const tiltTargets = document.querySelectorAll(".panel, .catalog-card, .media-card, .staff-card");
  const maxTilt = 5;

  tiltTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      target.style.transform = `perspective(900px) rotateX(${y * -maxTilt}deg) rotateY(${x * maxTilt}deg) translateY(-2px)`;
    });

    target.addEventListener("pointerleave", () => {
      target.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });
}
