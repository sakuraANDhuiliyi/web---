<template>
  <div class="song-search-container">
    <div class="search-bar">
      <input v-model="searchName" type="text" placeholder="输入歌曲名" />
      <button @click="searchSong">搜索</button>
    </div>
    <div v-if="songs.length > 0" class="songs-list">
      <ul>
        <li v-for="(song, index) in songs" :key="song.id" class="song-item">
          <div class="song-info">
            <p class="song-title">{{ song.name }} - {{ song.artists[0].name }}</p>
          </div>
          <div class="song-controls">
            <button @click="togglePlay(song)" :class="{ playing: song.id === currentSongId && isPlaying }">
              <span v-if="song.id === currentSongId && isPlaying">&#10074;&#10074;</span>
              <span v-else>&#9658;</span>
              {{ song.id === currentSongId && isPlaying ? '暂停' : '播放' }}
            </button>
            <button @click="stopSong(song)" :disabled="song.id !== currentSongId">
              &#9632; 停止
            </button>
            <button @click="showLyrics(song.id)">
              显示歌词
            </button>
          </div>

          <!-- 播放进度条和时间显示 -->
          <div v-if="song.id === currentSongId">
            <div class="progress-container">
              <span class="current-time">{{ formatTime(currentTime) }}</span>
              <input
                  type="range"
                  min="0"
                  :max="duration"
                  v-model="currentTime"
                  @input="seekSong"
                  class="progress-bar"
              />
              <span class="total-time">{{ formatTime(duration) }}</span>
            </div>
            <div class="volume-container">
              <label for="volume">音量：</label>
              <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  v-model="volume"
                  @input="changeVolume"
                  class="volume-slider"
              />
            </div>
          </div>
          <!-- 显示歌词 -->
          <div v-if="song.id === activeSongId && song.lyrics && song.lyrics.length > 0">
            <div v-for="(line, index) in song.lyrics" :key="index">
              <p :class="{ active: line.active }">{{ line.time }} - {{ line.text }}</p>
            </div>
          </div>
          <div v-else-if="song.id === activeSongId && !song.lyrics.length">
            <p>没有歌词信息</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import { Howl } from 'howler';
