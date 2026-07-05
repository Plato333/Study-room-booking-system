<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  createSeatApi,
  createSeatsBatchApi,
  deleteSeatApi,
  getSeatsByRoomApi,
  updateSeatApi,
  type SeatPayload,
} from '@/api/seat'
import { getSeatCodeApi } from '@/api/reservation'

interface SeatItem extends SeatPayload {
  id: number
  room_id: number
  created_at: string
  updated_at: string
}

const route = useRoute()
const router = useRouter()
const roomId = Number(route.params.roomId)

const list = ref<SeatItem[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const limit = ref(50)

// 单个新增弹窗
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const form = reactive<SeatPayload & { id?: number }>({
  room_id: roomId,
  seat_number: '',
  status: 'available',
})

// 批量新增弹窗
const batchDialogVisible = ref(false)
const batchDialogLoading = ref(false)
const batchInput = ref('')

function resetForm() {
  form.id = undefined
  form.room_id = roomId
  form.seat_number = ''
  form.status = 'available'
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getSeatsByRoomApi(roomId, {
      page: page.value,
      limit: limit.value,
    })
    list.value = res.data.items
    total.value = res.data.total
  } catch {
    ElMessage.error('获取座位列表失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(p: number) {
  page.value = p
  fetchList()
}

function goBack() {
  router.push({ name: 'study-rooms' })
}

// 单个新增/编辑
function openCreate() {
  resetForm()
  dialogMode.value = 'create'
  dialogVisible.value = true
}

function openEdit(row: SeatItem) {
  form.id = row.id
  form.room_id = row.room_id
  form.seat_number = row.seat_number
  form.status = row.status
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

async function handleSubmit() {
  dialogLoading.value = true
  try {
    if (dialogMode.value === 'create') {
      await createSeatApi(roomId, {
        room_id: roomId,
        seat_number: form.seat_number,
        status: form.status,
      })
      ElMessage.success('新增成功')
    } else if (form.id) {
      await updateSeatApi(form.id, {
        room_id: form.room_id,
        seat_number: form.seat_number,
        status: form.status,
      })
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '保存失败')
  } finally {
    dialogLoading.value = false
  }
}

// 批量新增
function openBatchCreate() {
  batchInput.value = ''
  batchDialogVisible.value = true
}

async function handleBatchSubmit() {
  const lines = batchInput.value
    .split(/[\n,，]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    ElMessage.warning('请输入座位编号')
    return
  }

  batchDialogLoading.value = true
  try {
    await createSeatsBatchApi(roomId, lines)
    ElMessage.success(`成功批量创建 ${lines.length} 个座位`)
    batchDialogVisible.value = false
    fetchList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '批量创建失败')
  } finally {
    batchDialogLoading.value = false
  }
}

// 删除
async function handleDelete(row: SeatItem) {
  try {
    await ElMessageBox.confirm(`确定要删除座位"${row.seat_number}"吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  try {
    await deleteSeatApi(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '删除失败')
  }
}

// 签到码
const seatCodeDialogVisible = ref(false)
const seatCodeValue = ref('')
const seatCodeQrcode = ref('')
const seatCodeName = ref('')
const seatCodeLoading = ref(false)

async function openSeatCode(row: SeatItem) {
  seatCodeName.value = row.seat_number
  seatCodeValue.value = ''
  seatCodeQrcode.value = ''
  seatCodeDialogVisible.value = true
  seatCodeLoading.value = true
  try {
    const res = await getSeatCodeApi(row.id)
    seatCodeValue.value = res.data.code
    seatCodeQrcode.value = `${import.meta.env.VITE_API_BASE_URL}/seats/${row.id}/qrcode`
  } catch {
    ElMessage.error('获取签到码失败')
    seatCodeDialogVisible.value = false
  } finally {
    seatCodeLoading.value = false
  }
}

function statusLabel(value: string) {
  const map: Record<string, string> = {
    available: '空闲',
    occupied: '占用',
    maintenance: '维护',
  }
  return map[value] || value
}

function statusTagType(value: string) {
  const map: Record<string, string> = {
    available: 'success',
    occupied: 'warning',
    maintenance: 'info',
  }
  return map[value] || 'info'
}

onMounted(fetchList)
</script>

<template>
  <div class="seat-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="goBack">← 返回自习室列表</el-button>
            <span class="room-title">座位管理 - 自习室 #{{ roomId }}</span>
          </div>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="openCreate">新增座位</el-button>
            <el-button type="success" @click="openBatchCreate">批量新增</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="seat_number" label="座位编号" min-width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="success" size="small" @click="openSeatCode(row)">签到码</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 单个新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增座位' : '编辑座位'" width="420px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="座位编号">
          <el-input v-model="form.seat_number" placeholder="如 A-01" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="空闲" value="available" />
            <el-option label="占用" value="occupied" />
            <el-option label="维护" value="maintenance" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量新增弹窗 -->
    <el-dialog v-model="batchDialogVisible" title="批量新增座位" width="520px">
      <div class="batch-hint">
        <p>请输入座位编号，每行一个，或用逗号/中文逗号分隔：</p>
        <p class="example">示例：A-01 或 A-01, A-02, A-03</p>
      </div>
      <el-input v-model="batchInput" type="textarea" :rows="8" placeholder="请输入座位编号..." />
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchDialogLoading" @click="handleBatchSubmit"> 批量创建 </el-button>
      </template>
    </el-dialog>

    <!-- 签到码弹窗 -->
    <el-dialog v-model="seatCodeDialogVisible" title="座位签到码" width="420px">
      <div style="text-align: center" v-loading="seatCodeLoading">
        <p style="margin-bottom: 16px">
          座位 <strong>{{ seatCodeName }}</strong>
        </p>
        <img
          v-if="seatCodeQrcode"
          :src="seatCodeQrcode"
          alt="签到二维码"
          style="width: 200px; height: 200px; border: 1px solid #ebeef5; border-radius: 8px"
        />
        <div style="margin-top: 12px; font-size: 16px; font-family: monospace; color: #606266; letter-spacing: 3px">
          签到码：{{ seatCodeValue }}
        </div>
        <p style="margin-top: 8px; font-size: 12px; color: #909399">
          学生可扫描二维码或在"我的预约"中输入签到码进行签到
        </p>
      </div>
      <template #footer>
        <el-button @click="seatCodeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.seat-page { padding: 40px 48px; }
.card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.room-title { font-size: 18px; font-weight: 700; color: var(--sk-text); }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
.batch-hint { margin-bottom: 12px; color: var(--sk-text-secondary); }
.batch-hint .example { font-size: 12px; color: var(--sk-text-tertiary); margin-top: 4px; }
:deep(.el-table) { border-radius: 16px; overflow: hidden; }
:deep(.el-table th) { background: rgba(255,255,255,.04) !important; color: var(--sk-text-secondary) !important; font-weight: 600; font-size: 12px; border: none; text-transform: uppercase; letter-spacing: .5px; }
:deep(.el-table td) { border-color: var(--sk-border); color: var(--sk-text); }
</style>
