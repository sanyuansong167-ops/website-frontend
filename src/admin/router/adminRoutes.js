import { h } from 'vue'
import AdminLogin from '../pages/AdminLogin.vue'
import { adminLogout, clearAdminCsrf, getAdminMe } from '../api/adminAuth'

const AdminAuthHome = {
  name: 'AdminAuthHome',
  data() {
    return {
      currentUser: null,
      loggingOut: false,
      errorMessage: '',
    }
  },
  async mounted() {
    try {
      this.currentUser = await getAdminMe()
    } catch (error) {
      this.errorMessage = error?.message || '登录状态校验失败'
    }
  },
  methods: {
    async handleLogout() {
      this.loggingOut = true
      this.errorMessage = ''

      try {
        await adminLogout()
      } catch (error) {
        this.errorMessage = error?.message || '退出登录失败'
      } finally {
        clearAdminCsrf()
        this.loggingOut = false
        this.$router.replace('/admin/login')
      }
    },
  },
  render() {
    return h('main', { class: 'admin-auth-home' }, [
      h('section', { class: 'admin-auth-home__panel' }, [
        h('p', { class: 'admin-auth-home__eyebrow' }, '武汉云台官网后台'),
        h('h1', '后台认证已通过'),
        h(
          'p',
          { class: 'admin-auth-home__meta' },
          this.currentUser
            ? `${this.currentUser.displayName || this.currentUser.username} · ${this.currentUser.roleCode || 'ADMIN'}`
            : '正在读取当前用户...',
        ),
        this.errorMessage ? h('p', { class: 'admin-auth-home__error' }, this.errorMessage) : null,
        h(
          'button',
          {
            class: 'admin-auth-home__button',
            disabled: this.loggingOut,
            onClick: this.handleLogout,
          },
          this.loggingOut ? '退出中...' : '退出登录',
        ),
      ]),
    ])
  },
}

async function requireAdminAuth(to) {
  try {
    await getAdminMe()
    return true
  } catch {
    return {
      path: '/admin/login',
      query: { redirect: to.fullPath },
    }
  }
}

export default [
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLogin,
  },
  {
    path: '/admin',
    name: 'admin-home',
    component: AdminAuthHome,
    beforeEnter: requireAdminAuth,
  },
]
