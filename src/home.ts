import './theme.css';
import { bootCommonFx, Typewriter, bindTilt, bindCounters } from './fx';
import { WORKS, MEMBERS, JOBS } from './data';
import { FEED, HERO_PHRASES, QUOTES, DIRECTIONS, STATS } from './content';

/* ============================================================
 * 象罔社团官网 · 首页脚本
 * 首页只做「橱窗」：动态流 / 方向胶囊 / 作品精选 / 语录 + 成员 / 招生
 * 完整内容（项目故事、成员档案、岗位详情）都在 detail.html 详情页
 * ============================================================ */

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function mount(id: string, html: string): void {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* ---------- 动态流：最近我们在干嘛 ---------- */
function renderFeed(): void {
  const html = FEED.map(
    (f) => `
    <article class="feed-item reveal">
      <div class="feed-date">${esc(f.date)}</div>
      <div class="feed-card">
        <div class="feed-top"><span class="feed-tag">${esc(f.tag)}</span><h3>${esc(f.title)}</h3></div>
        <p>${esc(f.desc)}</p>
      </div>
    </article>`
  ).join('');
  mount('feed-list', html);
}

/* ---------- 关于：方向胶囊 + 数字 ---------- */
function renderAbout(): void {
  mount(
    'dir-list',
    DIRECTIONS.map(
      (d) => `
      <div class="dir-pill reveal" data-tilt>
        <span class="dp-icon">${d.icon}</span>
        <span class="dp-name">${esc(d.name)}</span>
        <span class="dp-tags">${esc(d.tags)}</span>
      </div>`
    ).join('')
  );
  mount(
    'stats',
    STATS.map(
      (s) => `
      <div class="stat reveal">
        <b><span data-count="${s.value}">0</span><small>${esc(s.suffix)}</small></b>
        <span>${esc(s.label)}</span>
      </div>`
    ).join('')
  );
}

/* ---------- 作品：精选三张 + 更多卡，全部跳详情页 ---------- */
function renderWorks(): void {
  const featured = WORKS.slice(0, 3);
  const cards = featured
    .map(
      (w) => `
      <a class="work reveal" href="detail.html?type=work&amp;id=${esc(w.id)}" data-tilt>
        <div class="cover ${esc(w.coverClass)}"><span class="cover-emoji">${esc(w.icon)}</span><i class="cover-cat">${esc(w.cat)}</i></div>
        <div class="body">
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.desc.split('：')[0])}</p>
          <p class="stack">${w.stack.map(esc).join(' · ')}</p>
          <span class="work-more">读项目故事 →</span>
        </div>
      </a>`
    )
    .join('');
  const more = `
    <a class="work works-more reveal" href="#contact" data-tilt>
      <div class="cover c-more"><span class="cover-emoji">＋</span></div>
      <div class="body">
        <h3>更多作品持续更新</h3>
        <p>完整项目列表正在整理，你的项目也许就是下一张卡片。</p>
        <p class="stack">等你来写 · await you</p>
        <span class="work-more">来写点东西 →</span>
      </div>
    </a>`;
  mount('works-grid', cards + more);
}

/* ---------- 成员：语录 + 紧凑名册，点击进详情 ---------- */
function renderMembers(): void {
  mount(
    'quotes',
    QUOTES.map((q) => {
      const m = MEMBERS.find((x) => x.id === q.id);
      if (!m) return '';
      return `
      <figure class="quote reveal" data-tilt>
        <span class="q-mark">“</span>
        <blockquote>${esc(q.text)}</blockquote>
        <figcaption>
          <span class="q-avatar mv${m.hue}">${esc(m.name.charAt(0))}</span>
          <span><b>${esc(m.name)}</b><small>${esc(m.college)} · ${esc(m.major)}</small></span>
          <a class="q-link" href="detail.html?type=member&amp;id=${esc(m.id)}">档案 →</a>
        </figcaption>
      </figure>`;
    }).join('')
  );

  mount(
    'members-grid',
    MEMBERS.map(
      (m) => `
      <a class="member-card reveal" href="detail.html?type=member&amp;id=${esc(m.id)}">
        <div class="member-avatar mv${m.hue}">${esc(m.name.charAt(0))}</div>
        <h3>${esc(m.name)}</h3>
        <p>${esc(m.college)} · ${esc(m.major)}</p>
        <span class="member-no">${esc(m.no)}</span>
      </a>`
    ).join('')
  );
}

/* ---------- 招聘：只留一行入口，详情进详情页 ---------- */
function renderJobs(): void {
  mount(
    'job-list',
    JOBS.map(
      (j) => `
      <a class="job reveal" href="detail.html?type=job&amp;id=${esc(j.id)}">
        <span class="role">${esc(j.title)}</span>
        <span class="desc">${esc(j.org)}</span>
        <span class="meta ${j.status === 'open' ? 'open' : 'soon'}">● ${esc(j.statusText)}</span>
        <span class="arrow">-&gt;</span>
      </a>`
    ).join('')
  );
}

/* ---------- 启动 ---------- */
function main(): void {
  bootCommonFx();

  const tw = document.getElementById('typewriter');
  if (tw) new Typewriter(tw, HERO_PHRASES);

  renderFeed();
  renderAbout();
  renderWorks();
  renderMembers();
  renderJobs();

  bindTilt();
  bindCounters();
}

main();
