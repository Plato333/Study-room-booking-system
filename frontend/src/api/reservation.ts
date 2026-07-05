import request from './index'

export interface CreateReservationPayload {
  seat_id: number
  date: string
  start_time: string
  end_time: string
}

export interface ReservationQuery {
  page?: number
  limit?: number
  status?: string
  date?: string
  room_id?: number
}

export interface AvailableSeatsQuery {
  date: string
  start_time: string
  end_time: string
  room_id?: number
}

/** 查询空闲座位 */
export function getAvailableSeatsApi(params: AvailableSeatsQuery) {
  return request.get('/seats/available', { params })
}

/** 创建预约 */
export function createReservationApi(data: CreateReservationPayload) {
  return request.post('/reservations', data)
}

/** 我的预约列表 */
export function getMyReservationsApi(params?: ReservationQuery) {
  return request.get('/reservations/my', { params })
}

/** 全部预约（管理员） */
export function getAllReservationsApi(params?: ReservationQuery) {
  return request.get('/reservations', { params })
}

/** 取消预约 */
export function cancelReservationApi(id: number) {
  return request.delete(`/reservations/${id}`)
}

/** 签到 */
export function checkInReservationApi(id: number, seatCode: string) {
  return request.post(`/reservations/${id}/check-in`, { seat_code: seatCode })
}

/** 释放座位 */
export function releaseReservationApi(id: number) {
  return request.post(`/reservations/${id}/release`)
}

/** 获取座位签到码（管理员） */
export function getSeatCodeApi(seatId: number) {
  return request.get(`/seats/${seatId}/seat-code`)
}
