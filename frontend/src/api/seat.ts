import request from './index'

export interface SeatPayload {
  room_id: number
  seat_number: string
  status?: string
}

export interface SeatQuery {
  page: number
  limit: number
}

/** 获取某个自习室下的座位列表 */
export function getSeatsByRoomApi(roomId: number, params?: SeatQuery) {
  return request.get(`/study-rooms/${roomId}/seats`, { params })
}

/** 创建单个座位 */
export function createSeatApi(roomId: number, data: SeatPayload) {
  return request.post(`/study-rooms/${roomId}/seats`, data)
}

/** 批量创建座位 */
export function createSeatsBatchApi(roomId: number, seatNumbers: string[]) {
  return request.post(`/study-rooms/${roomId}/seats/batch`, { seat_numbers: seatNumbers })
}

/** 更新座位 */
export function updateSeatApi(id: number, data: Partial<SeatPayload>) {
  return request.put(`/seats/${id}`, data)
}

/** 删除座位 */
export function deleteSeatApi(id: number) {
  return request.delete(`/seats/${id}`)
}
