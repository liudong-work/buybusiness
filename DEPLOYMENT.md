# 服务器部署说明

## 📋 部署信息

| 项 | 值 |
|---|---|
| 服务器 IP | `182.92.59.70` |
| 用户名 | `root` |
| 密码 | `Ryg@893012` |
| 容器端口 | `3003` |
| 容器名称 | `wholesale-web` |
| 部署目录 | `/www/wholesale-platform` |
| 访问地址 | `http://182.92.59.70:3003` |

---

## 🚀 手动部署步骤

### 1. 上传项目文件到服务器

**在本地执行：**

```bash
# 进入项目目录
cd /Users/liudong/Desktop/cloneWebsite

# 使用 scp 上传文件（排除不必要的文件）
scp -r \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='admin-system/backend/.venv' \
  --exclude='admin-system/frontend/node_modules' \
  . root@182.92.59.70:/www/wholesale-platform/
```

*或者使用 rsync（推荐）：*
```bash
rsync -avz \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='admin-system/backend/.venv' \
  --exclude='admin-system/frontend/node_modules' \
  -e ssh ./ root@182.92.59.70:/www/wholesale-platform/
```

---

### 2. 连接服务器并部署

**连接服务器：**
```bash
ssh root@182.92.59.70
```

**在服务器上执行以下命令：**

```bash
# 进入部署目录
cd /www/wholesale-platform

# 检查 Docker 是否安装
docker --version
docker-compose --version

# 如果 Docker 未安装，执行安装（可选）
# curl -fsSL https://get.docker.com | bash
# systemctl start docker
# systemctl enable docker

# 停止旧容器（如果存在）
docker-compose down 2>/dev/null || true

# 构建 Docker 镜像
docker-compose build

# 后台启动容器
docker-compose up -d

# 查看容器状态
docker ps

# 查看启动日志
docker logs wholesale-web
```

---

## ✅ 验证部署

执行完上述命令后，等待约 1-2 分钟让容器启动，然后访问：

**🌐 网站地址：** http://182.92.59.70:3003

---

## 🔧 常用管理命令

### 查看容器日志
```bash
cd /www/wholesale-platform
docker-compose logs -f
```

### 重启服务
```bash
cd /www/wholesale-platform
docker-compose restart
```

### 停止服务
```bash
cd /www/wholesale-platform
docker-compose down
```

### 更新代码并重新部署
```bash
cd /www/wholesale-platform
git pull  # 或者重新上传文件
docker-compose down
docker-compose build
docker-compose up -d
```

### 进入容器内部
```bash
docker exec -it wholesale-web sh
```

---

## 🐳 Docker 配置说明

### Dockerfile
- 使用多阶段构建减小镜像体积
- Node.js 18 Alpine 作为基础镜像
- 独立运行模式（standalone）
- 非 root 用户运行，提高安全性

### docker-compose.yml
- 端口映射：`3003:3000`
- 自动重启：`always`
- 生产环境模式
- 独立网络隔离

---

## ⚠️ 注意事项

1. **端口冲突**：端口 `3003` 已预留，不会影响服务器上的其他服务
2. **防火墙**：如果无法访问，请检查服务器防火墙是否开放 3003 端口
   ```bash
   # 开放端口（CentOS）
   firewall-cmd --zone=public --add-port=3003/tcp --permanent
   firewall-cmd --reload
   
   # 开放端口（Ubuntu/Debian）
   ufw allow 3003/tcp
   ```
3. **资源**：构建时建议至少 2GB 内存
4. **数据持久化**：本项目为纯前端，无需数据库持久化

---

## 📞 故障排查

### 问题：无法访问网站
```bash
# 检查容器是否运行
docker ps

# 检查容器日志
docker logs wholesale-web

# 检查端口是否监听
netstat -tlnp | grep 3003
```

### 问题：构建失败
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

---

## 🎯 部署完成检查清单

- [ ] 文件上传完成
- [ ] Docker 镜像构建成功
- [ ] 容器正常启动
- [ ] `http://182.92.59.70:3003` 可正常访问
- [ ] 中英文切换功能正常
- [ ] 页面加载正常
