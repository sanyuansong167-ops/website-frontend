<template><SiteHeader/><main class="detail-page soft"><section class="section"><div class="container"><SectionTitle tag="案例详情" title="案例详情" desc="聚焦运行在企业真实场景、每一个案例均不是演示内容，而是正在服务中的客户案例。"/><div class="case-list"><article v-for="c in cases" :key="c.id" class="case-detail"><img :src="c.img" :alt="c.title"><div><h2>{{c.title}}</h2><b>{{c.industry}}</b><p>{{c.desc}}</p><span v-for="t in c.tags" :key="t">{{t}}</span><blockquote>{{c.quote}}</blockquote></div></article></div></div></section></main><FooterSection/></template>
<script setup>
import { cases } from '../data/site'; import SiteHeader from '../components/SiteHeader.vue'; import FooterSection from '../components/FooterSection.vue'; import SectionTitle from '../components/SectionTitle.vue';
</script>
