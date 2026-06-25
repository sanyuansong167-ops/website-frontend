<template><div class="feature"><IconBox :name="icon" :color="color"/><small>{{ en }}</small><h3>{{ title }}</h3><p>{{ text }}</p><a>了解更多 →</a></div></template>
<script setup>import IconBox from './IconBox.vue'; defineProps({icon:String,color:String,en:String,title:String,text:String})</script>
