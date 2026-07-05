import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, getProfileApi } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  // ── 状态 ──
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<{
    id: number
    username: string
    role: string
  } | null>(null)

  // ── 计算属性 ──
  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => userInfo.value?.role || '')

  // ── 登录 ──
  async function login(username: string, password: string) {
    const res = await loginApi({ username, password })
    const { access_token, user } = res.data

    // 持久化 Token
    token.value = access_token
    localStorage.setItem('token', access_token)

    // 保存用户信息
    userInfo.value = user

    // 跳转首页
    router.push('/home')
  }

  // ── 获取用户信息 ──
  async function fetchUserInfo() {
    try {
      const res = await getProfileApi()
      userInfo.value = res.data
    } catch {
      // Token 失效，清除登录状态
      logout()
    }
  }

  // ── 页面刷新后恢复登录态 ──
  async function restoreLoginState() {
    if (!token.value || userInfo.value) return
    await fetchUserInfo()
  }

  // ── 退出登录 ──
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    role,
    login,
    fetchUserInfo,
    restoreLoginState,
    logout,
  }
})
