<template>
  <div class="app-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="请输入应用名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="toolbar-card">
      <el-button type="primary" @click="handleAdd" v-permission="'app:create'">
        <el-icon><Plus /></el-icon>
        新增
      </el-button>
      <el-button type="warning" :disabled="selectedIds.length === 0" @click="handleBatchEnable(false)" v-permission="'app:enable'">
        <el-icon><Lock /></el-icon>
        禁用
      </el-button>
      <el-button type="success" :disabled="selectedIds.length === 0" @click="handleBatchEnable(true)" v-permission="'app:enable'">
        <el-icon><Unlock /></el-icon>
        启用
      </el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete" v-permission="'app:delete'">
        <el-icon><Delete /></el-icon>
        删除
      </el-button>
      <el-button type="info" :disabled="selectedIds.length !== 1" @click="handleViewCredentials" v-permission="'app:credentials'">
        <el-icon><View /></el-icon>
        查看应用密钥信息
      </el-button>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="150" align="left" />
        <el-table-column prop="code" label="编码" min-width="150" align="left" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="isEnable" label="是否启用" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEnable ? 'success' : 'warning'">
              {{ row.isEnable ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)" v-permission="'app:edit'">
              修改
            </el-button>
            <el-button v-if="row.isEnable" type="warning" size="small" @click="handleEnable(row, false)" v-permission="'app:enable'">
              禁用
            </el-button>
            <el-button v-else type="success" size="small" @click="handleEnable(row, true)" v-permission="'app:enable'">
              启用
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)" v-permission="'app:delete'">
              删除
            </el-button>
            <el-button type="info" size="small" @click="handleViewCredentials(row)" v-permission="'app:credentials'">
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
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 查看应用密钥信息对话框 -->
    <el-dialog v-model="credentialsDialogVisible" title="查看应用密钥信息" width="600px">
      <el-form label-width="120px">
        <el-form-item label="ClientId">
          <el-input v-model="credentials.clientId" readonly>
            <template #append>
              <el-button @click="copyToClipboard(credentials.clientId)">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="ClientSecret">
          <el-input v-model="credentials.clientSecret" readonly>
            <template #append>
              <el-button @click="copyToClipboard(credentials.clientSecret)">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="danger" @click="credentialsDialogVisible = false">
          <el-icon><Close /></el-icon>
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Lock, Unlock, Delete, View, CopyDocument, Close } from '@element-plus/icons-vue'
import type { App } from '@/types'

const router = useRouter()

const searchForm = reactive({
  name: ''
})

const tableData = ref<App[]>([])
const loading = ref(false)
const selectedIds = ref<number[]>([])
const credentialsDialogVisible = ref(false)
const credentials = reactive({
  clientId: '',
  clientSecret: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const { getAppList } = await import('@/api/app')
    const res = await getAppList({
      current: pagination.current,
      size: pagination.size,
      name: searchForm.name || undefined
    })
    
    tableData.value = res.records
    pagination.total = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  handleSearch()
}

const handleSelectionChange = (selection: App[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const handleAdd = () => {
  router.push('/admin/app/edit')
}

const handleEdit = (row: App) => {
  router.push(`/admin/app/edit/${row.id}`)
}

const handleEnable = async (row: App, enable: boolean) => {
  try {
    // TODO: 调用启用/禁用接口
    ElMessage.success(enable ? '启用成功' : '禁用成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleBatchEnable = async (enable: boolean) => {
  try {
    await ElMessageBox.confirm(`确定要${enable ? '启用' : '禁用'}选中的 ${selectedIds.value.length} 个应用吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用批量启用/禁用接口
    ElMessage.success(enable ? '启用成功' : '禁用成功')
    selectedIds.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleDelete = async (row: App) => {
  try {
    await ElMessageBox.confirm('删除应用会关联删除对应的权限,确认要删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const { deleteApp } = await import('@/api/app')
    await deleteApp(row.id)
    
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`删除应用会关联删除对应的权限,确认要删除选中的 ${selectedIds.value.length} 个应用吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用批量删除接口
    ElMessage.success('删除成功')
    selectedIds.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

const handleViewCredentials = async (row?: App) => {
  try {
    const appId = row ? row.id : selectedIds.value[0]
    // TODO: 调用获取密钥接口
    // const { getAppCredentials } = await import('@/api/app')
    // const data = await getAppCredentials(appId)
    
    // 模拟数据
    credentials.clientId = 'client_id_' + appId
    credentials.clientSecret = 'client_secret_' + appId
    
    credentialsDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取密钥信息失败')
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
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
