<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsersApi, updateUserApi, deleteUserApi } from '@/api/user'

// ── 列表数据 ──
const list = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const search = ref('')
const page = ref(1)
const limit = ref(10)

// ── 编辑弹窗 ──
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const editForm = reactive({
  id: 0,
  username: '',
  role: '',
})

// ── 获取用户列表 ──
async function fetchList() {
  loading.value = true
  try {
    const res = await getUsersApi({ page: page.value, limit: limit.value, search: search.value })
    list.value = res.data.items
    total.value = res.data.total
  } catch {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// ── 搜索 ──
function handleSearch() {
  page.value = 1
  fetchList()
}

// ── 分页 ──
function handlePageChange(p: number) {
  page.value = p
  fetchList()
}

// ── 打开编辑弹窗 ──
function openEdit(row: any) {
  editForm.id = row.id
  editForm.username = row.username
  editForm.role = row.role
  dialogVisible.value = true
}

// ── 确认编辑 ──
async function handleEdit() {
  dialogLoading.value = true
  try {
    await updateUserApi(editForm.id, { role: editForm.role })
    ElMessage.success('更新成功')
    dialogVisible.value = false
    fetchList()
  } catch {
    ElMessage.error('更新失败')
  } finally {
    dialogLoading.value = false
  }
}

// ── 删除用户 ──
async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
  } catch {
    return // 用户取消
  }
  try {
    await deleteUserApi(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '删除失败')
  }
}

// ── 角色标签样式 ──
function roleTagType(role: string) {
  return role === 'admin' ? 'danger' : role === 'teacher' ? 'warning' : 'info'
}
function roleLabel(role: string) {
  return role === 'admin' ? '管理员' : role === 'teacher' ? '教师' : '学生'
}

onMounted(fetchList)
</script>

<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>👥 用户管理</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="toolbar">
        <el-input
          v-model="search"
          placeholder="搜索用户名"
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

      <!-- 用户表格 -->
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)" size="small">
              {{ roleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleDateString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑用户" width="450px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input :model-value="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role" style="width: 100%">
            <el-option label="管理员 (admin)" value="admin" />
            <el-option label="教师 (teacher)" value="teacher" />
            <el-option label="学生 (student)" value="student" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="handleEdit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.users-page { padding: 20px; }
.card-header { font-size: 16px; font-weight: 600; }
.toolbar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
