<template>
  <el-select v-model="currentLang" @change="changeLang" style="width: 120px;">
    <el-option :label="$t('message.chinese')" value="zh"></el-option>
    <el-option :label="$t('message.english')" value="en"></el-option>
  </el-select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'

const { locale } = useI18n()
const currentLang = ref(locale.value)

const changeLang = (val) => {
  locale.value = val
  currentLang.value = val
}

// 监听语言变化
watch(
  () => locale.value,
  (newVal) => {
    currentLang.value = newVal
  }
)
</script>