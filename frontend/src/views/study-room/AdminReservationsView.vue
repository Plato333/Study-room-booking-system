<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllReservationsApi } from '@/api/reservation'
import { getOpenStudyRoomsApi } from '@/api/studyRoom'

interface RoomInfo {
  id: number
  name: string
}

interface ReservationItem {
  id: number
  student_id: number
  seat_id: number
  date: string
  start_time: string
  end_time: string
  status: string
  student: { id: number; username: string }
  seat: {
    id: number
    seat_number: string
    room: RoomInfo
  }
}

const list = ref<ReservationItem[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const filterStatus = ref('')
const filterDate = ref('')
const filterRoomId = ref<number | undefined>(undefined)
const rooms = ref<RoomInfo[]>([])

function statusLabel(value: string) {
  const map: Record<string, string> = {
    reserved: '已预约',
    checked_in: '已签到',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[value] || value
}

function statusTagType(value: string) {
  const map: Record<string, string> = {
    reserved: 'primary',
    checked_in: 'success',
    completed: 'info',
    cancelled: 'warning',
  }
  return map[value] || 'info'
}

async function fetchRooms() {
  try {
    const res = await getOpenStudyRoomsApi()
    rooms.value = res.data
  } catch {
    /* ignore */
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: page.value, limit: limit.value }
    if (filterStatus.value) params.status = filterStatus.value
    if (filterDate.value) params.date = filterDate.value
    if (filterRoomId.value) params.room_id = filterRoomId.value

    const res = await getAllReservationsApi(params)
    list.value = res.data.items
    total.value = res.data.total
  } catch {
    ElMessage.error('获取预约列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handlePageChange(p: number) {
  page.value = p
  fetchList()
}

onMounted(() => {
  fetchRooms()
  fetchList()
})
</script>

<template>
  <div class="admin-reservations-page">
    <el-card>
      <template #header><span>全部预约记录</span></template>

      <div class="toolbar">
        <el-select
          v-model="filterStatus"
          placeholder="状态"
          clearable
          style="width: 130px"
          @change="handleSearch"
          @clear="handleSearch"
        >
          <el-option label="已预约" value="reserved" />
          <el-option label="已签到" value="checked_in" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-select
          v-model="filterRoomId"
          placeholder="自习室"
          clearable
          style="width: 180px"
          @change="handleSearch"
          @clear="handleSearch"
        >
          <el-option v-for="r in rooms" :key="r.id" :label="r.name" :value="r.id" />
        </el-select>
        <el-date-picker
          v-model="filterDate"
          type="date"
          placeholder="日期"
          clearable
          style="width: 160px"
          @change="handleSearch"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" @click="handleSearch">筛选</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="student.username" label="学生" width="120" />
        <el-table-column label="自习室 / 座位" min-width="180">
          <template #default="{ row }"> {{ row.seat?.room?.name }} · {{ row.seat?.seat_number }} </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="时段" width="150">
          <template #default="{ row }">{{ row.start_time }} - {{ row.end_time }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="limit"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.admin-reservations-page {
  padding: 40px 48px;
}
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
:deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
}
:deep(.el-table th) {
  background: rgba(255, 255, 255, 0.04) !important;
  color: var(--sk-text-secondary) !important;
  font-weight: 600;
  font-size: 12px;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
:deep(.el-table td) {
  border-color: var(--sk-border);
  color: var(--sk-text);
}
</style>
