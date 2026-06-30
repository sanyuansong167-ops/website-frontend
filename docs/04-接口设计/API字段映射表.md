# API字段映射表

> AI 文档元信息
> - 文档类型：字段映射
> - 所属层级：接口设计层
> - 所属阶段：前后端联调准备
> - 适用对象：前端、后端、测试、AI
> - 主要用途：记录 Portal 接口真实字段及前端使用字段映射
> - 本文不用于：补充接口文档中不存在的字段
> - 上游文档：`D:\武汉云台\yuntai-frontend\接口文档(1).md`
> - 下游文档：接口对接总览.md，Mock数据规范.md，联调说明.md
> - 事实来源：接口文档(1).md，src/components/SiteHeader.vue，src/views/Home.vue，src/data/site.js
> - 当前状态：active
> - 可信级别：高
> - 关键词：字段映射，Portal接口，前后端联调

## 1. 映射原则

- 后端字段只记录 `接口文档(1).md` 已明确给出的字段。
- 前端字段只记录当前源码已使用字段，或为联调必须保留的映射目标。
- 未接入接口的前端字段如果当前源码无对应字段，状态标记为“待接入”或“待确认”。
- 不新增接口文档中不存在的字段。

### 1.1 状态口径说明

为避免把“未接入”误读成“后端字段错误”，本表状态按以下口径理解：

| 标记 | 含义 | 是否代表后端问题 |
| --- | --- | --- |
| 一致 | 后端字段与当前前端字段可直接对应 | 否 |
| 映射一致 / 需映射 | 字段语义一致，但前端字段名或结构不同，需要 API 层转换 | 否 |
| 不一致 | 当前前端源码没有可直接使用的字段，或现有字段与后端字段结构不同 | 不一定 |
| 待接入 | 接口或字段尚未进入当前源码调用链 | 否 |
| 待确认 | 仅靠现有接口文档和源码无法确定最终映射关系 | 需要确认 |

因此，待接入接口中出现的“不一致”优先表示“当前源码尚未具备对应字段或结构”，不等同于“后端接口定义错误”。

## 2. 已接入接口字段映射

### 2.1 站点基础配置

接口：`GET /portal/api/site/config`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `siteTitle` | `siteConfig.name`、`siteConfig.seo.title` | 映射一致 | 已接入 |
| `seoKeywords` | `siteConfig.seo.keywords` | 映射一致 | 已接入 |
| `seoDescription` | `siteConfig.seo.description` | 映射一致 | 已接入 |
| `brandSlogan` | `siteConfig.slogan` | 映射一致 | 已接入 |
| `brandTagline` | `siteConfig.slogan` | 映射一致 | 已接入 |
| `logoLightUrl` | `siteConfig.logo` | 映射一致 | 已接入 |
| `logoDarkUrl` | `siteConfig.logo` | 映射一致 | 已接入 |

### 2.2 导航菜单

接口：`GET /portal/api/site/navigation`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `id` | `key`、`activeId` | 映射一致 | 已接入 |
| `menuName` | `label` | 映射一致 | 已接入 |
| `targetType` | `targetType` | 一致 | 已接入 |
| `routePath` | `href`、`routeLocation` | 映射一致 | 已接入 |
| `anchorCode` | `href`、`routeLocation.hash`、`activeId` | 映射一致 | 已接入 |
| `externalUrl` | `href` | 映射一致 | 已接入 |
| `openInNewTab` | `target`、`rel` | 映射一致 | 已接入 |
| `children` | `submenu` | 映射一致 | 已接入 |

### 2.3 首页首屏 Banner

接口：`GET /portal/api/site/home-banner`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `mainTitle` | `hero.title` | 映射一致 | 已接入 |
| `subTitle` | `hero.subtitle` | 映射一致 | 已接入 |
| `backgroundImageUrl` | `hero.backgroundImage` | 映射一致 | 已接入 |
| `primaryButton.enabled` | 待确认 | 不一致 | 后端字段已定义，页面当前未使用 |
| `primaryButton.text` | 待确认 | 不一致 | 后端字段已定义，页面当前未使用 |
| `primaryButton.targetType` | 待确认 | 不一致 | 后端字段已定义，页面当前未使用 |
| `primaryButton.routePath` | 待确认 | 不一致 | 后端字段已定义，页面当前未使用 |
| `primaryButton.anchorCode` | 待确认 | 不一致 | 后端字段已定义，页面当前未使用 |
| `primaryButton.externalUrl` | 待确认 | 不一致 | 后端字段已定义，页面当前未使用 |
| `primaryButton.openInNewTab` | 待确认 | 不一致 | 后端字段已定义，页面当前未使用 |
| `secondaryButton.*` | 待确认 | 不一致 | 字段结构同 `primaryButton`，页面当前未使用 |

### 2.4 首页核心数据指标卡片

接口：`GET /portal/api/site/home-metrics`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `value` | `metric.value` | 一致 | 已接入 |
| `unit` | `metric.unit` | 一致 | 已接入 |
| `description` | `metric.description` | 一致 | 已接入 |

### 2.5 荣誉标签列表

接口：`GET /portal/api/site/honors`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `name` | `honor.name` | 一致 | 已接入 |
| `iconUrl` | `honor.iconUrl` | 一致 | 已接入 |

## 3. 待接入接口字段映射

### 3.1 合作高校

接口：`GET /portal/api/partner-universities`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `name` | 待确认 | 不一致 | 待接入 |
| `fullName` | 待确认 | 不一致 | 待接入 |
| `logoUrl` | 待确认 | 不一致 | 待接入 |

