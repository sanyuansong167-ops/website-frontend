# Yuntai Frontend

> AI 文档元信息
> - 文档类型：项目总入口
> - 所属层级：全局入口层
> - 所属阶段：静态官网完善与接口化过渡
> - 适用对象：新人、前端、后端、测试、项目管理、AI
> - 主要用途：项目总览、快速启动、文档导航和当前状态说明
> - 本文不用于：承载字段、接口、页面和联调细节
> - 上游文档：无
> - 下游文档：docs/00-文档体系说明.md，docs/01-项目概述/*
> - 事实来源：package.json，vite.config.mjs，src，docs
> - 当前状态：active
> - 可信级别：高
> - 关键词：README，项目入口，文档导航，Yuntai Frontend

武汉云台数据有限公司官网前端项目，用于展示公司品牌、产品能力、AI 战略、行业方案、企业实力、发展历程和联系方式。

本仓库当前以官网前台展示为主，已具备静态页面、部分 Portal 接口接入和本地静态数据兜底能力。README 只作为项目总入口和文档导航中心，详细页面、字段、接口、联调和 AI 协作说明统一维护在 `docs/`。

## 技术栈

| 类型 | 当前使用 |
| --- | --- |
| 前端框架 | Vue 3 |
| 构建工具 | Vite |
| 路由 | Vue Router |
| 请求库 | Axios |
| 图标 | lucide-vue-next |
| 样式 | CSS，主要位于 `src/assets/styles/` |
| 语言 | JavaScript，局部 Vue SFC 使用 TypeScript 写法 |

## 快速启动

```bash
npm install
npm run dev
npm run build
```

开发服务器默认由 Vite 启动，`npm run dev` 会使用 `--host 0.0.0.0`。本地访问地址以终端输出为准，通常为：

```text
http://localhost:5173
```

## 项目结构

```text
yuntai-frontend/
├── README.md
├── docs/
├── index.html
├── package.json
├── vite.config.mjs
└── src/
    ├── api/
    ├── assets/styles/
    ├── components/
    ├── data/
    ├── router/
    ├── views/
    ├── App.vue
    └── main.js
```

## 文档中心导航

| 阅读目标 | 推荐文档 |
| --- | --- |
| 快速了解项目 | `docs/01-项目概述/项目简介.md` |
| 理解技术架构 | `docs/01-项目概述/技术架构.md` |
| 查看产品需求 | `docs/02-产品需求/需求说明书.md` |
| 查看页面与模块 | `docs/03-前端设计/页面结构说明.md` |
| 查看路由 | `docs/03-前端设计/页面路由说明.md` |
| 查看字段定义 | `docs/03-前端设计/字段说明书.md` |
| 查看接口与联调 | `docs/04-接口设计/接口对接总览.md` |
| 查看 Mock 规范 | `docs/04-接口设计/Mock数据规范.md` |
| 查看开发规范 | `docs/05-开发规范/代码规范.md` |
| 查看本地运行 | `docs/06-部署运维/本地运行.md` |
| 查看上线检查 | `docs/06-部署运维/上线检查清单.md` |
| 查看任务状态 | `docs/07-项目管理/开发任务清单.md` |
| 给 AI 提供上下文 | `docs/08-AI协作文档/AI项目上下文.md` |
| 查看文档体系 | `docs/00-文档体系说明.md` |

推荐阅读顺序：

```text
README.md
-> docs/00-文档体系说明.md
-> docs/01-项目概述/项目简介.md
-> docs/02-产品需求/页面功能说明.md
-> docs/03-前端设计/页面结构说明.md
-> docs/04-接口设计/接口对接总览.md
-> docs/03-前端设计/字段说明书.md
-> docs/08-AI协作文档/AI项目上下文.md
```

## 开发流程

1. 阅读 `docs/08-AI协作文档/AI项目上下文.md` 和相关业务文档。
2. 根据任务类型查看页面、字段、接口或联调文档。
3. 修改代码前确认是否需要同步字段、接口、任务或上线检查文档。
4. 保持页面视觉和交互稳定，避免一次性大范围重构。
5. 提交前至少运行 `npm run build`，文档-only 修改除外。

## 构建与发布

```bash
npm run build
```

构建产物输出到：

```text
dist/
```

`dist/` 可部署到 Nginx、静态资源服务器、对象存储或其他静态站点平台。当前路由使用 `createWebHistory()`，生产环境需要配置刷新回退到 `index.html`。

## 当前项目状态

| 模块 | 状态 |
| --- | --- |
| 首页 `/` | 已实现 |
| 产品汇总页 `/product` | 已实现 |
| 案例汇总页 `/case` | 已实现 |
| `/product/:id` | 当前重定向到 `/product`，单详情待恢复 |
| `/case/:id` | 当前重定向到 `/case`，单详情待恢复 |
| Portal 接口 | 已封装部分站点接口，失败时使用本地数据兜底 |
| 联系表单 | 静态 UI，提交逻辑待实现 |
| Mock 数据 | 主要位于 `src/data/site.js` |
| SEO 与上线信息 | 待补齐正式信息 |

## 联系方式

项目业务联系方式以正式上线信息为准。当前页面中已有占位信息：

| 类型 | 当前值 |
| --- | --- |
| 公司 | 武汉云台数据有限公司 |
| 地点 | 武汉 · 中国光谷 |
| 邮箱 | business@yuntaidata.com |
| 备案号 | 待确认 |
