<template>
  <el-card class="settings-card">
    <el-form :model="watermarkConfig" label-width="100px">
      <el-form-item :label="$t('message.watermarkText')">
        <el-input v-model="watermarkConfig.text" placeholder="请输入水印文字"></el-input>
      </el-form-item>

      <el-form-item :label="$t('message.fontSize')">
        <el-slider v-model="watermarkConfig.fontSize" :min="10" :max="100" :step="1"></el-slider>
        <span class="value-text">{{ watermarkConfig.fontSize }}px</span>
      </el-form-item>

      <el-form-item :label="$t('message.fontColor')">
        <el-color-picker v-model="watermarkConfig.fontColor"></el-color-picker>
      </el-form-item>

      <el-form-item :label="$t('message.opacity')">
        <el-slider v-model="watermarkConfig.opacity" :min="0" :max="1" :step="0.01"></el-slider>
        <span class="value-text">{{ (watermarkConfig.opacity * 100).toFixed(0) }}%</span>
      </el-form-item>

      <el-form-item :label="$t('message.rotation')">
        <el-slider v-model="watermarkConfig.rotation" :min="0" :max="360" :step="1"></el-slider>
        <span class="value-text">{{ watermarkConfig.rotation }}°</span>
      </el-form-item>

      <el-form-item :label="$t('message.position')">
        <el-select v-model="watermarkConfig.position">
          <el-option :label="$t('message.topLeft')" value="topLeft"></el-option>
          <el-option :label="$t('message.topCenter')" value="topCenter"></el-option>
          <el-option :label="$t('message.topRight')" value="topRight"></el-option>
          <el-option :label="$t('message.middleLeft')" value="middleLeft"></el-option>
          <el-option :label="$t('message.center')" value="center"></el-option>
          <el-option :label="$t('message.middleRight')" value="middleRight"></el-option>
          <el-option :label="$t('message.bottomLeft')" value="bottomLeft"></el-option>
          <el-option :label="$t('message.bottomCenter')" value="bottomCenter"></el-option>
          <el-option :label="$t('message.bottomRight')" value="bottomRight"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="applyWatermark">{{ $t('message.applyWatermark') }}</el-button>
        <el-button type="success" @click="downloadImage" :disabled="!hasImage">{{ $t('message.downloadImage') }}</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  watermarkConfig: {
    type: Object,
    required: true
  },
  hasImage: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['apply', 'download'])

const applyWatermark = () => {
  emit('apply')
}

const downloadImage = () => {
  emit('download')
}

watch(
  () => props.watermarkConfig,
  (newVal) => {
    // 可开启实时预览
    // emit('apply')
  },
  { deep: true }
)
</script>

<style scoped>
.settings-card {
  margin-bottom: 20px;
}

.value-text {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.el-form-item {
  margin-bottom: 15px;
}
</style>