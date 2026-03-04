<script setup>
import PageHeader from "@/components/PageHeader/index.vue";
import Chat from '@/components/AI/Chat.vue'
import AbcEditor from "@/components/ABCjs/Abc.vue";
import AbcConverter from "@/components/ABCjs/AbcConverter.vue";
</script>

<template>
  <PageHeader />
  <main class="main-content">
    <section class="Abc-section">
      <AbcEditor/>
      <AbcConverter/>
    </section>
    <section class="chat-section">
      <Chat />
    </section>
  </main>
</template>

<style lang="scss" scoped>
.main-content {
  display: flex;
  flex: 1;
  padding: 40px 20px;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.Abc-section,
.chat-section {
  flex: 1 1 400px;
  max-width: 600px;
  background-color: #ffffff;
  padding: 25px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.Abc-section:hover,
.chat-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}

@media screen and (max-width: 768px) {
  .albumList-box {
    width: 12rem;
    height: 8rem;
  }
}
</style>
