/* ============================================================
 * 象罔社团官网 · 共享特效模块
 * 模块：粒子星域 / 打字机 / 3D 倾斜 / 数字滚动 / 滚动入场 + 进度条
 * 首页（home.ts）与详情页（detail.ts）共用
 * ============================================================ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  warm: boolean;
}

interface Mouse {
  x: number;
  y: number;
  active: boolean;
}

/** 全屏粒子星域：朱砂/琥珀双色粒子，缓慢漂移、彼此连线、被鼠标轻轻推开 */
export class ParticleField {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouse: Mouse = { x: 0, y: 0, active: false };
  private raf: number = 0;
  private readonly linkDist = 130;
  private readonly mouseRadius = 160;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
    this.resize();
    this.seed();
    this.bind();
    this.loop();
  }

  private count(): number {
    const area = window.innerWidth * window.innerHeight;
    return Math.min(110, Math.max(40, Math.floor(area / 16000)));
  }

  private seed(): void {
    const n = this.count();
    this.particles = Array.from({ length: n }, (): Particle => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
      warm: Math.random() > 0.45,
    }));
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private bind(): void {
    window.addEventListener('resize', () => {
      this.resize();
      this.seed();
    });
    window.addEventListener('mousemove', (e: MouseEvent) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
  }

  private step(): void {
    const { ctx, canvas, mouse } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of this.particles) {
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < this.mouseRadius * this.mouseRadius && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const force = ((this.mouseRadius - d) / this.mouseRadius) * 0.6;
          p.vx += (dx / d) * force * 0.12;
          p.vy += (dy / d) * force * 0.12;
        }
      }
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;
      if (p.y < -20) p.y = canvas.height + 20;
      if (p.y > canvas.height + 20) p.y = -20;
    }

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < this.linkDist * this.linkDist) {
          const alpha = (1 - Math.sqrt(d2) / this.linkDist) * 0.2;
          ctx.strokeStyle = `rgba(255,124,90,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of this.particles) {
      ctx.fillStyle = p.warm ? 'rgba(255,124,90,0.6)' : 'rgba(255,180,84,0.5)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private loop = (): void => {
    this.step();
    this.raf = requestAnimationFrame(this.loop);
  };

  public destroy(): void {
    cancelAnimationFrame(this.raf);
  }
}

/** 打字机：循环播放一组句子 */
export class Typewriter {
  private el: HTMLElement;
  private phrases: string[];
  private idx = 0;
  private char = 0;
  private deleting = false;

  constructor(el: HTMLElement, phrases: string[]) {
    this.el = el;
    this.phrases = phrases;
    this.tick();
  }

  private tick(): void {
    const full = this.phrases[this.idx];
    this.char += this.deleting ? -1 : 1;
    this.el.textContent = full.slice(0, this.char);

    let delay = this.deleting ? 26 : 62;
    if (!this.deleting && this.char === full.length) {
      delay = 2400;
      this.deleting = true;
    } else if (this.deleting && this.char === 0) {
      this.deleting = false;
      this.idx = (this.idx + 1) % this.phrases.length;
      delay = 420;
    }
    window.setTimeout(() => this.tick(), delay);
  }
}

/** 3D 倾斜卡片（跟随鼠标），并写入 --mx/--my 供光晕定位 */
export function bindTilt(scope: ParentNode = document): void {
  const cards = scope.querySelectorAll<HTMLElement>('[data-tilt]');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      const rotY = (px - 0.5) * 8;
      const rotX = (0.5 - py) * 8;
      card.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/** 数字滚动：进入视口后从 0 数到目标值 */
export function bindCounters(scope: ParentNode = document): void {
  const nums = scope.querySelectorAll<HTMLElement>('[data-count]');
  const animate = (el: HTMLElement): void => {
    const target = Number(el.dataset.count ?? '0');
    const dur = 1600;
    const start = performance.now();
    const frame = (now: number): void => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((n) => io.observe(n));
}

/** 滚动入场 + 顶部进度条 */
export function bindScrollFx(): void {
  const reveals = document.querySelectorAll<HTMLElement>('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.style.transitionDelay = `${Math.min(i * 70, 320)}ms`;
          el.classList.add('on');
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((el) => io.observe(el));

  const bar = document.getElementById('progress');
  window.addEventListener(
    'scroll',
    () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      if (bar) bar.style.width = `${(ratio * 100).toFixed(2)}%`;
    },
    { passive: true }
  );
}

/** 通用启动：粒子背景 + 入场动画（两个页面都用） */
export function bootCommonFx(): void {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
  if (canvas) new ParticleField(canvas);
  bindScrollFx();
}
