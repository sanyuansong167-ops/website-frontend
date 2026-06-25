# 武汉云台数据有限公司官网前端页面

本项目根据截图还原前端页面结构与视觉风格，代码已按模块拆分，没有把所有内容写在一个文件中。

## 技术栈

- Vue 3
- Vite
- Vue Router
- 组件化 CSS
- lucide-vue-next 图标库

## 页面功能

- 首页完整展示截图中的模块：
  - 首页首屏
  - AI战略
  - 产品体系
  - 创新研发体系
  - 产品与行业方案
  - 关于我们
  - 联系我们
- 产品矩阵卡片可点击，跳转到产品详情页：`/product/:id`
- 产品与行业方案卡片可点击，跳转到案例详情页：`/case/:id`
- 顶部导航支持锚点跳转
- 支持 PC 与移动端响应式展示

## 目录结构

```text
src
├─ assets/styles/global.css       # 全局样式
├─ components                     # 公共组件
│  ├─ Feature.vue
│  ├─ FooterSection.vue
│  ├─ IconBox.vue
│  ├─ SectionTitle.vue
│  └─ SiteHeader.vue
├─ data/site.js                   # 产品、案例、时间轴等页面数据
├─ router/index.js                # 路由配置
├─ views
│  ├─ Home.vue                    # 首页
│  ├─ ProductDetail.vue           # 产品详情页
│  └─ CaseDetail.vue              # 案例详情页
├─ App.vue
└─ main.js
```

## 运行方法

```bash
npm install
npm run dev
```

浏览器访问终端显示的本地地址，例如：

```text
http://localhost:5173
```

## 打包部署

```bash
npm run build
```

打包后会生成：

```text
dist/
```

将 `dist` 目录部署到服务器、Nginx、宝塔、阿里云 OSS、Vercel、Netlify 等静态网站环境即可。

## 维护说明

产品、案例、时间轴等主要内容集中放在：

```text
src/data/site.js
```

后期只需要修改这个文件中的数据，即可同步更新首页、产品详情页和案例详情页。
