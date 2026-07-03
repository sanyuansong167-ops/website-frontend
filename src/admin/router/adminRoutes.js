import AdminLogin from '../pages/AdminLogin.vue'
import AdminLayout from '../layout/AdminLayout.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'
import MediaManage from '../pages/MediaManage.vue'
import MediaLibrary from '../pages/MediaLibrary.vue'
import SiteConfigManage from '../pages/SiteConfigManage.vue'
import HomeBannerManage from '../pages/HomeBannerManage.vue'
import AdminSiteModuleManage from '../pages/AdminSiteModuleManage.vue'
import ProductManage from '../pages/ProductManage.vue'
import CaseManage from '../pages/CaseManage.vue'
import ContactInfoManage from '../pages/ContactInfoManage.vue'
import LeadManage from '../pages/LeadManage.vue'
import { getAdminMe } from '../api/adminAuth'

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
    component: AdminLayout,
    beforeEnter: requireAdminAuth,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: { title: '工作台' },
      },
      {
        path: 'media',
        name: 'admin-media',
        component: MediaManage,
        meta: { title: '媒体上传' },
      },
      {
        path: 'media-library',
        name: 'admin-media-library',
        component: MediaLibrary,
        meta: { title: '媒体库' },
      },
      {
        path: 'site-config',
        name: 'admin-site-config',
        component: SiteConfigManage,
        meta: { title: '站点配置' },
      },
      {
        path: 'home-banner',
        name: 'admin-home-banner',
        component: HomeBannerManage,
        meta: { title: '首页 Banner' },
      },
      {
        path: 'site-modules/:moduleKey',
        name: 'admin-site-module',
        component: AdminSiteModuleManage,
        meta: { title: 'Site 模块管理' },
      },
      {
        path: 'products',
        name: 'admin-products',
        component: ProductManage,
        meta: { title: '产品管理' },
      },
      {
        path: 'cases',
        name: 'admin-cases',
        component: CaseManage,
        meta: { title: '案例管理' },
      },
      {
        path: 'contact-info',
        name: 'admin-contact-info',
        component: ContactInfoManage,
        meta: { title: '联系方式管理' },
      },
      {
        path: 'leads',
        name: 'admin-leads',
        component: LeadManage,
        meta: { title: '线索管理' },
      },
    ],
  },
]
