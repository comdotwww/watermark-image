<template>
  <div class="image-editor">
    <el-upload
      class="upload-demo"
      action="#"
      :auto-upload="false"
      :on-change="handleFileChange"
      :show-file-list="false"
      accept="image/*"
    >
      <el-button type="primary" icon="Upload">{{ $t('message.upload') }}</el-button>
    </el-upload>

    <div class="editor-container" v-if="hasImage">
      <div ref="canvasContainer" class="canvas-container"></div>
    </div>
    <div v-else class="no-image">{{ $t('message.selectImage') }}</div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { fabric } from 'fabric'

const { t } = useI18n()

const props = defineProps({
  watermarkConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['imageLoaded'])

const canvasContainer = ref(null)
const canvas = ref(null)
const originalImage = ref(null)
const hasImage = ref(false)

// 初始化Canvas
const initCanvas = () => {
  // 确保容器存在
  if (!canvasContainer.value) return
  
  // 清除旧的canvas元素
  canvasContainer.value.innerHTML = ''
  
  // 创建新的canvas元素
  const canvasElement = document.createElement('canvas')
  canvasElement.id = 'imageCanvas'
  canvasElement.width = 800
  canvasElement.height = 600
  canvasContainer.value.appendChild(canvasElement)
  
  // 初始化Fabric canvas
  canvas.value = new fabric.Canvas(canvasElement, {
    preserveObjectStacking: true,
    selection: false,
    backgroundColor: '#f8f9fa'
  })
}

onMounted(() => {
  initCanvas()
})

// 监听容器变化
watch(canvasContainer, () => {
  if (canvasContainer.value) {
    initCanvas()
  }
})

const handleFileChange = (file) => {
  if (!file.raw) return
  
  const fileReader = new FileReader()
  
  fileReader.onload = (event) => {
    // 确保canvas已初始化
    if (!canvas.value) {
      initCanvas()
    }
    
    fabric.Image.fromURL(event.target.result, (img) => {
      // 重置canvas
      canvas.value.clear()
      
      // 调整图片大小以适应canvas
      const canvasWidth = canvas.value.getWidth()
      const canvasHeight = canvas.value.getHeight()
      
      // 计算缩放比例
      const scaleX = canvasWidth / img.width
      const scaleY = canvasHeight / img.height
      const scale = Math.min(scaleX, scaleY, 1) // 不放大图片
      
      img.scale(scale)
      
      // 居中显示
      img.set({
        left: (canvasWidth - img.width * scale) / 2,
        top: (canvasHeight - img.height * scale) / 2
      })
      
      originalImage.value = img
      canvas.value.add(img)
      canvas.value.renderAll()
      
      hasImage.value = true
      emit('imageLoaded', true)
      
      // 自动应用水印
      applyWatermark()
    }, {
      crossOrigin: 'anonymous'
    })
  }
  
  fileReader.onerror = (error) => {
    console.error('图片读取错误:', error)
    ElMessage.error(t('alert.imageLoadFailed'))
  }
  
  fileReader.readAsDataURL(file.raw)
}

const applyWatermark = () => {
  if (!canvas.value || !originalImage.value) return
  
  // 移除旧水印
  const watermarkObjects = canvas.value.getObjects().filter(obj => obj.id === 'watermark')
  watermarkObjects.forEach(obj => canvas.value.remove(obj))
  
  const { text, fontSize, fontColor, opacity, rotation, position } = props.watermarkConfig
  
  if (!text) return
  
  // 创建水印文本
  const textObj = new fabric.Text(text, {
    id: 'watermark',
    fontSize: fontSize,
    fill: fontColor,
    opacity: opacity,
    angle: rotation,
    selectable: false,
    fontFamily: 'Arial, sans-serif'
  })
  
  // 定位水印
  const canvasWidth = canvas.value.getWidth()
  const canvasHeight = canvas.value.getHeight()
  
  switch (position) {
    case 'topLeft': 
      textObj.set({ left: 20, top: 20 })
      break
    case 'topCenter': 
      textObj.set({ 
        left: canvasWidth/2 - textObj.width/2, 
        top: 20 
      })
      break
    case 'topRight': 
      textObj.set({ 
        left: canvasWidth - textObj.width - 20, 
        top: 20 
      })
      break
    case 'middleLeft': 
      textObj.set({ 
        left: 20, 
        top: canvasHeight/2 - textObj.height/2 
      })
      break
    case 'center': 
      textObj.set({ 
        left: canvasWidth/2 - textObj.width/2, 
        top: canvasHeight/2 - textObj.height/2 
      })
      break
    case 'middleRight': 
      textObj.set({ 
        left: canvasWidth - textObj.width - 20, 
        top: canvasHeight/2 - textObj.height/2 
      })
      break
    case 'bottomLeft': 
      textObj.set({ 
        left: 20, 
        top: canvasHeight - textObj.height - 20 
      })
      break
    case 'bottomCenter': 
      textObj.set({ 
        left: canvasWidth/2 - textObj.width/2, 
        top: canvasHeight - textObj.height - 20 
      })
      break
    case 'bottomRight': 
      textObj.set({ 
        left: canvasWidth - textObj.width - 20, 
        top: canvasHeight - textObj.height - 20 
      })
      break
  }
  
  canvas.value.add(textObj)
  canvas.value.renderAll()
}

const downloadImage = () => {
  if (!canvas.value) return
  
  try {
    // 获取canvas数据URL
    const dataURL = canvas.value.toDataURL({ 
      format: 'png', 
      quality: 1.0
    })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `watermarked-${new Date().getTime()}.png`
    link.click()
    
    // 清理
    URL.revokeObjectURL(link.href)
    
    ElMessage.success(t('alert.downloadSuccess'))
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error(t('alert.downloadFailed'))
  }
}

// 监听水印配置变化
watch(
  () => props.watermarkConfig,
  () => {
    if (hasImage.value) {
      applyWatermark()
    }
  },
  { deep: true }
)

defineExpose({ 
  applyWatermark, 
  downloadImage,
  hasImage
})
</script>

<style scoped>
.image-editor {
  margin-bottom: 20px;
}

.editor-container {
  margin-top: 20px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-image {
  margin-top: 20px;
  padding: 60px 20px;
  text-align: center;
  color: #999;
  border: 1px dashed #e6e6e6;
  border-radius: 4px;
}

canvas {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>