# 象罔社团官网 · XIANGWANG CLUB

南京信息工程大学「象罔社团」官方网站。科技风静态站（多页 HTML），带邀请码准入的注册 / 登录 / 页面门禁。

> 知索不得，象罔得之。

---

## 一、项目结构

```
society/
├─ v3/                  ← ★ 构建产物：真正要部署的静态站（纯 HTML/CSS/JS）
│  ├─ index.html        首页
│  ├─ login.html        登录 / 注册（唯一不设门禁的页面）
│  ├─ area.html         成员专区（内部页）
│  ├─ members.html      成员总览   → member-*.html（19 位成员独立详情页）
│  ├─ projects.html     作品列表   → work-w1 ~ w6.html
│  ├─ life.html         社团动态   → life-a1 ~ a6.html
│  ├─ recruit?          → job-j1 ~ j4.html（岗位详情）
│  └─ assets/           site.css / site.js / auth.css / auth.js / logo.png
│
├─ src/                 ← TypeScript 源码（首页交互：粒子星域/打字机/3D 倾斜/数字滚动…）
├─ redesign/            首页重设计稿
├─ dist/                早期 v2 构建产物（保留备查，不参与部署）
├─ build_v3.py          ★ v3 静态站生成器（数据 + 模板都在里面）
├─ deploy/nginx.conf    Nginx 站点配置（已开 gzip / 缓存 / 安全头）
├─ Dockerfile           静态站镜像（nginx:alpine）
└─ .gitignore
```

**技术形态：零构建依赖的纯静态站。** 所有资源都是相对路径引用，因此既能部署在域名根目录，也能放在子目录（如 `/club/`）下。

---

## 二、本地预览

任选一种：

```bash
# Python 自带（需在 v3 同级目录执行）
cd v3 && python -m http.server 8080

# 或 Node
npx serve v3 -l 8080
```

浏览器打开 http://localhost:8080/login.html

**演示账号**：用户名 `demo`，口令 `xw2026`（内置邀请码 `XW2026-DEMO` 亦可直接注册）。

> ⚠️ 正式上线前务必删掉 `v3/assets/auth.js` 里的 `DEMO` 预置账号段，否则任何人可凭公开口令进后台。

---

## 三、重新生成站点

页面的文案、成员、作品、岗位等数据都写在 `build_v3.py` 顶部的数据区（`WORKS` / `MEMBERS` / `LIFE` / `JOBS`），改完重跑即可全量重生成 `v3/`：

```bash
python build_v3.py
```

`build_v3.py` 顶部还有一个准入开关：

```python
SITE_GATE = True   # True = 全站门禁；False = 只锁「成员专区」area.html
```

---

## 四、部署到阿里云 ECS（推荐：Nginx）

### 0. 前置

| 项 | 要求 |
|---|---|
| 实例 | 阿里云 ECS，1 核 2G 起（静态站 1 核 1G 足够），系统选 **Ubuntu 22.04 / Alibaba Cloud Linux 3** |
| 带宽 | 按量或 1~3 Mbps 固定带宽均可 |
| 安全组 | 入方向放行 **22（SSH）**、**80（HTTP）**、**443（HTTPS）** |
| 域名 | 可选。有域名则解析 A 记录到 ECS 公网 IP；无域名可先用 IP 直接访问 |

> 不要用普通云盘挂载点的奇怪路径，统一用 `/var/www/`。

### 1. 装环境

```bash
# 登录
ssh root@<你的公网IP>

# Alibaba Cloud Linux / CentOS 系
dnf install -y nginx git        # 若报错改用 yum install -y nginx git

# Ubuntu / Debian 系
apt update && apt install -y nginx git
```

### 2. 拉代码

```bash
# 公开仓库
git clone https://github.com/ikun1111111111/society.git /opt/society

# 私有仓库：改用带 token 的地址（见第五节）
git clone https://<用户名>:<PersonalAccessToken>@github.com/ikun1111111111/society.git /opt/society
```

### 3. 把静态站放到网站根目录

```bash
mkdir -p /var/www/xiangwang
cp -r /opt/society/v3/. /var/www/xiangwang/

# 目录归属（nginx 默认以 nginx 用户跑，SELinux 系统需开 httpd 上下文）
chown -R nginx:nginx /var/www/xiangwang     # Ubuntu 下用户名为 www-data
restorecon -Rv /var/www/xiangwang 2>/dev/null || true
```

### 4. 配 Nginx

```bash
cp /opt/society/deploy/nginx.conf /etc/nginx/conf.d/xiangwang.conf
# 若有域名，把 server_name _; 改成 server_name club.example.com;

nginx -t                 # 语法检查，必须 OK
systemctl enable --now nginx
systemctl reload nginx
```

