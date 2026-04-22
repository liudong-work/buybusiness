# Faire Clone - 外贸批发市场网站

基于 Next.js 14 构建的现代化外贸批发市场网站，专门针对 SEO 优化，便于外国人搜索。

## 🚀 技术特色

### SEO 优化
- **服务端渲染 (SSR)** - Next.js 内置，提升搜索引擎爬取效率
- **结构化数据** - Schema.org 标记，提升搜索排名
- **多语言 SEO** - 支持多语言元标签优化
- **性能优化** - 图片懒加载、代码分割、缓存策略

### 技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Headless UI + 自定义组件
- **动画**: Framer Motion
- **图标**: Lucide React

## 📁 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局 (包含 SEO 配置)
│   └── page.tsx        # 首页
├── components/         # 可复用组件
│   ├── seo/           # SEO 相关组件
│   ├── layout/        # 布局组件
│   └── ui/            # 基础 UI 组件
├── lib/               # 工具函数
└── types/             # TypeScript 类型定义
```

## 🎯 SEO 优化策略

### 关键词策略
- **主要关键词**: wholesale marketplace, bulk products, business suppliers
- **长尾关键词**: wholesale home decor suppliers, bulk beauty products
- **地域关键词**: US wholesale, European suppliers

### 技术优化
- 图片 WebP/AVIF 格式优化
- 移动端优先响应式设计
- 核心网页指标 (Core Web Vitals) 优化
- 结构化数据标记

## 🛠️ 开发指南

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

## 🌐 多语言支持

项目支持多语言 SEO 配置：
- 英语 (en-US) - 主要语言
- 西班牙语 (es-ES) - 次要语言
- 可根据需要扩展更多语言

## 📊 性能指标目标

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms  
- **Cumulative Layout Shift (CLS)**: < 0.1
- **页面加载速度**: < 3s

## 🔍 SEO 检查清单

- [ ] 每个页面有唯一的 title 和 meta description
- [ ] 图片都有 alt 标签
- [ ] URL 结构清晰且包含关键词
- [ ] 内部链接合理
- [ ] 结构化数据正确实现
- [ ] 页面加载速度 < 3秒
- [ ] 移动端友好
- [ ] robots.txt 配置正确

## 🚀 部署建议

### 推荐平台
- **Vercel** - Next.js 官方平台，自动优化
- **Netlify** - 支持 SSR，CDN 全球分发
- **AWS Amplify** - 企业级部署方案

### SEO 监控工具
- Google Search Console
- Google Analytics 4
- PageSpeed Insights
- Ahrefs/SEMrush

## 📈 持续优化

- 每月进行 SEO 审计
- 跟踪关键词排名变化
- 分析用户行为数据
- 根据数据调整优化策略

---

**开发团队**: Faire Clone Team  
**项目类型**: 外贸网站克隆  
**目标市场**: 全球批发市场  
**技术重点**: SEO 优化和性能