### 3.2 时间轴

接口：`GET /portal/api/timeline-events`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `year` | `timeline[][0]` | 语义一致，结构不一致 | 待接入 |
| `title` | `timeline[][1]` | 语义一致，结构不一致 | 待接入 |
| `description` | `timeline[][2]` | 语义一致，结构不一致 | 待接入 |

### 3.3 重点研发方向

接口：`GET /portal/api/research-directions`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `titleCn` | 待确认 | 不一致 | 待接入 |
| `titleEn` | 待确认 | 不一致 | 待接入 |
| `summary` | 待确认 | 不一致 | 待接入 |
| `iconUrl` | 待确认 | 不一致 | 待接入 |

### 3.4 核心价值观卡片

接口：`GET /portal/api/value-cards`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `iconUrl` | 待确认 | 不一致 | 待接入 |
| `title` | 待确认 | 待确认 | 待接入 |
| `subtitle` | 待确认 | 不一致 | 待接入 |
| `description` | 待确认 | 待确认 | 待接入 |

### 3.5 我们的承诺

接口：`GET /portal/api/our-promises`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `content` | 待确认 | 不一致 | 待接入 |
| `tags[].tagText` | 待确认 | 不一致 | 待接入 |

### 3.6 基础联系方式

接口：`GET /portal/api/contact-info`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `contactAddress` | 待确认 | 不一致 | 待接入 |
| `businessPhone` | 待确认 | 不一致 | 待接入 |
| `contactEmail` | 待确认 | 不一致 | 待接入 |

### 3.7 行业解决方案

接口：`GET /portal/api/industry-solutions`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `name` | 待确认 | 不一致 | 待接入 |
| `iconUrl` | 待确认 | 不一致 | 待接入 |
| `description` | 待确认 | 待确认 | 待接入 |
| `customerTags` | 待确认 | 不一致 | 待接入 |

### 3.8 客户 Logo

接口：`GET /portal/api/site/client-logos`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `id` | 待确认 | 不一致 | 待接入 |
| `name` | 待确认 | 待确认 | 待接入 |
| `industry` | 待确认 | 不一致 | 待接入 |
| `logoUrl` | 待确认 | 不一致 | 待接入 |

### 3.9 企业实力核心指标

接口：`GET /portal/api/site/strength-metrics`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `id` | 待确认 | 不一致 | 待接入 |
| `metricValue` | 待确认 | 不一致 | 待接入 |
| `label` | 待确认 | 待确认 | 待接入 |
| `iconUrl` | 待确认 | 不一致 | 待接入 |

### 3.10 AI 战略卡片

接口：`GET /portal/api/site/ai-cards`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `id` | 待确认 | 不一致 | 待接入 |
| `name` | `Feature.title` | 语义一致，未接入 | 待接入 |
| `englishName` | `Feature.en` | 语义一致，未接入 | 待接入 |
| `iconUrl` | 待确认 | 不一致 | 待接入 |
| `description` | `Feature.text` | 语义一致，未接入 | 待接入 |
| `jumpLink` | 待确认 | 不一致 | 待接入 |

### 3.11 能力底座分类

接口：`GET /portal/api/site/capabilities`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `id` | 待确认 | 不一致 | 待接入 |
| `name` | 待确认 | 待确认 | 待接入 |
| `items[].id` | 待确认 | 不一致 | 待接入 |
| `items[].name` | 待确认 | 待确认 | 待接入 |

### 3.12 产品矩阵

接口：`GET /portal/api/products`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `id` | `id` | 一致 | 待接入 |
| `name` | `title` | 需映射 | 待接入 |
| `logoUrl` | 待确认 | 不一致 | 待接入 |
| `subTitle` | `sub` | 需映射 | 待接入 |
| `abstractText` | `desc` | 需映射 | 待接入 |
| `statusTag` | `status` | 需映射 | 待接入 |
| `detailLink` | 待确认 | 不一致 | 待接入 |

### 3.13 合作方向标签

接口：`GET /portal/api/cooperation-direction-tags`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `tagText` | 待确认 | 不一致 | 待接入 |

### 3.14 标杆案例

接口：`GET /portal/api/cases`

| 后端字段 | 前端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `title` | `title` | 一致 | 待接入 |
| `logoUrl` | `img` | 需映射 | 待接入 |
| `summary` | `desc` | 需映射 | 待接入 |
| `keywords` | `tags` | 需映射 | 待接入 |

### 3.15 预约交流线索

接口：`POST /portal/api/leads`

| 前端字段 | 后端字段 | 是否一致 | 状态 |
| --- | --- | --- | --- |
| `contactName` | `name` | 需映射 | 待接入 |
| `companyName` | `company` | 需映射 | 待接入 |
| `email` | `email` | 一致 | 待接入 |
| `phone` | `phone` | 一致 | 待接入 |
| `demandContent` | `demandDescription` | 需映射 | 待接入 |

## 4. 待确认项

| 项 | 状态 | 说明 |
| --- | --- | --- |
| Banner 按钮对象对应前端字段 | 待确认 | 后端已定义，前端当前硬编码按钮 |
| 行业解决方案与标杆案例在首页的模块边界 | 待确认 | 两者均有后端接口，当前页面使用本地案例数据 |
| 产品 `logoUrl`、`detailLink` 对应前端展示字段 | 待确认 | 当前页面使用 lucide `icon` 和固定路由 |
| 案例 `logoUrl` 是否等同封面图 | 待确认 | 接口文档描述为封面访问地址，当前前端字段为 `img` |
