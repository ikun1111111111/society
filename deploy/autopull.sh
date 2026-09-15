#!/usr/bin/env bash
#
# 由 cron 每 5 分钟调用一次：从 GitHub 拉取最新代码。
#
#   - 每次运行都刷新一个"心跳"文件（只有一行时间戳，几字节），
#     看它的内容就能知道定时任务有没有在跑
#   - 成功时不再写别的；失败时把时间和原因追加进日志，方便排查
#
# 本文件由 deploy/setup-autodeploy.sh 自动安装为定时任务，一般不需要手工执行。
# 想立刻手动拉一次，也可以直接运行：bash /opt/xiangwang/deploy/autopull.sh

set -u

REPO_DIR="/opt/xiangwang"
LOG_FILE="/var/log/xiangwang-autodeploy.log"
BEAT_FILE="/var/log/xiangwang-autodeploy.lastrun"
LOG_MAX_BYTES=1048576          # 日志超过 1MB 时自动瘦身

# 心跳：每次运行都覆盖写入当前时间（内容极小，不会增长）
date '+%F %T' > "$BEAT_FILE" 2>/dev/null || true

if ! cd "$REPO_DIR" 2>/dev/null; then
    echo "[$(date '+%F %T')] 目录不存在：$REPO_DIR" >> "$LOG_FILE"
    exit 1
fi

out="$(git pull --ff-only 2>&1)"
status=$?

if [ "$status" -ne 0 ]; then
    {
        echo "----------------------------------------"
        echo "[$(date '+%F %T')] 拉取失败（退出码 $status）"
        echo "$out"
    } >> "$LOG_FILE"

    # 防止日志无限增长：超限只保留最后 200 行
    if [ "$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)" -gt "$LOG_MAX_BYTES" ]; then
        tail -n 200 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi

    exit "$status"
fi

exit 0
