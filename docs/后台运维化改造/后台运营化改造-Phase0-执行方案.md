# 后台运营化改造 Phase 0 执行方案

> AI 文档元信息
> - 文档类型：执行方案 / AI 任务输入包
> - 所属层级：前端后台运营体验层
> - 所属阶段：Phase 0.1 规划待执行
> - 适用对象：产品负责人、前端开发、测试人员、Codex/AI 执行线程
> - 主要用途：指导将后台 Site 模块 JSON 管理页改造为运维可用的表单页
> - 本文不用于：后端接口设计、数据库迁移、前台官网数据库化、完整 CMS 方案
> - 上游文档：用户确认的 Phase 0 完善版方案
> - 下游文档：Phase 0.1 AI 卡片改造任务、Phase 0.2 客户 Logo/时间线推广任务
> - 事实来源：当前读取 `yuntai-frontend/src/admin/pages/AdminSiteModuleManage.vue`、`src/admin/api/adminSite.ts`、`src/admin/router/adminRoutes.js`、`src/admin/layout/AdminSidebar.vue`
> - 当前状态：active
> - 可信级别：高，字段级映射需在执行前按实际接口返回再次确认
> - 关键词：武汉云台官网、后台运营化、Site 模块、AI 卡片、表单化、JSON 管理页

## 1. 正式执行口径

Phase 0 只改造后台 Site 模块 JSON 管理页，先以 **AI 卡片** 为样板，把已有接口包装成运营表单；跑通后再配置化推广到其他模块。

当前阶段不做完整 CMS，不扩后端，不改数据库，不改前台展示。

## 2. 修改边界

### 2.1 只允许修改

只允许修改前端项目：

```text
D:\武汉云台\yuntai-official\yuntai-frontend
```

重点文件：

```text
src/admin/pages/AdminSiteModuleManage.vue
src/admin/api/adminSite.ts
src/admin/router/adminRoutes.js
src/admin/layout/AdminSidebar.vue
```

Phase 0.1 原则上先在 `AdminSiteModuleManage.vue` 内部跑通，不急着拆组件。

后续可新增：

```text
src/admin/config/adminSiteModuleFormConfig.ts
src/admin/components/SiteModuleForm.vue
src/admin/components/SiteModuleList.vue
```

### 2.2 禁止修改

本阶段禁止修改：

```text
official-website/**
yuntai-frontend/src/views/**
yuntai-frontend/src/components/** 仅前台展示相关组件
数据库结构
接口路径
认证/权限逻辑
接口文档
前台官网展示页面
```

不得引入：

```text
JWT / Bearer Token
新的认证方案
新的后端接口
新的数据库字段
完整媒体库选择器
```

## 3. 当前项目事实

当前后台 Site 模块通用页位于：

```text
yuntai-frontend/src/admin/pages/AdminSiteModuleManage.vue
```

该页面当前存在开发者工具式体验：

```text
Site Module 标识
接口路径展示
接口数据 JSON 展示
记录 ID 输入框
JSON Payload 文本域
排序 Payload 文本域
可见性 Payload 文本域
手动提交新增/编辑/删除/排序/可见性
```

当前 Site 模块接口配置位于：

```text
yuntai-frontend/src/admin/api/adminSite.ts
```

已存在 `ai-cards` 配置：

```ts
{
  key: 'ai-cards',
  title: 'AI 卡片',
  listPath: '/admin/api/site/ai-cards',
  createPath: '/admin/api/site/ai-cards',
  updatePath: '/admin/api/site/ai-cards/{id}',
  deletePath: '/admin/api/site/ai-cards/{id}',
  reorderPath: '/admin/api/site/ai-cards/batch-sort',
  orderMethod: 'put'
}
```

注意：当前读取到的前端配置只确认了接口路径和模块标题，**AI 卡片真实字段名需执行前从接口返回或后端 DTO/VO 中再次确认**。

## 4. Phase 0.1 目标

只改造：

```text
/admin/site-modules/ai-cards
```

目标是把 AI 卡片页面从 JSON 编辑页改为运维表单页。

其他 Site 模块暂时保持原 JSON 管理页不变，避免一次性影响范围过大。

## 5. 页面目标效果

### 5.1 列表区

页面标题：

```text
AI 卡片管理
```

顶部操作：

```text
[新增 AI 卡片] [刷新]
```

列表字段：

```text
名称 | 英文名 | 描述 | 是否显示 | 排序 | 更新时间 | 操作
```

操作按钮：

```text
编辑
删除
显示/隐藏
上移
下移
```

示例：

```text
名称         英文名      描述             是否显示  排序  更新时间      操作
企业知识库   Knowledge   沉淀组织经验...  开启      1     2026-07-01  编辑 删除 隐藏 下移
智能助手     Assistant   ...              开启      2     2026-07-01  编辑 删除 隐藏 上移
```

