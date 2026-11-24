import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
new Swiper('.events-swiper', {
  modules: [Navigation, Pagination], 
    spaceBetween: 24,
    pagination: {
    el: '.events-pagination',
      type: 'bullets',
      clickable: true,
      renderBullet: function (_, className) {
          return '<span class="' + className + '">' + '</span>';
        },
  },
    navigation: {
    nextEl: '.events-arrow-next',
    prevEl: '.events-arrow-prev',
  },
    breakpoints: {
    320: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
      },
      1440: {
        slidesPerView: 3,
    }
  }
});