<template>
  <div id="app">
    <header class="header">
      <h1>{{ $t('app.title') }}</h1>
      <div class="language-switcher">
        <select v-model="$i18n.locale" @change="changeLanguage">
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>
    </header>

    <main class="main-content">
      <div class="upload-section">
        <div 
          class="upload-area"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @click="triggerFileInput"
        >
          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            accept="image/*"
            style="display: none"
          />
          <div class="upload-placeholder">
            <span>{{ $t('upload.placeholder') }}</span>
          </div>
        </div>
      </div>

      <div v-if="originalImage" class="editor-section">
        <div class="preview-container">
          <div class="preview-wrapper">
            <canvas ref="previewCanvas"></canvas>
          </div>
        </div>

        <div class="controls">
          <div class="control-group">
            <label>{{ $t('watermark.text') }}</label>
            <input 
              type="text" 
              v-model="watermarkText"
              :placeholder="$t('watermark.textPlaceholder')"
            />
          </div>

          <div class="control-group">
            <label>{{ $t('watermark.fontSize') }}</label>
            <input 
              type="range" 
              v-model="fontSize"
              min="12"
              max="72"
            />
            <span>{{ fontSize }}px</span>
          </div>

          <div class="control-group">
            <label>{{ $t('watermark.opacity') }}</label>
            <input 
              type="range" 
              v-model="opacity"
              min="0.1"
              max="1"
              step="0.1"
            />
            <span>{{ (opacity * 100).toFixed(0) }}%</span>
          </div>

          <div class="control-group">
            <label>{{ $t('watermark.rotation') }}</label>
            <input 
              type="range" 
              v-model="rotation"
              min="-180"
              max="180"
            />
            <span>{{ rotation }}°</span>
          </div>

          <div class="control-group">
            <label>{{ $t('watermark.color') }}</label>
            <input type="color" v-model="color" />
          </div>

          <div class="control-group">
            <label>
              <input type="checkbox" v-model="tiled" />
              {{ $t('watermark.tiled') }}
            </label>
          </div>

          <div class="action-buttons">
            <button @click="applyWatermark" class="btn-primary">
              {{ $t('actions.applyWatermark') }}
            </button>
            <button @click="downloadImage" class="btn-secondary">
              {{ $t('actions.download') }}
            </button>
            <button @click="reset" class="btn-outline">
              {{ $t('actions.reset') }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      originalImage: null,
      watermarkText: 'Watermark',
      fontSize: 24,
      opacity: 0.7,
      rotation: -45,
      color: '#000000',
      tiled: true,
      processedImage: null
    }
  },
  watch: {
    originalImage() {
      if (this.originalImage) {
        this.$nextTick(() => {
          this.applyWatermark()
        })
      }
    },
    watermarkText: 'applyWatermark',
    fontSize: 'applyWatermark',
    opacity: 'applyWatermark',
    rotation: 'applyWatermark',
    color: 'applyWatermark',
    tiled: 'applyWatermark'
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        this.loadImage(file)
      }
    },

    handleDragOver(event) {
      event.preventDefault()
    },

    handleDrop(event) {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        this.loadImage(file)
      }
    },

    loadImage(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.originalImage = new Image()
        this.originalImage.onload = () => {
          this.applyWatermark()
        }
        this.originalImage.src = e.target.result
      }
      reader.readAsDataURL(file)
    },

    applyWatermark() {
      if (!this.originalImage) return

      const canvas = this.$refs.previewCanvas
      const ctx = canvas.getContext('2d')

      // Set canvas size to match image
      canvas.width = this.originalImage.width
      canvas.height = this.originalImage.height

      // Clear canvas and draw original image
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(this.originalImage, 0, 0)

      if (this.watermarkText) {
        ctx.save()
        
        // Set text styles
        ctx.font = `${this.fontSize}px Arial`
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (this.tiled) {
          // Tiled watermark pattern
          const patternCanvas = document.createElement('canvas')
          const patternCtx = patternCanvas.getContext('2d')
          patternCanvas.width = 200
          patternCanvas.height = 200

          patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height)
          patternCtx.font = ctx.font
          patternCtx.fillStyle = ctx.fillStyle
          patternCtx.globalAlpha = ctx.globalAlpha
          patternCtx.textAlign = 'center'
          patternCtx.textBaseline = 'middle'

          // Draw rotated text in center of pattern
          patternCtx.save()
          patternCtx.translate(patternCanvas.width / 2, patternCanvas.height / 2)
          patternCtx.rotate(this.rotation * Math.PI / 180)
          patternCtx.fillText(this.watermarkText, 0, 0)
          patternCtx.restore()

          // Create pattern and fill canvas
          const pattern = ctx.createPattern(patternCanvas, 'repeat')
          ctx.fillStyle = pattern
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else {
          // Single centered watermark
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate(this.rotation * Math.PI / 180)
          ctx.fillText(this.watermarkText, 0, 0)
          ctx.restore()
        }

        ctx.restore()
      }

      this.processedImage = canvas.toDataURL('image/png')
    },

    downloadImage() {
      if (!this.processedImage) return

      const link = document.createElement('a')
      link.download = `watermarked-${Date.now()}.png`
      link.href = this.processedImage
      link.click()
    },

    reset() {
      this.originalImage = null
      this.watermarkText = 'Watermark'
      this.fontSize = 24
      this.opacity = 0.7
      this.rotation = -45
      this.color = '#000000'
      this.tiled = true
      this.processedImage = null
      
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    changeLanguage() {
      // Language change is handled automatically by vue-i18n
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}

.header {
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: between;
  align-items: center;
}

.header h1 {
  color: #2c3e50;
  font-size: 1.5rem;
}

.language-switcher select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.upload-section {
  margin-bottom: 2rem;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
  background: white;
}

.upload-area:hover {
  border-color: #4CAF50;
}

.upload-placeholder {
  color: #666;
  font-size: 1.1rem;
}

.editor-section {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.preview-wrapper {
  max-width: 100%;
  overflow: auto;
  border: 1px solid #eee;
  border-radius: 4px;
}

.preview-wrapper canvas {
  max-width: 100%;
  height: auto;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  color: #555;
}

.control-group input[type="text"],
.control-group input[type="range"],
.control-group input[type="color"] {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.control-group input[type="range"] {
  padding: 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-primary, .btn-secondary, .btn-outline {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #2196F3;
  color: white;
}

.btn-secondary:hover {
  background: #0b7dda;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
}

.btn-outline:hover {
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .editor-section {
    grid-template-columns: 1fr;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>