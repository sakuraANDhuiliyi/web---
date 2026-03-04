<template>
  <div>
    <button @click="toggleAudio">{{ isListening ? '停止' : '开始' }}监听</button>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const canvas = ref(null)
const isListening = ref(false)
const width = 800
const height = 400

let audioContext = null
let analyser = null
let dataArray = null
let animationId = null
let mediaStream = null

const toggleAudio = async () => {
  if (isListening.value) {
    stopListening()
  } else {
    try {
      await startListening()
      isListening.value = true
    } catch (error) {
      console.error('无法访问麦克风:', error)
    }
  }
}

const startListening = async () => {
  // 请求麦克风权限
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })

  // 创建音频上下文
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const source = audioContext.createMediaStreamSource(mediaStream)

  // 创建分析器
  analyser = audioContext.createAnalyser()
  analyser.fftSize = 2048
  const bufferLength = analyser.frequencyBinCount
  dataArray = new Uint8Array(bufferLength)

  // 连接节点
  source.connect(analyser)

  // 开始绘制
  draw()
}

const stopListening = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
  }
  if (audioContext) {
    audioContext.close()
  }
  isListening.value = false
}

const draw = () => {
  const ctx = canvas.value.getContext('2d')
  analyser.getByteFrequencyData(dataArray)

  ctx.fillStyle = 'rgb(0, 0, 0)'
  ctx.fillRect(0, 0, width, height)

  const barWidth = (width / analyser.frequencyBinCount) * 2.5
  let posX = 0

  for (let i = 0; i < analyser.frequencyBinCount; i++) {
    const barHeight = dataArray[i]

    const r = barHeight + 25 * (i / analyser.frequencyBinCount)
    const g = 250 * (i / analyser.frequencyBinCount)
    const b = 50

    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(posX, height - barHeight / 2, barWidth, barHeight / 2)

    posX += barWidth + 1
  }

  animationId = requestAnimationFrame(draw)
}

onBeforeUnmount(() => {
  stopListening()
})
</script>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

canvas {
  border: 1px solid #ccc;
  margin-top: 20px;
}
</style>