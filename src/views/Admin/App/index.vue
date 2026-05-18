<template>
  <div class="app-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="toolbar-card">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增
      </el-button>
      <el-button type="warning" @click="handleBatchDisable">
        <el-icon><Lock /></el-icon>
        禁用
      </el-button>
      <el-button type="success" @click="handleBatchEnable">
        <el-icon><Unlock /></el-icon>
        启用
      </el-button>
      <el-button type="danger" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        删除
      </el-button>
      <el-button @click="handleBatchViewCredentials">
        <el-icon><View /></el-icon>
        查看应用密钥信息
      </el-button>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column prop="code" label="编码" min-width="150" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="isEnable" label="是否启用" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEnable ? 'success' : 'warning'">
              {{ row.isEnable ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userSyncUrl" label="用户同步地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="deptSyncUrl" label="部门同步地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              修改
            </el-button>
            <el-button
              v-if="row.isEnable"
              type="warning"
              link
              size="small"
              @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              link
              size="small"
              @click="handleEnable(row)"
            >
              启用
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
            <el-button type="info" link size="small" @click="handleViewCredentials(row)">
              查看密钥
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          :hide-on-single-page="false"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <AppEditDialog
      v-model="dialogVisible"
      :edit-data="currentEditApp"
      @success="loadData"
    />

    <!-- 查看应用密钥信息弹窗 -->
    <CredentialsDialog
      v-model="credentialsDialogVisible"
      :app="currentCredentialsApp"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Lock, Unlock, Delete, View } from '@element-plus/icons-vue'
import { getAppList, enableApp, deleteApp } from '@/api/app'
import type { App } from '@/types'
import AppEditDialog from './components/AppEditDialog.vue'
import CredentialsDialog from './components/CredentialsDialog.vue'

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 表格数据
const tableRef = ref()
const tableData = ref<App[]>([])
const loading = ref(false)
const selectedRows = ref<App[]>([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 弹窗相关
const dialogVisible = ref(false)
const currentEditApp = ref<App | null>(null)

// 密钥弹窗
const credentialsDialogVisible = ref(false)
const currentCredentialsApp = ref<App | null>(null)

// 获取选中的ID
const getSelectedIds = () => {
  return selectedRows.value.map(row => row.id).join(',')
}

// 加载应用列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getAppList({
      current: pagination.current,
      size: pagination.size,
      name: searchForm.name || undefined
    })
    tableData.value = res.records
    pagination.total = Number(res.total) || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 选择变化
const handleSelectionChange = (rows: App[]) => {
  selectedRows.value = rows
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  currentEditApp.value = null
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: App) => {
  currentEditApp.value = row
  dialogVisible.value = true
}

// 单个启用
const handleEnable = async (row: App) => {
  try {
    await enableApp(row.id.toString(), true)
    ElMessage.success('启用成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '启用失败')
  }
}

// 单个禁用
const handleDisable = async (row: App) => {
  try {
    await enableApp(row.id.toString(), false)
    ElMessage.success('禁用成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '禁用失败')
  }
}

// 单个删除
const handleDelete = async (row: App) => {
  try {
    await ElMessageBox.confirm('删除应用会关联删除对应的权限，确认要删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteApp(row.id.toString())
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量启用
const handleBatchEnable = async () => {
  const ids = getSelectedIds()
  if (!ids) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  try {
    await enableApp(ids, true)
    ElMessage.success('启用成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '启用失败')
  }
}

// 批量禁用
const handleBatchDisable = async () => {
  const ids = getSelectedIds()
  if (!ids) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  try {
    await enableApp(ids, false)
    ElMessage.success('禁用成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '禁用失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  const ids = getSelectedIds()
  if (!ids) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  try {
    await ElMessageBox.confirm('删除应用会关联删除对应的权限，确认要删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteApp(ids)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 查看密钥
const handleViewCredentials = (row: App) => {
  currentCredentialsApp.value = row
  credentialsDialogVisible.value = true
}

// 批量查看密钥
const handleBatchViewCredentials = () => {
  if (selectedRows.value.length !== 1) {
    ElMessage.warning('请选择一条记录')
    return
  }
  handleViewCredentials(selectedRows.value[0])
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.app-management {
  .search-card,
  .toolbar-card {
    margin-bottom: 16px;
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
