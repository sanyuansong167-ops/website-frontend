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
      <router-link v-for="item in navItems" :key="item.to" class="admin-sidebar__item" :to="item.to">
        <span class="admin-sidebar__icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="admin-sidebar__note">
      <span>API Integration</span>
      <strong>Admin / Portal 接口分离，写操作统一 CSRF</strong>
    </div>
  </aside>
</template>

<script setup>
const navItems = [
  { to: '/admin', icon: '⌂', label: '工作台' },
  { to: '/admin/media', icon: '↥', label: '媒体上传' },
  { to: '/admin/media-library', icon: '▧', label: '媒体库' },
  { to: '/admin/page-sections', icon: 'S', label: '页面区块' },
  { to: '/admin/site-config', icon: '◆', label: '站点配置' },
  { to: '/admin/home-banner', icon: '▣', label: '首页 Banner' },
  { to: '/admin/site-modules/home-metrics', icon: '1', label: '首页指标' },
  { to: '/admin/site-modules/navigation', icon: '2', label: '导航菜单' },
  { to: '/admin/site-modules/ai-cards', icon: '3', label: 'AI 卡片' },
  { to: '/admin/site-modules/capability-categories', icon: '4', label: '能力底座' },
  { to: '/admin/site-modules/client-logos', icon: '5', label: '客户 Logo' },
  { to: '/admin/site-modules/strength-metrics', icon: '6', label: '实力指标' },
  { to: '/admin/site-modules/partner-universities', icon: '7', label: '合作高校' },
  { to: '/admin/site-modules/research-directions', icon: '8', label: '研发方向' },
  { to: '/admin/site-modules/timeline-events', icon: '9', label: '时间线' },
  { to: '/admin/site-modules/value-cards', icon: 'V', label: '价值卡片' },
  { to: '/admin/site-modules/promise-content', icon: 'P', label: '承诺内容' },
  { to: '/admin/site-modules/promise-tags', icon: 'T', label: '承诺标签' },
  { to: '/admin/site-modules/content-tags', icon: '#', label: '内容标签' },
  { to: '/admin/site-modules/content-categories', icon: 'Y', label: '内容分类' },
  { to: '/admin/site-modules/content-relations', icon: 'R', label: '内容关联' },
  { to: '/admin/site-modules/content-references', icon: 'Q', label: '内容引用' },
  { to: '/admin/site-modules/business-registry', icon: 'B', label: '业务中心' },
  { to: '/admin/site-modules/business-templates', icon: 'M', label: '业务模板' },
  { to: '/admin/site-modules/industry-solutions', icon: 'I', label: '行业方案' },
  { to: '/admin/site-modules/cooperation-direction-tags', icon: 'C', label: '合作方向' },
  { to: '/admin/products', icon: '▤', label: '产品管理' },
  { to: '/admin/cases', icon: '▥', label: '案例管理' },
  { to: '/admin/contact-info', icon: '☎', label: '联系方式' },
  { to: '/admin/leads', icon: '●', label: '线索管理' },
]
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

.admin-sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 700;
}

.admin-sidebar__item.router-link-active,
.admin-sidebar__item:hover {
  background: #1f2937;
  color: #fff;
}

.admin-sidebar__icon {
  width: 22px;
  color: #93c5fd;
  text-align: center;
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
