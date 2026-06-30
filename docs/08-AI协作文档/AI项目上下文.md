# AI项目上下文

> AI 文档元信息
> - 文档类型：AI 上下文
> - 所属层级：AI 协作层
> - 所属阶段：持续维护
> - 适用对象：Codex、ChatGPT、Claude、Cursor、Windsurf、前端开发
> - 主要用途：为 AI 快速提供项目背景、代码事实、接口状态和修改规则
> - 本文不用于：替代完整需求或接口文档
> - 上游文档：README.md，docs/00-文档体系说明.md
> - 下游文档：AI开发规范.md，AI提示词规范.md
> - 事实来源：README.md，src，docs 重构结果
> - 当前状态：active
> - 可信级别：高
> - 关键词：AI上下文，Codex，项目上下文

## 1. 一句话状态

Yuntai Frontend 是武汉云台数据有限公司官网前端项目，当前已实现官网前台核心页面、部分 Portal 接口和本地数据兜底，正处于静态官网向接口化、可维护官网过渡阶段。

## 2. 必读顺序

```text
README.md
docs/00-文档体系说明.md
docs/01-项目概述/项目简介.md
docs/01-项目概述/技术架构.md
docs/03-前端设计/页面结构说明.md
docs/04-接口设计/接口对接总览.md
docs/03-前端设计/字段说明书.md
docs/07-项目管理/开发任务清单.md
```

## 3. 技术事实

- Vue 3 + Vite + Vue Router。
- Axios 已存在于 `src/api/http.ts`。
- Portal API 已存在于 `src/api/portal.ts`。
- Vite 已代理 `/portal` 到 `http://localhost:8080`。
- `src/data/site.js` 是当前本地兜底数据源。
- `Home.vue` 局部使用 `<script setup lang="ts">`。
- 路由使用 `createWebHistory()`，部署需要 history fallback。

## 4. 页面事实

| 页面 | 状态 |
| --- | --- |
| `/` | 已实现 |
| `/product` | 已实现，产品汇总页 |
| `/case` | 已实现，案例汇总页 |
| `/product/:id` | 当前重定向 |
| `/case/:id` | 当前重定向 |

## 5. 接口事实

已接接口：

- `GET /portal/api/site/config`
- `GET /portal/api/site/navigation`
- `GET /portal/api/site/home-banner`
- `GET /portal/api/site/home-metrics`
- `GET /portal/api/site/honors`

待确认接口：

- 产品列表与详情
- 案例列表与详情
- 关于我们
- 联系表单提交
- 招聘岗位

## 6. AI 修改代码规则

- 先读相关 docs，再读对应源码。
- 不要把旧文档中“暂无 API”的说法当成当前事实。
- 不要修改业务代码来完成纯文档任务。
- 修改字段时同步字段说明书和 API 字段映射表。
- 修改接口时同步接口总览、联调说明和 Mock 规范。
- 涉及代码修改后运行 `npm run build`。
- 未确认的信息标记为“待确认”。

## 7. 当前优先任务

1. 首页硬编码内容抽离。
2. 产品、案例、时间轴字段统一。
3. 联系表单绑定、校验、提交。
4. 恢复单产品和单案例详情。
5. 补齐上线信息和构建检查。
