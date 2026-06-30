# Phase 2-C 联系我们模块接入报告

> AI 文档元信息
> - 文档类型：阶段整改报告
> - 所属层级：源码接入与联调验证
> - 所属阶段：Phase 2-C
> - 适用对象：前端、后端、测试、AI
> - 主要用途：记录联系方式、合作方向、需求提交接入 Portal API 的修改与验证结果
> - 本文不用于：定义新的后端接口、扩大表单必填范围或新增接口字段
> - 上游文档：D:\武汉云台\yuntai-frontend\接口文档(1).md；docs/04-接口设计；Phase 2-A API层接入整改报告.md
> - 下游文档：Phase 2-D 接入任务输入
> - 事实来源：src/views/Home.vue；src/components/FooterSection.vue；src/data/site.js；src/api/portal.ts；npm run build 输出；本地联调请求结果
> - 当前状态：待后端服务联调复测
> - 可信级别：中高
> - 关键词：联系我们，合作方向，线索提交，Portal API，表单校验，Mock兜底

## 1. 修改文件

- `src/views/Home.vue`
- `src/components/FooterSection.vue`
- `src/data/site.js`
- `Phase 2-C 联系我们模块接入报告.md`

说明：继续复用 Phase 2-A 已实现的 `getPortalContactInfo()`、`getPortalCooperationDirectionTags()`、`submitPortalLead()`，未在页面中直接写 axios、fetch 或 request。

## 2. 接口接入情况

- `GET /portal/api/contact-info`：已接入首页联系我们模块与页脚联系我们区域。
- `GET /portal/api/cooperation-direction-tags`：已接入首页合作方向标签区域。
- `POST /portal/api/leads`：已接入首页预约交流表单。

## 3. 字段映射情况

- 联系方式页面字段：`address`、`phone`、`email`。
- 合作方向页面字段：`tagText`、`label`。
- 表单页面字段：`contactName`、`companyName`、`email`、`phone`、`demandContent`。
- 页面未直接使用 `contactAddress`、`businessPhone`、`contactEmail`、`demandDescription` 等后端原始字段。
- `submitPortalLead()` 内部继续负责将前端字段转换为后端请求字段。

## 4. 校验规则

- `contactName`：必填，最长 64 字符。
- `companyName`：必填，最长 128 字符。
- `email`：必填，最长 128 字符，并校验邮箱格式。
- `phone`：选填；填写时最长 64 字符，并校验电话白名单字符。
- `demandContent`：选填；填写时最长 1000 字符。

## 5. 重复提交处理

- 新增 `submitting` 状态。
- 提交中按钮禁用，避免连续点击重复提交。
- `handleLeadSubmit()` 开头对 `submitting` 做防重保护。

## 6. 错误处理

- 联系方式 GET 失败时回退 `site.js` Mock，并保留 `console.error`。
- 合作方向 GET 失败时回退 `site.js` Mock，并保留 `console.error`。
- 线索提交失败时不 Mock 成功、不清空表单，显示失败提示，并保留 `console.error`。
- 线索提交成功后显示成功提示，并重置表单；不刷新页面、不跳转页面。

## 7. Mock 处理

- `site.js` 补充 `contactInfo` Mock：包含 `address`、`phone`、`email` 以及 API 层兼容字段。
- `site.js` 补充 `cooperationDirectionTags` Mock：每项包含 `tagText`、`label`。
- 页面初始使用 Mock 渲染，接口成功后替换为 API 数据，避免 loading 阶段布局抖动。
- 联系方式空值通过 `v-if` 隐藏对应行，避免显示 `undefined` 或 `null`。
- 合作方向空数组时不渲染标签项，不报错。

## 8. 联调结果

当前本机 `127.0.0.1:8080` 后端服务未监听，真实正常数据、空数据、提交成功场景暂未完成联调。

已验证：

- 首页 `http://127.0.0.1:5173/`：HTTP 200。
- `GET /portal/api/contact-info` 经 Vite 代理返回 502，符合后端不可达场景。
- `GET /portal/api/cooperation-direction-tags` 经 Vite 代理返回 502，符合后端不可达场景。
- `POST /portal/api/leads` 经 Vite 代理返回 502，未伪造成成功。
- 表单防重复提交、成功提示、失败提示、失败保留输入已在代码路径中实现；需后端启动后做浏览器端完整复测。

待后端启动后复测：

- 联系方式正常数据。
- 联系方式空字段隐藏。
- 合作方向正常数据。
- 合作方向空数组。
- 线索提交成功。
- 线索提交失败。
- 重复点击提交按钮。

## 9. 构建结果

- `npm run build`：普通沙箱下因 Vite 写入 `node_modules/.vite-temp` 被拒绝而失败。
- 提升权限后执行同一条 `npm run build`：通过。
- 构建输出仅包含 Vite 默认 chunk 体积提示，无编译错误。

## 10. 回滚记录

- 未触发回滚。
- 页面可正常构建，首页可正常返回。

## 11. 待确认项

- 后端服务启动后，需要补充真实接口正常数据和空数据联调记录。
- 线索提交成功、限流错误、参数错误等后端响应需要在真实服务下复测。
- 页脚服务领域仍为原页面静态文案，本阶段未接入其它接口。

## 12. Phase 2-D 建议

- 启动后端后完成 Phase 2-B、Phase 2-C 的真实联调复测清单。
- 接入剩余 Portal 内容接口，例如时间轴、研发方向、价值观、承诺、客户 Logo、企业实力指标、AI 卡片、能力底座。
- 统一沉淀页面级 loading、empty、error 展示规范，避免后续模块重复实现。