### 5.2 新增/编辑弹窗

弹窗标题：

```text
新增 AI 卡片
编辑 AI 卡片
```

表单字段：

```text
名称：输入框
英文名：输入框
描述：文本域
跳转链接：输入框
排序：数字输入
是否显示：开关
```

按钮：

```text
[保存] [取消]
```

## 6. 页面不得出现的内容

AI 卡片运维页面不得出现以下技术概念：

```text
JSON Payload
接口路径
记录 ID 输入框
version 输入框
sort payload
visible payload
请求参数
原始接口数据 JSON
```

这些值由前端自动处理。

## 7. 配置驱动设计

### 7.1 配置目标

配置不仅描述字段，也描述接口行为。

Phase 0.1 可以先把配置写在 `AdminSiteModuleManage.vue` 内部；Phase 0.2 或 Phase 0.3 再抽到：

```text
src/admin/config/adminSiteModuleFormConfig.ts
```

### 7.2 建议配置结构

```ts
export const siteModuleFormConfigs = {
  'ai-cards': {
    key: 'ai-cards',
    title: 'AI 卡片',
    idField: 'id',
    versionField: 'version',
    listMode: 'array',

    api: {
      list: '/admin/api/site/ai-cards',
      create: '/admin/api/site/ai-cards',
      update: '/admin/api/site/ai-cards/{id}',
      delete: '/admin/api/site/ai-cards/{id}'
    },

    visibility: {
      enabled: true,
      field: 'visible',
      path: '/admin/api/site/ai-cards/{id}/visibility'
    },

    reorder: {
      enabled: true,
      path: '/admin/api/site/ai-cards/batch-sort',
      mode: 'batch',
      sortField: 'sortOrder'
    },

    createDefaults: {
      visible: true,
      sortOrder: 0
    },

    fields: [
      { key: 'name', label: '名称', type: 'text', required: true },
      { key: 'englishName', label: '英文名', type: 'text' },
      { key: 'description', label: '描述', type: 'textarea' },
      { key: 'jumpLink', label: '跳转链接', type: 'text' },
      { key: 'sortOrder', label: '排序', type: 'number' },
      { key: 'visible', label: '是否显示', type: 'switch' }
    ]
  }
}
```

### 7.3 字段映射确认要求

上面的字段名是执行方案建议，不得直接假定为后端事实。

执行 Phase 0.1 前必须确认 AI 卡片接口真实字段，确认来源可选：

```text
1. 浏览器 Network 中 GET /admin/api/site/ai-cards 返回数据
2. yuntai-frontend 现有调用结果
3. official-website 后端 DTO/VO，只读确认，不修改
```

如果真实字段与建议字段不同，以真实字段为准，更新本地配置。

常见候选字段映射：

| 运营字段 | 候选真实字段 | 处理方式 |
| --- | --- | --- |
| 名称 | `name` / `title` / `cardName` | 以接口返回为准 |
| 英文名 | `englishName` / `subTitle` / `enName` | 字段不存在则隐藏 |
| 描述 | `description` / `summary` / `content` | 以接口返回为准 |
| 跳转链接 | `jumpLink` / `linkUrl` / `targetUrl` | 字段不存在则隐藏 |
| 图标媒体 ID | `iconId` / `iconMediaId` | Phase 0.1 可先隐藏或保留数字输入 |
| 是否显示 | `visible` | 字段不存在则隐藏开关 |
| 排序 | `sortOrder` | 字段不存在则隐藏排序输入和上移/下移 |
| 更新时间 | `updatedAt` | 字段不存在则列表显示 `-` |

## 8. 实现步骤

### 8.1 准备检查

在执行代码修改前，必须先运行：

```powershell
cd D:\武汉云台\yuntai-official\yuntai-frontend
git status --short
```

检查是否有用户未提交改动。不得回滚或覆盖用户已有改动。

### 8.2 增加 AI 卡片表单模式分支

在：

```text
src/admin/pages/AdminSiteModuleManage.vue
```

增加判断：

```ts
const isAiCardsFormMode = computed(() => selectedKey.value === 'ai-cards')
```

模板中：

```text
ai-cards 使用运营表单 UI
其他模块继续使用现有 JSON 工具 UI
```

不得一次性重构所有模块。

### 8.3 列表数据标准化

保留现有 `rows` 解析逻辑：

```text
数组
data.list
data.records
```

增加 AI 卡片专用显示函数：

```ts
function displayValue(row, fieldKey)
function getAiCardId(row)
function getAiCardVersion(row)
function getAiCardVisible(row)
function getAiCardSortOrder(row)
```

如果字段不存在，列表显示 `-`，不要报错。

### 8.4 新增弹窗

点击 `新增 AI 卡片`：

