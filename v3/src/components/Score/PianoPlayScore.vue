<template>
  <div class="sheet-music-list">
    <h2>乐谱列表</h2>
    <!-- 搜索框 -->
    <input
      type="text"
      v-model="searchQuery"
      placeholder="搜索乐曲..."
      class="search-input"
    />
    <!-- 分类选择（可选） -->
    <select v-model="selectedCategory" class="category-select">
      <option value="">全部分类</option>
      <option v-for="category in categories" :key="category" :value="category">
        {{ category }}
      </option>
    </select>
    <!-- 添加乐谱按钮 -->
    <button @click="toggleAddForm" class="add-button">
      {{ showAddForm ? '取消添加' : '添加乐谱' }}
    </button>
    <!-- 添加乐谱表单 -->
    <transition name="fade">
      <div v-if="showAddForm" class="add-form-container">
        <h3>添加新乐谱</h3>
        <form @submit.prevent="addSong">
          <div class="form-group">
            <label for="song-name">乐曲名称:</label>
            <input
              type="text"
              id="song-name"
              v-model="newSong.name"
              required
              placeholder="输入乐曲名称"
            />
          </div>
          <div class="form-group">
            <label for="song-category">分类:</label>
            <input
              type="text"
              id="song-category"
              v-model="newSong.category"
              required
              placeholder="输入分类"
            />
          </div>
          <div class="sheets-section">
            <h4>乐谱项:</h4>
            <div
              v-for="(sheet, index) in newSong.sheets"
              :key="index"
              class="sheet-item-form"
            >
              <div class="form-group">
                <label>类型:</label>
                <select v-model="sheet.type" required>
                  <option value="" disabled>选择类型</option>
                  <option value="image">图片</option>
                  <option value="text">文本</option>
                </select>
              </div>
              <div class="form-group" v-if="sheet.type === 'image'">
                <label>图片URL:</label>
                <input
                  type="text"
                  v-model="sheet.src"
                  required
                  placeholder="输入图片URL"
                />
              </div>
              <div class="form-group" v-else-if="sheet.type === 'text'">
                <label>文本内容:</label>
                <textarea
                  v-model="sheet.content"
                  required
                  placeholder="输入文本乐谱内容"
                  rows="4"
                ></textarea>
              </div>
              <button
                type="button"
                @click="removeSheet(index)"
                class="remove-sheet-button"
                aria-label="移除乐谱项"
              >
                移除
              </button>
            </div>
            <button
              type="button"
              @click="addSheet"
              class="add-sheet-button"
            >
              添加乐谱项
            </button>
          </div>
          <button type="submit" class="submit-button">提交</button>
        </form>
      </div>
    </transition>
    <!-- 乐曲卡片列表 -->
    <div class="card" v-for="song in filteredSongs" :key="song.id">
      <div
        class="card-header"
        @click="toggleExpand(song.id)"
        role="button"
        tabindex="0"
        @keydown.enter.prevent="toggleExpand(song.id)"
        @keydown.space.prevent="toggleExpand(song.id)"
        :aria-expanded="song.isExpanded"
        :aria-controls="`card-content-${song.id}`"
        :id="`card-header-${song.id}`"
      >
        <h3>{{ song.name }}</h3>
        <div class="card-actions">
          <button
            class="favorite-button"
            @click.stop="toggleFavorite(song.id)"
            :aria-pressed="song.isFavorite"
            aria-label="Toggle Favorite"
          >
            {{ song.isFavorite ? '★' : '☆' }}
          </button>
          <button
            class="complete-button"
            @click.stop="toggleComplete(song.id)"
            :aria-pressed="song.isCompleted"
            aria-label="Toggle Completed"
          >
            {{ song.isCompleted ? '✔️' : '❌' }}
          </button>
          <button class="expand-button" aria-label="Toggle Sheet Music">
            {{ song.isExpanded ? '收起' : '展开' }}
          </button>
        </div>
      </div>
      <transition name="fade">
        <div
          class="card-content"
          v-if="song.isExpanded"
          :id="`card-content-${song.id}`"
          role="region"
          :aria-labelledby="`card-header-${song.id}`"
        >
          <!-- 遍历并展示每个乐谱项 -->
          <div v-for="(sheet, index) in song.sheets" :key="index" class="sheet-item">
            <!-- 图片乐谱 -->
            <img
              v-if="sheet.type === 'image'"
              :src="sheet.src"
              :alt="sheet.alt || song.name + ' 乐谱'"
              class="sheet-image"
            />
            <!-- 文本乐谱 -->
            <pre
              v-else-if="sheet.type === 'text'"
              class="sheet-text"
            >{{ sheet.content }}</pre>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SheetMusicList',
  data() {
    return {
      songs: [ // 内部管理的乐谱列表
        {
          id: 1,
          name: '虫儿飞',
          sheets: [
            {
              type: 'image',
              src: '/public/1.jpg',
              alt: '月光奏鸣曲乐谱',
            },
            {
              type: 'text',
              content: `
uuuuio u y y       tttyu u r r
 e u y    e u y    e u y tt
uuuioy y y        tttyu u r r
 e u y    e u y    e u y tt
u yo i uy oiuiouy
teuy teyt  iuiut
t iuiu t y t
              `,
            },
          ],
          isExpanded: false,
          isFavorite: false,
          isCompleted: false,
          category: '童谣',
        },
        {
          id: 2,
          name: '凄美地',
          sheets: [
            {
              type: 'image',
              src: '/sheets/for-elise.png',
              alt: '致爱丽丝乐谱',
            },
            {
              type: 'text',
              content: `6689808 86|6689808 85|09886|09885|0989|9098|6689808
86|6689808 85|09886|09885|0989|9098|6780|67w7|6780|
80we e|trew0|trewe|trew0w9|0we|trew0ww09898|69908|
              `
            }
          ],
          isExpanded: false,
          isFavorite: false,
          isCompleted: false,
          category: '流行',
        },
        {
          id: 3,
          name: '江南',
          sheets: [
            {
              type: 'image',
              src: '/sheets/canon.png',
              alt: '',
            },
            {
              type: 'text',
              content: `e__u__p__a__ s__h__f__s__ p-|w__y__o__p__ a_s__a__ p
-|e__u__p__a __s__h__f__s__ p-|w__y__o__p__ a_p__o__
p-|=_p__a__s__h_f__s__p_|a__a__a__s__a_o__p__ =|=__
p__p__a__s__h_f__s__p_|a__a__a__s__d__a__a__o__p_.
=|=_p__a__s__h_f__s__p_|a__a__a__s__a__a__p_o_s__p
__|=_p__a__s__h_f__s__p_|a__a__a__s__d__a__a__o__p
_.|=_f__f__f__f__f__f__=__f__f__f__f__f__f__f__|f_d__f_
_f__f_s__d_s__s__s__s__|h_s__s__s__p__ h_s__s__j__h_
h_h_ h-=_s__d__|f__f__f__g__h__g__f__s__d_. f__f__d__
|s__a__s__d__f__d__s__d__a_. a__o__|p_p__p__.s__ s_h
__h__.s__|g__f__g__f__h__g__f__s__s__d_. s__d__|f__f_
_f__g__h__g__f__s__d_. f__f__d__|
`,
            },
          ],
          isExpanded: false,
          isFavorite: false,
          isCompleted: false,
          category: '古典',
        },
        {
          id: 4,
          name: '三叶',
          sheets: [
            {
              type: 'image',
              src: '/sheets/canon.png',
              alt: '',
            },
            {
              type: 'text',
              content: `前奏：
s_d_[if ]h[og]f[ud]s[if ]======
o_p_[is]d[of ]a[us]o[ip]======
s_d_[if ]h[og]f[ud]s[if ]======
o_p_[is]d[of ]a[us]o[ip]======
主奏：
[qs]_h_s_h_s==s_h_s_h_s
[es]_h_s_h_s=ws_d_s_f_s
[qs]_h_s_h_s==s_h_s_h_s
[es]_h_s_h_s=w_l_k_h_j_f_h_a_
[qs]_h_s_h_s==s_h_s_h_s
[es]_h_s_h_s=ws_d_s_f_s
[qs]_d_s_f_s==s_d_s_f_s
[qs]_d_s_f_s=====
副歌：
[sht]osodo[sf ]o
[esh]pspdp[sg]_f_d_s_
qioipi[os]i
[sft]oso[wd]oso
[sht]osodo[sf ]o
[esh]pspdp[sg]_f_d_s_
qioipi[os]i
[sft]oso[adw]======
高潮：
s_d_[if ]h[og]f[ud]s[if ]======
o_p_[is]d[of ]a[us]o[ip]======
s_d_[if ]h[og]f[ud]s[if ]======
o_p_[si]a[od]s[Pf ]d[Ph]g[Pj]h[Pl]J
[dpj]_ h_ j_ [dpz]_ j_ h_ [dpj]_ h_ j_ [dpz]_ j_ h_
[pSj]_ h_ j_ [pSL]_ j_ h_ [pSj]_ h_ j_ [pSL]_ j_ h_
[dpj]_ h_ j_ [dpz]_ j_ h_ [dpj]_ h_ j_ [dpz]_ j_ h_
[pSj]_ h_ j_ L_ h_ j_ z_ h_ j_ [Lxb]=====
桥段：
[qs]_h_s_h_s==s_h_s_h_s
[es]_h_s_h_s=ws_d_s_f_s
[qs]_h_s_h_s==s_h_s_h_s
[es]_h_s_h_s=w_l_k_h_j_f_h_a_
[qs]_d_s_f_s==s_d_s_f_s
[qs]_d_s_f_s==.
[qs]_h_s_f_s===.
结尾：
t_y_u_o_[4p]u[5o]y[6u]t[8y]_o_u====
[4w]t[5r]y[6t]u[8y]o====
t_y_u_o_[4p]u[5o]y[6u]t[8y]_o_u====
[4w]t[5r]y[6t]u[8y]t====
[4p]_o_[qs]_a_[5p]_o_[wu]_o_[3y]_u_[0t]_y_[6e]_t_[ey]_
u_
[4p]_o_[qs]_a_[5p]_o_[wu]_o_[3p]_s_[0d]_f_[6d]_s_[ep]
[4p]_o_[qs]_a_[5p]_o_[wu]_o_[3y]_u_[0t]_y_[6e]_t_[ey]_
u_
[4s]_q_o_p_q_u_o_q_y_u_q_t_y_q_e
[4s]_q_o_p_q_u_o_q_y_u_q_t_y_q_e
[3s]_0_o_p_0_u_o_0_y_u_0_t_y_0_e
[3s]_0_o_p_0_u_o_0_y_u_0_t_y_0_e
[4s]_q_o_p_q_u_o_q_y_u_q_t_y_q_e
[4s]_q_o_d_q_s_f_q_d_h_q_f_j_q_h_z
`,
            },
          ],
          isExpanded: false,
          isFavorite: false,
          isCompleted: false,
          category: '流行',
        },
        {
          id: 5,
          name: '打上花火',
          sheets: [
            {
              type: 'image',
              src: '/sheets/canon.png',
              alt: '',
            },
            {
              type: 'text',
              content: `前奏：
[toj]kzhj[ykp]zh
[uaj]kzxj[odk]fh
[toj]kzhj[ykp]zh
[uaj]kzxj[odk]fh
[8wp]adop[9ea]do
[0rp]adop[wya]do
[8wp]adop[9ea]do
[0rp]adop[wya]-ad
主奏：
[8f]whj-[9eG]ds[0a][rd]Gh-[wy].
hG[8f ]wh-G[9ed]dd
[0pr]adop[wya]-ad
[8f ]whj-[9eG]ds[0a][rd]Gh-[wy].hG
[8f ]wh-G[9ed]df
[0rp]adop[wya]-fG
[8h]w-G[9ef ]G[h0]r-GfG[wyh]Gdf
[8d][wo]of[9ed]opa
[0p][ra]dop[wya]-fG
[8h]w-G[9ef ]G[h0]r-GfG[wyh]jkl-
[woh][woh][rak][epj][woh][woh]5—=
高潮（合唱）：
kz_k[8j][wh][tf ]_hj-[29]_-[k29]z_k
[0j][rh][ud]_hh-[29]_-[k29]z_k
[8j]w[tk]_zzxz_kj_k.0ru.-[29]_-[k29]z_k
[8j][wh][tf ]_hj-[29]_-[k29]z_k
[0j][rh][ud]_hh-[@(]-[h@(]_G_f_G_f.
j.GfGG[29]-[18h]-[29]-[30]–=
间奏：
[8wp]adop[9ea]do
[0rp]adop[wya]do
[8wp]adop[9ea]do
[0rp]adop[wya]-o_p_
副歌：
ap_o_ou_I_oI_u_y
r_y_uI_o_I_y_uyr_r_r_y_uI_o_I
o_p_ap_o_I-y-
[37e]rywe[59r]-
o_p_ap_o_ou_I_oI_u_y
r_y_uI_o_I_y_uyu.y.u.o.p.a.p.o-
[37e]rywe[59r]-
f-dsa.p_a_sa_p_op_a_sa_p_o
u_I_oI_u_yr_y.u.o.I.y.r.u-=
f-dsa.p_a_s–a_p_a—=
sapoo—==========
二段高潮：
kz_k[8j][wh][tf ]_hj-[29]_-[k29]z_k
[0j][rh][ud]_hh-[29]_-[k29]z_k
[8j]w[tk]_zzxz_kj_k.0ru.-[29]_-[k29]z_k
[8j][wh][tf ]_hj-[29]_-[k29]z_k
[0j][rh][ud]_hh-[@(]-[h@(]_G_f_G_f.
j.GdaG[29]-[18h]-[29]-[30]–=
zj_h_h_j_j.-=
zj_h_h_j_j.-=
zj_h_h_j_j.-=
z__xz_k_k_z_z.-=
zj_h_h_j_j.-=
zj_h_h_j_j.-=
zj_h_h_j_j.-=
f_jkl.j.-=====
间奏：
[toj]kzhj[ykp]zh
[uaj]kzxj[odk]fh
[toj]kzhj[ykp]zh
[uaj]kzxj[odk]fh桥段：
ad[8f ]whj-[9eG]ds[0a][rd]Gh-[wy].
hG[8f ]wh-G[9ed]dd
[0pr]adop[wya]-ad
[8f ]whj-[9eG]ds[0a][rd]Gh-[wy].hG
[8f ]wh-G[9ed]df–====
三段高潮：
kz_k[8j][wh][tf ]_hj-[29]_-[k29]z_k
[0j][rh][ud]_hh-[29]_-[k29]z_k
[8j]w[tk]_zzxz_kj_k.0ru.-[29]_-[k29]z_k
[8j][wh][tf ]_hj-[29]_-[k29]z_k
[0j][rh][ud]_hh-[@(]-[h@(]_G_f_G_f.
j.GfGG[29]-[18h]-[29]-[30]–=
f-d_f_hj-k-h-k_j_hj-z-k-fdf-dsa–=
f-d_f_hj-k-h-k_j_hj-z-x–kj-h_j_k.-j_h_h–=
f-d_f_hj-k-h-k_j_hj-z-k-fdf-dsa–=
f-d_f_hj-k-h-k_j_hj-z-x–kj-h_j_k.-j_h_h—=
结尾：
[toj]kzhj[ykp]zh
[uaj]kzhj[odk]zk
[toj]kzhj[ykp]zh
[uaj]kzh.j.[odk]-z–k–=
`,
            },
          ],
          isExpanded: false,
          isFavorite: false,
          isCompleted: false,
          category: '流行',
        },
        {
          id: 6,
          name: '夏至未至',
          sheets: [
            {
              type: 'image',
              src: '/sheets/canon.png',
              alt: '',
            },
            {
              type: 'text',
              content: `[h_oi—-]d_s|h_d_s_|h_d_s_|k_s_s_l [h_ou—-]d_s|h_d
s|h_d_s_|k_s_sl [h_oy—-]d_s h_d_s h_d_s_ k_s_s_l [z
ut—-]d_h_d l_f_h_f x_f_h_f g_f_d_s_|
[h_oi]d_s|[h_oi]d_s|[h-o]d_s|[k_oi]_s_s_l[h_oi-]_d
s|[h_ou]d_s|[h_ou]d_s|[k_ou]_s_s_l

`,
            },
          ],
          isExpanded: false,
          isFavorite: false,
          isCompleted: false,
          category: '流行',
        },
        {
          id: 7,
          name: '最后一页',
          sheets: [
            {
              type: 'image',
              src: '/sheets/canon.png',
              alt: '',
            },
            {
              type: 'text',
              content: `=w t o|o u_o_| = p u=y= |ou_o_=p y-t-|oi_u_= t w t y t-t-
=|=w ty|yu ey-w ty|yu wt-w tr|e r t r-tuu—-|=w ty yu ey-w
ty |uy y_t_t- t r ertrtyt|`,
            },
          ],
          isExpanded: false,
          isFavorite: false,
          isCompleted: false,
          category: '流行',
        },
      ],
      searchQuery: '',
      selectedCategory: '',
      showAddForm: false, // 控制添加表单的显示
      newSong: { // 新增乐谱的表单数据
        name: '',
        category: '',
        sheets: [
          {
            type: '',
            src: '',
            content: '',
          },
        ],
      },
    };
  },
  computed: {
    categories() {
      return [...new Set(this.songs.map(song => song.category))];
    },
    filteredSongs() {
      let result = this.songs;

      // 按搜索关键词过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(song => song.name.toLowerCase().includes(query));
      }

      // 按分类过滤
      if (this.selectedCategory) {
        result = result.filter(song => song.category === this.selectedCategory);
      }

      return result;
    },
  },
  methods: {
    toggleExpand(songId) {
      const song = this.songs.find(s => s.id === songId);
      if (song) {
        song.isExpanded = !song.isExpanded;
      }
    },
    toggleFavorite(songId) {
      const song = this.songs.find(s => s.id === songId);
      if (song) {
        song.isFavorite = !song.isFavorite;
      }
    },
    toggleComplete(songId) {
      const song = this.songs.find(s => s.id === songId);
      if (song) {
        song.isCompleted = !song.isCompleted;
      }
    },
    toggleAddForm() {
      this.showAddForm = !this.showAddForm;
      if (!this.showAddForm) {
        this.resetNewSong();
      }
    },
    addSheet() {
      this.newSong.sheets.push({
        type: '',
        src: '',
        content: '',
      });
    },
    removeSheet(index) {
      this.newSong.sheets.splice(index, 1);
    },
    addSong() {
      // 简单验证表单
      if (!this.newSong.name.trim() || !this.newSong.category.trim()) {
        alert('请填写乐曲名称和分类。');
        return;
      }

      // 验证每个乐谱项
      for (let i = 0; i < this.newSong.sheets.length; i++) {
        const sheet = this.newSong.sheets[i];
        if (sheet.type === 'image') {
          if (!sheet.src.trim()) {
            alert(`请填写第 ${i + 1} 个图片乐谱的URL。`);
            return;
          }
        } else if (sheet.type === 'text') {
          if (!sheet.content.trim()) {
            alert(`请填写第 ${i + 1} 个文本乐谱的内容。`);
            return;
          }
        } else {
          alert(`请选择第 ${i + 1} 个乐谱项的类型。`);
          return;
        }
      }

      // 生成新的唯一ID
      const newId = this.songs.length
        ? Math.max(...this.songs.map(song => song.id)) + 1
        : 1;

      // 处理新乐谱的 sheets 数据，确保每个 sheet 有必要的字段
      const formattedSheets = this.newSong.sheets.map(sheet => {
        if (sheet.type === 'image') {
          return {
            type: 'image',
            src: sheet.src.trim(),
            alt: sheet.alt || this.newSong.name + ' 乐谱',
          };
        } else {
          return {
            type: 'text',
            content: sheet.content.trim(),
          };
        }
      });

      // 创建新歌曲对象
      const songToAdd = {
        id: newId,
        name: this.newSong.name.trim(),
        category: this.newSong.category.trim(),
        sheets: formattedSheets,
        isExpanded: false,
        isFavorite: false,
        isCompleted: false,
      };

      // 添加到 songs 列表
      this.songs.push(songToAdd);

      // 重置表单
      this.resetNewSong();

      // 关闭添加表单
      this.showAddForm = false;
    },
    resetNewSong() {
      this.newSong = {
        name: '',
        category: '',
        sheets: [
          {
            type: '',
            src: '',
            content: '',
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.sheet-music-list {
  margin-bottom: 20px;
}

.sheet-music-list h2 {
  text-align: center;
  margin-bottom: 15px;
}

.search-input {
  display: block;
  margin: 0 auto 20px auto;
  padding: 8px 12px;
  width: 80%;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.category-select {
  display: block;
  margin: 0 auto 20px auto;
  padding: 8px 12px;
  width: 80%;
  max-width: 200px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.add-button {
  display: block;
  margin: 0 auto 20px auto;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #218838;
}

.add-form-container {
  width: 90%;
  max-width: 600px;
  margin: 0 auto 20px auto;
  padding: 20px;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-in-out;
}

.add-form-container h3 {
  text-align: center;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.sheets-section {
  margin-bottom: 15px;
}

.sheet-item-form {
  border: 1px solid #ced4da;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 10px;
  position: relative;
}

.remove-sheet-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.remove-sheet-button:hover {
  background-color: #c82333;
}

.add-sheet-button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-sheet-button:hover {
  background-color: #0056b3;
}

.submit-button {
  display: block;
  width: 100%;
  padding: 10px 0;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #138496;
}

.card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 10px auto;
  padding: 15px;
  width: 90%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.favorite-button,
.complete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
}

.favorite-button {
  color: gold;
}

.complete-button {
  color: green;
}

.expand-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.expand-button:hover {
  background-color: #0056b3;
}

.card-content {
  margin-top: 15px;
  animation: fadeIn 0.3s ease-in-out;
  max-height: 600px; /* 设置最大高度，防止内容过多 */
  overflow-y: auto; /* 超出部分可滚动 */
}

.sheet-item {
  margin-bottom: 15px;
}

.sheet-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.sheet-text {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap; /* 保留换行 */
  font-family: 'Courier New', Courier, monospace; /* 使用等宽字体 */
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  overflow-x: auto; /* 水平滚动 */
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card {
    width: 95%;
  }

  .search-input {
    width: 90%;
  }

  .category-select {
    width: 90%;
  }

  .sheet-text {
    font-size: 12px;
  }

  .key-note {
    font-size: 10px;
  }

  .key-mapping {
    font-size: 8px;
  }

  .key.black .key-note {
    font-size: 8px;
  }

  .key.black .key-mapping {
    font-size: 6px;
  }

  .add-form-container {
    width: 95%;
  }
}
</style>
