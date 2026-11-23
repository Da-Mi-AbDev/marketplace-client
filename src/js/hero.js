import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

import 'swiper/css';

const heroSwiper = new Swiper('.hero-slider', {
  modules: [Navigation],

  slidesPerView: 1,
  spaceBetween: 0,
  speed: 650,
  loop: false,

  navigation: {
    nextEl: '.hero-arrow-next',
    prevEl: '.hero-arrow-prev',
  },
});
