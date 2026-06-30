# Phase 2-B 产品案例行业方案接入报告

> AI 文档元信息
> - 文档类型：阶段整改报告
> - 所属层级：源码接入与联调验证
> - 所属阶段：Phase 2-B
> - 适用对象：前端、后端、测试、AI
> - 主要用途：记录产品、案例、行业解决方案页面接入 Portal API 的修改与验证结果
> - 本文不用于：定义新的后端接口或新增接口字段
> - 上游文档：D:\武汉云台\yuntai-frontend\接口文档(1).md；docs/04-接口设计；Phase 2-A API层接入整改报告.md
> - 下游文档：Phase 2-C 接入任务输入
> - 事实来源：src/views/Home.vue；src/views/ProductDetail.vue；src/views/CaseDetail.vue；src/data/site.js；src/api/portal.ts；npm run build 输出
> - 当前状态：待后端服务联调复测
> - 可信级别：中高
> - 关键词：Portal API，产品，案例，行业方案，Mock兜底，页面接入

## 1. 修改文件列表

- `src/views/Home.vue`
- `src/views/ProductDetail.vue`
- `src/views/CaseDetail.vue`
- `src/data/site.js`
- `Phase 2-B 产品案例行业方案接入报告.md`

说明：`src/api/portal.ts` 继续复用 Phase 2-A 已实现的 `getPortalProducts()`、`getPortalCases()`、`getPortalIndustrySolutions()`，本阶段未重复创建同类 API 方法。

## 2. 页面接入模块

- 首页产品矩阵：从 `site.js` 初始 Mock 切换为 mounted 后调用 `getPortalProducts()`。
- 产品详情页：从 `site.js` 初始 Mock 切换为 mounted 后调用 `getPortalProducts()`。
- 首页产品与行业方案模块：从案例 Mock 切换为 `industrySolutions` 初始 Mock，并调用 `getPortalIndustrySolutions()`。
- 案例详情页：从 `site.js` 初始 Mock 切换为 mounted 后调用 `getPortalCases()`。

## 3. 接口接入情况

- `GET /portal/api/products`：已通过 `getPortalProducts()` 接入首页产品矩阵与产品详情页。
- `GET /portal/api/cases`：已通过 `getPortalCases()` 接入案例详情页。
- `GET /portal/api/industry-solutions`：已通过 `getPortalIndustrySolutions()` 接入首页行业方案模块。

## 4. 字段使用情况

- 产品页面展示字段：`id`、`title`、`sub`、`desc`、`status`、`detailLink`。
- 案例页面展示字段：`title`、`img`、`desc`、`tags`。
- 行业方案页面展示字段：`name`、`iconUrl`、`description`、`customerTags`。
- 页面层未直接使用产品后端原始字段 `name`、`subTitle`、`abstractText`、`statusTag`。
- 页面层未直接使用案例后端原始字段 `summary`、`keywords`。
- 产品图标、颜色、标签、核心功能属于页面原有展示辅助内容，继续从本地 Mock 通过 helper 按 `id` 或索引读取，未作为后端接口字段处理。

## 5. Mock 兜底情况

- 页面初始渲染继续使用 `site.js` 中的 Mock，避免 loading 阶段布局抖动。
- API 层接口异常时会返回 Mock 兜底，并输出 `[Portal API] 接口请求失败` 日志。
- 页面层额外保留 try/catch；若 API 调用链仍抛出异常，会输出页面级 fallback 日志并恢复对应 Mock。
- 正常接口返回空数组时，页面采用空数组，不继续保留初始 Mock；对应模块渲染为空列表。
- `src/data/site.js` 新增 `industrySolutions` 兜底数据，仅包含 `name`、`iconUrl`、`description`、`customerTags` 后端契约字段。

## 6. 联调结果

当前本机 `127.0.0.1:8080` 后端服务未监听，真实正常数据与真实空数据场景暂未完成联调。

已验证：

- Vite 页面服务 `http://127.0.0.1:5173/`：HTTP 200。
- 产品详情页 `http://127.0.0.1:5173/product`：HTTP 200。
- 案例详情页 `http://127.0.0.1:5173/case`：HTTP 200。
- `GET /portal/api/products` 经 Vite 代理返回 502，符合后端不可达场景。
- `GET /portal/api/cases` 经 Vite 代理返回 502，符合后端不可达场景。
- `GET /portal/api/industry-solutions` 经 Vite 代理返回 502，符合后端不可达场景。

待后端启动后复测：

- 产品接口正常数据。
- 产品接口空数组。
- 案例接口正常数据。
- 案例接口空数组。
- 行业方案接口正常数据。
- 行业方案接口空数组。

## 7. 构建结果

- `npm run build`：通过。
- 构建输出仅包含 Vite 默认 chunk 体积提示，无编译错误。

## 8. 待确认问题

- 当前环境没有可用的后端 8080 服务，正常数据与空数据只能待服务启动后复测。
- 当前环境未发现可用 headless 浏览器命令，未完成自动截图对比；本次通过源码 diff 控制未修改 CSS、类名、路由和公共资源。
- 首页 `#cases` 区块标题为“产品与行业方案”，本阶段按行业方案模块接入；若后续需要单独首页案例列表，需要 Phase 2-C 明确模块边界。
- 后端 `iconUrl` 为图片 URL 时，当前页面仍沿用原有 `IconBox` 图标体系展示兜底图标，未修改组件 DOM 结构。

## 9. Phase 2-C 建议

- 启动后端服务后，按产品、案例、行业方案三类接口分别复测正常数据、空数组和异常场景。
- 接入联系方式与合作方向标签，完成联系模块 API 化。
- 明确首页案例模块与行业方案模块的展示边界，决定是否新增独立案例列表展示区。
- 接入线索表单提交，重点处理后端校验错误、限流错误和用户反馈。
