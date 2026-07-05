<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/index'

const dialogVisible = ref(false)
const messages = ref<{ role: string; text: string }[]>([])
const inputText = ref('')
const loading = ref(false)

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return
  messages.value.push({ role: 'user', text })
  inputText.value = ''
  loading.value = true
  try {
    const res = await request.post('/ai/chat', { message: text })
    const reply = res.data.reply
    messages.value.push({ role: 'ai', text: reply })
  } catch {
    messages.value.push({ role: 'ai', text: '😅 请求失败，请稍后重试' })
  } finally {
    loading.value = false
  }
}

function quickAsk(q: string) {
  inputText.value = q
  sendMessage()
}
</script>

<template>
  <div class="ai-fab" @click="dialogVisible = true">
    <span>🤖</span>
  </div>

  <el-dialog
    v-model="dialogVisible"
    title="🤖 自习室助手"
    width="420px"
    top="60px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="chat-box">
      <div v-if="messages.length === 0 && !loading" class="empty-chat">
        <div class="empty-icon">💬</div>
        <p>问点什么吧：</p>
        <div class="quick-list">
          <div class="quick-item" @click="quickAsk('今天还有空位吗？')">今天还有空位吗？</div>
          <div class="quick-item" @click="quickAsk('自习室有哪些？')">自习室有哪些？</div>
          <div class="quick-item" @click="quickAsk('今天预约情况怎么样？')">今天预约情况？</div>
          <div class="quick-item" @click="quickAsk('怎么预约座位？')">怎么预约？</div>
        </div>
      </div>
      <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
        <div class="bubble">{{ m.text }}</div>
      </div>
      <div v-if="loading" class="msg ai">
        <div class="bubble thinking">思考中...</div>
      </div>
    </div>
    <template #footer>
      <div class="chat-input">
        <el-input v-model="inputText" placeholder="输入问题..." :disabled="loading" @keyup.enter="sendMessage" />
        <el-button type="primary" :loading="loading" @click="sendMessage">发送</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.ai-fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #40b4ff);
  color: #fff;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 113, 227, 0.3);
  transition: all 0.3s ease;
  z-index: 999;
}
.ai-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(0, 113, 227, 0.5);
}

.chat-box {
  height: 380px;
  overflow-y: auto;
  padding: 8px 0;
}
.msg {
  margin-bottom: 14px;
  display: flex;
}
.msg.ai {
  justify-content: flex-start;
}
.msg.user {
  justify-content: flex-end;
}
.bubble {
  max-width: 85%;
  padding: 10px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}
.msg.ai .bubble {
  background: #f0f0f5;
  color: #1d1d1f;
  border-bottom-left-radius: 4px;
}
.msg.user .bubble {
  background: #0071e3;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.thinking {
  opacity: 0.5;
}

.empty-chat {
  text-align: center;
  padding: 40px 0;
  color: #aeaeb2;
}
.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}
.empty-chat p {
  font-size: 14px;
  margin: 0 0 16px;
}
.quick-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.quick-item {
  font-size: 13px;
  color: #0071e3;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 980px;
  background: rgba(0, 113, 227, 0.06);
  transition: all 0.2s;
}
.quick-item:hover {
  background: rgba(0, 113, 227, 0.12);
}

.chat-input {
  display: flex;
  gap: 8px;
}
.chat-input :deep(.el-input__wrapper) {
  border-radius: 12px !important;
  height: 40px;
}
</style>
