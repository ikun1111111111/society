/* ============================================================
 * 象罔社团 · 邀请码准入内核        assets/auth.js
 * ------------------------------------------------------------
 * 职责：注册（需邀请码）/ 登录 / 会话 / 页面门禁 / 导航态
 * 形态：纯前端实现（账号、邀请码、会话全部存在 localStorage）
 *
 * ⚠️ 安全性说明（上线前必读）
 *   邀请码表与账号表都在浏览器里，任何人打开控制台就能看到、
 *   也能自己写 localStorage 伪造会话。本文件只负责「界面与流程」，
 *   真要拦住人必须把校验搬到后端：
 *     注册 POST /api/register {code,name,u,pw}  → 后端校验邀请码并签发 token
 *     登录 POST /api/login    {u,pw}            → 返回 token
 *     门禁 GET  /api/me                         → 校验 token
 *   前端的 checkCode()/register()/login() 换成 fetch 即可，其余不用动。
 * ============================================================ */
(function (w, d) {
  'use strict';

  var K_USERS = 'xw.users.v1';
  var K_SESS  = 'xw.session.v1';
  var K_CODES = 'xw.codes.v1';
  var DAYS    = 7;      /* 会话有效期（天） */

  /* ============================================================
   * 一、内置邀请码表
   *   role  : member / admin
   *   quota : 可用次数，0 = 不限次
   *   owner : 归属人（内部记录，用于追溯是谁发的）
   * ============================================================ */
  var SEED_CODES = [
    { code: 'XW2026-DEMO',     role: 'admin',  quota: 0, group: '演示账号', owner: '演示账号',
      note: '测试账号专用码，不限次，谁都能拿去体验一遍流程' },
    { code: 'XW2026-CLUB',     role: 'member', quota: 0, group: '社团通用', owner: '社团',
      note: '2026 秋季招新通用码，不限次，任何招新成员都能用' },
    { code: 'XW2026-CAITONG',  role: 'member', quota: 1, group: '技术一组', owner: '蔡僮',
      note: '技术一组专属，单人一次' },
    { code: 'XW2026-CAIKAI',   role: 'member', quota: 1, group: '技术二组', owner: '蔡凯',
      note: '技术二组专属，单人一次' },
    { code: 'XW2026-RAOYUXUAN',role: 'member', quota: 1, group: '技术三组', owner: '饶宇轩',
      note: '技术三组专属，单人一次' },
    { code: 'XW2026-QINZIYUAN',role: 'member', quota: 1, group: '技术四组', owner: '秦梓源',
      note: '技术四组专属，单人一次' },
    { code: 'XW2026-ADMIN',    role: 'admin',  quota: 1, group: '社团管理', owner: '杨添龙',
      note: '管理员码，登录后可自行签发新的邀请码' },
    { code: 'XW2025-EXPIRED',  role: 'member', quota: 0, group: '社团通用', owner: '社团',
      note: '上一届招新码，已过期（用来演示失败态）',
      expiresAt: Date.UTC(2025, 11, 31, 16, 0, 0) }
  ];

  /* ============================================================
   * 一·二、预置测试账号（默认只在本地可用）
   *   不走 localStorage 里的账号表 —— 换浏览器、换设备、清缓存都能直接登进来。
   *   用户名 demo / 口令 xw2026，身份是管理员。
   *
   *   ⚠️ 口令是写死在源码里的公开值，所以默认只在本机地址下启用：
   *        localhost / 127.0.0.1 / ::1 / 直接双击打开的 file://
   *   从公网（域名或 IP）访问时它自动失效，登录页上的相关入口也会一并摘掉。
   *   真需要在线上临时演示：把下面的 DEMO_FORCE 改成 true 重新部署，
   *   演示完立刻改回 false —— 否则等于把管理员口令挂在互联网上。
   * ============================================================ */
  var DEMO_FORCE = false;

  var DEMO_ON = DEMO_FORCE || (function () {
    var h = String(w.location.hostname || '');
    if (!h) return true;                       /* file:// 双击打开时 hostname 为空 */
    return /^(localhost|127\.0\.0\.1|::1|\[::1\]|0\.0\.0\.0)$/.test(h);
  })();

  var DEMO = {
    u: 'demo', pw: 'xw2026', name: '演示账号',
    role: 'admin', group: '演示账号', code: 'XW2026-DEMO'
  };

  /* ============================================================
   * 二、存储读写（隐私模式下 localStorage 会抛错，全部兜住）
   * ============================================================ */
  function read(k, dflt) {
    try { var v = w.localStorage.getItem(k); return v ? JSON.parse(v) : dflt; }
    catch (e) { return dflt; }
  }
  function save(k, v) {
    try { w.localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ============================================================
   * 三、口令哈希
   *   localhost / https 下用 SHA-256；file:// 打开时降级为弱哈希。
   *   （无论哪种，前端哈希都不等于安全，见文件头说明。）
   * ============================================================ */
  function weakHash(str) {
    var h = 0x811c9dc5, h2 = 0x1000193;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
      h2 = ((h2 << 5) - h2 + str.charCodeAt(i)) >>> 0;
    }
    return 'w' + h.toString(16) + h2.toString(16) + '-' + str.length;
  }
  function toHex(buf) {
    var out = '', b = new Uint8Array(buf);
    for (var i = 0; i < b.length; i++) out += ('0' + b[i].toString(16)).slice(-2);
    return out;
  }
  function hash(pw) {
    var raw = 'xw::' + pw;
    return new Promise(function (resolve) {
      var sub = w.crypto && w.crypto.subtle;
      var ENC = w.TextEncoder;
      if (sub && ENC) {
        try {
          sub.digest('SHA-256', new ENC().encode(raw))
            .then(function (buf) { resolve(toHex(buf)); })
            .catch(function () { resolve(weakHash(raw)); });
          return;
        } catch (e) { /* 落到下面 */ }
      }
      resolve(weakHash(raw));
    });
  }

  /* ============================================================
   * 四、邀请码
   * ============================================================ */
  /* 去掉所有非字母数字，这样 "xw2026 club" / "XW-2026-CLUB" 都能匹配 */
  function compact(s) { return String(s == null ? '' : s).toUpperCase().replace(/[^A-Z0-9]/g, ''); }

  function seedList() { return SEED_CODES.slice(); }
  function customList() { return read(K_CODES, []); }
  function allCodes() { return seedList().concat(customList()); }

  function findCode(input) {
    var c = compact(input);
    if (!c) return null;
    var list = allCodes();
    for (var i = 0; i < list.length; i++) {
      if (compact(list[i].code) === c) return list[i];
    }
    return null;
  }

  /* 某个码已经被多少人用掉（本地记录 + 码自带 used 基数） */
  function usedCount(code) {
    var users = read(K_USERS, []);
    var n = 0;
    for (var i = 0; i < users.length; i++) if (users[i].code === code) n++;
    return n;
  }

  function codeState(def) {
    var used = usedCount(def.code) + (def.used | 0);
    if (def.expiresAt && Date.now() > def.expiresAt) {
      return { ok: false, state: 'expired', def: def, used: used,
        msg: '这枚邀请码已在 ' + fmtDate(def.expiresAt) + ' 过期' };
    }
    if (def.quota > 0 && used >= def.quota) {
      return { ok: false, state: 'used', def: def, used: used,
        msg: '这枚邀请码已被使用（' + used + ' / ' + def.quota + '）' };
    }
    var left = def.quota > 0 ? def.quota - used : -1;
    return { ok: true, state: 'ok', def: def, used: used, left: left,
      msg: '有效 · ' + (def.group || '社团') +
           (def.quota > 0 ? ' · 剩余 ' + left + ' 次' : ' · 不限次') };
  }

  function checkCode(input) {
    var raw = String(input == null ? '' : input).trim();
    if (!raw) return { ok: false, state: 'empty', msg: '请输入邀请码' };
    var def = findCode(raw);
    if (!def) return { ok: false, state: 'invalid', msg: '邀请码无效，检查一下有没有输错' };
    return codeState(def);
  }

  function fmtDate(ts) {
    var t = new Date(ts);
    return t.getFullYear() + '.' + ('0' + (t.getMonth() + 1)).slice(-2) + '.' + ('0' + t.getDate()).slice(-2);
  }

  /* 管理员签发新邀请码 */
  function issueCode(opt) {
    var s = session();
    if (!s || s.role !== 'admin') return { ok: false, msg: '只有管理员可以签发邀请码' };
    var code = compact(opt && opt.code);
    if (code.length < 6) return { ok: false, msg: '邀请码至少 6 位字母或数字' };
    if (findCode(code)) return { ok: false, msg: '这枚邀请码已存在' };
    var list = customList();
    list.push({
      code: opt.code.toUpperCase(), role: opt.role === 'admin' ? 'admin' : 'member',
      quota: Math.max(0, parseInt(opt.quota, 10) || 0),
      group: (opt.group || '临时邀请').slice(0, 16),
      owner: s.name, note: '由 ' + s.name + ' 于 ' + fmtDate(Date.now()) + ' 签发',
      issuedAt: Date.now()
    });
    save(K_CODES, list);
    return { ok: true, code: opt.code.toUpperCase() };
  }

  /* ============================================================
   * 五、账号 / 会话
   * ============================================================ */
  var ROLE_LABEL = { member: '社团成员', admin: '管理员' };

  function users() { return read(K_USERS, []); }
  function roleLabel(r) { return ROLE_LABEL[r] || '社团成员'; }

  function setSession(user, keep) {
    var ttl = (keep === false ? 1 : DAYS) * 864e5;
    save(K_SESS, {
      u: user.u, name: user.name, role: user.role || 'member',
      group: user.group || '', code: user.code || '',
      at: Date.now(), exp: Date.now() + ttl
    });
  }

  function session() {
    var s = read(K_SESS, null);
    if (!s) return null;
    if (!s.exp || Date.now() > s.exp) { save(K_SESS, null); return null; }
    return s;
  }

  function logout() {
    save(K_SESS, null);
    try { w.location.href = 'login.html?bye=1'; } catch (e) {}
  }

  /* ============================================================
   * 六、注册 / 登录
   *   统一返回 { ok, field, msg, user? }，不抛异常、不弹 alert
   * ============================================================ */
  function register(o) {
    o = o || {};
    return new Promise(function (resolve) {
      var chk = checkCode(o.code);
      if (!chk.ok) return resolve({ ok: false, field: 'code', msg: chk.msg, state: chk.state });

      var u = String(o.u || '').trim();
      if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(u))
        return resolve({ ok: false, field: 'u', msg: '账号 3-20 位，字母开头，只能含字母 / 数字 / 下划线' });
      if (u.toLowerCase() === DEMO.u)
        return resolve({ ok: false, field: 'u', msg: '这个账号名被系统保留了，换一个吧' });

      var name = String(o.name || '').trim();
      if (name.length < 1 || name.length > 20)
        return resolve({ ok: false, field: 'name', msg: '昵称 1-20 个字' });

      var pw = String(o.pw || '');
      if (pw.length < 6) return resolve({ ok: false, field: 'pw', msg: '密码至少 6 位' });
      if (/^\d+$/.test(pw)) return resolve({ ok: false, field: 'pw', msg: '密码不能全是数字' });
      if (pw !== String(o.pw2 || '')) return resolve({ ok: false, field: 'pw2', msg: '两次输入的密码不一致' });

      var list = users();
      for (var i = 0; i < list.length; i++) {
        if (list[i].u.toLowerCase() === u.toLowerCase())
          return resolve({ ok: false, field: 'u', msg: '这个账号已经被注册了' });
      }
      /* 用完最后一名额前再查一次，避免并发/重复提交 */
      var again = checkCode(o.code);
      if (!again.ok) return resolve({ ok: false, field: 'code', msg: again.msg, state: again.state });

      hash(pw).then(function (h) {
        var user = {
          u: u, name: name, pw: h, role: again.def.role || 'member',
          group: again.def.group || '', code: again.def.code,
          inviter: again.def.owner || '', at: Date.now()
        };
        list.push(user);
        if (!save(K_USERS, list))
          return resolve({ ok: false, field: 'u', msg: '本地存储不可用（可能开了无痕模式），无法保存账号' });
        setSession(user, o.keep !== false);
        resolve({ ok: true, user: user, def: again.def });
      });
    });
  }

  function login(u, pw) {
    var name = String(u || '').trim().toLowerCase();

    /* 预置测试账号优先：口令是公开的，不走本地哈希，所以任何浏览器都能进。
       仅在本机地址（DEMO_ON）下生效 —— 公网访问时这段根本进不来，
       demo 会退化成「没有这个账号」。 */
    if (DEMO_ON && name === DEMO.u) {
      if (String(pw || '') !== DEMO.pw) {
        return Promise.resolve({ ok: false, field: 'pw', msg: '测试账号的口令是 ' + DEMO.pw });
      }
      var du = ensureDemoUser();
      setSession(du, true);
      return Promise.resolve({ ok: true, user: du, builtin: true });
    }

    var list = users();
    var found = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].u.toLowerCase() === name) { found = list[i]; break; }
    }
    if (!found) return Promise.resolve({ ok: false, field: 'u', msg: '没有这个账号，可能还没注册' });
    return hash(String(pw || '')).then(function (h) {
      if (h !== found.pw) return { ok: false, field: 'pw', msg: '密码不正确' };
      setSession(found, true);
      return { ok: true, user: found };
    });
  }

  /* 把测试账号补进本地账号表，专区页的「其他已注册成员」才看得到它 */
  function ensureDemoUser() {
    var list = users();
    for (var i = 0; i < list.length; i++) {
      if (list[i].u.toLowerCase() === DEMO.u) {
        if (!list[i].builtin) { list[i].builtin = true; list[i].role = DEMO.role; save(K_USERS, list); }
        return list[i];
      }
    }
    var user = {
      u: DEMO.u, name: DEMO.name, pw: '', role: DEMO.role, group: DEMO.group,
      code: DEMO.code, inviter: '演示账号', at: Date.now(), builtin: true,
      note: '内置测试账号，口令不走本地校验'
    };
    list.push(user);
    save(K_USERS, list);
    return user;
  }

  /* 一键进入：登录页那个按钮调的就是它 */
  function demoLogin() {
    if (!DEMO_ON) {
      return Promise.resolve({ ok: false, field: 'u',
        msg: '预置测试账号只在本地演示时可用。请用邀请码注册一个正式账号。' });
    }
    return login(DEMO.u, DEMO.pw);
  }

  /* 登录页用它决定要不要显示「一键进入」等入口 */
  function demoAvailable() { return DEMO_ON; }

  /* ============================================================
   * 七、页面门禁
   *   页面 <html class="gated"> + 本文件阻塞式加载 → 脚本一跑到
   *   这里就判定，来不及渲染内容，所以不会出现「先看到再被踢出」。
   * ============================================================ */
  function nextParam() {
    var p = w.location.pathname.split('/').pop() || '';
    return encodeURIComponent(p + w.location.search + w.location.hash);
  }

  function gate() {
    var s = session();
    if (s) { d.documentElement.classList.remove('gated'); return s; }
    w.location.replace('login.html?next=' + nextParam() + '&need=1');
    return null;
  }

  /* 需要更高权限时用这个，返回 false 表示已跳走 */
  function requireRole(role) {
    var s = gate();
    if (!s) return null;
    if (role === 'admin' && s.role !== 'admin') {
      w.location.replace('area.html?denied=1');
      return null;
    }
    return s;
  }

  /* ============================================================
   * 八、导航栏登录态
   * ============================================================ */
  function mountNav() {
    var host = d.getElementById('navAuth');
    if (!host) return;
    var s = session();
    if (!s) {
      host.innerHTML = '<a class="nav-login" href="login.html">登录 / 注册</a>';
      return;
    }
    host.innerHTML =
      '<div class="nav-user" id="navUser">' +
        '<button class="nu-btn" type="button" aria-haspopup="true">' +
          '<span class="nu-av">' + esc(s.name.slice(0, 1)) + '</span>' +
          '<span class="nu-txt"><b>' + esc(s.name) + '</b><small>' + esc(roleLabel(s.role)) + '</small></span>' +
          '<i class="nu-c">▾</i>' +
        '</button>' +
        '<div class="nu-menu">' +
          '<div class="nu-head"><b>' + esc(s.name) + '</b><span>@' + esc(s.u) + ' · ' + esc(s.group || '社团') + '</span></div>' +
          '<a href="area.html"><i>◈</i> 成员专区</a>' +
          '<a href="area.html#codes"><i>⌘</i> 邀请码</a>' +
          '<a href="index.html"><i>↗</i> 返回官网首页</a>' +
          '<button type="button" data-logout><i>⎋</i> 退出登录</button>' +
        '</div>' +
      '</div>';
    var wrap = host.querySelector('.nav-user');
    host.querySelector('.nu-btn').addEventListener('click', function (e) {
      e.stopPropagation(); wrap.classList.toggle('open');
    });
    host.querySelector('[data-logout]').addEventListener('click', function () { logout(); });
    d.addEventListener('click', function (e) {
      if (!e.target.closest('#navUser')) wrap.classList.remove('open');
    });
  }

  /* ============================================================
   * 导出
   * ============================================================ */
  w.XWAUTH = {
    /* 邀请码 */
    codes: allCodes, findCode: findCode, checkCode: checkCode, codeState: codeState,
    usedCount: usedCount, issueCode: issueCode,
    /* 账号 */
    users: users, register: register, login: login, logout: logout,
    session: session, setSession: setSession,
    roleLabel: roleLabel, fmtDate: fmtDate, esc: esc,
    /* 预置测试账号 */
    DEMO: DEMO, demoLogin: demoLogin, ensureDemoUser: ensureDemoUser,
    demoAvailable: demoAvailable,
    /* 门禁 */
    gate: gate, requireRole: requireRole, nextParam: nextParam
  };

  /* ---------- 自启动 ---------- */
  if (d.documentElement.classList.contains('gated')) gate();
  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', mountNav);
  } else {
    mountNav();
  }
})(window, document);
