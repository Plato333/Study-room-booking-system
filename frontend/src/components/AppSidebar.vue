<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { menuConfig } from '@/config/menu'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/** 当前角色的菜单项 */
const menus = computed(() => {
  const role = userStore.role
  return role ? menuConfig[role] || [] : []
})

function activeMenu() {
  return route.path
}
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-logo" @click="router.push('/home')">
      <span class="logo-text">自习室预约</span>
    </div>

    <el-menu
      :default-active="activeMenu()"
      background-color="#f5f5f7"
      text-color="#1d1d1f"
      active-text-color="#0071e3"
      router
    >
      <!-- 动态渲染当前角色的菜单 -->
      <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
    </el-menu>

    <!-- 未登录时显示占位 -->
    <el-menu v-if="!userStore.isLoggedIn" background-color="#ffffff" text-color="#86868b" active-text-color="#0071e3">
      <el-menu-item index="/home">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 24px 24px 20px;
  cursor: pointer;
}
.logo-text {
  font-size: 17px;
  font-weight: 700;
  color: var(--sk-text);
  letter-spacing: -0.3px;
}
.el-menu {
  border-right: none;
  flex: 1;
  padding: 4px 8px;
}
:deep(.el-menu-item) {
  font-size: 14px;
  height: 40px;
  line-height: 40px;
  margin: 2px 0;
  border-radius: 9px;
}
:deep(.el-menu-item:hover) {
  background: #f5f5f7;
}
:deep(.el-menu-item.is-active) {
  background: rgba(0, 113, 227, 0.08);
  color: var(--sk-blue) !important;
  font-weight: 600;
}
:deep(.el-menu-item .el-icon) {
  font-size: 17px;
  margin-right: 8px;
}
</style>
