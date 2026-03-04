<template>
  <div class="waveform-editor">
    <!-- 上传音频 -->
    <div class="upload-section">
      <label for="audioUpload">上传音频文件 (webm):</label>
      <input type="file" id="audioUpload" accept="audio/webm" @change="handleFileUpload" />
    </div>

    <!-- 波形图 -->
    <div ref="waveform" class="waveform"></div>

    <!-- 音频控制按钮 -->
    <div class="controls">
      <button @click="playPause" :disabled="!waveSurfer">播放/暂停</button>
      <button @click="resetRegions" :disabled="!regions.length">清除区域</button>
      <button @click="exportEditedAudio" :disabled="!selectedRegion">导出选区音频</button>
    </div>

    <!-- 提示消息 -->
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>
<script>
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
export default {
  name: "WaveformEditor",
  data() {
    return {
      waveSurfer: null, // WaveSurfer 实例
      regions: [], // 存储区域列表
      selectedRegion: null, // 当前选中的区域
      message: "", // 提示信息
    };
  },
  methods: {
    // 处理音频文件上传
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === "audio/webm") {
        this.message = "加载音频文件中...";
        const url = URL.createObjectURL(file);
        this.initWaveSurfer(url);
      } else {
        this.message = "请上传有效的 WebM 音频文件！";
      }
    },

    // 初始化 WaveSurfer 实例
    initWaveSurfer(url) {
      if (this.waveSurfer) this.waveSurfer.destroy();

      this.waveSurfer = WaveSurfer.create({
        container: this.$refs.waveform,
        waveColor: "#A8DBA8",
        progressColor: "#3B8686",
        cursorColor: "#FF0000",
        responsive: true,
        plugins: [
          RegionsPlugin.create({
            dragSelection: {
              color: "rgba(255, 165, 0, 0.2)", // 选区颜色
            },
          }),
        ],
      });

      this.waveSurfer.load(url);

      this.waveSurfer.on("ready", () => {
        this.message = "音频加载完成，可以开始编辑。";
      });

      this.waveSurfer.on("region-created", this.handleRegionCreated);
      this.waveSurfer.on("region-updated", (region) => {
        this.selectedRegion = region;
      });

      // 播放结束回调
      this.waveSurfer.on("finish", () => {
        this.waveSurfer.stop();
      });

      this.regions = [];
      this.selectedRegion = null;
    },

    // 处理选区创建，确保只有一个选区
    handleRegionCreated(region) {
      Object.values(this.waveSurfer.regions.list).forEach((r) => r.remove());
      this.regions = [region];
      this.selectedRegion = region;
    },

    // 播放/暂停音频
    playPause() {
      this.waveSurfer.playPause();
    },

    // 清除选区
    resetRegions() {
      Object.values(this.waveSurfer.regions.list).forEach((r) => r.remove());
      this.regions = [];
      this.selectedRegion = null;
      this.message = "所有选区已清除。";
    },

    // 导出选区音频
    exportEditedAudio() {
      if (!this.selectedRegion) {
        this.message = "请先选择音频区域。";
        return;
      }

      const start = this.selectedRegion.start;
      const end = this.selectedRegion.end;

      const audio = new Audio(this.waveSurfer.getMediaElement().src);
      const offlineContext = new OfflineAudioContext(1, 44100 * (end - start), 44100);

      fetch(audio.src)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => offlineContext.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          const trimmedBuffer = this.trimAudioBuffer(audioBuffer, start, end);
          this.downloadTrimmedAudio(trimmedBuffer);
        })
        .catch((error) => {
          console.error("音频导出失败:", error);
          this.message = "音频导出失败，请重试。";
        });
    },

    // 裁剪音频缓冲区
    trimAudioBuffer(audioBuffer, start, end) {
      const sampleRate = audioBuffer.sampleRate;
      const startOffset = Math.floor(start * sampleRate);
      const endOffset = Math.floor(end * sampleRate);
      const trimmedLength = endOffset - startOffset;

      const newBuffer = this.waveSurfer.backend.ac.createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        for (let i = 0; i < trimmedLength; i++) {
          newData[i] = oldData[i + startOffset];
        }
      }

      return newBuffer;
    },

    // 下载裁剪后的音频
    downloadTrimmedAudio(audioBuffer) {
      const blob = this.bufferToWave(audioBuffer);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "trimmed_audio.wav"; // 修改为 WAV 格式
      link.click();
      this.message = "音频已导出成功！";
    },

    // 将 AudioBuffer 转换为 WAV 格式
    bufferToWave(abuffer) {
      const numOfChan = abuffer.numberOfChannels,
        length = abuffer.length * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        sampleRate = abuffer.sampleRate;

      let offset = 0;
      const writeString = (string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset++, string.charCodeAt(i));
        }
      };

      // 写入WAV头部
      writeString("RIFF");
      view.setUint32(offset, length - 8, true); offset += 4;
      writeString("WAVE");
      writeString("fmt ");
      view.setUint32(offset, 16, true); offset += 4;
      view.setUint16(offset, 1, true); offset += 2; // PCM
      view.setUint16(offset, numOfChan, true); offset += 2;
      view.setUint32(offset, sampleRate, true); offset += 4;
      view.setUint32(offset, sampleRate * 2 * numOfChan, true); offset += 4;
      view.setUint16(offset, numOfChan * 2, true); offset += 2;
      view.setUint16(offset, 16, true); offset += 2;
      writeString("data");
      view.setUint32(offset, length - offset - 4, true); offset += 4;

      // 写入音频数据
      for (let i = 0; i < abuffer.length; i++) {
        for (let channel = 0; channel < numOfChan; channel++) {
          let sample = Math.max(-1, Math.min(1, abuffer.getChannelData(channel)[i]));
          sample = (sample * 32767) | 0;
          view.setInt16(offset, sample, true);
          offset += 2;
        }
      }

      return new Blob([buffer], { type: "audio/wav" }); // 修改为 WAV 格式
    },
  },
};
</script>
<style scoped>
.waveform-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-section {
  margin-bottom: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button {
  padding: 8px 16px;
  font-size: 14px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

.message {
  margin-top: 10px;
  color: #d9534f;
  font-size: 14px;
}

.waveform {
  width: 100%;
  max-width: 600px; /* 可根据需要调整最大宽度 */
  height: 150px;
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>