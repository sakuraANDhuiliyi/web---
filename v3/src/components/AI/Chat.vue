<template>
  <div  class="homepage">
    <live />
    <div class="chat-container">
      <div class="chat-messages" ref="chatMessages">
        <div v-for="message in messages" :key="message.id" class="chat-message">
        <span
          :class="message.role === 'user' ? 'user-message' : 'ai-message'"
        >
          {{ message.text }}
        </span>
          <div class="message-timestamp">
            {{ formatTimestamp(message.timestamp) }}
          </div>
        </div>
      </div>
      <div class="chat-input">
        <input
          type="text"
          v-model="userInput"
          @keyup.enter="sendMessage"
          placeholder="输入你的消息..."
        />
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      userInput: '',
      messages: [],
    };
  },
  methods: {
    async fetchMessages() {
      try {
        const response = await axios.get('http://localhost:8080/messages');
        const records = response.data;

        // 清空当前消息列表
        this.messages = [];

        // 将每条记录拆分为用户消息和AI消息
        records.forEach((record) => {
          this.messages.push({
            id: `user-${record.id}`,
            role: 'user',
            text: record.question,
            timestamp: record.timestamp,
          });
          this.messages.push({
            id: `ai-${record.id}`,
            role: 'ai',
            text: record.response,
            timestamp: record.timestamp,
          });
        });

        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    async sendMessage() {
      if (this.userInput.trim() === '') return;

      // 将用户消息添加到消息列表
      const userMessage = {
        id: Date.now(),
        role: 'user',
        text: this.userInput,
        timestamp: new Date().toISOString(),
      };
      this.messages.push(userMessage);

      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      // 发送消息到Go后端
      try {
        const response = await axios.post('http://localhost:8080/send', {
          message: this.userInput,
        });

        // 获取AI的完整回复并添加到消息列表
        const aiResponse = response.data.response; // 确保这里的字段名与后端一致
        const aiMessage = {
          id: Date.now() + 1,
          role: 'ai',
          text: aiResponse,
          timestamp: new Date().toISOString(),
        };
        this.messages.push(aiMessage);

        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }

      // 清空输入框
      this.userInput = '';
    },
    scrollToBottom() {
      const chatMessages = this.$refs.chatMessages;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
  },
  created() {
    // 在组件创建时获取存储的消息
    this.fetchMessages();
  },
};
</script>

<style>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  width: 100;
  margin: 80px auto 0;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chat-messages {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.chat-message {
  margin-bottom: 10px;
  font-size: 14px;
}

.user-message {
  color: #2e6cf2;
  font-weight: bold;
}

.ai-message {
  color: #00a99d;
  font-style: italic;
}

.message-timestamp {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.chat-input {
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ddd;
}

.chat-input input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-right: 10px;
}

.chat-input button {
  padding: 8px 15px;
  background-color: #2e6cf2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #1a4c99;
}

.chat-input input:focus, .chat-input button:focus {
  outline: none;
}

.chat-input input::placeholder {
  color: #888;
}


@media (max-width: 768px) {
  .navbar {
    padding: 16px 16px;
    flex-direction: column;
  }
}
</style>
