<template>
  <div class="image-editor">
    <el-upload
      class="upload-demo"
      action="#"
      :auto-upload="false"
      :on-change="handleFileChange"
      :show-file-list="false"
    >
      <el-button type="primary" icon="Upload">{{ $t('message.upload') }}</el-button>
    </el-upload>

    <div class="editor-container" v-if="canvas">
      <canvas ref="canvasRef" width="800" height="600"></canvas>
    </div>
    <div v-else class="no-image">{{ $t('message.selectImage') }}</div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { fabric } from 'fabric'

const props = defineProps({
  watermarkConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['imageLoaded'])

const canvasRef = ref(null)
const canvas = ref(null)
const originalImage = ref(null)

onMounted(() => {
  canvas.value = new fabric.Canvas(canvasRef.value, {
    preserveObjectStacking: true,
    selection: false
  })
})

const handleFileChange = (file) => {
  if (!file.raw) return

  const reader = new FileReader()
  reader.onload = (e) => {
    fabric.Image.fromURL(e.target.result, (img) => {
      originalImage.value = img
      canvas.value.setWidth(img.width)
      canvas.value.setHeight(img.height)
      canvas.value.clear()
      canvas.value.add(img)
      emit('imageLoaded', true)
    })
  }
  reader.readAsDataURL(file.raw)
}

const applyWatermark = () => {
  if (!originalImage.value) return

  // 移除旧水印
  const watermarkObjects = canvas.value.getObjects().filter(obj => obj.id === 'watermark')
  watermarkObjects.forEach(obj => canvas.value.remove(obj))

  const { text, fontSize, fontColor, opacity, rotation, position } = props.watermarkConfig

  // 创建水印文本
  const textObj = new fabric.Text(text, {
    id: 'watermark',
    fontSize: fontSize,
    fill: fontColor,
    opacity: opacity,
    angle: rotation,
    selectable: false
  })

  // 定位水印
  const canvasWidth = canvas.value.getWidth()
  const canvasHeight = canvas.value.getHeight()

  switch (position) {
    case 'topLeft': textObj.set({ left: 20, top: 20 }); break
    case 'topCenter': textObj.set({ left: canvasWidth/2 - textObj.width/2, top: 20 }); break
    case 'topRight': textObj.set({ left: canvasWidth - textObj.width - 20, top: 20 }); break
    case 'middleLeft': textObj.set({ left: 20, top: canvasHeight/2 - textObj.height/2 }); break
    case 'center': textObj.set({ left: canvasWidth/2 - textObj.width/2, top: canvasHeight/2 - textObj.height/2 }); break
    case 'middleRight': textObj.set({ left: canvasWidth - textObj.width - 20, top: canvasHeight/2 - textObj.height/2 }); break
    case 'bottomLeft': textObj.set({ left: 20, top: canvasHeight - textObj.height - 20 }); break
    case 'bottomCenter': textObj.set({ left: canvasWidth/2 - textObj.width/2, top: canvasHeight - textObj.height - 20 }); break
    case 'bottomRight': textObj.set({ left: canvasWidth - textObj.width - 20, top: canvasHeight - textObj.height - 20 }); break
  }

  canvas.value.add(textObj)
}

const downloadImage = () => {
  if (!canvas.value) return
  const dataURL = canvas.value.toDataURL({ format: 'png', quality: 1.0 })
  const link = document.createElement('a')
  link.href = dataURL
  link.download = 'watermarked-image.png'
  link.click()
}

defineExpose({ applyWatermark, downloadImage })
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

.no-image {
  margin-top: 20px;
  padding: 40px;
  text-align: center;
  color: #999;
  border: 1px dashed #e6e6e6;
  border-radius: 4px;
}

canvas {
  width: 100%;
  height: auto;
}
</style>