```text
清空 selectedRow
用 createDefaults 初始化 formModel
打开弹窗
```

保存时：

```text
从表单字段生成 payload
自动补充 visible/sortOrder 默认值
调用 createAdminSiteModuleItem(currentConfig, payload)
成功后关闭弹窗并刷新列表
失败时显示中文错误
```

### 8.5 编辑弹窗

点击 `编辑`：

```text
复制当前 row 到 formModel
隐藏 id/version 输入
打开弹窗
```

保存时：

```text
从 formModel 生成 payload
自动带上 versionField 对应值
调用 updateAdminSiteModuleItem(currentConfig, id, payload)
成功后关闭弹窗并刷新列表
```

注意：运维人员不填写 `id` 和 `version`，但 payload 中可以由前端自动带入。

### 8.6 删除

点击删除时必须二次确认：

```text
确认删除“{名称}”？
```

确认后：

```text
调用 deleteAdminSiteModuleItem(currentConfig, id, row)
成功后刷新列表
```

如果当前后端删除接口要求 body 中携带 `version`，前端从 row 自动取，不让运维填写。

### 8.7 显示/隐藏

如果配置启用 `visibility.enabled`：

```text
按钮文案根据 visible 显示为 显示 / 隐藏
点击后自动组装 { visible: !当前值, version }
调用 updateAdminSiteModuleVisibility(currentConfig, id, payload)
成功后刷新列表
```

如果当前 `adminSite.ts` 的 `ai-cards` 没有 `visibilityPath`，执行前需要只在前端配置中补充。不得改后端接口路径。

### 8.8 上移/下移排序

如果配置启用 `reorder.enabled`：

```text
上移：与上一条交换 sortOrder
下移：与下一条交换 sortOrder
```

推荐 payload 先按当前后端已有排序接口形态拼装。

若接口期望暂不明确，执行时先通过现有 JSON 工具页或 Network 确认。确认前不得盲目提交排序逻辑。

常见 batch sort payload 形态候选：

```ts
[
  { id: 1, sortOrder: 10 },
  { id: 2, sortOrder: 20 }
]
```

或：

```ts
{
  items: [
    { id: 1, sortOrder: 10 },
    { id: 2, sortOrder: 20 }
  ]
}
```

实际以接口为准。

### 8.9 中文错误提示

所有接口错误统一显示：

```text
加载失败，请稍后重试
保存失败，请检查填写内容
删除失败，请稍后重试
排序失败，请稍后重试
显示状态更新失败，请稍后重试
```

如果后端返回 `message`，可显示后端中文 `message`。

不得显示：

```text
stack trace
AxiosError 原始对象
Java exception 类名
SQL 错误
```

## 9. 建议实现结构

### 9.1 Phase 0.1 内部实现

Phase 0.1 暂不强制新增组件，优先在 `AdminSiteModuleManage.vue` 内部实现：

```text
ai-cards 配置对象
formModel
drawer/dialog 状态
openCreateForm()
openEditForm(row)
buildPayload()
saveForm()
confirmDelete(row)
toggleVisible(row)
moveRow(row, direction)
```

### 9.2 Phase 0.3 再抽组件

当 AI 卡片、客户 Logo、时间线均跑通后，再考虑抽：

```text
src/admin/components/SiteModuleForm.vue
src/admin/components/SiteModuleList.vue
src/admin/config/adminSiteModuleFormConfig.ts
```

不要在 Phase 0.1 一开始就抽公共组件，避免字段差异尚未暴露时过早抽象。

## 10. UI 设计要求

后台是运营工具，不做营销页风格。

要求：

```text
信息密度适中
表格清晰
按钮含义明确
弹窗字段整齐
错误提示显眼
移动端不重叠
不出现技术字段
```

建议控件：

| 场景 | 控件 |
| --- | --- |
| 新增 | 主按钮 |
| 刷新 | 次按钮 |
| 是否显示 | 开关或按钮 |
| 排序 | 上移/下移按钮 |
| 删除 | 危险按钮 + confirm |
| 长描述 | 文本域 |
| 数字排序 | number input |

## 11. 验收标准

Phase 0.1 只验收 AI 卡片。

### 11.1 功能验收

```text
AI 卡片可列表展示
AI 卡片可新增
AI 卡片可编辑
AI 卡片可删除
AI 卡片可显示/隐藏
AI 卡片可上移/下移
保存后自动刷新列表
删除前有二次确认
接口错误显示中文提示
```

### 11.2 页面验收

页面不得出现：

```text
JSON Payload
接口路径
记录 ID 输入框
version 输入框
sort payload
visible payload
请求参数
原始 JSON 数据块
```

### 11.3 边界验收

```text
只修改 yuntai-frontend
不修改 official-website
不修改前台官网页面
不修改认证/权限逻辑
不修改接口路径
不新增后端接口
不新增数据库字段
```

