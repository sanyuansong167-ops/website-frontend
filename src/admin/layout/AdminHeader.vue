<template>
  <header class="admin-header">
    <div>
      <p class="admin-header__eyebrow">后台管理</p>
      <h1>{{ title }}</h1>
    </div>

    <div class="admin-header__user">
      <div class="admin-header__identity">
        <strong>{{ displayName }}</strong>
        <span>{{ roleCode }}</span>
      </div>
      <button type="button" :disabled="loggingOut" @click="$emit('logout')">
        {{ loggingOut ? '退出中...' : '退出登录' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '工作台',
  },
  user: {
    type: Object,
    default: null,
  },
  loggingOut: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['logout'])

const displayName = computed(() => props.user?.displayName || props.user?.username || '管理员')
const roleCode = computed(() => props.user?.roleCode || 'ADMIN')
</script>

<style scoped>
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 76px;
  padding: 0 28px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.admin-header__eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.admin-header h1 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  line-height: 1.2;
}

.admin-header__user {
  display: flex;
  align-items: center;
  gap: 14px;
}

.admin-header__identity {
  min-width: 0;
  text-align: right;
}

.admin-header__identity strong,
.admin-header__identity span {
  display: block;
}

.admin-header__identity strong {
  color: #111827;
  font-size: 14px;
}

.admin-header__identity span {
  margin-top: 3px;
  color: #64748b;
  font-size: 12px;
}

.admin-header button {
  min-width: 86px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #1f2937;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.admin-header button:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.admin-header button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
