<template><div class="section-title"><span>{{ tag }}</span><h2>{{ title }}</h2><p v-if="desc">{{ desc }}</p></div></template>
<script setup>defineProps({ tag:String, title:String, desc:String })</script>