### 11.4 回归验收

```text
/admin/site-modules/ai-cards 显示运营表单页
其他 /admin/site-modules/* 页面仍可使用原 JSON 工具页
后台登录流程不变
CSRF 写请求逻辑不变
```

## 12. 验证命令

执行完 Phase 0.1 后，在前端项目目录运行：

```powershell
cd D:\武汉云台\yuntai-official\yuntai-frontend
npm run build
```

如需本地预览：

```powershell
npm run dev -- --port 5174
```

访问：

```text
http://localhost:5174/admin/site-modules/ai-cards
```

注意：本地预览需要后端服务和登录态配合才能完成真实接口验收。

## 13. 禁止事项清单

执行线程不得：

```text
修改 official-website/**
新增或修改数据库迁移
修改 Security / Session / CSRF 逻辑
引入 JWT / Bearer Token
修改 /admin/api/auth/**
修改前台 Home.vue 或前台展示组件
把所有模块一次性重构
删除既有未提交改动
用硬编码假数据冒充接口数据
让运维人员填写 id/version/JSON
```

## 14. 风险与处理

| 风险 | 表现 | 处理 |
| --- | --- | --- |
| 字段名不一致 | 保存 400 或列表字段为空 | 先确认接口返回字段，再调整配置 |
| 排序 payload 不明确 | 排序接口失败 | 先禁用排序按钮或标注待确认，不盲写 |
| visibilityPath 缺失 | 显示/隐藏无法调用 | 读取现有接口配置或后端控制器，只补前端配置 |
| 删除接口需要 version | 删除失败 | 从 row 自动取 version，运维不填写 |
| 其他模块受影响 | 其他页面 JSON 工具不可用 | 仅对 `ai-cards` 启用表单分支 |

## 15. 建议任务拆分

### Task 0.1.1 读取和确认

```text
读取 AdminSiteModuleManage.vue
读取 adminSite.ts
确认 ai-cards 接口路径
确认 ai-cards 实际返回字段
确认新增/编辑/删除/排序/可见性的 payload 形态
```

### Task 0.1.2 表单模式 UI

```text
仅为 ai-cards 增加表格列表
增加新增/编辑弹窗
移除 ai-cards 页面上的 JSON/接口路径/ID/version 输入
其他模块保持旧页面
```

### Task 0.1.3 写操作接入

```text
新增
编辑
删除确认
显示/隐藏
上移/下移
保存后刷新
中文错误提示
```

### Task 0.1.4 验证

```text
npm run build
浏览器访问 /admin/site-modules/ai-cards
人工确认无 JSON 工具痕迹
人工确认其他模块仍可用
```

## 16. 给 Codex 的可执行提示词

可以直接把下面内容作为下一轮执行输入：

```text
只修改 D:\武汉云台\yuntai-official\yuntai-frontend。
不要修改 official-website、数据库、接口路径、认证/权限逻辑、接口文档、前台官网展示页面。

目标：Phase 0.1 只把 /admin/site-modules/ai-cards 从 JSON 管理页改成运营表单页。

请先检查 git status，保留用户已有未提交改动。
读取 src/admin/pages/AdminSiteModuleManage.vue 和 src/admin/api/adminSite.ts。
确认 ai-cards 当前接口配置和实际字段。

实现要求：
1. 仅 ai-cards 使用表单化 UI，其他 Site 模块继续使用原 JSON 工具页。
2. AI 卡片页面展示：名称、英文名、描述、是否显示、排序、更新时间、操作。
3. 支持新增、编辑、删除、显示/隐藏、上移/下移。
4. 新增/编辑使用弹窗或抽屉，运维只填写业务字段。
5. 页面不得出现 JSON Payload、接口路径、记录 ID 输入框、version、sort payload、visible payload、请求参数。
6. id/version/payload 由前端自动从 row 和配置中组装。
7. 删除前必须二次确认。
8. 保存成功后自动刷新列表。
9. 接口错误显示中文提示，不展示技术堆栈。
10. 完成后运行 npm run build。

不要抽公共组件，先在 AdminSiteModuleManage.vue 内跑通 AI 卡片样板。
```

## 17. 后续路线

```text
Phase 0.1：AI 卡片样板页
Phase 0.2：客户 Logo、时间线
Phase 0.3：抽 SiteModuleForm / SiteModuleList / adminSiteModuleFormConfig
Phase 0.4：覆盖其余 Site 模块
Phase 1：媒体选择器、前台数据库化、完整 CMS
```

## 18. 一句话总结

当前阶段不做完整 CMS，只把已有 Site 模块后台从开发者 JSON 工具改成运维可用的表单后台；第一步只做 AI 卡片样板，跑通后再推广。
