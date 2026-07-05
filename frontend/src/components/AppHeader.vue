<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { menuConfig } from '@/config/menu'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const menus = computed(() => {
  const role = userStore.role
  return role ? menuConfig[role] || [] : []
})

function handleLogout() {
  userStore.logout()
}
function activeMenu() {
  return route.path
}
function goHome() {
  router.push('/home')
}
</script>

<template>
  <div class="header">
    <div class="header-left" @click="goHome">
      <div class="brand-icon">📚</div>
      <span class="brand-text">自习室预约</span>
    </div>

    <div class="header-center">
      <template v-if="userStore.isLoggedIn">
        <router-link
          v-for="item in menus"
          :key="item.path"
          :to="item.path"
          class="nav-pill"
          :class="{ active: activeMenu() === item.path }"
        >
          <span class="nav-pill-dot"></span>
          <span class="nav-pill-text">{{ item.label }}</span>
        </router-link>
      </template>
      <router-link v-else to="/home" class="nav-pill" :class="{ active: activeMenu() === '/home' }">
        <span class="nav-pill-dot"></span>
        <span class="nav-pill-text">首页</span>
      </router-link>
    </div>

    <div class="header-right">
      <template v-if="userStore.isLoggedIn">
        <span class="user-badge" :class="userStore.role">
          {{ userStore.role === 'admin' ? '管理' : '学生' }}
        </span>
        <span class="user-name">{{ userStore.userInfo?.username }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </template>
      <span v-else class="user-placeholder">未登录</span>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 0;
}

/* Left - Brand */
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}
.brand-icon {
  font-size: 20px;
  line-height: 1;
}
.brand-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--sk-text);
  letter-spacing: -0.4px;
}

/* Center - Navigation Pills */
.header-center {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
  padding: 0 16px;
}
.nav-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 980px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sk-text-secondary);
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;
  white-space: nowrap;
}
.nav-pill:hover {
  color: var(--sk-text);
  background: rgba(0, 0, 0, 0.04);
}
.nav-pill.active {
  background: rgba(0, 113, 227, 0.1);
  color: var(--sk-blue);
  font-weight: 600;
}
.nav-pill-dot {
  display: none;
}
.nav-pill.active .nav-pill-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sk-blue);
}

/* Right - User */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.user-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 980px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.user-badge.admin {
  background: rgba(0, 113, 227, 0.1);
  color: var(--sk-blue);
}
.user-badge.student {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}
.user-name {
  font-size: 13px;
  color: var(--sk-text);
  font-weight: 500;
}
.logout-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--sk-text-tertiary);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 980px;
  transition: all 0.2s ease;
}
.logout-btn:hover {
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.06);
}
.user-placeholder {
  font-size: 13px;
  color: var(--sk-text-tertiary);
}
</style>
