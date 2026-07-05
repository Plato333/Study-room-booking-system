import request from './index'

/**
 * 登录接口
 */
export function loginApi(data: { username: string; password: string }) {
  return request.post('/auth/login', data)
}

/**
 * 获取当前用户信息（需携带 Token）
 */
export function getProfileApi() {
  return request.get('/auth/profile')
}
