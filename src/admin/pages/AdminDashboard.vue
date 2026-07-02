<template>
  <section class="admin-dashboard">
    <div class="admin-dashboard__summary">
      <article>
        <span>认证状态</span>
        <strong>已接入</strong>
        <p>当前后台通过 Cookie Session 与 CSRF 接口完成认证基础链路。</p>
      </article>
      <article>
        <span>当前用户</span>
        <strong>{{ userName }}</strong>
        <p>{{ roleCode }}</p>
      </article>
      <article>
        <span>当前阶段</span>
        <strong>Task 2</strong>
        <p>后台布局、左侧导航、顶部用户区和内容区域。</p>
      </article>
    </div>

    <div class="admin-dashboard__panel">
      <h2>后续任务</h2>
      <ul>
        <li>Task 3：媒体上传</li>
        <li>Task 4：站点配置与首页 Banner</li>
        <li>Task 5：产品管理</li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentUser: {
    type: Object,
    default: null,
  },
})

const userName = computed(() => props.currentUser?.displayName || props.currentUser?.username || '读取中')
const roleCode = computed(() => props.currentUser?.roleCode || 'ADMIN')
</script>

<style scoped>
.admin-dashboard {
  display: grid;
  gap: 20px;
}

.admin-dashboard__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.admin-dashboard__summary article,
.admin-dashboard__panel {
  min-width: 0;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.admin-dashboard__summary span {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.admin-dashboard__summary strong {
  display: block;
  margin-top: 10px;
  color: #111827;
  font-size: 24px;
  line-height: 1.2;
}

.admin-dashboard__summary p {
  margin: 10px 0 0;
  color: #475569;
  line-height: 1.6;
}

.admin-dashboard__panel h2 {
  margin: 0 0 14px;
  color: #111827;
  font-size: 18px;
}

.admin-dashboard__panel ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 18px;
  color: #475569;
}

@media (max-width: 900px) {
  .admin-dashboard__summary {
    grid-template-columns: 1fr;
  }
}
</style>
