/*
 * 모든 페이지: 언어 바꾸기 (한국어 / English).
 * 고른 언어를 기억하고, 처음 온 사람의 브라우저 언어가 이 페이지 언어와 다르면 다른 언어 페이지를 작게 알려 준다 (자동으로 옮기지 않는다).
 * 영어 페이지는 en/ 폴더에 있고 그림·스크립트는 위 폴더의 것을 같이 쓴다 (<html data-base="../">).
 */
(() => {
  const LANG = document.documentElement.lang;
  const KEY = 'site-lang';
  const store = (v) => {
    try {
      if (v) localStorage.setItem(KEY, v);
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  };
  document.querySelectorAll('a[data-lang]').forEach((a) => a.addEventListener('click', () => store(a.dataset.lang)));
  const other = document.querySelector('.lang-switch');
  if (!other || store()) return;
  const wants = (navigator.languages || [navigator.language]).map((l) => String(l).toLowerCase().split('-')[0]);
  const target = other.dataset.lang;
  // 이 페이지 언어가 브라우저 언어 목록에 있으면 그대로, 없고 다른 언어가 있으면 알려 준다
  if (wants.includes(LANG) || !(wants.includes(target) || target === 'en')) return;
  const hint = document.createElement('div');
  hint.className = 'lang-hint';
  hint.lang = target;
  hint.innerHTML = target === 'en'
    ? '<span>This page is also available in English.</span><a href="">View in English</a><button type="button" aria-label="Close">×</button>'
    : '<span>이 페이지는 한국어로도 볼 수 있어요.</span><a href="">한국어로 보기</a><button type="button" aria-label="닫기">×</button>';
  hint.querySelector('a').href = other.href;
  hint.querySelector('a').addEventListener('click', () => store(target));
  hint.querySelector('button').addEventListener('click', () => (store(LANG), hint.remove()));
  document.body.appendChild(hint);
})();

/* 소개 페이지: 이야기 둘러보기(캐러셀), 부별 이야기 카드, 액션 게임 띠 */
(() => {
  if (typeof STORIES === 'undefined') return;
  const $ = (id) => document.getElementById(id);
  const BASE = document.documentElement.dataset.base || '';
  const EN = document.documentElement.lang === 'en';
  const pad = (n) => String(n).padStart(2, '0');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 이야기 둘러보기 ----------
  let cur = 0;
  let timer = 0;
  const img = $('sp-img');
  const bars = $('sp-bars');
  PARTS.forEach((_, i) => {
    const b = document.createElement('i');
    b.dataset.p = i + 1;
    bars.appendChild(b);
  });

  function show(i, focusArt) {
    cur = (i + STORIES.length) % STORIES.length;
    const s = STORIES[cur];
    img.classList.add('out');
    setTimeout(() => {
      img.src = `${BASE}assets/art/${s.id}.webp`;
      img.alt = EN ? `A scene from ${s.t}` : `${s.t} 장면`;
      img.onload = () => img.classList.remove('out');
    }, reduce ? 0 : 220);
    $('sp-no').textContent = pad(s.no);
    $('sp-part').textContent = PARTS[s.p - 1];
    $('sp-title').textContent = s.t;
    $('sp-ref').textContent = s.r;
    $('sp-sum').textContent = s.s;
    $('sp-game').innerHTML = '';
    s.g.forEach((g) => {
      const span = document.createElement('span');
      span.textContent = `${g.e} ${g.t}`;
      $('sp-game').appendChild(span);
    });
    bars.querySelectorAll('i').forEach((b) => b.classList.toggle('on', +b.dataset.p <= s.p));
    if (focusArt) $('spotlight').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }

  function auto() {
    clearInterval(timer);
    if (!reduce) timer = setInterval(() => show(cur + 1), 6500);
  }
  $('sp-prev').onclick = () => (show(cur - 1), auto());
  $('sp-next').onclick = () => (show(cur + 1), auto());
  const sp = $('spotlight');
  sp.addEventListener('mouseenter', () => clearInterval(timer));
  sp.addEventListener('mouseleave', auto);
  let x0 = null;
  sp.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  sp.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)), auto();
    x0 = null;
  });
  show(0);
  auto();

  // ---------- 부별 이야기 카드 ----------
  const tabs = $('tabs');
  const grid = $('grid');
  function cards(p) {
    grid.innerHTML = '';
    const list = STORIES.filter((s) => s.p === p);
    grid.style.setProperty('--cols', list.length > 6 ? 4 : list.length);
    list.forEach((s) => {
      const li = document.createElement('li');
      li.innerHTML = `<button type="button" class="story">
        <img src="${BASE}assets/art/${s.id}.webp" alt="" loading="lazy">
        <span class="txt"><small>${pad(s.no)}</small><b></b><em></em></span></button>`;
      li.querySelector('b').textContent = s.t;
      li.querySelector('em').textContent = s.r;
      li.querySelector('button').onclick = () => (show(STORIES.indexOf(s), true), auto());
      grid.appendChild(li);
    });
  }
  PARTS.forEach((name, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.textContent = name;
    b.onclick = () => {
      tabs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', x === b));
      cards(i + 1);
    };
    tabs.appendChild(b);
  });
  tabs.firstChild.click();

  // ---------- 액션 게임 띠 ----------
  const track = $('track');
  const chips = STORIES.flatMap((s) => s.g.map((g) => ({ ...g, story: s.t })));
  for (let k = 0; k < 2; k++)
    chips.forEach((g) => {
      const c = document.createElement('span');
      c.className = 'chip';
      if (k) c.setAttribute('aria-hidden', 'true');
      c.innerHTML = `<i></i><b></b><small></small>`;
      c.querySelector('i').textContent = g.e;
      c.querySelector('b').textContent = g.t;
      c.querySelector('small').textContent = g.story;
      track.appendChild(c);
    });
})();
