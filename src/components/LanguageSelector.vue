<template>
  <el-select v-model="currentLang" @change="changeLang" style="width: 120px;">
    <el-option label="中文" value="zh"></el-option>
    <el-option label="English" value="en"></el-option>
  </el-select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const { locale } = useI18n()
const currentLang = ref(locale.value)

const changeLang = (val) => {
  locale.value = val
  currentLang.value = val
}
</script>