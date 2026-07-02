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

<style scoped>
.footer {
  padding: 56px 0 30px;
  background: #0f172a;
  color: #97a3b6;
}

.footer .container {
  width: 100%;
  max-width: 1416px;
  padding: 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 0;
  align-items: start;
}

.footer-grid > div {
  min-width: 0;
}

.footer-grid > div:first-child {
  max-width: 320px;
}

.brand.light {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 156px;
  margin-bottom: 22px;
}

.brand.light .logo-mark {
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  border-radius: 9px;
}

.brand.light strong {
  display: block;
  color: #fff;
  font-size: 21px;
  line-height: 1.15;
  font-weight: 900;
}

.brand.light span {
  display: block;
  margin-top: 4px;
  color: #7f8da1;
  font-size: 12px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.footer p {
  margin: 0 0 22px;
  color: #a4afbf;
  font-size: 16px;
  line-height: 1.9;
  font-weight: 700;
}

.social {
  display: flex;
  gap: 14px;
  align-items: center;
}

.social span {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin: 0;
  border-radius: 50%;
  background: #1e293b;
  color: #9aa8ba;
  font-size: 13px;
  font-weight: 900;
}

.footer h4 {
  margin: 0 0 22px;
  color: #f8fafc;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 900;
}

.footer a {
  display: block;
  margin: 0 0 15px;
  color: #a4afbf;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 800;
}

.footer-grid > div:nth-child(4) a {
  margin-bottom: 18px;
}

.copyright {
  max-width: 1416px;
  margin-top: 58px;
  padding-top: 28px;
  border-top: 1px solid #243044;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  color: #8d9aab;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
}

.copyright span:last-child {
  text-align: right;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .footer {
    padding: 42px 0 24px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    row-gap: 32px;
  }

  .footer-grid > div:first-child {
    max-width: none;
  }

  .brand.light {
    margin-left: 0;
  }

  .copyright {
    margin-top: 36px;
    flex-direction: column;
    align-items: flex-start;
  }

  .copyright span:last-child {
    text-align: left;
    white-space: normal;
  }
}
</style>