阿里云 Linux / CentOS 上 `/etc/nginx/nginx.conf` 默认已 `include conf.d/*.conf`；**Ubuntu 默认站点在 `sites-enabled/`，需要额外禁用默认站**：

```bash
rm -f /etc/nginx/sites-enabled/default
systemctl reload nginx
```

### 5. 访问验证

浏览器打开 `http://<公网IP>/` ，应自动跳到 `login.html`。
用演示账号登录后能看到首页、成员、作品、动态——即部署成功。

### 6. 上 HTTPS（有域名时强烈建议）

```bash
# Ubuntu
apt install -y certbot python3-certbot-nginx
# Alibaba Cloud Linux
dnf install -y certbot python3-certbot-nginx

certbot --nginx -d club.example.com     # 自动改 nginx 配置并配置 90 天续期
```

阿里云域名需先完成 **ICP 备案**，否则 80/443 会被拦截。测试阶段可直接用公网 IP + 端口访问。

### 7. 后续更新流程

```bash
cd /opt/society
git pull
cp -r v3/. /var/www/xiangwang/
chown -R nginx:nginx /var/www/xiangwang
systemctl reload nginx
```

---

## 五、部署到阿里云 ECS（Docker 方式，更省事）

服务器上装好 Docker 后，只需三条命令：

```bash
git clone https://github.com/ikun1111111111/society.git /opt/society
cd /opt/society
docker build -t xiangwang-site .
docker run -d --name xiangwang --restart always -p 80:80 xiangwang-site
```

镜像内部已自带 Nginx 与 `deploy/nginx.conf`，`/usr/share/nginx/html` 就是 `v3/` 的内容。

更新：

```bash
cd /opt/society && git pull
docker build -t xiangwang-site . && docker stop xiangwang && docker rm xiangwang
docker run -d --name xiangwang --restart always -p 80:80 xiangwang-site
```

> 阿里云镜像仓库（ACR）可选：把镜像推到 ACR，服务器改 `docker pull` 拉取，适合多台服务器。

---

## 六、部署到阿里云 OSS（无服务器，最便宜）

适合「只要一个能访问的网址，不想维护服务器」：

1. OSS 控制台建 Bucket，**读写权限设为公共读**。
2. 基础设置 → 静态页面：默认首页 `index.html`，子目录首页 `index.html`；**错误文档填 `index.html`**（站点是多页结构，避免空白 404）。
3. 上传 `v3/` 全部文件到 Bucket 根目录（保持 `assets/` 层级）。
4. 用 Bucket 绑定的外网域名访问。

**注意**：OSS 静态托管无法给单个目录加访问控制，`v3/assets/auth.js` 的门禁逻辑在浏览器里跑，**别人可以直接访问 `member-*.html` 的 URL**。若要真拦人，必须走第七节的后端方案。

---

## 七、⚠️ 上线安全说明（重要）

当前 `v3/assets/auth.js` 是**纯前端准入**：邀请码表、账号表、会话全部存在浏览器 `localStorage` 里。

这意味着：

- 任何人打开 F12 控制台就能看到全部邀请码；
- 任何人手写一条 `localStorage` 记录就能伪造管理员会话；
- 直接请求 `member-xxx.html` 等 URL 可绕过页面门禁。

它适合**演示、内部看起来正规的入口**，**不适合存放任何真实敏感信息**。

要真正拦住人，需要把三个接口搬到后端：

```
POST /api/register  { code, name, u, pw }   → 后端校验邀请码，签发 token
POST /api/login     { u, pw }               → 校验口令，返回 token
GET  /api/me                                → 校验 token，未登录返回 401
```

`auth.js` 顶部的注释里已写好迁移方案：只需把前端的 `checkCode() / register() / login()` 换成 `fetch` 调用，其余页面逻辑不用动。后端可用 Node（Express/Fastify）或 Python（FastAPI）实现，数据落 SQLite / RDS，再用 Nginx 反代 `/api` 到本机端口。

---

## 八、常见问题

| 现象 | 原因 / 解法 |
|---|---|
| 打开是 Nginx 默认欢迎页 | 默认站点没禁用（Ubuntu）或 `conf.d` 未 include |
| 页面能开但样式全丢 | 只上传了 HTML 没上传 `assets/`，或 `root` 指到了上一层 |
| 一直跳回登录页 | 浏览器禁用了 localStorage（隐私模式 / iframe 里嵌）；或域名换了但旧会话不匹配 |
| 403 Forbidden | 文件权限或 SELinux 上下文不对：`chown -R nginx:nginx` + `restorecon -Rv` |
| 国内访问 80 端口被重置 | 域名未备案，改用 IP 访问或先完成 ICP 备案 |
| `git clone` 卡住 / 连不上 | 服务器访问 GitHub 慢，用 `git clone` 加 `-c http.proxy=` 或改走 Gitee 镜像中转 |

---

## 九、许可

社团内部项目，未开源授权，请勿外传。
