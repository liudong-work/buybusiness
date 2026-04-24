#!/bin/bash

echo "========================================="
echo "开始部署外贸批发平台到服务器"
echo "========================================="

SERVER_IP="182.92.59.70"
SERVER_USER="root"
SERVER_PASSWORD="Ryg@893012"
REMOTE_DIR="/www/wholesale-platform"
CONTAINER_NAME="wholesale-web"
PORT="3003"

echo "📦 1. 清理本地构建缓存..."
rm -rf .next
rm -rf node_modules/.cache

echo "🔍 2. 检查服务器 Docker 环境..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，正在安装..."
    curl -fsSL https://get.docker.com | bash
    systemctl start docker
    systemctl enable docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，正在安装..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Docker 环境已就绪"
docker --version
docker-compose --version
EOF

echo "📂 3. 创建服务器目录..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR"

echo "📤 4. 上传项目文件到服务器..."
sshpass -p "$SERVER_PASSWORD" rsync -avz --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='admin-system/backend/.venv' -e "ssh -o StrictHostKeyChecking=no" ./ $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

echo "🔨 5. 在服务器上构建并启动 Docker 容器..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
cd $REMOTE_DIR

echo "停止旧容器（如果存在）..."
docker-compose down 2>/dev/null || true

echo "构建 Docker 镜像..."
docker-compose build

echo "启动 Docker 容器..."
docker-compose up -d

echo "等待容器启动..."
sleep 10

echo "检查容器状态..."
docker ps --filter "name=$CONTAINER_NAME"

echo "检查容器日志..."
docker logs $CONTAINER_NAME 2>&1 | tail -20
EOF

echo ""
echo "🎉 部署完成！"
echo "========================================="
echo "🌐 访问地址: http://$SERVER_IP:$PORT"
echo "🐳 容器名称: $CONTAINER_NAME"
echo "📁 部署目录: $REMOTE_DIR"
echo "========================================="
echo ""
echo "📝 常用管理命令："
echo "  查看日志: ssh root@$SERVER_IP 'cd $REMOTE_DIR && docker-compose logs -f'"
echo "  重启服务: ssh root@$SERVER_IP 'cd $REMOTE_DIR && docker-compose restart'"
echo "  停止服务: ssh root@$SERVER_IP 'cd $REMOTE_DIR && docker-compose down'"
echo "========================================="
