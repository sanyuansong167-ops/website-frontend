<template>
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <div class="brand light">
          <div class="logo-mark">云</div>
          <div><strong>云台数据</strong><span>YUNTAI DATA</span></div>
        </div>
        <p>让组织拥有持续进化的数字智能能力。十余年深耕企业数字化与智能化建设。</p>
        <div class="social"><span>in</span><span>→</span><span>Y</span></div>
      </div>
      <div><h4>快速链接</h4><a>产品矩阵</a><a>行业解决方案</a><a>标杆案例</a><a>关于我们</a></div>
      <div><h4>服务领域</h4><a>企业数字化建设</a><a>数据平台建设</a><a>AI应用开发</a><a>Agent场景落地</a><a>系统集成与咨询</a></div>
      <div><h4>联系我们</h4><a v-if="contactInfo.address">{{ contactInfo.address }}</a><a v-if="contactInfo.phone">{{ contactInfo.phone }}</a><a v-if="contactInfo.email">{{ contactInfo.email }}</a></div>
    </div>
    <div class="container copyright"><span>© 2026 武汉云台数据有限公司 版权所有</span><span>隐私政策　服务条款　鄂ICP备XXXXXXX号</span></div>
  </footer>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { contactInfo as defaultContactInfo } from '../data/site'
import { getPortalContactInfo } from '../api/portal'

const contactInfo = ref({ ...defaultContactInfo })

async function loadContactInfo() {
  try {
    contactInfo.value = await getPortalContactInfo()
  } catch (error) {
    console.error('[Portal API] footer contact-info failed, fallback to site.js', error)
    contactInfo.value = { ...defaultContactInfo }
  }
}

onMounted(loadContactInfo)
</script>
