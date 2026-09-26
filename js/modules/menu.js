const WEB3FORMS_ACCESS_KEY = '';/* ============================================================
   menu.js — 移动端导航菜单
   职责：开关菜单、焦点管理、Esc 与点击外部关闭、点击链接后收起
   约定：不挂载到 window，仅通过模块返回值暴露 init
   ============================================================ */

const MenuModule = (() => {
  'use strict';

  const SELECTOR_TOGGLE = '.nav__toggle';
  const SELECTOR_MENU = '#nav-menu';
  const DESKTOP_QUERY = '(min-width: 1024px)';

  let toggle = null;
  let toggleLabel = null;
  let menu = null;
  let links = [];

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  /** 同步按钮 ARIA 状态、无障碍文案与面板 data 属性（样式仅依赖 data-open） */
  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.dataset.open = String(open);
    if (toggleLabel) {
      toggleLabel.textContent = open ? '收起导航菜单' : '展开导航菜单';
    }
  }

  function close(returnFocus) {
    setOpen(false);
    if (returnFocus) {
      toggle.focus();
    }
  }

  function onToggleClick() {
    const open = !isOpen();
    setOpen(open);
    // 展开后把焦点交给第一个菜单项，键盘用户无需再 Tab 一次
    if (open && links.length) {
      links[0].focus();
    }
  }

  function onDocumentClick(event) {
    if (!isOpen()) {
      return;
    }
    if (menu.contains(event.target) || toggle.contains(event.target)) {
      return;
    }
    close(false);
  }

  function onKeydown(event) {
    if (event.key === 'Escape' && isOpen()) {
      close(true);
    }
  }

  /** 视口切到桌面布局时重置状态，避免状态与样式不同步 */
  function onViewportChange(event) {
    if (event.matches) {
      setOpen(false);
    }
  }

  function init() {
    toggle = document.querySelector(SELECTOR_TOGGLE);
    menu = document.querySelector(SELECTOR_MENU);
    if (!toggle || !menu) {
      return;
    }

    links = Array.from(menu.querySelectorAll('a[href]'));
    toggleLabel = toggle.querySelector('.visually-hidden');

    toggle.addEventListener('click', onToggleClick);
    links.forEach((link) => link.addEventListener('click', () => close(false)));
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeydown);

    window.matchMedia(DESKTOP_QUERY).addEventListener('change', onViewportChange);
  }

  return { init };
})();