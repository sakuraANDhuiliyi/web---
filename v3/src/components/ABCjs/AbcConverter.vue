<template>
  <div class="container">
    <h1>乐谱转换器</h1>
    <div class="tabs">
      <button :class="{ active: activeTab === 'abcToCustom' }" @click="activeTab = 'abcToCustom'">
        ABC记谱法转自定义乐谱
      </button>
      <button :class="{ active: activeTab === 'customToAbc' }" @click="activeTab = 'customToAbc'">
        自定义乐谱转ABC记谱法
      </button>
    </div>

    <div v-if="activeTab === 'abcToCustom'" class="converter">
      <h2>ABC记谱法转自定义乐谱</h2>
      <textarea v-model="abcInput" placeholder="在此输入ABC记谱法代码" rows="10"></textarea>
      <button @click="convertAbcToCustom">转换</button>
      <h3>自定义乐谱输出</h3>
      <pre>{{ customNotation }}</pre>
    </div>

    <div v-else class="converter">
      <h2>自定义乐谱转ABC记谱法</h2>
      <textarea v-model="customInput" placeholder="在此输入自定义乐谱代码" rows="10"></textarea>
      <button @click="convertCustomToAbc">转换</button>
      <h3>ABC记谱法输出</h3>
      <pre>{{ abcNotation }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicConverter',
  data() {
    return {
      activeTab: 'abcToCustom', // 'abcToCustom' 或 'customToAbc'
      // ABC转自定义
      abcInput: `X:1
T:小鸡的一家
M:2/4
Q:1/4=140
L:1/16
K:D
C2 C2 C2 E2 | G2 G2 G4 | A3 G E2 G2 | D2 D2 D4 |
E2 E2 G4 | C2 D2 E4 | C3 D (E2 G2) | [12 D2 z2 E2 z2 |
C4 z4 ] | [3 D2 D2 D2 E2 | C4 z4 ] :|`,
      customNotation: '',
      // 自定义转ABC
      customInput: `曲目编号: 1
曲名: 小鸡的一家
拍号: 2/4
速度: 1/4=140
最短音符时值: 1/16
调号: D

1 1 1 3 | 5 5 5 | 6... 2 = 2 | 9 9 9 |
3 3 5 | 1 2 3 | 1... 2 (3 5) | [12 2 = 3 = |
1 = | [3 2 2 2 3 | 1 = ] :|`,
      abcNotation: '',
    };
  },
  methods: {
    // 音调到字符的映射
    getNoteToCharMap() {
      return {
        // 白键
        'C2': '1', 'D2': '2', 'E2': '3', 'F2': '4', 'G2': '5', 'A2': '6', 'B2': '7',
        'C3': '8', 'D3': '9', 'E3': '0', 'F3': 'q', 'G3': 'w', 'A3': 'e', 'B3': 'r',
        'C4': 't', 'D4': 'y', 'E4': 'u', 'F4': 'i', 'G4': 'o', 'A4': 'p', 'B4': 'a',
        'C5': 's', 'D5': 'd', 'E5': 'f', 'F5': 'g', 'G5': 'h', 'A5': 'j', 'B5': 'k',
        'C6': 'l', 'D6': 'z', 'E6': 'x', 'F6': 'c', 'G6': 'v', 'A6': 'b', 'B6': 'n',
        'C7': 'm',
        // 黑键
        'C#2': '!', 'Db2': '!', 'D#2': '@', 'Eb2': '@', 'F#2': '$', 'Gb2': '$',
        'G#2': '%', 'Ab2': '%', 'A#2': '^', 'Bb2': '^',
        'C#3': '*', 'Db3': '*', 'D#3': '(', 'Eb3': '(', 'F#3': 'E', 'Gb3': 'E',
        'G#3': 'T', 'Ab3': 'T', 'A#3': 'Y', 'Bb3': 'Y',
        'C#4': 'I', 'Db4': 'I', 'D#4': 'O', 'Eb4': 'O', 'F#4': 'S', 'Gb4': 'S',
        'G#4': 'D', 'Ab4': 'D', 'A#4': 'G', 'Bb4': 'G',
        'C#5': 'H', 'Db5': 'H', 'D#5': 'J', 'Eb5': 'J', 'F#5': 'L', 'Gb5': 'L',
        'G#5': 'Z', 'Ab5': 'Z', 'A#5': 'C', 'Bb5': 'C',
      };
    },
    // 字符到音调的映射
    getCharToNoteMap() {
      const noteMap = {
        // 白键
        '1': 'C2', '2': 'D2', '3': 'E2', '4': 'F2', '5': 'G2', '6': 'A2', '7': 'B2',
        '8': 'C3', '9': 'D3', '0': 'E3', 'q': 'F3', 'w': 'G3', 'e': 'A3', 'r': 'B3',
        't': 'C4', 'y': 'D4', 'u': 'E4', 'i': 'F4', 'o': 'G4', 'p': 'A4', 'a': 'B4',
        's': 'C5', 'd': 'D5', 'f': 'E5', 'g': 'F5', 'h': 'G5', 'j': 'A5', 'k': 'B5',
        'l': 'C6', 'z': 'D6', 'x': 'E6', 'c': 'F6', 'v': 'G6', 'b': 'A6', 'n': 'B6',
        'm': 'C7',
        // 黑键
        '!': 'C#2', '@': 'D#2', '$': 'F#2', '%': 'G#2', '^': 'A#2',
        '*': 'C#3', '(': 'D#3', 'E': 'F#3', 'T': 'G#3', 'Y': 'A#3',
        'I': 'C#4', 'O': 'D#4', 'S': 'F#4', 'D': 'G#4', 'G': 'A#4',
        'H': 'C#5', 'J': 'D#5', 'L': 'F#5', 'Z': 'G#5', 'C': 'A#5',
      };
      return noteMap;
    },
    // ABC记谱法转自定义乐谱
    convertAbcToCustom() {
      const lines = this.abcInput.split('\n');
      const headers = {};
      const bodyLines = [];
      let inHeader = true;

      // 解析头部信息
      for (let line of lines) {
        line = line.trim();
        if (inHeader && line.includes(':')) {
          const [key, ...rest] = line.split(':');
          headers[key.trim()] = rest.join(':').trim();
        } else {
          inHeader = false;
          if (line !== '') {
            bodyLines.push(line);
          }
        }
      }

      // 构建自定义乐谱头部
      let custom = `曲目编号: ${headers['X'] || 'N/A'}\n`;
      custom += `曲名: ${headers['T'] || 'N/A'}\n`;
      custom += `拍号: ${headers['M'] || 'N/A'}\n`;
      custom += `速度: ${headers['Q'] || 'N/A'}\n`;
      custom += `最短音符时值: ${headers['L'] || 'N/A'}\n`;
      custom += `调号: ${headers['K'] || 'N/A'}\n\n`;

      // 获取音调到字符的映射
      const noteToChar = this.getNoteToCharMap();

      // 处理每一行乐谱主体
      let convertedBody = '';
      for (let line of bodyLines) {
        // 分割小节
        const measures = line.split('|').map(m => m.trim());
        for (let measure of measures) {
          if (measure === '') continue;

          // 处理和弦 [abc]
          measure = measure.replace(/([^]+)/g, (match, p1) => {
            // 将和弦内的音符转换
            const chords = p1.match(/[A-Ga-g][#b]?[\d]*/g) || [];
            const convertedChords = chords.map(note => {
              return noteToChar[note] || note;
            });
            return `[${convertedChords.join('')}]`;
          });

          // 处理连续按键 {abc}
          measure = measure.replace(/\{([^\}]+)\}/g, (match, p1) => {
            const notes = p1.match(/[A-Ga-g][#b]?[\d]*/g) || [];
            const convertedNotes = notes.map(note => {
              return noteToChar[note] || note;
            });
            return `{${convertedNotes.join('')}}`;
          });

          // 处理附点音符 a.
          measure = measure.replace(/([A-Za-z0-9]+)\.(?!\.)/g, (match, p1) => {
            return `${p1}.`;
          });

          // 处理延音线 - 或 ~
          measure = measure.replace(/-+/g, '-').replace(/~+/g, '~');

          // 处理普通音符和时值
          measure = measure.replace(/([A-Ga-g][#b]?[\d]*)(\d*)/g, (match, p1, p2) => {
            let char = noteToChar[p1] || p1;
            if (p2) {
              // 根据ABC的时值转换
              // L:1/16 是最短时值
              // p2 表示时值的倍数
              // 1 → 1/16, 2 → 1/8, 4 → 1/4, 3 → 3/16 等
              if (p2 === '1') {
                // 1/16 音符
                char += '__';
              } else if (p2 === '2') {
                // 1/8 音符
                char += '_';
              } else if (p2 === '4') {
                // 1/4 音符
                // 根据自定义规则，四分音符用特定符号，如 sshhggh
                // 这里需要更复杂的映射，暂时简化为不添加
                // 可以根据需要进一步实现
              } else if (p2 === '3') {
                // 附点音符
                char += '.';
              }
            }
            return char;
          });

          // 处理休止符 z
          measure = measure.replace(/z/g, '=');

          // 处理延音线后缀 '-' 或 '~'
          measure = measure.replace(/([A-Za-z0-9=]+)([-~])/g, (match, p1, p2) => {
            return `${p1}${p2}`;
          });

          convertedBody += measure + ' | ';
        }
        convertedBody += '\n';
      }

      custom += convertedBody.trim();
      this.customNotation = custom;
    },

    // 自定义乐谱转ABC记谱法
    convertCustomToAbc() {
      const lines = this.customInput.split('\n');
      const headers = {};
      const bodyLines = [];
      let inHeader = true;

      // 解析头部信息
      for (let line of lines) {
        line = line.trim();
        if (inHeader && line.includes(':')) {
          const [key, ...rest] = line.split(':');
          headers[key.trim()] = rest.join(':').trim();
        } else {
          inHeader = false;
          if (line !== '') {
            bodyLines.push(line);
          }
        }
      }

      // 构建ABC记谱法头部
      let abc = '';
      if (headers['曲目编号']) abc += `X:${headers['曲目编号']}\n`;
      if (headers['曲名']) abc += `T:${headers['曲名']}\n`;
      if (headers['拍号']) abc += `M:${headers['拍号']}\n`;
      if (headers['速度']) abc += `Q:${headers['速度']}\n`;
      if (headers['最短音符时值']) abc += `L:${headers['最短音符时值']}\n`;
      if (headers['调号']) abc += `K:${headers['调号']}\n`;

      // 获取字符到音调的映射
      const charToNote = this.getCharToNoteMap();

      // 处理每一行乐谱主体
      let convertedBody = '';
      for (let line of bodyLines) {
        // 分割小节
        const measures = line.split('|').map(m => m.trim());
        for (let measure of measures) {
          if (measure === '') continue;

          // 处理和弦 [abc]
          measure = measure.replace(/([^]+)/g, (match, p1) => {
            // 将和弦内的字符转换为音符
            const chords = p1.split('').map(char => {
              return charToNote[char] || char;
            });
            return `[${chords.join('')}]`;
          });

          // 处理连续按键 {abc}
          measure = measure.replace(/\{([^\}]+)\}/g, (match, p1) => {
            // 将连续按键内的字符转换为音符
            const notes = p1.split('').map(char => {
              return charToNote[char] || char;
            });
            return `{${notes.join('')}}`;
          });

          // 处理附点音符 a.
          measure = measure.replace(/([A-Za-z0-9]+)\.(?!\.)/g, (match, p1) => {
            const note = charToNote[p1] || p1;
            return `${note}3`;
          });

          // 处理延音线 '-' 或 '~'
          measure = measure.replace(/([A-Za-z0-9=]+)([-~])/g, (match, p1, p2) => {
            return `${p1}-`;
          });

          // 处理普通字符和时值
          measure = measure.replace(/([A-Za-z0-9=]+)(__|_|\.|)/g, (match, p1, p2) => {
            let note = charToNote[p1] || p1;
            if (p2) {
              if (p2 === '__') {
                // 十六分音符
                note += '1';
              } else if (p2 === '_') {
                // 八分音符
                note += '2';
              } else if (p2 === '.') {
                // 附点音符
                note += '3';
              }
            }
            return note;
          });

          // 处理休止符 '='
          measure = measure.replace(/=/g, 'z');

          convertedBody += measure + ' | ';
        }
        convertedBody += '\n';
      }

      abc += convertedBody.trim();
      this.abcNotation = abc;
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 30px;
  font-size: 2.5em;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
}

.tabs button {
  background-color: #e0e7ff;
  border: none;
  padding: 12px 24px;
  margin: 0 8px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 16px;
  transition: background-color 0.3s, color 0.3s;
}

.tabs button.active {
  background-color: #6366f1;
  color: white;
}

.tabs button:hover {
  background-color: #a5b4fc;
}

.converter {
  background-color: #f9fafb;
  padding: 25px;
  border-radius: 10px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.converter h2 {
  color: #4b5563;
  margin-bottom: 15px;
  font-size: 1.8em;
}

textarea {
  width: 100%;
  height: 220px;
  padding: 12px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  margin-bottom: 15px;
  background-color: #ffffff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-bottom: 15px;
}

button:hover {
  background-color: #2563eb;
}

pre {
  background-color: #f3f4f6;
  padding: 15px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #111827;
}

@media (max-width: 700px) {
  .tabs {
    flex-direction: column;
    align-items: center;
  }

  .tabs button {
    margin: 5px 0;
    width: 80%;
  }

  textarea {
    height: 180px;
  }
}
</style>