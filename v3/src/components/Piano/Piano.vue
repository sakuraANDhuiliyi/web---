<template>
  <div class="piano-wrapper">
    <!-- Sound Set Selector and Recorder -->
    <div class="controls">
      <!-- Sound Set Selector -->
      <div class="sound-set-selector">
        <label for="soundSet">乐器选择</label>
        <select id="soundSet" v-model="selectedSoundSet" @change="handleSoundSetChange">
          <option v-for="set in soundSets" :key="set.name" :value="set.path">
            {{ set.name }}
          </option>
        </select>
      </div>
      <!-- Recorder -->
      <div class="recorder">
        <button @click="toggleRecording" :class="{ recording: isRecording }">
          {{ isRecording ? '停止录制' : '开始录制' }}
        </button>
        <a v-if="recordedUrl" :href="recordedUrl" download="piano_recording.webm">下载录音</a>
      </div>
    </div>

    <div
      class="piano-container"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="resetAllKeys"
    >
      <!-- Canvas 可视化区域 -->
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @click="activateAudioContext"
      ></canvas>

      <div class="piano">
        <!-- 白键 -->
        <div
          v-for="(key, index) in whiteKeys"
          :key="`white-${index}`"
          :class="['key', 'white', { active: key.active }]"
          @mousedown.stop.prevent="handleKeyInteraction(key)"
          @mouseup.stop.prevent="handleKeyRelease(key)"
          @mouseenter.stop.prevent="isMouseDown ? handleKeyInteraction(key) : null"
          @mouseleave.stop.prevent="isMouseDown ? handleKeyRelease(key) : null"
          :style="getWhiteKeyStyle(index)"
        >
          <div class="labels">
            <span class="key-note">{{ key.noteName }}</span>
            <span class="key-mapping">{{ key.label }}</span>
          </div>
        </div>

        <!-- 黑键 -->
        <div
          v-for="(key, index) in blackKeys"
          :key="`black-${index}`"
          :class="['key', 'black', { active: key.active }]"
          @mousedown.stop.prevent="handleKeyInteraction(key)"
          @mouseup.stop.prevent="handleKeyRelease(key)"
          @mouseenter.stop.prevent="isMouseDown ? handleKeyInteraction(key) : null"
          @mouseleave.stop.prevent="isMouseDown ? handleKeyRelease(key) : null"
          :style="getBlackKeyStyle(index)"
        >
          <div class="labels">
            <span class="key-note">{{ key.noteName }}</span>
            <span class="key-mapping">{{ key.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Piano',
  data() {
    return {
      whiteKeys: [],
      blackKeys: [],
      isMouseDown: false,
      keyMap: {},
      audioContext: null,
      analyser: null,
      dataArray: null,
      animationId: null,
      canvasWidth: 800,
      canvasHeight: 400,
      canvas: null,
      masterGain: null,
      isAudioInitialized: false,

      // Sound Sets
      soundSets: [
        { name: '钢琴', path: '/public/piano/' },
        { name: '小提琴', path: '/public/violin/' },
        { name: '笛子', path: '/public/dizi/' },
        { name: '钢琴2', path: '/public/pianoKeyAudioFL/' },
        { name: '萨克斯', path: '/public/pianoKeyAudioFL/' },
        { name: '竖琴', path: '/public/pianoKeyAudioFL/' },
        { name: '古筝', path: '/public/pianoKeyAudioFL/' },
        { name: '葫芦丝', path: '/public/pianoKeyAudioFL/' },
        { name: '口琴', path: '/public/pianoKeyAudioFL/' },
        { name: '大提琴', path: '/public/pianoKeyAudioFL/' },
        { name: '圆号', path: '/public/pianoKeyAudioFL/' },
        { name: '吉他', path: '/public/guitar/' },
        { name: '贝斯', path: '/public/guitar/' },
        { name: '尤克里里', path: '/public/guitar/' },
        { name: '琵琶', path: '/public/guitar/' },
        { name: '尺八', path: '/public/guitar/' },
        { name: '短号', path: '/public/guitar/' },
        { name: '哨笛', path: '/public/guitar/' },
        { name: '唢呐', path: '/public/guitar/' },
        { name: '木琴', path: '/public/guitar/' },
        { name: '鼓', path: '/public/guitar/' },
        // Add more sound sets as needed
      ],
      selectedSoundSet: '/public/piano/',
      isPreloading: false,

      // Recorder
      mediaRecorder: null,
      recordedChunks: [],
      isRecording: false,
      recordedUrl: null,
    };
  },
  created() {
    this.generateKeys();
    window.addEventListener('resize', this.updateKeyWidth);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.updateKeyWidth();
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.preloadAudio();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateKeyWidth);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    // Stop recorder if active
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  },
  methods: {
    generateKeys() {
      // Existing key generation logic...
      // (Same as provided in your original code)
      // Ensure you keep the generateKeys method unchanged
      this.whiteKeys = [];
      this.blackKeys = [];
      this.keyMap = {};

      let keyNumber = 1;
      let whiteKeyIndex = 0;
      let whiteNoteToIndex = {};

      const octave0Notes = [
        { note: 'A0', isWhiteKey: true },
        { note: 'A#0', isWhiteKey: false },
        { note: 'B0', isWhiteKey: true },
      ];
      octave0Notes.forEach((item) => {
        const key = {
          keyNumber: keyNumber++,
          noteName: item.note,
          isWhiteKey: item.isWhiteKey,
          active: false,
          label: '',
        };
        if (item.isWhiteKey) {
          key.whiteKeyIndex = whiteKeyIndex;
          whiteNoteToIndex[item.note] = whiteKeyIndex;
          this.whiteKeys.push(key);
          whiteKeyIndex++;
        } else {
          const baseNote = item.note.replace('#', '');
          const parentNoteName = baseNote + '0';
          const parentIndex = whiteNoteToIndex[parentNoteName];
          key.parentIndex = parentIndex;
          this.blackKeys.push(key);
        }
      });

      const notesInOctave = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

      for (let octave = 1; octave <= 7; octave++) {
        for (let note of notesInOctave) {
          const noteName = note + octave;
          const isWhiteKey = !note.includes('#');
          const key = {
            keyNumber: keyNumber++,
            noteName: noteName,
            isWhiteKey: isWhiteKey,
            active: false,
            label: '',
          };

          if (isWhiteKey) {
            key.whiteKeyIndex = whiteKeyIndex;
            whiteNoteToIndex[noteName] = whiteKeyIndex;
            this.whiteKeys.push(key);
            whiteKeyIndex++;
          } else {
            const baseNote = note.replace('#', '');
            const parentNoteName = baseNote + octave;
            const parentIndex = whiteNoteToIndex[parentNoteName];
            key.parentIndex = parentIndex;
            this.blackKeys.push(key);
          }
        }
      }

      // Add C8
      const key = {
        keyNumber: keyNumber++,
        noteName: 'C8',
        isWhiteKey: true,
        active: false,
        whiteKeyIndex: whiteKeyIndex,
        label: '',
      };
      this.whiteKeys.push(key);

      console.log('Total white keys:', this.whiteKeys.length); // Should be 52
      console.log('Total black keys:', this.blackKeys.length); // Should be 36

      // Bind keyboard keys
      this.mapKeyboardKeys();
    },
    updateKeyWidth() {
      // Existing logic for updating key width
    },
    handleKeyInteraction(key) {
      this.activateAudioContext();
      this.keyPressed(key);
    },
    handleKeyRelease(key) {
      this.keyReleased(key);
    },
    keyPressed(key) {
      if (!key.active) {
        key.active = true;
        key.audio.currentTime = 0;
        key.audio.play();
        console.log(`Key pressed: ${key.noteName}`);
      }
    },
    keyReleased(key) {
      key.active = false;
      key.audio.pause();
      key.audio.currentTime = 0;
      console.log(`Key released: ${key.noteName}`);
    },
    resetAllKeys() {
      this.whiteKeys.forEach((key) => (key.active = false));
      this.blackKeys.forEach((key) => (key.active = false));
      this.isMouseDown = false;
    },
    handleMouseDown() {
      this.isMouseDown = true;
    },
    handleMouseUp() {
      this.isMouseDown = false;
    },
    handleKeyDown(event) {
      const keyChar = event.key.toLowerCase();
      if (this.keyMap[keyChar] && !this.keyMap[keyChar].active) {
        this.activateAudioContext();
        this.keyPressed(this.keyMap[keyChar]);
      }
    },
    handleKeyUp(event) {
      const keyChar = event.key.toLowerCase();
      if (this.keyMap[keyChar]) {
        this.keyReleased(this.keyMap[keyChar]);
      }
    },
    getWhiteKeyStyle(index) {
      const whiteKeyWidth = 100 / 52;
      return {
        width: `${whiteKeyWidth}%`,
        height: '200px',
        left: `${index * whiteKeyWidth}%`,
        zIndex: 1,
        position: 'absolute',
      };
    },
    getBlackKeyStyle(index) {
      const whiteKeyWidth = 100 / 52;
      const blackKeyWidth = whiteKeyWidth * 0.7;
      const blackKeyHeight = '120px';

      const blackKey = this.blackKeys[index];
      const parentIndex = blackKey.parentIndex;

      const left = (parentIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;

      return {
        width: `${blackKeyWidth}%`,
        height: blackKeyHeight,
        left: `${left}%`,
        zIndex: 2,
        top: '0px',
        position: 'absolute',
      };
    },
    mapKeyboardKeys() {
      const customKeyMap = {
        'C2': '1',
        'D2': '2',
        'E2': '3',
        'F2': '4',
        'G2': '5',
        'A2': '6',
        'B2': '7',
        'C3': '8',
        'D3': '9',
        'E3': '0',
        'F3': 'Q',
        'G3': 'W',
        'A3': 'E',
        'B3': 'R',
        'C4': 'T',
        'D4': 'Y',
        'E4': 'U',
        'F4': 'I',
        'G4': 'O',
        'A4': 'P',
        'B4': 'A',
        'C5': 'S',
        'D5': 'D',
        'E5': 'F',
        'F5': 'G',
        'G5': 'H',
        'A5': 'J',
        'B5': 'K',
        'C6': 'L',
        'D6': 'Z',
        'E6': 'X',
        'F6': 'C',
        'G6': 'V',
        'A6': 'B',
        'B6': 'N',
        'C7': 'M'
      };

      const reversedKeyMap = {};

      const allKeys = [...this.whiteKeys, ...this.blackKeys];
      allKeys.forEach((pianoKey) => {
        const key = pianoKey.noteName;
        if (customKeyMap[key]) {
          const keyboardKey = customKeyMap[key].toLowerCase();
          reversedKeyMap[keyboardKey] = pianoKey;
          pianoKey.label = customKeyMap[key];
        }
      });

      this.keyMap = reversedKeyMap;
    },
    async activateAudioContext() {
      if (this.isAudioInitialized) return;

      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGain = this.audioContext.createGain();

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Create a MediaStreamDestination for recording
        this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();

        // Connect masterGain to mediaStreamDestination for recording
        this.masterGain.connect(this.mediaStreamDestination);

        console.log('AudioContext initialized');

        const allKeys = [...this.whiteKeys, ...this.blackKeys];
        allKeys.forEach((key) => {
          if (key.audio && key.audio.readyState >= 2) { // HAVE_CURRENT_DATA
            try {
              const source = this.audioContext.createMediaElementSource(key.audio);
              source.connect(this.masterGain);
              console.log(`Connected audio source: ${key.noteName}`);
            } catch (error) {
              console.error(`Failed to connect audio source (${key.noteName}):`, error);
            }
          }
        });

        // Initialize MediaRecorder
        this.initializeRecorder();

        // Start visualizer
        this.drawVisualizer();

        this.isAudioInitialized = true;
      } catch (error) {
        console.error('Failed to initialize AudioContext:', error);
      }
    },
    initializeRecorder() {
      if (!this.mediaStreamDestination) {
        console.error('MediaStreamDestination not available for recording.');
        return;
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStreamDestination.stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      this.mediaRecorder.onstop = this.handleRecordingStop;
      console.log('MediaRecorder initialized');
    },
    toggleRecording() {
      if (!this.audioContext) {
        this.activateAudioContext();
      }

      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    },
    startRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
        this.recordedChunks = [];
        this.mediaRecorder.start();
        this.isRecording = true;
        console.log('Recording started');
      }
    },
    stopRecording() {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
        this.isRecording = false;
        console.log('Recording stopped');
      }
    },
    handleRecordingStop() {
      const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
      this.recordedUrl = URL.createObjectURL(blob);
      console.log('Recording available for download');
    },
    drawVisualizer() {
      if (!this.analyser || !this.canvas) return;

      const ctx = this.canvas.getContext('2d', { alpha: true });

      const draw = () => {
        this.analyser.getByteFrequencyData(this.dataArray);

        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        const barWidth = (this.canvasWidth / this.analyser.frequencyBinCount) * 2.5;
        let posX = 0;

        for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
          const barHeight = this.dataArray[i];

          const r = barHeight + 25 * (i / this.analyser.frequencyBinCount);
          const g = 250 * (i / this.analyser.frequencyBinCount);
          const b = 50;

          ctx.fillStyle = `rgba(${r},${g},${b}, 0.7)`;
          ctx.fillRect(posX, this.canvasHeight - barHeight / 2, barWidth, barHeight / 2);

          posX += barWidth + 1;
        }

        this.animationId = requestAnimationFrame(draw);
      };

      draw();
    },
    handleCanvasClick() {
      this.activateAudioContext();
    },
    handleSoundSetChange() {
      this.isPreloading = true;

      const allKeys = [...this.whiteKeys, ...this.blackKeys];
      allKeys.forEach((key) => {
        if (key.audio) {
          key.audio.pause();
          key.audio.currentTime = 0;
        }
      });

      if (this.audioContext) {
        this.audioContext.close().then(() => {
          this.audioContext = null;
          this.analyser = null;
          this.dataArray = null;
          this.masterGain = null;
          this.isAudioInitialized = false;
        });
      }

      allKeys.forEach((key) => {
        if (key.audio) {
          key.audio.src = '';
          key.audio = null;
        }
      });

      this.generateKeys();

      this.preloadAudio().then(() => {
        this.isPreloading = false;
        this.activateAudioContext();
      }).catch(() => {
        this.isPreloading = false;
      });
    },
    preloadAudio() {
      return new Promise((resolve, reject) => {
        const allKeys = [...this.whiteKeys, ...this.blackKeys];
        const promises = allKeys.map((key) => {
          return new Promise((res) => {
            const audio = new Audio(this.selectedSoundSet + key.keyNumber + '.wav');
            audio.crossOrigin = "anonymous";
            audio.loop = false;
            audio.preload = 'auto';

            const onLoad = () => {
              key.audio = audio;
              res();
            };
            const onError = (e) => {
              console.error(`Failed to load audio for ${key.noteName}:`, e);
              res(); // Resolve even on error to prevent blocking
            };

            audio.addEventListener('canplaythrough', onLoad, { once: true });
            audio.addEventListener('error', onError, { once: true });

            audio.load();
          });
        });

        Promise.all(promises)
          .then(() => {
            console.log('All audio files preloaded');
            resolve();
          })
          .catch((error) => {
            console.error('Error preloading audio files:', error);
            reject(error);
          });
      });
    },
  },
};
</script>
<style scoped>
.piano-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* New Controls Container */
.controls {
  display: flex;
  align-items: center;
  gap: 20px; /* Space between selector and recorder */
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
}

