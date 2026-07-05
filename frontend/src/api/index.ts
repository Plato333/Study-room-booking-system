import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

/**
 * Axios 实例 —— 所有 API 请求的统一入口
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

/**
 * 请求拦截器 —— 每次发请求前自动执行
 *
 * 功能：从 localStorage 读取 Token，自动添加到请求头
 */
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器 —— 每次收到响应后自动执行
 *
 * 功能：统一处理 401 错误（Token 失效或未登录）
 */
request.interceptors.response.use(
  (response) => {
    // 2xx 状态码 → 直接返回
    return response
  },
  (error) => {
    // 401 → Token 失效，清除登录状态，跳转登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

export default request
