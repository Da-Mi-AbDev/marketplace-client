import Swiper from 'swiper';
import { Navigation, Pagination, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export function initFeedbacksSlider() {
  const sliderEl = document.querySelector('.feedbacks-swiper');
  if (!sliderEl) return;

  return new Swiper(sliderEl, {
    modules: [Navigation, Pagination, Keyboard, A11y],
    spaceBetween: 24,
    slidesPerView: 1,
    watchOverflow: true,
    grabCursor: true,
    navigation: {
      prevEl: '.feedbacks-arrow-prev',
      nextEl: '.feedbacks-arrow-next',
    },
    pagination: {
      el: '.feedbacks-pagination',
      clickable: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    a11y: {
      enabled: true,
      prevSlideMessage: 'Previous feedback',
      nextSlideMessage: 'Next feedback',
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1440: { slidesPerView: 3 },
    },
  });
}
