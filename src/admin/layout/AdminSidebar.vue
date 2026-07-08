<template>
  <aside class="admin-sidebar">
    <router-link class="admin-sidebar__brand" to="/admin">
      <span class="admin-sidebar__mark">云</span>
      <span>
        <strong>云台后台</strong>
        <small>Admin Console</small>
      </span>
    </router-link>

    <nav class="admin-sidebar__nav" aria-label="后台导航">
      <template v-for="item in navItems" :key="item.key || item.to">
        <router-link
          v-if="item.type === 'link'"
          class="admin-sidebar__item"
          :class="{ 'is-active': isActiveItem(item) }"
          :to="item.to"
        >
          <span class="admin-sidebar__icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>

        <section
          v-else
          class="admin-sidebar__group"
          :class="{ 'is-active': isActiveGroup(item), 'is-open': isGroupOpen(item) }"
        >
          <button
            class="admin-sidebar__group-toggle"
            type="button"
            :aria-expanded="isGroupOpen(item)"
            @click="toggleGroup(item.key)"
          >
            <span class="admin-sidebar__icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
            <span class="admin-sidebar__arrow">{{ isGroupOpen(item) ? '⌄' : '›' }}</span>
          </button>

          <div v-if="isGroupOpen(item)" class="admin-sidebar__group-items">
            <router-link
              v-for="child in item.children"
              :key="child.to"
              class="admin-sidebar__item admin-sidebar__subitem"
              :class="{ 'is-active': isActiveItem(child) }"
              :to="child.to"
            >
              <span class="admin-sidebar__icon">{{ child.icon }}</span>
              <span>{{ child.label }}</span>
            </router-link>
          </div>
        </section>
      </template>
    </nav>

    <div class="admin-sidebar__note">
      <span>API Integration</span>
      <strong>Admin / Portal 接口分离，写操作统一 CSRF</strong>
    </div>
  </aside>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useRoute } from 'vue-router'

const navItems = [
  { type: 'link', to: '/admin', icon: '⌂', label: '工作台' },
  { type: 'link', to: '/admin/media-library', icon: '▧', label: '媒体库' },
  { type: 'link', to: '/admin/page-sections', icon: 'S', label: '页面区块' },
  { type: 'link', to: '/admin/site-config', icon: '◆', label: '站点配置' },
  { type: 'link', to: '/admin/site-modules/navigation', icon: '2', label: '导航菜单' },
  {
    type: 'group',
    key: 'home',
    icon: 'H',
    label: '首页',
    children: [
      { to: '/admin/home-banner', icon: '▣', label: '首页 Banner' },
      { to: '/admin/site-modules/home-metrics', icon: '1', label: '首页指标' },
    ],
  },
  {
    type: 'group',
    key: 'ai-strategy',
    icon: 'A',
    label: 'AI战略',
    children: [
      { to: '/admin/site-modules/ai-cards', icon: '3', label: 'AI 卡片' },
    ],
  },
  {
    type: 'group',
    key: 'product-system',
    icon: 'P',
    label: '产品体系',
    children: [
      { to: '/admin/site-modules/capability-categories', icon: '4', label: '能力底座' },
      { to: '/admin/site-modules/capability-items', icon: '4', label: '能力底座子项' },
      { to: '/admin/products', icon: '▤', label: '产品管理' },
    ],
  },
  {
    type: 'group',
    key: 'innovation-rd',
    icon: 'R',
    label: '创新研发体系',
    children: [
      { to: '/admin/site-modules/partner-universities', icon: '7', label: '合作高校' },
      { to: '/admin/site-modules/research-directions', icon: '8', label: '研发方向' },
    ],
  },
  {
    type: 'group',
    key: 'product-industry',
    icon: 'I',
    label: '产品与行业方案',
    children: [
      { to: '/admin/site-modules/industry-solutions', icon: 'I', label: '行业方案' },
      { to: '/admin/site-modules/cooperation-direction-tags', icon: 'C', label: '合作方向' },
      { to: '/admin/cases', icon: '▥', label: '案例管理' },
    ],
  },
  {
    type: 'group',
    key: 'about-us',
    icon: 'U',
    label: '关于我们',
    children: [
      { to: '/admin/site-modules/honors', icon: 'H', label: '荣誉资质' },
      { to: '/admin/site-modules/timeline-events', icon: '9', label: '时间线' },
      { to: '/admin/site-modules/client-logos', icon: '5', label: '客户 Logo' },
      { to: '/admin/site-modules/strength-metrics', icon: '6', label: '实力指标' },
      { to: '/admin/site-modules/value-cards', icon: 'V', label: '价值卡片' },
      { to: '/admin/site-modules/promise-content', icon: 'P', label: '承诺内容' },
      { to: '/admin/site-modules/promise-tags', icon: 'T', label: '承诺标签' },
    ],
  },
  {
    type: 'group',
    key: 'contact-us',
    icon: '☎',
    label: '联系我们',
    children: [
      { to: '/admin/leads', icon: '●', label: '线索管理' },
      { to: '/admin/contact-info', icon: '☎', label: '联系方式' },
    ],
  },
  {
    type: 'group',
    key: 'content-assets',
    icon: '#',
    label: '内容资产',
    children: [
      { to: '/admin/site-modules/content-tags', icon: '#', label: '内容标签' },
      { to: '/admin/site-modules/content-categories', icon: 'Y', label: '内容分类' },
      { to: '/admin/site-modules/content-relations', icon: 'R', label: '内容关联' },
      { to: '/admin/site-modules/content-references', icon: 'Q', label: '内容引用' },
    ],
  },
]

