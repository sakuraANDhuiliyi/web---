<script setup>
import PageHeader from "@/components/PageHeader/index.vue";
import Piano from "@/components/Piano/Piano.vue";
import Music from '@/components/SearchMusic/SearchMusic.vue'
import Score from '@/components/Score/PianoPlayScore.vue'
</script>
<template>
  <PageHeader />
  <header class="piano-section">
    <Piano />
  </header>
  <main class="main-content">
    <section class="recorder-section">
      <Score/>
    </section>
    <section class="music-section">
      <Music />
    </section>
  </main>
</template>

<style lang="scss" scoped>
.mobile-top-card {
  height: 31rem;
  margin: 4px;
  :deep(.info-avatar) {
    padding: 0 2rem;
  }
  :deep(.personal-say) {
    padding-left: 1rem;
  }
  :deep(.info-background) {
    height: 12rem;
    width: 100%;
  }
  :deep(.common-menu) {
    padding: 1rem 5.5rem;
  }
  :deep(.git-ee) {
    padding: 0 4rem;
  }
  :deep(.personal-link) {
    padding: 1rem 6rem;
  }
}
.mobile-bottom-card {
  margin: 4px;
  padding: 1rem;
  .icon-localoffer {
    font-weight: 900;
  }
  span {
    margin-left: 0.3rem;
  }
  .site-info {
    padding: 0.3rem 1rem;
    line-height: 2;
    font-size: 1rem;

    .value {
      font-weight: 600;
    }
  }
}
.group {
  margin-left: 0.3rem;
  width: 100%;
  height: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  .img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    margin-right: 10px;
  }
}
.main-content {
  display: flex;
  flex: 1;
  padding: 40px 20px;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.recorder-section,
.music-section {
  flex: 1 1 400px;
  max-width: 600px;
  background-color: #ffffff;
  padding: 25px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.recorder-section:hover,
.music-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}
</style>
