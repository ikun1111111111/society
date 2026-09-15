# ============================================================
# 象罔社团官网 · 静态站镜像
# 构建：docker build -t xiangwang-site .
# 运行：docker run -d --name xiangwang -p 80:80 --restart always xiangwang-site
# ============================================================
FROM nginx:1.27-alpine

# 时区与中文
RUN apk add --no-cache tzdata \
 && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
 && echo "Asia/Shanghai" > /etc/timezone

# 站点静态资源（构建产物目录）
COPY v3/ /usr/share/nginx/html/

# 站点配置
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# 部署后可访问 http://<服务器IP>/login.html
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
