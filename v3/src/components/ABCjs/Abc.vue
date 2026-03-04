<template>
  <div class="abc-editor">
    <h2>ABC 代码输入</h2>
    <textarea
        v-model="abcInput"
        @input="onInput"
        rows="10"
        cols="60"
        placeholder="在此输入 ABC 代码..."
    ></textarea>

    <div class="controls">
      <button @click="play" :disabled="isPlaying">播放</button>
      <button @click="stop" :disabled="!isPlaying">停止</button>
    </div>

    <h2>乐谱预览</h2>
    <div :id="paperId" class="abcjs-paper" :class="{ 'dark-mode': darkMode }"></div>
    <div :id="audioId" class="abcjs-audio"></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { nanoid } from 'nanoid';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css'; // 引入 abcjs 的音频样式

// 定义 CursorControl 类，用于控制播放光标
class CursorControl {
  constructor(rootSelector) {
    this.rootSelector = rootSelector;
    this.cursor = null;
  }

  onStart() {
    const svg = document.querySelector(`${this.rootSelector} svg`);
    if (!svg) return;
    this.cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.cursor.setAttribute("class", "abcjs-cursor");
    this.cursor.setAttributeNS(null, "x1", "0");
    this.cursor.setAttributeNS(null, "y1", "0");
    this.cursor.setAttributeNS(null, "x2", "0");
    this.cursor.setAttributeNS(null, "y2", "0");
    svg.appendChild(this.cursor);
  }

  removeSelection() {
    const lastSelection = document.querySelectorAll(`${this.rootSelector} .abcjs-highlight`);
    lastSelection.forEach(el => el.classList.remove('abcjs-highlight'));
  }

  onEvent(ev) {
    if (ev.measureStart && ev.left === null) return; // 忽略跨小节线的连音

    this.removeSelection();

    // 选择当前播放的音符
    ev.elements.forEach(noteGroup => {
      noteGroup.forEach(note => {
        note.classList.add('abcjs-highlight');
      });
    });

    // 移动光标到当前音符位置
    if (this.cursor) {
      this.cursor.setAttribute("x1", String(ev.left - 2));
      this.cursor.setAttribute("x2", String(ev.left - 2));
      this.cursor.setAttribute("y1", String(ev.top));
      this.cursor.setAttribute("y2", String(ev.top + ev.height));
    }
  }

  onFinished() {
    this.removeSelection();
    if (this.cursor) {
      this.cursor.setAttribute("x1", "0");
      this.cursor.setAttribute("x2", "0");
      this.cursor.setAttribute("y1", "0");
      this.cursor.setAttribute("y2", "0");
    }
  }
}

export default {
  name: 'AbcEditor',
  props: {
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // 生成唯一的 ID 用于乐谱和音频容器
    const paperId = `paper-${nanoid()}`;
    const audioId = `audio-${nanoid()}`;

    // 响应式变量
    const abcInput = ref(`X:1
T:示例乐曲
M:4/4
K:C
C D E F | G A B c | c B A G | F E D C |`);
    const isPlaying = ref(false);
    const synth = ref(null);
    const synthControl = ref(null);
    const cursorControl = ref(null);
    const visualObj = ref(null);

    // 初始化 CursorControl
    cursorControl.value = new CursorControl(`#${paperId}`);

    // 渲染 ABC 记谱法
    const renderABC = () => {
      // 清除之前的渲染
      const paperDiv = document.getElementById(paperId);
      if (paperDiv) {
        paperDiv.innerHTML = '';
      }

      try {
        visualObj.value = abcjs.renderAbc(paperId, abcInput.value, {
          responsive: "resize",
          add_classes: true,
        });
        return visualObj.value[0];
      } catch (error) {
        console.warn("运行 abcjs 时出错:", error);
        return null;
      }
    };

    // 播放音乐
    const play = () => {
      if (isPlaying.value) return;

      const visual = renderABC();
      if (!visual) {
        alert('无法渲染乐谱，请检查 ABC 代码。');
        return;
      }

      // 初始化 SynthController
      synthControl.value = new abcjs.synth.SynthController();
      synthControl.value.load(`#${audioId}`, cursorControl.value, {
        displayLoop: true,
        displayRestart: true,
        displayPlay: true,
        displayProgress: true,
        displayWarp: true,
      });

      // 初始化 Synth
      synth.value = new abcjs.synth.CreateSynth();
      synth.value.init({
        visualObj: visual,
        audioContext: new (window.AudioContext || window.webkitAudioContext)(),
        options: {}
      }).then(() => {
        return synthControl.value.setTune(visual, false, { chordsOff: false });
      }).then(() => {
        isPlaying.value = true;
        synthControl.value.play();
      }).catch((error) => {
        console.warn("音频加载失败:", error);
      });

      // 监听播放结束
      synthControl.value.getSynth().options.onended = () => {
        isPlaying.value = false;
      };
    };

    // 停止音乐
    const stop = () => {
      if (synthControl.value) {
        synthControl.value.stop();
        synthControl.value = null;
      }
      if (synth.value) {
        synth.value.stop();
        synth.value = null;
      }
      isPlaying.value = false;
    };

    // 处理输入变化
    const onInput = () => {
      stop(); // 停止当前播放
      renderABC();
    };

    // 生命周期钩子：组件挂载后执行
    onMounted(() => {
      renderABC();
    });

    // 组件卸载前执行
    onBeforeUnmount(() => {
      stop();
    });

    // 监听 ABC 输入的变化，实时渲染乐谱
    watch(abcInput, (newVal) => {
      renderABC();
    });

    return {
      abcInput,
      paperId,
      audioId,
      play,
      stop,
      isPlaying,
      onInput,
      darkMode: props.darkMode
    };
  }
};
</script>

<style scoped>
.abc-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

textarea {
  font-family: monospace;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.controls {
  margin-bottom: 20px;
}

button {
  margin-right: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #3182ce;
  color: white;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #2b6cb0;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.abcjs-paper.dark-mode {
  background-color: #333;
  color: #fff;
}

.abcjs-cursor {
  stroke: red;
  stroke-width: 2;
}

.abcjs-highlight {
  fill: yellow !important;
}
</style>