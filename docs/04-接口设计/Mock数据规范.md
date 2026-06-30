# Mock数据规范

> AI 文档元信息
> - 文档类型：Mock 规范
> - 所属层级：接口设计层
> - 所属阶段：接口化过渡
> - 适用对象：前端、后端、测试、AI
> - 主要用途：说明本地 Mock 与 Portal 接口契约的对应关系
> - 本文不用于：创建接口文档中不存在的 Mock 字段
> - 上游文档：`D:\武汉云台\yuntai-frontend\接口文档(1).md`
> - 下游文档：接口对接总览.md，API字段映射表.md，联调说明.md
> - 事实来源：接口文档(1).md，src/data/site.js
> - 当前状态：active
> - 可信级别：高
> - 关键词：Mock，Portal接口，site.js，兜底数据

## 1. Mock 用途

`src/data/site.js` 当前保留为：

- 接口失败兜底数据。
- 开发环境 Mock 数据。
- 页面静态内容临时数据源。

Mock 数据不得作为后端字段事实来源。后端字段以 `接口文档(1).md` 为准。

本文记录的是 Mock 规范和差异清单，不表示 `src/data/site.js` 已经完成字段整改。凡状态为“缺失 Mock”“字段不完整”“字段不同”“结构不同”的项目，均需要在后续源码联调阶段再处理。

## 2. Portal 接口对应 Mock 清单

| Portal 接口 | 接口字段 | 当前 Mock / 静态来源 | Mock 状态 |
| --- | --- | --- | --- |
| `/portal/api/site/config` | `siteTitle`、`seoKeywords`、`seoDescription`、`brandSlogan`、`brandTagline`、`logoLightUrl`、`logoDarkUrl` | `siteConfig` | 已存在，字段不同，需映射 |
| `/portal/api/site/navigation` | `id`、`menuName`、`targetType`、`routePath`、`anchorCode`、`externalUrl`、`openInNewTab`、`children` | `navigation` | 已存在，字段不完整 |
| `/portal/api/site/home-banner` | `mainTitle`、`subTitle`、`backgroundImageUrl`、`primaryButton`、`secondaryButton` | `hero` | 已存在，按钮 Mock 缺失 |
| `/portal/api/site/home-metrics` | `value`、`unit`、`description` | `metrics` | 已存在，字段一致 |
| `/portal/api/site/honors` | `name`、`iconUrl` | `honors` | 已存在，字段一致 |
| `/portal/api/partner-universities` | `name`、`fullName`、`logoUrl` | 页面静态内容 | 缺失 Mock |
| `/portal/api/timeline-events` | `year`、`title`、`description` | `timeline` | 已存在，结构不同 |
| `/portal/api/research-directions` | `titleCn`、`titleEn`、`summary`、`iconUrl` | 页面静态内容 | 缺失 Mock |
| `/portal/api/value-cards` | `iconUrl`、`title`、`subtitle`、`description` | 页面静态内容 | 缺失 Mock |
| `/portal/api/our-promises` | `content`、`tags[].tagText` | 页面静态内容 | 缺失 Mock |
| `/portal/api/contact-info` | `contactAddress`、`businessPhone`、`contactEmail` | 页面静态内容 | 缺失 Mock |
| `/portal/api/industry-solutions` | `name`、`iconUrl`、`description`、`customerTags` | `cases` 被复用 | 缺失契约 Mock |
| `/portal/api/site/client-logos` | `id`、`name`、`industry`、`logoUrl` | 页面静态内容 | 缺失 Mock |
| `/portal/api/site/strength-metrics` | `id`、`metricValue`、`label`、`iconUrl` | 页面静态内容 | 缺失 Mock |
| `/portal/api/site/ai-cards` | `id`、`name`、`englishName`、`iconUrl`、`description`、`jumpLink` | 页面静态内容 | 缺失 Mock |
| `/portal/api/site/capabilities` | `id`、`name`、`items[].id`、`items[].name` | 页面静态内容 | 缺失 Mock |
| `/portal/api/products` | `id`、`name`、`logoUrl`、`subTitle`、`abstractText`、`statusTag`、`detailLink` | `products` | 已存在业务 Mock，字段不同 |
| `/portal/api/cooperation-direction-tags` | `tagText` | 页面静态内容 | 缺失 Mock |
| `/portal/api/cases` | `title`、`logoUrl`、`summary`、`keywords` | `cases` | 已存在业务 Mock，字段不同 |
| `/portal/api/leads` | 请求字段：`name`、`company`、`email`、`phone`、`demandDescription` | 无 | 缺失提交 Mock |

