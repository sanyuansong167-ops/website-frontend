# Phase 2-D 企业能力模块接入报告

> AI 文档元信息
> - 文档类型：阶段整改报告
> - 所属层级：源码接入与联调验证
> - 所属阶段：Phase 2-D
> - 适用对象：前端、后端、测试、AI
> - 主要用途：记录企业实力、客户 Logo、AI 能力中心、能力底座接入 Portal API 的修改与验证结果
> - 本文不用于：定义新的后端接口、调整页面视觉设计或替代真实联调报告
> - 上游文档：D:\武汉云台\yuntai-frontend\接口文档(1).md；docs/04-接口设计；Phase 2-A API层接入整改报告.md
> - 下游文档：Phase 2-E 接入任务输入
> - 事实来源：src/api/portal.ts；src/views/Home.vue；src/data/site.js；npm run build 输出；本地联调请求结果
> - 当前状态：待后端服务联调复测
> - 可信级别：中高
> - 关键词：企业实力，客户Logo，AI能力中心，能力底座，Portal API，Mock兜底

## 1. 修改文件列表

- `src/api/portal.ts`
- `src/views/Home.vue`
- `src/data/site.js`
- `Phase 2-D 企业能力模块接入报告.md`

说明：未修改 `src/router/**`、`public/**`、CSS 文件，未引入新依赖。

## 2. 接口接入情况

- `GET /portal/api/site/strength-metrics`：新增 `getPortalStrengthMetrics()`，并接入首页企业实力数字指标。
- `GET /portal/api/site/client-logos`：新增 `getPortalClientLogos()`，并接入首页服务客户 Logo 墙。
- `GET /portal/api/site/ai-cards`：新增 `getPortalAiCards()`，并接入首页 AI 战略卡片。
- `GET /portal/api/site/capabilities`：新增 `getPortalCapabilities()`，并接入首页能力底座卡片。

## 3. 页面模块变更说明

- AI 战略卡片：由静态 `Feature` 列表切换为 `aiCards` 数据驱动，继续复用原 `Feature` 组件。
- 能力底座：由静态三张 `base-card` 切换为 `capabilities` 数据驱动，保留原 `base-card` 类名和三类色彩兜底。
- 服务客户：由静态客户列表切换为 `clientLogos` 数据驱动，保留原客户墙容器和 emoji 兜底。
- 企业实力数字：由静态四个数字卡片切换为 `strengthMetrics` 数据驱动，保留原 `nums`、`num-icon` 结构。

## 4. 字段映射说明

- 企业实力：`metricValue -> value`，`label -> label`，`iconUrl -> iconUrl`。
- 客户 Logo：保留 `id`、`name`、`industry`、`logoUrl`。
- AI 卡片：`name -> title`，`englishName -> en`，`description -> text`，`jumpLink -> jumpLink`，`iconUrl -> iconUrl`。
- 能力底座：保留 `id`、`name`、`items`、`items[].id`、`items[].name`；`items` 非数组时兜底为空数组。
- 页面层未直接使用 `metricValue`、`englishName`、AI 卡片后端 `name`、AI 卡片后端 `description`。

## 5. 图标兼容说明

- AI 卡片继续使用原有 lucide 图标体系；`iconUrl` 为空或不是可直接映射的图标名时，按原顺序使用 `BookOpen`、`MessageSquare`、`ChartNoAxesColumn`、`Bot` 兜底。
- 企业实力数字继续使用原有 `Users`、`Building2`、`Award`、`Trophy` 图标兜底。
- 本阶段未为 `iconUrl` 改动图标容器、颜色、尺寸和卡片布局。

## 6. Logo 图片处理说明

- 客户 Logo `logoUrl` 存在时尝试渲染图片。
- `logoUrl` 为空或图片加载失败时，使用原客户墙 emoji 兜底，不显示 broken image。
- `industry` 为空时不渲染行业文本，避免显示 `undefined/null`。
- 现有 CSS 未定义客户 Logo 图片专用尺寸；本阶段未修改 CSS。如真实 Logo 图片视觉验收不达标，建议后续在设计允许下补最小图片样式规则。

## 7. Mock 兜底说明

- `src/data/site.js` 新增 `strengthMetrics`、`clientLogos`、`aiCards`、`capabilities` Mock。
- 保留原有 Mock 数据，未删除、重命名或搬迁。
- 页面初始使用 Mock 渲染，避免 loading 阶段布局抖动。
- GET 接口失败时 API 层输出 `[Portal API] 接口请求失败` 并返回 Mock；页面层也保留 fallback 日志和 Mock 回退。

## 8. 空值处理说明

- 企业实力空数组：`nums` 内不渲染指标项，不报错。
- 客户 Logo 空数组：客户墙内不渲染客户项，不报错。
- AI 卡片空数组：AI 卡片区域不渲染卡片项，不报错。
- 能力底座空数组：能力底座区域不渲染卡片项，不报错。
- 能力底座 `items` 非数组：API 层映射为空数组。
- 空 `iconUrl` / `logoUrl` 不显示 `undefined/null/[object Object]`。

## 9. 联调结果

当前本机 `127.0.0.1:8080` 后端服务未监听，真实正常数据、空数据、字段为空、图片加载失败等场景暂未完成后端联调。

已验证：

- 首页 `http://127.0.0.1:5173/`：HTTP 200。
- `GET /portal/api/site/strength-metrics` 经 Vite 代理返回 502，符合后端不可达场景。
- `GET /portal/api/site/client-logos` 经 Vite 代理返回 502，符合后端不可达场景。
- `GET /portal/api/site/ai-cards` 经 Vite 代理返回 502，符合后端不可达场景。
- `GET /portal/api/site/capabilities` 经 Vite 代理返回 502，符合后端不可达场景。

待后端启动后复测：

- 四个接口正常数据。
- 四个接口空数组。
- `iconUrl` / `logoUrl` 为空。
- 客户 Logo 图片加载失败。
- 能力底座 `items` 为空或异常。

## 10. 构建结果

- `npm run build`：普通沙箱下因 Vite 写入 `node_modules/.vite-temp` 被拒绝而失败。
- 提升权限后执行同一条 `npm run build`：通过。
- 构建输出仅包含 Vite 默认 chunk 体积提示，无编译错误。

## 11. 回滚记录

- 未触发回滚。
- 页面可正常构建，首页可正常返回。

## 12. 待确认问题

- 后端服务启动后，需要补充真实接口正常数据、空数据和图片异常场景联调记录。
- 客户 Logo 图片真实尺寸和现有客户墙 CSS 的适配效果需浏览器视觉验收。
- 后端 `iconUrl` 如果返回图片 URL，本阶段继续使用现有图标兜底，未重构图标区。

## 13. Phase 2-E 建议

- 启动后端后统一复测 Phase 2-B、2-C、2-D 所有 Portal 接口。
- 接入剩余 Portal 内容接口，例如时间轴、研发方向、价值观、承诺、产学研合作等模块。
- 在设计允许后补充客户 Logo 图片专用最小样式，确保真实 Logo 不拉伸、不变形。
