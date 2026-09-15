import './style.css';
import './main';
import { WORKS, MEMBERS, JOBS, WorkItem, MemberItem, JobItem } from './data';

/* ============================================================
 * 详情页渲染：detail.html?type=work|member|job&id=xxx
 * ============================================================ */

const root = document.getElementById('detail-root');

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderWork(w: WorkItem): string {
  return `
  <a class="back-link" href="index.html">← 返回官网</a>
  <div class="detail-hero">
    <div class="detail-icon ${w.coverClass}">${w.icon}</div>
    <div>
      <h1 class="grad">${esc(w.title)}</h1>
      <p class="detail-sub">社团项目组 · ${esc(w.status)}</p>
    </div>
  </div>
  <div class="detail-chips">
    <span class="chip">${esc(w.cat)}</span>
    <span class="chip blue">${esc(w.status)}</span>
    ${w.stack.map((s) => `<span class="chip amber">${esc(s)}</span>`).join('')}
  </div>
  <div class="detail-sec"><h2>项目简介</h2><p>${esc(w.desc)}</p></div>
  <div class="detail-sec"><h2>项目亮点</h2><ul>${w.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>
  <div class="detail-sec"><h2>想参与开发？</h2><p>该项目由社团项目组维护，新成员完成新手任务后即可申请加入。通过官网底部 QQ 群或邮箱联系我们，备注「想加入项目：${esc(w.title)}」。</p></div>`;
}

function renderMember(m: MemberItem): string {
  const first = m.name.charAt(0);
  return `
  <a class="back-link" href="index.html">← 返回官网</a>
  <div class="detail-hero">
    <div class="member-avatar mv${m.hue}">${esc(first)}</div>
    <div>
      <h1 class="grad">${esc(m.name)}</h1>
      <p class="detail-sub">${esc(m.college)} · ${esc(m.major)} · 编号 ${esc(m.no)}</p>
    </div>
  </div>
  <div class="detail-chips">
    <span class="chip">2026 秋季批次</span>
    ${m.dir.map((d) => `<span class="chip blue">${esc(d)}</span>`).join('')}
  </div>
  <div class="detail-sec"><h2>关于 TA</h2><p>${esc(m.bio)}</p></div>
  <div class="detail-sec"><h2>研究方向</h2><ul>${m.dir.map((d) => `<li>${esc(d)}（占位，待成员确认）</li>`).join('')}</ul></div>
  <div class="detail-sec"><h2>联系 TA？</h2><p>出于隐私保护，成员联系方式不对外展示。如需联系，请通过社团官方 QQ 群或邮箱，由管理员转达。</p></div>`;
}

function renderJob(j: JobItem): string {
  const cls = j.status === 'open' ? 'chip' : 'chip amber';
  return `
  <a class="back-link" href="index.html">← 返回官网</a>
  <div class="detail-hero">
    <div class="detail-icon c1">💼</div>
    <div>
      <h1 class="grad">${esc(j.title)}</h1>
      <p class="detail-sub">${esc(j.org)} · <span style="color:var(--acc)">${esc(j.statusText)}</span></p>
    </div>
  </div>
  <div class="detail-chips">
    <span class="${cls}">● ${esc(j.statusText)}</span>
    <span class="chip gray">实习 / 内推</span>
  </div>
  <div class="detail-sec"><h2>岗位职责</h2><ul>${j.duty.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>
  <div class="detail-sec"><h2>任职要求</h2><ul>${j.reqs.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>
  <div class="detail-sec"><h2>报名方式</h2><p>将简历发送至 <b style="color:var(--acc);font-family:var(--mono)">xiangwang@club.edu.cn</b>（占位），邮件标题：「${esc(j.title)} + 姓名 + 年级」；或加入招新 QQ 群私聊管理员。社团成员可直接找社长内推。</p></div>`;
}

function render404(id: string | null): string {
  return `
  <div class="detail-404">
    <h1>404</h1>
    <p>${id ? `没有找到「${esc(id)}」对应的内容` : '参数缺失'}：可能已下线，或链接拼错了。</p>
    <a class="btn btn-primary" href="index.html">← 回官网逛逛</a>
  </div>`;
}

function main(): void {
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');

  let html = '';
  if (type === 'work') {
    const item = WORKS.find((w) => w.id === id);
    if (item) { html = renderWork(item); document.title = `${item.title} · 象罔社团`; }
  } else if (type === 'member') {
    const item = MEMBERS.find((m) => m.id === id);
    if (item) { html = renderMember(item); document.title = `${item.name} · 象罔社团`; }
  } else if (type === 'job') {
    const item = JOBS.find((j) => j.id === id);
    if (item) { html = renderJob(item); document.title = `${item.title} · 象罔社团`; }
  }

  root.innerHTML = html || render404(id);
  window.scrollTo(0, 0);
}

main();
