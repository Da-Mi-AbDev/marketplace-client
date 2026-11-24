export function initMobileMenu() {
  const menuBtn = document.querySelector('.header-menu-btn');
  const menuCloseBtn = document.querySelector('.mobile-menu-close-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuList = document.querySelector('.mobile-menu-list');
  if (!menuBtn || !mobileMenu || !menuCloseBtn) {
    return;
  }
  const openMenu = () => {
    mobileMenu.classList.add('is-open');
    document.body.classList.add('no-scroll');
  };
  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  };
  menuBtn.addEventListener('click', openMenu);
  menuCloseBtn.addEventListener('click', closeMenu);
  const handelKeyDown = event => {
    if (mobileMenu.classList.contains('is-open') && event.key === 'Escape') {
      closeMenu();
    }
  };
  document.addEventListener('keydown', handelKeyDown);
  mobileMenuList.addEventListener('click', event => {
    if (event.target.classList.contains('mobile-menu-link')) {
      closeMenu();
    }
  });
}
