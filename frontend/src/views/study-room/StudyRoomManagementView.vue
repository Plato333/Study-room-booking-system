<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  createStudyRoomApi,
  deleteStudyRoomApi,
  getStudyRoomsApi,
  updateStudyRoomApi,
  type StudyRoomPayload,
} from '@/api/studyRoom'

interface StudyRoom extends StudyRoomPayload {
  id: number
  created_at: string
  updated_at: string
}

const router = useRouter()
const list = ref<StudyRoom[]>([])
const total = ref(0)
const loading = ref(false)
const search = ref('')
const page = ref(1)
const limit = ref(10)

const dialogVisible = ref(false)
const dialogLoading = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

const form = reactive<StudyRoomPayload & { id?: number }>({
  name: '',
  location: '',
  open_time: '08:00',
  close_time: '22:00',
  status: 'open',
})

function resetForm() {
  form.id = undefined
  form.name = ''
  form.location = ''
  form.open_time = '08:00'
  form.close_time = '22:00'
  form.status = 'open'
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getStudyRoomsApi({
      page: page.value,
      limit: limit.value,
      search: search.value || undefined,
    })
    list.value = res.data.items
    total.value = res.data.total
  } catch {
    ElMessage.error('获取自习室列表失败')
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

function openCreate() {
  resetForm()
  dialogMode.value = 'create'
  dialogVisible.value = true
}

function openEdit(row: StudyRoom) {
  form.id = row.id
  form.name = row.name
  form.location = row.location
  form.open_time = row.open_time
  form.close_time = row.close_time
  form.status = row.status
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

function buildPayload(): StudyRoomPayload {
  return {
    name: form.name,
    location: form.location,
    open_time: form.open_time,
    close_time: form.close_time,
    status: form.status,
  }
}

async function handleSubmit() {
  dialogLoading.value = true
  try {
    if (dialogMode.value === 'create') {
      await createStudyRoomApi(buildPayload())
      ElMessage.success('新增成功')
    } else if (form.id) {
      await updateStudyRoomApi(form.id, buildPayload())
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

async function handleDelete(row: StudyRoom) {
  try {
    await ElMessageBox.confirm(`确定要删除自习室"${row.name}"吗？关联的座位也会被删除。`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  try {
    await deleteStudyRoomApi(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '删除失败')
  }
}

function goToSeats(row: StudyRoom) {
  router.push({ name: 'study-room-seats', params: { roomId: row.id } })
}

function statusLabel(value: string) {
  return value === 'open' ? '开放' : '关闭'
}

onMounted(fetchList)
</script>

<template>
  <div class="study-room-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>自习室管理</span>
          <el-button type="primary" :icon="Plus" @click="openCreate">新增自习室</el-button>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="search"
          placeholder="搜索自习室名称"
          clearable
          style="width: 240px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="自习室名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="location" label="位置" min-width="180" show-overflow-tooltip />
        <el-table-column label="开放时间" width="120">
          <template #default="{ row }">{{ row.open_time }} - {{ row.close_time }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'open' ? 'success' : 'info'" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="290" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="success" size="small" @click="goToSeats(row)">座位管理</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增自习室' : '编辑自习室'" width="520px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入自习室名称" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="form.location" placeholder="请输入位置" />
        </el-form-item>
        <el-form-item label="开放时间">
          <el-time-select
            v-model="form.open_time"
            start="06:00"
            step="00:30"
            end="23:00"
            placeholder="开放时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="关闭时间">
          <el-time-select
            v-model="form.close_time"
            start="06:00"
            step="00:30"
            end="23:00"
            placeholder="关闭时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="open">开放</el-radio>
            <el-radio value="closed">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.study-room-page {
  padding: 40px 48px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}
:deep(.el-card) {
  background: rgba(255, 255, 255, 0.04) !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  border: 1px solid var(--sk-border) !important;
}
</style>
