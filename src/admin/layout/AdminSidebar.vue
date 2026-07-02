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
      <router-link class="admin-sidebar__item" to="/admin">
        <span class="admin-sidebar__icon">⌂</span>
        <span>工作台</span>
      </router-link>
      <router-link class="admin-sidebar__item" to="/admin/media">
        <span class="admin-sidebar__icon">↑</span>
        <span>媒体上传</span>
      </router-link>
      <router-link class="admin-sidebar__item" to="/admin/site-config">
        <span class="admin-sidebar__icon">◆</span>
        <span>站点配置</span>
      </router-link>
      <router-link class="admin-sidebar__item" to="/admin/home-banner">
        <span class="admin-sidebar__icon">▣</span>
        <span>首页 Banner</span>
      </router-link>
      <router-link class="admin-sidebar__item" to="/admin/products">
        <span class="admin-sidebar__icon">□</span>
        <span>产品管理</span>
      </router-link>
      <router-link class="admin-sidebar__item" to="/admin/cases">
        <span class="admin-sidebar__icon">▤</span>
        <span>案例管理</span>
      </router-link>
      <router-link class="admin-sidebar__item" to="/admin/contact-info">
        <span class="admin-sidebar__icon">☎</span>
        <span>联系方式</span>
      </router-link>
      <router-link class="admin-sidebar__item" to="/admin/leads">
        <span class="admin-sidebar__icon">◇</span>
        <span>线索管理</span>
      </router-link>
    </nav>

    <div class="admin-sidebar__note">
      <span>Task 7</span>
      <strong>联系方式与线索管理</strong>
    </div>
  </aside>
</template>

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
}

.admin-sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
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
