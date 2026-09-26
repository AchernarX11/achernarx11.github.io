# 作品集网站 · 项目规则

> 本文件是项目的唯一规则来源（Single Source of Truth）。
> 所有开发者与 AI 助手在编码、设计、提交前必须遵守本规则。
> 规则冲突时，以本文件为准。

---

## 目录

1. [项目定位](#1-项目定位)
2. [技术栈](#2-技术栈)
3. [架构规范](#3-架构规范)
4. [设计规范](#4-设计规范)
5. [交互规范](#5-交互规范)
6. [资源规范（切图优先）](#6-资源规范切图优先)
7. [代码规范](#7-代码规范)
8. [性能要求](#8-性能要求)
9. [可访问性](#9-可访问性)
10. [响应式断点](#10-响应式断点)
11. [必须包含的区块](#11-必须包含的区块)
12. [禁止事项](#12-禁止事项)
13. [交付标准](#13-交付标准)

---

## 1. 项目定位

个人作品集网站，用于展示设计/开发作品、个人简介与联系方式。
面向招聘方与潜在客户，强调 **视觉质感、加载性能、可访问性**。

核心目标：
- 3 秒内让访客理解「我是谁、我能做什么」
- 作品可快速浏览，细节可深入查看
- 联系方式触手可及

---

## 2. 技术栈

**固定，不擅自更换：**

- 纯 HTML5 + CSS3 + 原生 JavaScript（ES6+）
- 不使用框架（React / Vue 等），除非明确要求
- 不使用 CSS 预处理器，使用原生 CSS 变量
- 字体：Google Fonts（Inter / 或指定字体）
- 图标：优先内联 SVG，其次 Font Awesome CDN

---

## 3. 架构规范

### 3.1 目录结构（禁止随意堆放）

```text
/
├── index.html
├── css/
│ ├── reset.css # 全局重置
│ ├── variables.css # 设计变量（颜色/间距/圆角/阴影）
│ ├── base.css # 基础排版、通用元素
│ ├── layout.css # 容器、网格、导航、页脚骨架
│ ├── components.css # 按钮、卡片、标签等可复用组件
│ ├── pages.css # 各 section 专属样式
│ └── style.css # 主入口，按顺序 @import 上述文件
├── js/
│ ├── modules/ # 功能模块（menu.js / scroll.js / form.js）
│ └── main.js # 入口，初始化各模块
├── works/ # 作品详情页（一个作品一个 .html）
├── assets/
│ ├── icons/ # SVG 图标（切图产物）
│ ├── images/ # 内容图片（WebP + JPG fallback）
│ ├── video/ # 演示录屏（.mp4）
│ ├── docs/ # 可下载文档（.docx / .pdf）
│ └── favicon.ico
├── Content/ # 作品原始素材与说明（不直接对外引用）
└── README.md
```

### 3.2 架构原则

- **分层清晰**：变量 → 重置 → 基础 → 布局 → 组件 → 页面，禁止跨层反向依赖
- **单一职责**：一个 CSS 文件只负责一类样式，一个 JS 模块只负责一个功能
- **可复用优先**：重复出现的 UI 抽成组件类（如 `.btn`、`.card`），禁止复制粘贴
- **命名语义化**：类名用 kebab-case，采用 BEM 风格（`.card__title--active`）
- **禁止魔数**：尺寸、颜色、间距一律走变量，禁止散落硬编码
- **无全局污染**：JS 模块用 IIFE 或 ES Module 包裹，禁止挂载到 `window`

---

## 4. 设计规范

### 4.1 颜色

| 用途 | 值 |
|---|---|
| 背景主色 | `#f9f7f4`（暖白） |
| 卡片背景 | `#ffffff` |
| 主文字 | `#1e1e1e` |
| 次要文字 | `#5a5a5a` |
| 强调色 | `#c49a6c`（柔和金棕） |
| 边框 | `#e9e5e0` |

> 所有颜色必须定义为 CSS 变量，禁止硬编码在样式里散落使用。

### 4.2 排版

- 字体族：`'Inter', -apple-system, sans-serif`
- 标题字重 600–700，正文 400
- 行高：标题 1.2，正文 1.6
- 字号使用 `clamp()` 实现流体排版
- 段落最大宽度 ≤ 65ch，保证可读性

### 4.3 间距与圆角

- 使用 8px 基准网格（8 / 16 / 24 / 32 / 40 / 60 / 80）
- 卡片圆角：20px，按钮圆角：40px（胶囊形）
- 统一使用 `--radius` / `--radius-sm` 变量

### 4.4 阴影

- 默认：`0 4px 12px rgba(0, 0, 0, 0.03)`
- 悬浮：`0 12px 30px rgba(0, 0, 0, 0.06)`
- 禁止使用黑色重阴影（> 0.15 透明度）

---

## 5. 交互规范

> 核心目标：**平滑、自然、有反馈**。

### 5.1 动效原则

- 所有过渡统一使用 `--transition: all 0.3s ease`（或更细粒度变量）
- 时长范围 200–400ms：微交互 200ms，区块过渡 300–400ms
- 缓动优先 `ease` / `cubic-bezier(0.4, 0, 0.2, 1)`，禁止线性动画
- 只动画 `transform` 与 `opacity`，保证 60fps
- 悬浮位移 ≤ 6px，避免夸张跳动

### 5.2 交互反馈

- 按钮：`hover` 变色 + 微抬升，`active` 下压 1px
- 卡片：`hover` 抬升 6px + 阴影加深 + 边框变色
- 链接：下划线由左至右展开（`::after` + `width` 过渡）
- 导航：锚点滚动平滑（`scroll-behavior: smooth`），带 `scroll-margin-top` 避开吸顶栏
- 移动端菜单：滑入滑出用 `transform: translateY()`，禁用 `display` 切换
- 图片加载：淡入（`opacity` + `transition`），避免生硬弹出

### 5.3 无障碍动效

- 尊重 `prefers-reduced-motion`：命中时关闭所有非必要动画
- 焦点态必须可见：`:focus-visible` 有独立样式（描边或背景变化）
- 键盘可完成全部操作：Tab 顺序合理，Esc 可关闭菜单

---

## 6. 资源规范（切图优先）

> 核心目标：**页面中不出现 emoji 直接上屏，所有视觉符号走切图或 SVG。**

### 6.1 核心原则

- **禁止**在页面中直接使用 emoji 字符（如 🎨 ✨ 🚀）作为图标或装饰
- emoji 在不同系统渲染不一致，且无法控制颜色、尺寸、对齐
- 所有视觉符号必须走 **切图资源** 或 **内联 SVG**

### 6.2 切图流程

1. 设计稿中的图标/装饰元素，导出为 **SVG**（优先，可缩放可改色）
2. 复杂位图导出为 **WebP**（质量 80），附 **JPG/PNG** fallback
3. 图标统一放入 `assets/icons/`，命名如 `icon-arrow-right.svg`
4. 内容图片放入 `assets/images/`，命名如 `project-01.webp`
5. 图标优先内联 SVG，便于用 `currentColor` 继承文字颜色

### 6.3 图标使用方式

```html
<!-- 推荐：内联 SVG，可继承颜色 -->
<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M5 12h14M12 5l7 7-7 7"/>
</svg>

<!-- 备选：img 引入切图 -->
<img src="assets/icons/icon-arrow-right.svg" alt="" width="20" height="20">
```

### 6.4 禁止事项

- ❌ 禁止 <span>🎨</span> 这类 emoji 直接当图标
- ❌ 禁止用 emoji 当占位图、装饰符、列表符号
- ❌ 禁止用 CSS content: "🚀" 注入 emoji
- ❌ 禁止使用未压缩的原始设计稿大图

### 6.5 占位资源

- 无真实图片时，用纯色块 + 内联 SVG 线框占位，不要用 emoji
- 头像占位用 SVG 人像轮廓，不用 emoji

---

## 7. 代码规范

### 7.1 HTML

- 语义化标签：header / nav / main / section / article / footer
- 每个 section 必须有 id，便于锚点导航
- 图片必须有 alt，装饰性图片用 alt=""
- 表单控件必须有关联 <label>
- 首行加 <!DOCTYPE html>，lang="zh-CN" 或 "en"

### 7.2 CSS

- 移动优先，媒体查询用 min-width
- 类名用 kebab-case（如 .project-card）
- 禁止 !important（除非覆盖第三方库）
- 禁止内联样式（除动态计算值）
- 布局优先 Flexbox / Grid，避免 float
- 动画只使用 transform 和 opacity，保证 60fps

### 7.3 JavaScript

- 使用 const / let，禁用 var
- 事件监听用 addEventListener，禁止 onclick 属性
- DOM 查询缓存到变量，避免重复查询
- 所有交互必须支持键盘操作（Tab / Enter / Esc）
- 移动端菜单、平滑滚动等逻辑抽离为独立模块

---

## 8. 性能要求

- 首屏关键 CSS 内联，其余异步加载
- 图片使用 loading="lazy" + decoding="async"
- 图片优先 WebP，提供 fallback
- 字体用 font-display: swap
- 目标 Lighthouse 性能 ≥ 90

---

## 9. 可访问性

- 颜色对比度 ≥ WCAG AA（正文 4.5:1）
- 所有交互元素有 :focus-visible 样式
- 提供「跳到主内容」skip link
- 支持 prefers-reduced-motion，关闭动画
- 移动端菜单按钮带 aria-expanded / aria-controls

---

## 10. 响应式断点

```css
/* 移动优先 */
@media (min-width: 640px)  { /* 平板 */ }
@media (min-width: 1024px) { /* 桌面 */ }
@media (min-width: 1280px) { /* 大屏 */ }
```

- 容器最大宽度 1280px，居中
- 网格用 repeat(auto-fill, minmax(300px, 1fr)) 自适应

---

## 11. 必须包含的区块

- 导航栏 — sticky，含 logo 与锚点链接，移动端汉堡菜单
- Hero 区 — 姓名/头衔 + 一句话简介 + CTA 按钮
- 作品展示 — 卡片网格，每张含图、标签、标题、描述、链接
- 关于我 — 个人介绍 + 数据统计（年限/项目数）
- 联系方式 — 邮箱 + 社交图标链接
- 页脚 — 版权信息

---

## 12. 禁止事项

- ❌ 不使用 jQuery 或任何重型库
- ❌ 不使用 alert() / confirm() 等原生弹窗
- ❌ 不添加自动播放的音视频
- ❌ 不使用纯图片做按钮
- ❌ 不出现「Lorem ipsum」占位文本（用真实示意内容）
- ❌ 不提交含 console.log 的代码
- ❌ 禁止 emoji 直接上屏当图标/装饰
- ❌ 禁止未经切图的原始大图直接引用

---

## 13. 交付标准

- □ 所有链接可点击且无 404
- □ 移动端（375px）无横向滚动
- □ 键盘可完整浏览全站
- □ 无控制台报错
- □ HTML 通过 W3C 校验
- □ 页面中无 emoji 字符
- □ 所有图标为 SVG 或切图资源
- □ 架构分层清晰，无跨层反向依赖
- □ 交互过渡统一 200–400ms，无生硬跳变
- □ 代码注释清晰，关键逻辑有说明

---
## 14. 其他
-在开发过程中如果发现部分需求于本规则文档有冲突，及时提出，并且根据回答修改完善README文件

---
## 附录：新增约束速查

| 约束项 | 具体要求 |
| --- | --- |
| 规范架构 | 目录分层（变量→重置→基础→布局→组件→页面），单一职责，禁魔数，禁全局污染 |
| 交互平滑 | 统一 200–400ms 过渡，只动画 transform/opacity，hover 位移 ≤ 6px，尊重 reduced-motion |
| 禁 emoji 上屏 | 页面中不得出现 emoji 字符，含 content 注入，占位也不行 |
| 切图优先 | 图标走内联 SVG 或导出切图，图片走 WebP + fallback，命名规范入 assets/ |
