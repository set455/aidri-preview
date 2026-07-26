document.documentElement.classList.remove('no-js');

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
const form = document.querySelector('[data-lead-form]');
const formStatus = document.querySelector('[data-form-status]');

if (header && header.dataset.header !== 'solid') {
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menu?.classList.remove('is-open');
};

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menu?.classList.toggle('is-open', !isOpen);
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.classList.contains('is-open')) {
    closeMenu();
    menuButton?.focus();
  }
});

document.addEventListener('click', (event) => {
  if (menu?.classList.contains('is-open') && !event.target.closest('.site-header')) closeMenu();
});

window.matchMedia('(min-width: 981px)').addEventListener('change', (mq) => {
  if (mq.matches) closeMenu();
});

const FALLBACK_MESSAGE = 'Не получилось отправить заявку. Напишите нам: help@aidri.ru или в Telegram @aidri_support.';

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  if (formStatus) formStatus.textContent = 'Отправляем заявку…';
  button?.setAttribute('disabled', '');
  try {
    const data = new FormData(form);
    data.set('page', window.location.href);
    const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    const json = await res.json().catch(() => null);
    if (res.ok && json && json.ok) {
      form.reset();
      if (formStatus) formStatus.textContent = 'Заявка отправлена. Ответим в течение рабочего дня.';
    } else if (formStatus) {
      formStatus.textContent = (json && json.error) || FALLBACK_MESSAGE;
    }
  } catch {
    if (formStatus) formStatus.textContent = FALLBACK_MESSAGE;
  } finally {
    button?.removeAttribute('disabled');
  }
});

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Онлайн-чат Jivo: после регистрации аккаунта вставить ID виджета (см. CHANGELOG).
// Пока ID пуст — показывается запасная кнопка чата в Telegram.
const JIVO_ID = '';

if (JIVO_ID) {
  let jivoLoaded = false;
  const loadJivo = () => {
    if (jivoLoaded) return;
    jivoLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://code.jivo.ru/widget/' + JIVO_ID;
    s.async = true;
    document.head.appendChild(s);
  };
  ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach((e) => {
    window.addEventListener(e, loadJivo, { once: true, passive: true });
  });
  setTimeout(loadJivo, 5000);
} else {
  const chatFab = document.createElement('a');
  chatFab.className = 'chat-fab';
  chatFab.href = 'https://t.me/aidri_support';
  chatFab.target = '_blank';
  chatFab.rel = 'noopener';
  chatFab.setAttribute('aria-label', 'Чат с оператором в Telegram');
  chatFab.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2 21 3l-3.4 18-5.4-4.6L9 20v-4.4L17.6 6.6 7.2 13.8 3 11.2Z"/></svg><span>Чат</span>';
  document.body.appendChild(chatFab);
}