## 3. 已存在 Mock 差异

| Mock 数据 | 当前字段 | Portal 接口字段 | 处理状态 |
| --- | --- | --- | --- |
| `siteConfig` | `logo`、`logoText`、`name`、`slogan`、`seo.title`、`seo.description` | `siteTitle`、`seoKeywords`、`seoDescription`、`brandSlogan`、`brandTagline`、`logoLightUrl`、`logoDarkUrl` | 保留，API 层已做映射 |
| `navigation` | `id`、`label` | `id`、`menuName`、`targetType`、`routePath`、`anchorCode`、`externalUrl`、`openInNewTab`、`children` | 保留，字段不完整 |
| `hero` | `title`、`subtitle`、`backgroundImage` | `mainTitle`、`subTitle`、`backgroundImageUrl`、`primaryButton`、`secondaryButton` | 保留，缺少按钮契约 |
| `metrics` | `value`、`unit`、`description` | `value`、`unit`、`description` | 可作为契约 Mock |
| `honors` | `name`、`iconUrl` | `name`、`iconUrl` | 可作为契约 Mock |
| `timeline` | 数组 `[year,title,description]` | 对象字段 `year`、`title`、`description` | 结构待整改 |
| `products` | `id`、`icon`、`color`、`title`、`sub`、`desc`、`tags`、`status`、`features` | `id`、`name`、`logoUrl`、`subTitle`、`abstractText`、`statusTag`、`detailLink` | 字段待映射 |
| `cases` | `id`、`title`、`industry`、`img`、`desc`、`tags`、`quote` | `title`、`logoUrl`、`summary`、`keywords` | 字段待映射 |

## 4. 缺失 Mock 清单

| 模块 | 对应接口 | 状态 |
| --- | --- | --- |
| 合作高校 | `/portal/api/partner-universities` | 缺失 Mock |
| 重点研发方向 | `/portal/api/research-directions` | 缺失 Mock |
| 核心价值观卡片 | `/portal/api/value-cards` | 缺失 Mock |
| 我们的承诺 | `/portal/api/our-promises` | 缺失 Mock |
| 基础联系方式 | `/portal/api/contact-info` | 缺失 Mock |
| 行业解决方案 | `/portal/api/industry-solutions` | 缺失契约 Mock |
| 客户 Logo | `/portal/api/site/client-logos` | 缺失 Mock |
| 企业实力指标 | `/portal/api/site/strength-metrics` | 缺失 Mock |
| AI 战略卡片 | `/portal/api/site/ai-cards` | 缺失 Mock |
| 能力底座分类 | `/portal/api/site/capabilities` | 缺失 Mock |
| 合作方向标签 | `/portal/api/cooperation-direction-tags` | 缺失 Mock |
| 预约交流线索提交 | `/portal/api/leads` | 缺失提交 Mock |

## 5. 待确认 Mock 项

接口文档只定义字段和类型，未提供完整 JSON 示例。为避免创造示例数据，以下 Mock 示例值不在本文档中生成：

| 接口 | 待确认内容 |
| --- | --- |
| `/portal/api/site/home-banner` | `primaryButton`、`secondaryButton` 的前端兜底值 |
| `/portal/api/industry-solutions` | 与当前案例模块的展示边界 |
| `/portal/api/products` | `logoUrl` 是否替换当前 lucide 图标展示 |
| `/portal/api/cases` | `logoUrl` 是否作为当前案例封面图 |
| `/portal/api/leads` | 前端表单字段到提交字段的最终转换位置 |

## 6. Mock 维护规则

- Mock 字段必须来自 `接口文档(1).md`。
- 如果接口文档未定义字段，不得在 Mock 中新增。
- 如果当前页面需要旧字段，必须通过 API 层或适配层转换，不得把旧字段写成后端事实。
- 接口失败兜底可以继续使用 `src/data/site.js`，但应明确它是前端兜底数据，不是后端契约。
- 修改 `src/data/site.js` 时，应同步复核 `API字段映射表.md` 和 `联调说明.md`，避免 Mock 字段、API 映射字段、页面使用字段再次分散。
