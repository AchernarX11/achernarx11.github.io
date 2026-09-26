/* ============================================================
   scroll.js — 滚动相关增强
   职责：吸顶栏状态、当前区块高亮、滚动淡入、图片加载淡入
   说明：锚点平滑滚动由 CSS scroll-behavior 负责，此处不重复实现
   ============================================================ */

const ScrollModule = (() => {
  'use strict';

  const SELECTOR_HEADER = '.site-header';
  const SELECTOR_SECTION = 'main section[id]';
  const SELECTOR_NAV_LINK = '.nav__link';
  const SELECTOR_REVEAL = '.reveal';
  const SELECTOR_IMAGE = '.work-card__img, .about__portrait img, .shot__img';
  const SCROLL_THRESHOLD = 8;

  let header = null;

  function initHeaderState() {
    header = document.querySelector(SELECTOR_HEADER);
    if (!header) {
      return;
    }

    const sync = () => {
      header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    };

    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }

  /** 用 IntersectionObserver 判断当前所在区块，高亮对应导航项 */
  function initActiveLink() {
    const links = Array.from(document.querySelectorAll(SELECTOR_NAV_LINK));
    if (!links.length) {
      return;
    }

    const sections = new Map();
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') {
        return;
      }
      const section = document.querySelector(href);
      if (section) {
        sections.set(section, link);
      }
    });

    if (!sections.size) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          links.forEach((link) => link.classList.remove('is-active'));
          sections.get(entry.target).classList.add('is-active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((link, section) => observer.observe(section));
  }

  /** 区块进入视口时淡入上移（只动画 opacity / transform） */
  function initReveal() {
    const items = Array.from(document.querySelectorAll(SELECTOR_REVEAL));
    if (!items.length) {
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, self) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add('is-visible');
          self.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    items.forEach((item) => observer.observe(item));
  }

  /** 图片加载完成后淡入；已缓存（complete）的直接显示 */
  function initImageFade() {
    const images = Array.from(document.querySelectorAll(SELECTOR_IMAGE));

    images.forEach((image) => {
      if (image.complete && image.naturalWidth > 0) {
        image.classList.add('is-loaded');
        return;
      }
      image.addEventListener('load', () => image.classList.add('is-loaded'), { once: true });
    });
  }

  function init() {
    initHeaderState();
    initActiveLink();
    initReveal();
    initImageFade();
  }

  return { init };
})();