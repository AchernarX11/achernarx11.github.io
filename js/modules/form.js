/* ============================================================
   form.js — 联系表单：草稿暂存 + 校验 + 真实发送
   职责：把访客填的内容存成本地草稿、提交时校验、行内错误提示、发送与结果反馈
   说明：纯静态站没有自己的后端，发送借助 Web3Forms 转成邮件投递到站长邮箱
   ============================================================ */

const FormModule = (() => {
  'use strict';

  const SELECTOR_FORM = '#contact-form';
  const SELECTOR_STATUS = '#form-status';
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MIN_MESSAGE_LENGTH = 10;

  /* 收信密钥：去 https://web3forms.com 填一次你自己的邮箱，密钥会寄到那个邮箱，
     把拿到的那串字符粘到下面的引号里，表单就能真正把信发到你邮箱。
     留空时表单会直接提示「没接通」，不会给出假的成功反馈。 */
  const WEB3FORMS_ACCESS_KEY = '24c93884-7e36-4abc-b548-2a147f72aeba';
  const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
  const MAIL_SUBJECT = '来自作品集的留言';

  /* 草稿只存在访客自己的浏览器里，用途是刷新或误关页面后内容不丢，不会被上传 */
  const DRAFT_KEY = 'achernar:contact-draft';
  const DRAFT_DELAY = 400;

  const MESSAGES = {
    required: '这一项还没有填写',
    email: '请填写有效的邮箱地址，例如 name@example.com',
    message: `想聊的内容请至少写 ${MIN_MESSAGE_LENGTH} 个字，方便我知道怎么回`,
    invalid: '还有几项需要确认，请检查标出的字段。',
    restored: '已恢复你上次没发完的内容。',
    sending: '正在发送，请稍等…',
    success: '已收到你的信息，我会在 1 个工作日内回复。',
    failed: '发送失败了，可能是网络问题。请再试一次，或者直接写信到 3445229764@qq.com。',
    unconfigured: '表单还没接通，请直接写信到 3445229764@qq.com，那个我一定收得到。',
  };

  let form = null;
  let status = null;
  let statusText = null;
  let draftTimer = null;
  let isSubmitting = false;

  /** 只更新文案节点，保留状态区里的图标 */
  function setStatus(state, message) {
    status.dataset.state = state;
    statusText.textContent = message;
  }

  /** 把错误写入行内提示，并同步 aria-invalid / 容器状态类 */
  function setFieldError(field, message) {
    const errorEl = document.getElementById(`${field.id}-error`);
    const fieldBox = field.closest('.field');

    if (fieldBox) {
      fieldBox.classList.toggle('field--invalid', Boolean(message));
    }
    field.setAttribute('aria-invalid', message ? 'true' : 'false');

    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function validateField(field) {
    const value = field.value.trim();

    if (field.required && !value) {
      return MESSAGES.required;
    }
    if (field.type === 'email' && value && !EMAIL_PATTERN.test(value)) {
      return MESSAGES.email;
    }
    if (field.tagName === 'TEXTAREA' && value && value.length < MIN_MESSAGE_LENGTH) {
      return MESSAGES.message;
    }
    return '';
  }

  function getFields() {
    return Array.from(form.querySelectorAll('input, textarea'));
  }

  /** 按字段 id 收集内容，草稿与发送用的是同一份结构 */
  function collectValues() {
    const values = {};
    getFields().forEach((field) => {
      values[field.id] = field.value.trim();
    });
    return values;
  }

  /* 隐私模式下 localStorage 会直接抛异常，这里一律吞掉：存不上草稿不影响正常发送 */
  function saveDraft(values) {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      return;
    }
  }

  function readDraft() {
    try {
      return JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      return;
    }
  }

  /** 打开页面时把上次没发完的内容填回去 */
  function restoreDraft() {
    const draft = readDraft();
    if (!draft) {
      return;
    }

    let restored = false;
    getFields().forEach((field) => {
      const value = draft[field.id];
      if (typeof value === 'string' && value) {
        field.value = value;
        restored = true;
      }
    });

    if (restored) {
      setStatus('idle', MESSAGES.restored);
    }
  }

  /** 输入时防抖存草稿，避免每敲一个字就写一次 */
  function scheduleDraftSave() {
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(() => saveDraft(collectValues()), DRAFT_DELAY);
  }

  function validateAll() {
    let firstInvalid = null;

    getFields().forEach((field) => {
      const message = validateField(field);
      setFieldError(field, message);
      if (message && !firstInvalid) {
        firstInvalid = field;
      }
    });

    return firstInvalid;
  }

  async function sendByWeb3Forms(values) {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: MAIL_SUBJECT,
        from_name: 'Achernar 的作品集',
        name: values.name,
        email: values.email,
        replyto: values.email,
        message: values.message,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();

    // 发送期间忽略重复点击，否则同一封信会被投递多次
    if (isSubmitting) {
      return;
    }

    const firstInvalid = validateAll();
    if (firstInvalid) {
      setStatus('error', MESSAGES.invalid);
      firstInvalid.focus();
      return;
    }

    if (!WEB3FORMS_ACCESS_KEY) {
      setStatus('error', MESSAGES.unconfigured);
      return;
    }

    isSubmitting = true;
    setStatus('loading', MESSAGES.sending);

    try {
      await sendByWeb3Forms(collectValues());
      form.reset();
      clearDraft();
      getFields().forEach((field) => setFieldError(field, ''));
      setStatus('success', MESSAGES.success);
    } catch (error) {
      // 发送失败时保留已填内容与本地草稿，访客不用重写一遍
      console.error('联系表单发送失败：', error);
      window.clearTimeout(draftTimer);
      saveDraft(collectValues());
      setStatus('error', MESSAGES.failed);
    } finally {
      isSubmitting = false;
    }
  }

  function init() {
    form = document.querySelector(SELECTOR_FORM);
    status = document.querySelector(SELECTOR_STATUS);
    if (!form || !status) {
      return;
    }

    statusText = status.querySelector('span');
    if (!statusText) {
      return;
    }

    form.addEventListener('submit', onSubmit);
    // input 事件会冒泡，挂在表单上就够，无需逐个字段绑定
    form.addEventListener('input', scheduleDraftSave);

    // 失焦时即时校验，修改时清除已有错误，减少提交后的返工
    getFields().forEach((field) => {
      field.addEventListener('blur', () => setFieldError(field, validateField(field)));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') {
          setFieldError(field, validateField(field));
        }
      });
    });

    restoreDraft();
  }

  return { init };
})();
