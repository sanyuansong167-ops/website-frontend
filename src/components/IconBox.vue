<template><div :class="['icon-box', color]"><component :is="iconComp" :size="26" /></div></template>
<script setup>
import { computed } from 'vue'
import * as Icons from 'lucide-vue-next'
const props=defineProps({name:{type:String,default:'Box'},color:{type:String,default:'blue'}})
const iconComp=computed(()=>Icons[props.name]||Icons.Box)
</script>
