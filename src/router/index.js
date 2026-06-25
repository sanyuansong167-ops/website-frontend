import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import CaseDetail from '../views/CaseDetail.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/products', redirect: '/#products' },
    { path: '/product', name: 'product-detail', component: ProductDetail },
    { path: '/product/:id', redirect: '/product' },
    { path: '/cases', redirect: '/#cases' },
    { path: '/case', name: 'case-detail', component: CaseDetail },
    { path: '/case/:id', redirect: '/case' },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 88, behavior: 'smooth' }
    return { top: 0 }
  }
})
