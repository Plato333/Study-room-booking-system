import request from './index'

/** 获取用户列表（分页 + 搜索） */
export function getUsersApi(params: {
  page: number
  limit: number
  search?: string
}) {
  return request.get('/users', { params })
}

/** 更新用户 */
export function updateUserApi(id: number, data: { role?: string; password?: string }) {
  return request.put(`/users/${id}`, data)
}

/** 删除用户 */
export function deleteUserApi(id: number) {
  return request.delete(`/users/${id}`)
}
