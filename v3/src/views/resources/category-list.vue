<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from "@/components/PageHeader/index.vue";

// 定义文章数据
const articles = ref([
  {
    id: 6,
    title: 'ABC记谱法',
    description: '首先拿到一首谱子需要得到基本信息\n' +
      '歌曲名称，节拍，速度，定调(Key)，另外ABC记谱法还需要一个信息就是最短音符的时值',
    image: 'https://pic.rmb.bdstatic.com/bjh/news/c555fe0ec33fe6bae9c8714e841937509387.jpeg?x-bce-process=image/watermark,bucket_baidu-rmb-video-cover-1,image_YmpoL25ld3MvNjUzZjZkMjRlMDJiNjdjZWU1NzEzODg0MDNhYTQ0YzQucG5n,type_RlpMYW5UaW5nSGVpU01HQg==,w_19,text_QGFiY-mfs-espg==,size_19,x_15,y_15,interval_2,color_FFFFFF,effect_softoutline,shc_000000,blr_2,align_1',
  },
  {
    id: 7,
    title: '基础的乐理知识',
    description: '要想把音乐学好就必须先学习乐理知识。乐理知识就是音乐的钥匙，有了这把钥匙你就能更快地打开音乐之门，进入音乐殿堂。',
    image: 'https://img2.baidu.com/it/u=3752131341,3516681900&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1024',
  },
  {
    id: 8,
    title: '钢琴乐谱识别',
    description: '学钢琴的人或者学过钢琴的人都知道学钢琴不容易，除了弹奏的技巧熟练程度外还有就是看谱识谱。',
    image: 'https://pic2.zhimg.com/v2-a540c7127f2046fd0478d1a2e88625ab_1440w.jpg',
  },
  {
    id: 9,
    title: 'tone.js',
    description: 'Tone.js 是一个Web Audio框架，用于在浏览器中创建交互式音乐。Tone.js旨在使音乐家和基于Web Audio 应用程序的音频程序员都能熟悉应用。在应用层，Tone.js 提供了常见的DAW(数字音频工作站)功能，如用于同步和调度事件的全局传输，以及预构建的合成器和音效。此外，Tone.js 提供高性能的构建模块，以创建您自己的合成器、音效和复杂的控制信号。',
    image: 'https://via.placeholder.com/600x400?text=Vue+3',
  },
  // 添加更多文章...
]);

const router = useRouter();

// 处理卡片点击事件
const goToArticle = (id) => {
  router.push({ path: '/article', query: { id } });
};
</script>

<template>
  <div>
    <PageHeader />

    <div class="articles-container">
      <div
        v-for="article in articles"
        :key="article.id"
        class="article-card"
        @click="goToArticle(article.id)"
      >
        <div class="image-container">
          <img :src="article.image" :alt="article.title" class="article-image" />
          <div class="overlay">
            <span class="read-more">阅读更多</span>
          </div>
        </div>
        <div class="article-content">
          <h3 class="article-title">{{ article.title }}</h3>
          <p class="article-description">{{ article.description }}</p>
          <button class="read-button">阅读更多</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.articles-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  padding: 40px;
  justify-items: center;
  background-color: #f9f9f9;
}

.article-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.15);
  }

  .image-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 66.66%; /* 3:2 Aspect Ratio */
    overflow: hidden;

    .article-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 20px;

      .read-more {
        color: #fff;
        font-size: 1.1em;
        font-weight: bold;
        background-color: rgba(0, 0, 0, 0.6);
        padding: 10px 20px;
        border-radius: 20px;
        transition: background-color 0.3s ease;
      }

      .read-more:hover {
        background-color: rgba(0, 0, 0, 0.8);
      }
    }

    &:hover .article-image {
      transform: scale(1.1);
    }

    &:hover .overlay {
      opacity: 1;
    }
  }

  .article-content {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .article-title {
      font-size: 1.5em;
      margin: 0 0 10px 0;
      color: #333;
      transition: color 0.3s ease;
    }

    .article-description {
      flex: 1;
      font-size: 1em;
      color: #666;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .read-button {
      align-self: flex-start;
      padding: 10px 20px;
      background-color: #007BFF;
      color: #fff;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 0.95em;
      transition: background-color 0.3s ease, transform 0.3s ease;

      &:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>