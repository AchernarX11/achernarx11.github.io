/* ============================================================
   main.js — 脚本入口
   职责：标记 JS 可用、按需初始化各功能模块
   约定：模块各自负责单一功能，入口只做编排
   ============================================================ */

(function () {
  'use strict';

  // 标记 JS 可用：滚动淡入等增强样式只在此时生效，脚本失效时内容依然可见
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', () => {
    MenuModule.init();
    ScrollModule.init();
    FormModule.init();
  });
})();