<template>
  <div class="serial-scanner">
    <div v-if="!isScanning && !serialNumber" class="scanner-controls">
      <button @click="startScan" class="btn-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Scan Serial Number
      </button>
      <button @click="showManualInput = true" class="btn-secondary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Enter Manually
      </button>
    </div>
    
    <div v-if="isScanning" class="scanner-view">
      <div ref="scannerContainer" id="scanner-container" class="scanner-container"></div>
      <div class="scanner-overlay">
        <div class="scan-frame"></div>
        <p class="text-white text-center mt-4">Position barcode/serial in frame</p>
      </div>
      <button @click="stopScan" class="btn-secondary mt-4">Stop Scanning</button>
    </div>
    
    <div v-if="serialNumber" class="scanned-result mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <p class="text-green-800 dark:text-green-300 font-semibold">
          Serial Number: <strong>{{ serialNumber }}</strong>
        </p>
        <button @click="clearSerial" class="text-red-600 hover:text-red-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <img v-if="serialPhoto" :src="serialPhoto" alt="Serial Number Photo" class="mt-2 max-w-xs rounded border border-gray-300 dark:border-gray-600" />
    </div>
    
    <div v-if="showManualInput" class="manual-input mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Enter Serial Number
      </label>
      <input 
        v-model="manualSerial" 
        type="text" 
        placeholder="Enter serial number"
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        @keyup.enter="confirmManualSerial"
      />
      <div class="flex gap-2 mt-3">
        <button @click="confirmManualSerial" class="btn-primary flex-1">Confirm</button>
        <button @click="cancelManualInput" class="btn-secondary flex-1">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const emit = defineEmits(['serial-scanned', 'photo-captured'])

const isScanning = ref(false)
const showManualInput = ref(false)
const serialNumber = ref('')
const serialPhoto = ref('')
const manualSerial = ref('')
const scannerContainer = ref(null)
let html5QrCode = null

const startScan = async () => {
  try {
    isScanning.value = true
    showManualInput.value = false
    
    await nextTick() // Wait for DOM to update
    
    if (!scannerContainer.value) return
    
    const containerId = scannerContainer.value.id || 'scanner-container'
    html5QrCode = new Html5Qrcode(containerId)
    
    await html5QrCode.start(
      { facingMode: 'environment' }, // Use back camera on mobile
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => {
        handleScanResult(decodedText)
      },
      (errorMessage) => {
        // Ignore not found errors (just means no code detected yet)
        if (errorMessage && !errorMessage.toString().includes('NotFoundException')) {
          console.log('Scan error:', errorMessage)
        }
      }
    )
  } catch (error) {
    console.error('Camera access error:', error)
    alert('Unable to access camera. Please check permissions.')
    isScanning.value = false
  }
}

const stopScan = async () => {
  if (html5QrCode) {
    try {
      await html5QrCode.stop()
      html5QrCode.clear()
    } catch (error) {
      console.error('Error stopping scanner:', error)
    }
    html5QrCode = null
  }
  isScanning.value = false
}

const handleScanResult = async (scannedText) => {
  serialNumber.value = scannedText
  await stopScan()
  
  // Capture photo of the serial number
  await captureSerialPhoto()
  
  emit('serial-scanned', scannedText)
}

const captureSerialPhoto = async () => {
  try {
    // Try to capture from scanner if available, otherwise use camera
    if (html5QrCode && scannerContainer.value) {
      // For now, we'll use a simple approach - take photo after scan
      // In a real implementation, you might want to capture the frame during scanning
      const photoData = await takePhotoFromCamera()
      if (photoData) {
        serialPhoto.value = photoData
        const url = await uploadPhoto(photoData)
        emit('photo-captured', url)
      }
    }
  } catch (error) {
    console.error('Photo capture error:', error)
  }
}

const takePhotoFromCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    
    const video = document.createElement('video')
    video.srcObject = stream
    video.play()
    
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)
        
        // Convert to base64
        const photoData = canvas.toDataURL('image/jpeg', 0.8)
        
        // Stop stream
        stream.getTracks().forEach(track => track.stop())
        resolve(photoData)
      }
    })
  } catch (error) {
    console.error('Error taking photo:', error)
    return null
  }
}

const uploadPhoto = async (base64Data) => {
  try {
    const response = await $fetch('/api/upload-photo', {
      method: 'POST',
      body: {
        image: base64Data,
        type: 'serial-number'
      }
    })
    return response.url
  } catch (error) {
    console.error('Photo upload error:', error)
    return base64Data // Fallback to base64
  }
}

const manualEntry = () => {
  showManualInput.value = true
  stopScan()
}

const confirmManualSerial = () => {
  if (manualSerial.value.trim()) {
    serialNumber.value = manualSerial.value.trim()
    showManualInput.value = false
    manualSerial.value = ''
    emit('serial-scanned', serialNumber.value)
  }
}

const cancelManualInput = () => {
  showManualInput.value = false
  manualSerial.value = ''
}

const clearSerial = () => {
  serialNumber.value = ''
  serialPhoto.value = ''
  manualSerial.value = ''
  emit('serial-scanned', '')
  emit('photo-captured', '')
}

onUnmounted(async () => {
  await stopScan()
})
</script>

<style scoped>
.scanner-container {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  position: relative;
}

.scanner-view {
  position: relative;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scan-frame {
  border: 3px solid #10b981;
  border-radius: 8px;
  width: 250px;
  height: 250px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

