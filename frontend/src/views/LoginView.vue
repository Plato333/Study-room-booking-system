<script setup lang="ts">
import { reactive, ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({ username: '', password: '' })

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名 3-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

async function handleLogin() {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.login(loginForm.username, loginForm.password)
    ElMessage.success('登录成功！')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="blob blob3"></div>
    <div class="login-card">
      <div class="brand">📚</div>
      <h1 class="title">自习室预约</h1>
      <p class="desc">登录以继续</p>

      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-position="top" @keyup.enter="handleLogin">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            size="large"
            style="width: 100%; height: 48px; font-size: 16px"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="tip">
        <p>测试账号：testuser / 123456</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f0f8, #e8edf5, #f0f5f5, #f8f0f5, #f5f5f7);
  background-size: 500% 500%;
  animation: bgShift 30s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}
@keyframes bgShift {
  0% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 100% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 0% 100%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.blob,
.blob1,
.blob2,
.blob3 {
  position: fixed;
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
}
.blob1 {
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(0, 113, 227, 0.12) 0%, rgba(0, 113, 227, 0.04) 40%, transparent 70%);
  top: -300px;
  right: -250px;
  animation: morph1 25s ease-in-out infinite;
  filter: blur(80px);
}
.blob2 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(175, 82, 222, 0.1) 0%, rgba(175, 82, 222, 0.03) 40%, transparent 70%);
  bottom: -300px;
  left: -250px;
  animation: morph2 30s ease-in-out infinite;
  filter: blur(80px);
}
.blob3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 149, 0, 0.06) 0%, transparent 70%);
  top: 50%;
  left: 55%;
  animation: morph3 20s ease-in-out infinite;
  filter: blur(60px);
}
@keyframes morph1 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  25% {
    transform: translate3d(120px, 80px, 0) scale(1.15);
  }
  50% {
    transform: translate3d(60px, 150px, 0) scale(0.9);
  }
  75% {
    transform: translate3d(-50px, 100px, 0) scale(1.08);
  }
}
@keyframes morph2 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  33% {
    transform: translate3d(-100px, -80px, 0) scale(1.2);
  }
  66% {
    transform: translate3d(-150px, -120px, 0) scale(0.85);
  }
}
@keyframes morph3 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-30px, 40px, 0) scale(1.15);
  }
}

.login-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 48px 40px 36px;
  width: 380px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  animation: cardIn 2.5s cubic-bezier(0.25, 0.1, 0.25, 1) both;
}
@keyframes cardIn {
  0% {
    opacity: 0;
    transform: translateY(60px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.brand {
  text-align: center;
  font-size: 48px;
  margin-bottom: 8px;
}
.title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--sk-text);
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}
.desc {
  text-align: center;
  font-size: 15px;
  color: var(--sk-text-secondary);
  margin: 0 0 32px;
}

:deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
  color: var(--sk-text);
  padding-bottom: 4px;
}
:deep(.el-input__wrapper) {
  height: 48px;
  border-radius: 12px !important;
  background: rgba(0, 0, 0, 0.02) !important;
}
:deep(.el-input__inner) {
  font-size: 15px;
}
:deep(.el-button--primary) {
  transition: all 0.3s ease;
}
:deep(.el-button--primary):hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 113, 227, 0.3);
}
:deep(.el-button--primary):active {
  transform: scale(0.98);
}

.tip {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--sk-border);
}
.tip p {
  font-size: 12px;
  color: var(--sk-text-tertiary);
  margin: 0;
}
</style>
