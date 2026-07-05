import request from './index'

export interface StudyRoomPayload {
  name: string
  location: string
  open_time: string
  close_time: string
  status?: string
}

export interface StudyRoomQuery {
  page: number
  limit: number
  search?: string
}

/** 获取自习室列表（分页 + 搜索） */
export function getStudyRoomsApi(params: StudyRoomQuery) {
  return request.get('/study-rooms', { params })
}

/** 获取所有开放中的自习室 */
export function getOpenStudyRoomsApi() {
  return request.get('/study-rooms/open')
}

/** 创建自习室 */
export function createStudyRoomApi(data: StudyRoomPayload) {
  return request.post('/study-rooms', data)
}

/** 更新自习室 */
export function updateStudyRoomApi(id: number, data: Partial<StudyRoomPayload>) {
  return request.put(`/study-rooms/${id}`, data)
}

/** 删除自习室 */
export function deleteStudyRoomApi(id: number) {
  return request.delete(`/study-rooms/${id}`)
}
