<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Search, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createReservationApi, getAvailableSeatsApi } from '@/api/reservation'
import { getOpenStudyRoomsApi } from '@/api/studyRoom'

interface StudyRoom {
  id: number
  name: string
  location: string
  open_time: string
  close_time: string
}

interface SeatItem {
  id: number
  seat_number: string
  status: string
  room: StudyRoom
}

const rooms = ref<StudyRoom[]>([])
const seats = ref<SeatItem[]>([])
const loading = ref(false)
const reserving = ref(false)

const today = new Date().toISOString().slice(0, 10)
const formDate = ref(today)
const formStartTime = ref('08:00')
const formEndTime = ref('10:00')
const selectedRoomId = ref<number | undefined>(undefined)
const searched = ref(false)

const quickTimes = [
  { label: '上午', start: '08:00', end: '12:00' },
  { label: '下午', start: '13:00', end: '17:00' },
  { label: '晚间', start: '18:00', end: '21:00' },
]

async function fetchRooms() {
  try {
    const res = await getOpenStudyRoomsApi()
    rooms.value = res.data
  } catch {
    ElMessage.error('获取自习室列表失败')
  }
}

async function handleSearch() {
  if (!formDate.value || !formStartTime.value || !formEndTime.value) {
    ElMessage.warning('请填写日期和时间')
    return
  }
  if (formEndTime.value <= formStartTime.value) {
    ElMessage.warning('结束时间必须晚于开始时间')
    return
  }

  loading.value = true
  searched.value = true
  try {
    const res = await getAvailableSeatsApi({
      date: formDate.value,
      start_time: formStartTime.value,
      end_time: formEndTime.value,
      room_id: selectedRoomId.value,
    })
    seats.value = res.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '查询失败')
  } finally {
    loading.value = false
  }
}

function selectQuickTime(t: (typeof quickTimes)[number]) {
  formStartTime.value = t.start
  formEndTime.value = t.end
  handleSearch()
}

async function handleReserve(seat: SeatItem) {
  try {
    await ElMessageBox.confirm(
      `确定预约「${seat.room.name}」座位 ${seat.seat_number}？
日期：${formDate.value}
时段：${formStartTime.value} - ${formEndTime.value}`,
      '确认预约',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' },
    )
  } catch {
    return
  }

  reserving.value = true
  try {
    await createReservationApi({
      seat_id: seat.id,
      date: formDate.value,
      start_time: formStartTime.value,
      end_time: formEndTime.value,
    })
    ElMessage.success('预约成功')
    handleSearch()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '预约失败')
  } finally {
    reserving.value = false
  }
}

onMounted(fetchRooms)
</script>

<template>
  <div class="reservation-page">
    <h2 class="page-title">📅 预约座位</h2>

    <!-- 搜索面板 -->
    <div class="filter-panel">
      <div class="filter-row">
        <div class="filter-item">
          <label>日期</label>
          <el-date-picker
            v-model="formDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="(d: Date) => d < new Date(today)"
          />
        </div>
        <div class="filter-item">
          <label>开始</label>
          <el-time-select v-model="formStartTime" start="06:00" step="00:30" end="23:00" placeholder="开始" />
        </div>
        <div class="filter-item">
          <label>结束</label>
          <el-time-select v-model="formEndTime" start="06:00" step="00:30" end="23:00" placeholder="结束" />
        </div>
        <div class="filter-item">
          <label>自习室</label>
          <el-select v-model="selectedRoomId" placeholder="全部" clearable>
            <el-option v-for="r in rooms" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </div>
        <div class="filter-item filter-action">
          <el-button type="primary" :icon="Search" @click="handleSearch" :loading="loading" size="large">
            查询空位
          </el-button>
        </div>
      </div>
      <!-- 快捷时段 -->
      <div class="quick-times">
        <span class="quick-label">快捷时段：</span>
        <el-button
          v-for="t in quickTimes"
          :key="t.label"
          size="small"
          round
          :type="formStartTime === t.start && formEndTime === t.end ? 'primary' : 'default'"
          @click="selectQuickTime(t)"
        >
          {{ t.label }}
        </el-button>
      </div>
    </div>

    <!-- 结果 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>正在查询空闲座位...</p>
    </div>

    <div v-else-if="searched && seats.length === 0" class="empty-state">
      <div class="empty-icon">🪑</div>
      <h3>暂无空闲座位</h3>
      <p>该时段没有可用座位，试试其他时间或自习室</p>
    </div>

    <div v-else-if="!searched && seats.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>选择时段开始查询</h3>
      <p>选择日期、时间段和自习室，点击"查询空位"</p>
    </div>

    <div v-else class="seat-grid">
      <div v-for="seat in seats" :key="seat.id" class="seat-card" @click="handleReserve(seat)">
        <div class="seat-top">
          <span class="seat-icon">💺</span>
          <el-tag size="small" type="success" effect="plain">空闲</el-tag>
        </div>
        <div class="seat-number">{{ seat.seat_number }}</div>
        <div class="seat-room">{{ seat.room.name }}</div>
        <div class="seat-location">{{ seat.room.location }}</div>
        <el-button type="primary" plain size="small" class="reserve-btn" :loading="reserving">立即预约</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reservation-page {
  padding: 40px 48px;
  max-width: 1100px;
}
.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 28px;
  letter-spacing: -0.5px;
}

.filter-panel {
  background: #fff;
  border-radius: 18px;
  padding: 24px 28px;
  margin-bottom: 28px;
}
.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filter-item label {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
}
.filter-item :deep(.el-date-editor),
.filter-item :deep(.el-select) {
  width: 150px;
}
.filter-action {
  padding-top: 24px;
}

.quick-times {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f7;
}
.quick-label {
  font-size: 12px;
  color: #aeaeb2;
}

.loading-state {
  text-align: center;
  padding: 80px 0;
  color: #86868b;
}
.loading-state p {
  margin-top: 16px;
  font-size: 15px;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
}
.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
}
.empty-state h3 {
  color: #1d1d1f;
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
}
.empty-state p {
  color: #86868b;
  font-size: 15px;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
}
.seat-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 20px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}
.seat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}
.seat-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.seat-icon {
  font-size: 32px;
}
.seat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.3px;
  margin-bottom: 4px;
}
.seat-room {
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
}
.seat-location {
  font-size: 12px;
  color: #aeaeb2;
  margin-bottom: 16px;
}
.reserve-btn {
  width: 100%;
  border-radius: 10px;
}
</style>