const route = useRoute()
const openGroups = reactive(Object.fromEntries(
  navItems.filter((item) => item.type === 'group').map((item) => [item.key, true]),
))

function isActiveItem(item) {
  return route.path === item.to
}

function isActiveGroup(item) {
  return item.children.some((child) => isActiveItem(child))
}

function isGroupOpen(item) {
  return Boolean(openGroups[item.key])
}

function toggleGroup(key) {
  openGroups[key] = !openGroups[key]
}

watch(
  () => route.path,
  () => {
    const activeGroup = navItems.find((item) => item.type === 'group' && isActiveGroup(item))
    if (activeGroup) {
      openGroups[activeGroup.key] = true
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.admin-sidebar {
  display: flex;
  flex-direction: column;
  width: 248px;
  min-height: 100vh;
  padding: 20px 16px;
  background: #111827;
  color: #e5e7eb;
}

.admin-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  color: inherit;
  text-decoration: none;
}

.admin-sidebar__mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-weight: 900;
}

.admin-sidebar__brand strong,
.admin-sidebar__brand small {
  display: block;
}

.admin-sidebar__brand strong {
  font-size: 16px;
  line-height: 1.2;
}

.admin-sidebar__brand small {
  margin-top: 3px;
  color: #9ca3af;
  font-size: 12px;
}

.admin-sidebar__nav {
  display: grid;
  gap: 6px;
  margin-top: 28px;
  max-height: calc(100vh - 210px);
  overflow: auto;
  padding-right: 2px;
}

.admin-sidebar__item,
.admin-sidebar__group-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  width: 100%;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #cbd5e1;
  font: inherit;
  text-decoration: none;
  font-weight: 700;
  cursor: pointer;
}

.admin-sidebar__item.is-active,
.admin-sidebar__item:hover,
.admin-sidebar__group.is-active > .admin-sidebar__group-toggle,
.admin-sidebar__group-toggle:hover {
  background: #1f2937;
  color: #fff;
}

.admin-sidebar__icon {
  width: 22px;
  color: #93c5fd;
  text-align: center;
}

.admin-sidebar__group {
  display: grid;
  gap: 4px;
}

.admin-sidebar__group-items {
  display: grid;
  gap: 4px;
  padding-left: 12px;
}

.admin-sidebar__subitem {
  min-height: 34px;
  padding-left: 10px;
  font-size: 13px;
}

.admin-sidebar__arrow {
  margin-left: auto;
  color: #93c5fd;
}

.admin-sidebar__note {
  margin-top: auto;
  padding: 14px;
  border: 1px solid #263244;
  border-radius: 8px;
  background: #0f172a;
}

.admin-sidebar__note span,
.admin-sidebar__note strong {
  display: block;
}

.admin-sidebar__note span {
  color: #93c5fd;
  font-size: 12px;
  font-weight: 800;
}

.admin-sidebar__note strong {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.4;
}
</style>