/* Sound Set Selector */
.sound-set-selector {
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
}

.sound-set-selector label {
  margin-right: 8px;
  font-weight: bold;
  color: #333;
}

.sound-set-selector select {
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.3s;
}

.sound-set-selector select:hover,
.sound-set-selector select:focus {
  border-color: #666;
}

/* Recorder Styles */
.recorder {
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
}

.recorder button {
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
}

.recorder button.recording {
  background-color: #f44336;
}

.recorder button:hover {
  background-color: #45a049;
}

.recorder button.recording:hover {
  background-color: #e53935;
}

.recorder a {
  font-size: 14px;
  color: #007bff;
  text-decoration: none;
}

.recorder a:hover {
  text-decoration: underline;
}

.piano-container {
  width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
  padding: 60px 10px 10px 10px;
  background-color: #f5f5f5;
  user-select: none;
  position: relative;
}

.piano {
  position: relative;
  height: 200px;
  width: 100%;
  margin: 0 auto;
  background: linear-gradient(to bottom, #ddd, #bbb);
  border: 2px solid #333;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* White Keys */
.key.white {
  background: #fff;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #000;
  border-radius: 0 0 5px 5px;
  position: absolute;
  bottom: 0;
  cursor: pointer;
  transition: background 0.1s, transform 0.1s;
}

.key.white.active {
  background: #e6e6e6;
  transform: translateY(2px);
}

/* Black Keys */
.key.black {
  background: #000;
  color: #fff;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
  border-radius: 0 0 3px 3px;
  position: absolute;
  cursor: pointer;
  transition: background 0.1s, transform 0.1s;
  z-index: 2;
}

.key.black.active {
  background: #333;
  transform: translateY(2px);
}

/* Labels */
.labels {
  position: absolute;
  bottom: 5px;
  width: 100%;
  text-align: center;
}

.key-note {
  font-size: 12px;
  display: block;
  user-select: none;
  pointer-events: none;
  color: inherit;
}

.key-mapping {
  font-size: 10px;
  display: block;
  user-select: none;
  pointer-events: none;
  color: #555;
}

.key.black .key-note {
  font-size: 10px;
}

.key.black .key-mapping {
  font-size: 8px;
}

/* Prevent key selection */
.key {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Canvas Styles */
canvas {
  display: block;
  margin: 20px auto;
  width: 100%;
  height: 100px;
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  background: transparent;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

canvas:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.7);
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .piano {
    height: 150px;
  }

  .key.white {
    height: 150px;
  }

  canvas {
    max-width: 100%;
  }

  .controls {
    flex-direction: column;
    gap: 10px;
    top: 5px;
    left: 5px;
  }

  .sound-set-selector {
    padding: 6px 10px;
  }

  .sound-set-selector label {
    font-size: 12px;
  }

  .sound-set-selector select {
    font-size: 12px;
    padding: 3px 6px;
  }

  .recorder button {
    font-size: 12px;
    padding: 4px 8px;
  }

  .recorder a {
    font-size: 12px;
  }
}
</style>