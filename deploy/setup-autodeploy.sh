#!/usr/bin/env bash
#
# 象罔社团官网 —— 服务器自动部署一键配置
#
# 做两件事：
#   1) 装一条定时任务：每 5 分钟自动从 GitHub 拉取代码，让线上跟着更新
#   2) 清理 SSH 授权文件里遗留的垃圾行 / 已废弃的部署密钥
#
# 用法（在服务器上执行，root 身份）：
#   bash /opt/xiangwang/deploy/setup-autodeploy.sh
#
# 可以放心重复执行 —— 不会产生重复条目，也不会重复备份。
#
# 原理：本仓库是公开的，服务器拉代码不需要任何密码或密钥，
#       所以这条定时任务不涉及任何凭据，删掉即彻底失效。

set -u

REPO_DIR="/opt/xiangwang"        # 服务器上的仓库路径
INTERVAL="*/5"                   # 拉取频率。改成 "*" 就是每分钟一次

echo "=============================================="
echo " 象罔社团官网 · 自动部署配置"
echo "=============================================="
echo

# ---------------------------------------------------------------
# 第 1 步：定时自动拉取
# ---------------------------------------------------------------
echo "[1/2] 配置定时任务（每 5 分钟自动拉取）"
echo

if ! command -v crontab >/dev/null 2>&1; then
    echo "  错误：这台机器上没有 crontab 命令。"
    echo "  Ubuntu 上可以这样装：apt-get install -y cron"
    exit 1
fi

tmp="$(mktemp)"
# 取出现有 crontab，先剔除本脚本以前装过的条目
# （包括之前少了一个空格、cron 认不出来的那条坏行）
crontab -l 2>/dev/null | grep -v "$REPO_DIR" > "$tmp" || true

# 用 printf 生成，避免手工粘贴丢空格
printf '%s * * * * cd %s && git pull --ff-only >/dev/null 2>&1\n' \
    "$INTERVAL" "$REPO_DIR" >> "$tmp"

crontab "$tmp"
rm -f "$tmp"

echo "  当前定时任务："
crontab -l 2>/dev/null | sed 's/^/    /'
echo
echo "  说明：上面带 $REPO_DIR 的那一行就是本脚本装的。"
echo "        带 @reboot 的那一行是你原有的（Cloudflare 隧道），没有动它。"
echo

# ---------------------------------------------------------------
# 第 2 步：清理 SSH 授权文件
# ---------------------------------------------------------------
echo "[2/2] 清理 SSH 授权文件"
echo

AK="/root/.ssh/authorized_keys"

if [ ! -f "$AK" ]; then
    echo "  没有 $AK，跳过。"
else
    stamp="$(date +%Y%m%d-%H%M%S)"
    cp "$AK" "$AK.bak.$stamp"
    before=$(wc -l < "$AK" | tr -d ' ')

    # 剔除两类行：
    #   1) 误把中文提示当成命令执行后写进去的垃圾行
    #   2) 已废弃的 GitHub Actions 部署公钥（对应私钥已不再使用）
    grep -v '粘在这里' "$AK" | grep -v 'github-actions-deploy' > "$AK.new" || true

    if [ -s "$AK.new" ]; then
        cat "$AK.new" > "$AK"
        chmod 600 "$AK"
        after=$(wc -l < "$AK" | tr -d ' ')
        echo "  行数：$before → $after"
        echo "  备份：$AK.bak.$stamp"
    else
        echo "  注意：清理后授权文件会变成空的，为免把你锁在门外，这次没有改动。"
    fi
    rm -f "$AK.new"

    echo
    echo "  残留检查（下面应当只看到「已清理干净」）："
    if grep -n '粘在这里' "$AK" 2>/dev/null; then
        echo "  ↑ 仍有垃圾行"
    elif grep -n 'github-actions-deploy' "$AK" 2>/dev/null; then
        echo "  ↑ 仍有废弃的部署公钥"
    else
        echo "    已清理干净"
    fi
fi

echo
echo "=============================================="
echo " 完成。"
echo
echo " 以后你在任何地方改代码并推送到 GitHub，"
echo " 最多 5 分钟后线上会自动变成新版，你不用做任何事。"
echo
echo " 想亲眼验证一次：随便推一个改动上来，"
echo " 等 5 分钟刷新 http://47.99.180.48:8085/login.html"
echo "=============================================="
