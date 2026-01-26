# 统一身份认证系统 - Vue3 重构版

基于 Vue 3 + TypeScript + Element Plus 重构的西藏交发集团统一身份认证系统前端。

## 📋 项目简介

本项目是对原有基于 jQuery + Thymeleaf 的 SSO 系统进行现代化重构,采用 Vue 3 Composition API + TypeScript 开发,提供更好的开发体验和用户体验。

## ✨ 主要特性

- 🚀 **Vue 3** - 使用最新的 Vue 3 Composition API
- 💪 **TypeScript** - 完整的类型支持
- 🎨 **Element Plus** - 基于 Vue 3 的组件库
- 🔐 **权限管理** - 完善的权限控制系统
- 📱 **响应式设计** - 支持桌面端和移动端
- 🔄 **二维码登录** - 支持扫码登录
- 💾 **状态管理** - 使用 Pinia 进行状态管理
- 🛣️ **路由管理** - 使用 Vue Router 4
- 📦 **Vite** - 快速的开发构建工具

## 🛠️ 技术栈

- **核心框架**: Vue 3.4
- **开发语言**: TypeScript 5.3
- **UI 组件库**: Element Plus 2.5
- **状态管理**: Pinia 2.1
- **路由管理**: Vue Router 4.2
- **HTTP 客户端**: Axios 1.6
- **加密库**: CryptoJS 4.2
- **构建工具**: Vite 5.0
- **代码规范**: ESLint + Prettier

## 📁 项目结构

```
smart-sso-web/
├── public/                  # 静态资源
├── src/
│   ├── api/                # API 接口定义
│   ├── assets/             # 资源文件
│   ├── components/         # 公共组件
│   ├── composables/        # 组合式函数
│   ├── router/             # 路由配置
│   ├── stores/             # 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── views/              # 页面组件
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript 配置
└── vite.config.ts          # Vite 配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物在 `dist` 目录

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 🔧 环境变量配置

### 开发环境 (.env.development)

```env
# API 基础路径
VITE_API_BASE_URL=http://localhost:8080

# 应用标题
VITE_APP_TITLE=统一身份认证系统
```

### 生产环境 (.env.production)

```env
# API 基础路径
VITE_API_BASE_URL=https://sso.example.com

# 应用标题
VITE_APP_TITLE=统一身份认证系统
```

## 📖 核心功能

### 1. 登录模块

- ✅ 账号密码登录
- ✅ 二维码扫码登录
- ✅ 记住密码(加密存储)
- ✅ 忘记密码(身份验证 + 重置)
- ✅ 密码显示/隐藏切换

### 2. 管理后台

- ✅ 用户管理(增删改查)
- ✅ 角色管理(增删改查)
- ✅ 权限管理(树形结构)
- ✅ 应用管理(增删改查)
- ✅ 机构管理(树形结构)
- ✅ 个人资料管理

### 3. 权限控制

- ✅ 路由级别权限控制
- ✅ 按钮级别权限控制
- ✅ 菜单动态加载
- ✅ 权限指令

## 🔐 API 接口

所有 API 接口定义在 `src/api` 目录下:

- `auth.ts` - 认证相关接口
- `user.ts` - 用户管理接口
- `role.ts` - 角色管理接口
- `permission.ts` - 权限管理接口
- `app.ts` - 应用管理接口
- `office.ts` - 机构管理接口
- `menu.ts` - 菜单接口

## 📝 开发规范

### 组件命名

- 组件文件使用 PascalCase: `UserEdit.vue`
- 组件名称使用 PascalCase: `<UserEdit />`

### 文件命名

- 工具函数使用 camelCase: `crypto.ts`
- 类型定义使用 camelCase: `index.ts`
- 常量文件使用 UPPER_CASE: `CONSTANTS.ts`

### 代码风格

- 使用 ESLint + Prettier 进行代码检查和格式化
- 使用 TypeScript 严格模式
- 使用 Composition API
- 使用 `<script setup>` 语法糖

## 🚢 部署

### 方式一: Nginx 独立部署

1. 构建项目

```bash
npm run build
```

2. 将 `dist` 目录部署到 Nginx

```nginx
server {
    listen 80;
    server_name sso.example.com;

    location / {
        root /var/www/smart-sso-web/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
    }
}
```

### 方式二: Spring Boot 集成部署

1. 构建项目

```bash
npm run build
```

2. 将 `dist` 目录内容复制到 Spring Boot 项目的 `src/main/resources/static` 目录

3. 重新打包 Spring Boot 项目

## 📚 相关文档

- [Vue 3 文档](https://cn.vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

[MIT License](LICENSE)

## 👥 维护团队

- 开发团队 - 星杓科技

## 📞 联系方式

如有问题,请联系开发团队。

---

**版本**: v1.0.0  
**最后更新**: 2026-01-21
