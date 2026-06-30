# Phase 2-A API层接入整改报告

## 1. 修改文件列表

- `src/api/portal.ts`
- `src/data/site.js`
- `Phase 2-A API层接入整改报告.md`

## 2. 新增 API 方法列表

- `getPortalProducts()`
- `getPortalCases()`
- `getPortalContactInfo()`
- `getPortalIndustrySolutions()`
- `getPortalCooperationDirectionTags()`
- `submitPortalLead(payload)`

## 3. 修正 API 方法列表

- 本阶段未修改已接入的 5 个 Portal API 方法：
  - `getSiteConfig()`
  - `getNavigation()`
  - `getHomeBanner()`
  - `getHomeMetrics()`
  - `getHonors()`

## 4. 字段映射说明

- 产品：`id -> id`，`name -> title`，`logoUrl -> logoUrl`，`subTitle -> sub`，`abstractText -> desc`，`statusTag -> status`，`detailLink -> detailLink`。
- 案例：`title -> title`，`logoUrl -> img`，`summary -> desc`，`keywords -> tags`；`keywords` 非数组时兜底为空数组。
- 联系方式：`contactAddress -> address`，`businessPhone -> phone`，`contactEmail -> email`。
- 行业解决方案：保留 `name`、`iconUrl`、`description`、`customerTags`；`customerTags` 非数组时兜底为空数组。
- 合作方向标签：`tagText -> tagText`，`tagText -> label`。
- 线索提交：`contactName -> name`，`companyName -> company`，`email -> email`，`phone -> phone`，`demandContent -> demandDescription`；提交前统一 `trim`。

## 5. Mock 兜底说明

- `src/data/site.js` 保留原有 `products`、`cases`、`timeline`、`hero`、`navigation`、`metrics`、`honors`、`siteConfig` 数据，未删除、重命名或搬迁。
- 在文件末尾追加产品和案例的后端契约兼容字段，支持 API 失败时复用现有 Mock。
- 新增 `contactInfo`、`industrySolutions`、`cooperationDirectionTags` 兜底数据。
- `industrySolutions` 与 `cooperationDirectionTags` 暂为空数组，避免在接口文档之外创造业务内容。

## 6. 错误处理说明

- 新增 GET 方法均请求真实 Portal 接口，并复用现有 `getPortal` / `unwrapPortalData` 响应解析逻辑。
- 新增 GET 方法失败时统一输出：

```ts
console.error('[Portal API] 接口请求失败:', {
  name,
  path,
  error,
})
```

- GET 失败后返回对应 Mock 兜底，避免后续页面接入时因接口失败导致空白或崩溃。
- `submitPortalLead(payload)` 使用真实 `POST /portal/api/leads`，不 Mock 成功、不吞掉错误，后端错误会继续抛给调用方。

## 7. 未处理或待确认项

- 按 Phase 2-A 规则，本次未修改 `src/views/**`、`src/components/**`、`src/router/**`、`public/**`，也未接入页面调用逻辑。
- 产品 `logoUrl` / `detailLink` 与当前页面图标、跳转展示关系仍待 Phase 2-B 页面接入阶段确认。
- 行业解决方案展示模块边界仍待 Phase 2-B 确认，本阶段只完成 API 层数据结构准备。
- 当前环境的全局 `npm run build` 启动器损坏，报缺失 `npm-cli.js`；已改用项目本地 Vite 命令完成构建验证。

## 8. 构建检查结果

- `npm run build`：未能启动，原因是当前机器 `npm.ps1` 指向的 `C:\Users\86155\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js` 不存在。
- `.\node_modules\.bin\vite.cmd build`：构建通过。
- 构建输出仅包含 Vite 默认 chunk 体积提示，无编译错误。

## 9. 下一步 Phase 2-B 建议接入模块

- 优先将产品、案例、联系方式三个页面当前依赖 Mock 的模块切换为本阶段新增 API 方法。
- 接入合作方向标签到联系模块左侧展示区。
- 接入行业解决方案模块，并明确其与案例模块的页面职责边界。
- 接入线索表单提交逻辑，重点处理后端校验错误、限流错误和用户反馈。
