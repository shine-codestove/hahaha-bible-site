/* 소개 페이지: 이야기 둘러보기(캐러셀), 부별 이야기 카드, 액션 게임 띠 */
(() => {
  const $ = (id) => document.getElementById(id);
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
      img.src = `assets/art/${s.id}.webp`;
      img.alt = `${s.t} 장면`;
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
        <img src="assets/art/${s.id}.webp" alt="" loading="lazy">
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
