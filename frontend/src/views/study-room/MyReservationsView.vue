<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  cancelReservationApi,
  checkInReservationApi,
  getMyReservationsApi,
  releaseReservationApi,
} from '@/api/reservation'

interface SeatInfo {
  id: number
  seat_number: string
  room: { id: number; name: string }
}

interface ReservationItem {
  id: number
  student_id: number
  seat_id: number
  date: string
  start_time: string
  end_time: string
  status: string
  check_in_time: string | null
  release_time: string | null
  created_at: string
  seat: SeatInfo
}

const list = ref<ReservationItem[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const filterStatus = ref('')
const filterDate = ref('')

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

async function fetchList() {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      limit: limit.value,
    }
    if (filterStatus.value) params.status = filterStatus.value
    if (filterDate.value) params.date = filterDate.value

    const res = await getMyReservationsApi(params)
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

async function handleCancel(row: ReservationItem) {
  try {
    await ElMessageBox.confirm(`确定取消 ${row.date} ${row.start_time}-${row.end_time} 的预约吗？`, '取消预约', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '返回',
    })
  } catch {
    return
  }

  try {
    await cancelReservationApi(row.id)
    ElMessage.success('已取消')
    fetchList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '取消失败')
  }
}

// 签到相关
const checkInDialogVisible = ref(false)
const checkInLoading = ref(false)
const checkInSeatCode = ref('')
const currentCheckInId = ref<number>(0)

function openCheckIn(row: ReservationItem) {
  currentCheckInId.value = row.id
  checkInSeatCode.value = ''
  checkInDialogVisible.value = true
}

async function handleCheckIn() {
  if (!checkInSeatCode.value.trim()) {
    ElMessage.warning('请输入座位签到码')
    return
  }

  checkInLoading.value = true
  try {
    await checkInReservationApi(currentCheckInId.value, checkInSeatCode.value.trim())
    ElMessage.success('签到成功')
    checkInDialogVisible.value = false
    fetchList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '签到失败')
  } finally {
    checkInLoading.value = false
  }
}

// 释放座位
const releasing = ref(false)

async function handleRelease(row: ReservationItem) {
  try {
    await ElMessageBox.confirm('确定要释放该座位吗？释放后座位将变为空闲状态。', '释放确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '返回',
    })
  } catch {
    return
  }

  releasing.value = true
  try {
    await releaseReservationApi(row.id)
    ElMessage.success('座位已释放')
    fetchList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '释放失败')
  } finally {
    releasing.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <div class="my-reservations-page">
    <el-card>
      <template #header><span>我的预约</span></template>

      <div class="toolbar">
        <el-select v-model="filterStatus" placeholder="预约状态" clearable style="width: 140px" @change="handleSearch">
          <el-option label="已预约" value="reserved" />
          <el-option label="已签到" value="checked_in" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-date-picker
          v-model="filterDate"
          type="date"
          placeholder="按日期筛选"
          clearable
          style="width: 160px"
          @change="handleSearch"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" @click="handleSearch">筛选</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="时段" width="150">
          <template #default="{ row }">{{ row.start_time }} - {{ row.end_time }}</template>
        </el-table-column>
        <el-table-column label="自习室 / 座位" min-width="200">
          <template #default="{ row }"> {{ row.seat?.room?.name }} · {{ row.seat?.seat_number }} </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'reserved'" type="success" size="small" @click="openCheckIn(row)">
              签到
            </el-button>
            <el-button v-if="row.status === 'reserved'" type="danger" size="small" @click="handleCancel(row)">
              取消
            </el-button>
            <el-button v-if="row.status === 'checked_in'" type="warning" size="small" @click="handleRelease(row)">
              释放
            </el-button>
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

    <!-- 签到弹窗 -->
    <el-dialog v-model="checkInDialogVisible" title="扫码签到" width="420px">
      <p style="margin-bottom: 12px; color: #606266">请扫描座位上的二维码，或手动输入座位签到码：</p>
      <el-input v-model="checkInSeatCode" placeholder="请输入座位签到码" @keyup.enter="handleCheckIn" />
      <template #footer>
        <el-button @click="checkInDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="checkInLoading" @click="handleCheckIn"> 确认签到 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.my-reservations-page {
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
  background: #f5f5f7;
  color: #1d1d1f;
  font-weight: 600;
  font-size: 13px;
  border: none;
}
:deep(.el-table td) {
  border-color: #f5f5f7;
}
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafafa;
}
</style>
