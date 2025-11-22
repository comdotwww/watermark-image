<template>
  <div id="app">
    <el-container style="min-height: 100vh;">
      <el-header>
        <div class="header-content">
          <h1>{{ $t('message.title') }}</h1>
          <language-selector></language-selector>
        </div>
      </el-header>

      <el-main>
        <el-row :gutter="20">
          <el-col :span="8">
            <watermark-settings
              :watermark-config="watermarkConfig"
              :has-image="hasImage"
              @apply="handleApplyWatermark"
              @download="handleDownloadImage"
            ></watermark-settings>
          </el-col>
          <el-col :span="16">
            <image-editor
              ref="imageEditorRef"
              :watermark-config="watermarkConfig"
              @image-loaded="handleImageLoaded"
            ></image-editor>
          </el-col>
        </el-row>
      </el-main>

      <el-footer>
        <div class="footer-content">
          © 2025 MarkImg Clone | 基于Vue3 + Fabric.js构建
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageEditor from './components/ImageEditor.vue'
import WatermarkSettings from './components/WatermarkSettings.vue'
import LanguageSelector from './components/LanguageSelector.vue'

const imageEditorRef = ref(null)
const hasImage = ref(false)

// 水印默认配置
const watermarkConfig = ref({
  text: 'MarkImg',
  fontSize: 30,
  fontColor: '#000000',
  opacity: 0.5,
  rotation: 0,
  position: 'center'
})

const handleImageLoaded = (status) => {
  hasImage.value = status
}

const handleApplyWatermark = () => {
  imageEditorRef.value?.applyWatermark()
}

const handleDownloadImage = () => {
  imageEditorRef.value?.downloadImage()
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.el-footer {
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 20px 0;
  border-top: 1px solid #e6e6e6;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>