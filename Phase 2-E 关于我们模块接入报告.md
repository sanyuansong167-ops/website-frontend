# Phase 2-E 关于我们模块接入报告

## 1. 修改文件列表

- `src/api/portal.ts`
- `src/data/site.js`
- `src/views/Home.vue`
- `Phase 2-E 关于我们模块接入报告.md`

未修改：`src/router/**`、`public/**`、样式文件。

## 2. API 接入情况

本阶段新增并复用统一 Portal API 封装与 Mock 兜底逻辑：

- `getPortalPartnerUniversities()` -> `GET /portal/api/partner-universities`
- `getPortalTimelineEvents()` -> `GET /portal/api/timeline-events`
- `getPortalResearchDirections()` -> `GET /portal/api/research-directions`
- `getPortalValueCards()` -> `GET /portal/api/value-cards`
- `getPortalOurPromises()` -> `GET /portal/api/our-promises`

所有新增 GET 接口均通过 `getPortalWithMock` 请求真实 Portal 接口；请求失败时返回 `src/data/site.js` 中对应 Mock，并保留统一错误日志：

```ts
console.error('[Portal API] 接口请求失败:', {
  name,
  path,
  error,
})
```

## 3. 页面接入模块

`src/views/Home.vue` 已将以下关于我们相关模块由静态数据切换为 Portal API 数据源：

- 产学研合作高校：`partnerUniversities`
- 重点研发方向：`researchDirections`
- 时间轴：`timelineEvents`
- 核心价值观：`valueCards`
- 我们的承诺：`ourPromises`

页面保留原 section、class、组件层级和交互位置；未调整页面样式、路由或全局结构。

## 4. 字段映射说明

- 合作高校：`name -> name`，`fullName -> fullName`，`logoUrl -> logoUrl`
- 时间轴：`year -> year`，`title -> title`，`description -> description`
- 研发方向：`titleCn -> title`，`titleEn -> en`，`summary -> summary`，`iconUrl -> iconUrl`
- 价值观卡片：`iconUrl -> iconUrl`，`title -> title`，`subtitle -> subtitle`，`description -> description`
- 我们的承诺：`content -> content`，`tags[].tagText -> tags[].tagText`，`tags[].tagText -> tags[].label`

页面层未直接使用 `titleCn`、`titleEn` 等后端原始字段；这些字段只在 API 层映射函数中处理。

## 5. Timeline 兼容处理

当前时间轴模板仍沿用既有数组下标结构：

```vue
t[0] / t[1] / t[2]
```

本阶段在页面数据加载后将 API 返回的 `{ year, title, description }` 转换为 `[year, title, description]`，避免改动现有 DOM 结构与样式。

待后续优化：timeline 页面结构仍使用数组下标，建议 Phase 3 或专项重构时统一改为对象字段渲染。

## 6. 图标与图片兼容

- 合作高校：优先渲染 `logoUrl`，图片加载失败后回退学校缩写 `name`；`fullName` 为空时不渲染空文本。
- 研发方向：优先渲染 `iconUrl`，图片加载失败或为空时回退原有 Lucide 图标顺序。
- 价值观卡片：优先渲染 `iconUrl`，图片加载失败或为空时回退原有 `IconBox` 图标顺序。

未新增 CSS；保持原有视觉容器与 class。

## 7. Mock 兜底说明

`src/data/site.js` 仅追加以下兜底数据，未删除、重命名、搬迁或重构既有 Mock：

- `partnerUniversities`
- `timelineEvents`
- `researchDirections`
- `valueCards`
- `ourPromises`

其中 `timelineEvents` 基于既有 `timeline` 数据派生，保障当前页面兼容。

## 8. 空状态处理

- 接口返回空数组时，对应列表模块自然不渲染条目，不抛错。
- `fullName`、`subtitle`、`content` 为空时通过 `v-if` 避免显示 `undefined/null`。
- `tags` 非数组时在 API 层与页面层均兜底为空数组。
- 图片地址为空或加载失败时自动回退既有文本或图标展示。

## 9. 联调结果

本地 Vite 服务测试：

- 首页 `/`：HTTP 200
- `/portal/api/partner-universities`：HTTP 502
- `/portal/api/timeline-events`：HTTP 502
- `/portal/api/research-directions`：HTTP 502
- `/portal/api/value-cards`：HTTP 502
- `/portal/api/our-promises`：HTTP 502

说明：本机 `127.0.0.1:8080` 后端服务未监听，新增代理接口返回 502 属于当前环境预期；前端 GET 方法会触发 Mock 兜底并输出错误日志。

待后端服务启动后继续验证：

- 正常数据场景
- 空数据场景
- 字段为空与图片加载失败场景

## 10. 构建结果

执行命令：

```bash
npm run build
```

结果：

- 首次普通沙箱执行失败：Vite 写入 `node_modules/.vite-temp` 触发 Windows `EPERM`。
- 使用外部权限重跑同一命令成功。
- Vite 输出 chunk 体积超过 500 kB 的既有警告，不影响本阶段构建结果。

## 11. 回滚记录

本阶段未执行回滚操作，未删除既有 Mock、页面文案、样式、路由或组件文件。

## 12. 待确认问题

- 后端服务未启动，5 个新增接口的真实数据联调、空数据联调仍待后端环境可用后确认。
- 时间轴模板仍使用数组下标结构，本阶段仅做兼容转换，未做结构性重构。
- 如后端后续返回真实 `logoUrl/iconUrl` 图片，建议再做一次浏览器截图核对实际图片尺寸对原布局的影响。

## 13. Phase 2 总结建议

- Phase 2 已覆盖官网首页主要 Portal 数据源接入链路，建议下一阶段集中做真实后端环境联调与异常场景验收。
- 建议补充一组最小化端到端检查：Portal GET 成功、GET 空数组、GET 500、图片 404、线索提交 400/500。
- 后续可将时间轴数组结构改为对象结构，并同步补充页面级类型定义，减少长期维护成本。
