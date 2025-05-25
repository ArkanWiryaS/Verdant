const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");
  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute(
    "class",
    isOpen ? "ri-close-line" : "ri-menu-3-line"
  );
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-3-line");
});

// Custom Carousel
document.addEventListener("DOMContentLoaded", function () {
  const carouselContainer = document.querySelector(".carousel__container");
  const destinationCards = document.querySelectorAll(".destination__card");
  const prevBtn = document.querySelector(".carousel__btn--prev");
  const nextBtn = document.querySelector(".carousel__btn--next");

  if (!carouselContainer || !destinationCards.length) return;

  let currentIndex = 0;
  let cardWidth;
  let cardsGap;
  let maxIndex;

  function calculateDimensions() {
    if (destinationCards.length > 0) {
      const cardStyle = window.getComputedStyle(destinationCards[0]);
      cardWidth = destinationCards[0].offsetWidth;
      cardsGap = parseInt(
        window.getComputedStyle(carouselContainer).columnGap || 16
      );
    } else {
      cardWidth = 300;
      cardsGap = 16;
    }

    const containerWidth = document.querySelector(".carousel").offsetWidth;
    const visibleCards =
      window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
    maxIndex = Math.max(0, destinationCards.length - visibleCards);
  }

  function updateCarousel() {
    if (!carouselContainer) return;
    calculateDimensions();
    const translateX = -currentIndex * (cardWidth + cardsGap);
    carouselContainer.style.transform = `translateX(${translateX}px)`;
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
  }

  calculateDimensions();
  updateCarousel();

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateCarousel();
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      updateCarousel();
    });
  }

  window.addEventListener("resize", () => {
    calculateDimensions();
    currentIndex = Math.min(currentIndex, maxIndex);
    updateCarousel();
  });
});

// Hide and show navigation on scroll
const nav = document.querySelector("nav");
let lastScrollTop = 0;

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (scrollTop <= 10) {
    nav.classList.remove("hide");
    nav.classList.add("show");
    return;
  }

  if (scrollTop > lastScrollTop) {
    nav.classList.remove("show");
    nav.classList.add("hide");
  } else {
    nav.classList.remove("hide");
    nav.classList.add("show");
  }

  lastScrollTop = scrollTop;
});