export default {
  name: 'SongSearch',
  data() {
    return {
      searchName: '',       // 搜索的歌曲名称
      songs: [],            // 存储搜索结果
      activeSongId: null,// 存储当前显示歌词的歌曲 ID
      currentLyrics: [] ,
      currentSongId: null,  // 存储当前播放的歌曲 ID
      isPlaying: false,     // 播放状态
      currentHowl: null,    // 当前 Howl 实例
      volume: 1,            // 音量控制，范围 0 到 1
      duration: 0,          // 当前歌曲的总时长
      currentTime: 0,       // 当前播放时间
      progressInterval: null // 用于更新播放进度的定时器
    };
  },
  methods: {
    async searchSong() {
      if (!this.searchName.trim()) {
        alert('请输入歌曲名');
        return;
      }
      try {
        // 构建查询字符串
        const query = `s=${encodeURIComponent(this.searchName)}&type=1&offset=0&limit=15`;

        // 发送请求到代理地址
        const response = await axios.get(`/music/api/search/get?${query}`);

        // 检查数据是否存在
        if (response.data && response.data.result && response.data.result.songs) {
          const songData = response.data.result.songs;

          // 提取歌曲信息并生成对应的 mp3 链接
          this.songs = songData.map(song => ({
            id: song.id,
            name: song.name,
            artists: song.artists,
            audioUrl: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`,
            lyrics: []  // 初始化歌词为空数组
          }));

          // 重置播放状态
          this.stopCurrentSong();
        } else {
          alert('没有找到相关歌曲');
          this.songs = [];
        }
      } catch (error) {
        console.error('请求失败:', error);
        alert('搜索失败，请重试');
      }
    },

    togglePlay(song) {
      if (this.currentSongId === song.id) {
        if (this.isPlaying) {
          this.pauseSong();
        } else {
          this.playSong();
        }
      } else {
        this.playNewSong(song);
      }
    },

    playNewSong(song) {
      // 停止当前播放的歌曲
      this.stopCurrentSong();

      // 创建新的 Howl 实例
      this.currentHowl = new Howl({
        src: [song.audioUrl],
        html5: true, // 允许大文件
        volume: this.volume,
        onend: () => {
          this.isPlaying = false;
          this.currentSongId = null;
          this.currentHowl = null;
          this.duration = 0;
          this.currentTime = 0;
          clearInterval(this.progressInterval);
        },
        onplay: () => {
          this.isPlaying = true;
          this.duration = this.currentHowl.duration();
          this.startProgressUpdate();
        },
        onpause: () => {
          this.isPlaying = false;
          clearInterval(this.progressInterval);
        },
        onstop: () => {
          this.isPlaying = false;
          this.currentSongId = null;
          this.currentHowl = null;
          this.duration = 0;
          this.currentTime = 0;
          clearInterval(this.progressInterval);
        }
      });

      // 播放歌曲
      this.currentHowl.play();
      this.currentSongId = song.id;
    },

    playSong() {
      if (this.currentHowl) {
        this.currentHowl.play();
        this.isPlaying = true;
        this.startProgressUpdate();
      }
    },

    pauseSong() {
      if (this.currentHowl) {
        this.currentHowl.pause();
        this.isPlaying = false;
        clearInterval(this.progressInterval);
      }
    },

    stopSong(song) {
      if (this.currentSongId === song.id && this.currentHowl) {
        this.currentHowl.stop();
        this.isPlaying = false;
        this.currentSongId = null;
        this.currentHowl = null;
        this.duration = 0;
        this.currentTime = 0;
        clearInterval(this.progressInterval);
      }
    },

    stopCurrentSong() {
      if (this.currentHowl) {
        this.currentHowl.stop();
        this.isPlaying = false;
        this.currentSongId = null;
        this.currentHowl = null;
        this.duration = 0;
        this.currentTime = 0;
        clearInterval(this.progressInterval);
      }
    },

    async showLyrics(songId) {
      // 查找点击的歌曲
      const song = this.songs.find(s => s.id === songId);

      // 如果没有歌词，进行歌词请求
      if (!song.lyrics.length) {
        try {
          // 发送请求到代理地址，获取歌词数据
          const response = await axios.get('/music/api/song/lyric', {
            params: {
              os: 'pc',
              id: songId,
              lv: -1,
              tv: -1
            }
          });

          // 解析歌词
          if (response.data && response.data.lrc && response.data.lrc.lyric) {
            song.lyrics = this.parseLyrics(response.data.lrc.lyric);
          }
        } catch (error) {
          console.error('获取歌词失败:', error);
        }
      }

      // 激活显示当前歌曲的歌词
      this.activeSongId = songId;
    },
    // 解析歌词的函数，将歌词转换为带时间戳的对象
    parseLyrics(lyrics) {
      const lines = lyrics.split('\n');
      const parsedLyrics = lines.map(line => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
          const [_, minutes, seconds, milliseconds, text] = match;
          const time = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
          return { time, text, active: false };
        }
        return null;
      }).filter(line => line !== null);

      return parsedLyrics;
    },
    // 每次音频播放时更新歌词
    updateLyrics() {
      const audio = this.$refs.audio;
      if (!audio) return;

      const currentTime = audio.currentTime;

      // 找到当前播放时间对应的歌词
      this.songs.forEach(song => {
        if (song.id === this.activeSongId && song.lyrics.length > 0) {
          song.lyrics.forEach((line, index) => {
            // 标记当前播放时间对应的歌词
            line.active = (currentTime >= line.time && currentTime < (song.lyrics[index + 1]?.time || Infinity));
          });
        }
      });
    },
    changeVolume() {
      if (this.currentHowl) {
        this.currentHowl.volume(this.volume);
      }
    },

    seekSong(event) {
      if (this.currentHowl) {
        this.currentHowl.seek(this.currentTime);
      }
    },

    startProgressUpdate() {
      this.progressInterval = setInterval(() => {
        if (this.currentHowl && this.isPlaying) {
          this.currentTime = this.currentHowl.seek();
        }
      }, 1000);
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes < 10 ? '0' + minutes : minutes}:${secs < 10 ? '0' + secs : secs}`;
    }
  },
  beforeUnmount() {
    // 清理 Howl 实例和定时器
    this.stopCurrentSong();
  }
};
</script>
<style scoped>
/* 容器样式 */
.song-search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fefefe;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 搜索栏样式 */
.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.search-bar input {
  width: 60%;
  padding: 10px 15px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px 0 0 8px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-bar input:focus {
  border-color: #4caf50;
}

.search-bar button {
  padding: 10px 20px;
  font-size: 16px;
  border: 2px solid #4caf50;
  border-left: none;
  background-color: #4caf50;
  color: white;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.search-bar button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.search-bar button:active {
  transform: translateY(0);
}

/* 歌曲列表样式 */
.songs-list ul {
  list-style: none;
  padding: 0;
}

.song-item {
  background-color: #ffffff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.song-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}

.song-info {
  margin-bottom: 15px;
}

.song-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

/* 控制按钮样式 */
.song-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.song-controls button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: #2196f3;
  color: white;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.song-controls button.playing {
  background-color: #f44336;
}

.song-controls button:hover {
  background-color: #1976d2;
  transform: translateY(-2px);
}

.song-controls button:active {
  transform: translateY(0);
}

.song-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 播放进度条样式 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.current-time,
.total-time {
  font-size: 14px;
  color: #555;
  width: 50px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  cursor: pointer;
}

.volume-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.volume-container label {
  font-size: 14px;
  color: #555;
}

.volume-slider {
  flex: 1;
  cursor: pointer;
}

/* 歌词样式 */
.lyrics-container {
  margin-top: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-left: 4px solid #4caf50;
  border-radius: 6px;
}
.lyrics-line {
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}
.no-lyrics {
  margin-top: 15px;
  font-size: 14px;
  color: #888;
}
.lyrics-popup {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  max-height: 400px;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  z-index: 10;
  padding: 15px;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.lyrics-popup::before {
  content: '';
  position: absolute;
  top: -10px;
  right: 30px;
  border-width: 0 10px 10px 10px;
  border-style: solid;
  border-color: transparent transparent #ddd transparent;
}
.lyrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.lyrics-header span {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.close-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
  transition: color 0.3s ease;
}
.close-button:hover {
  color: #555;
}
.lyrics-content {
  max-height: 350px;
  overflow-y: auto;
}
.lyrics-line {
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}
.lyrics-time {
  color: #888;
  margin-right: 5px;
}
.lyrics-text {
  color: #333;
}
.lyrics-line.active {
  color: #d32f2f;
  font-weight: bold;
}
</style>