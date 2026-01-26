<template>
  <div class="user-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="toolbar-card">
      <el-button type="primary" @click="handleAdd" v-permission="'user:create'">
        <el-icon>
          <Plus />
        </el-icon>
        新增用户
      </el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete"
        v-permission="'user:delete'">
        <el-icon>
          <Delete />
        </el-icon>
        批量删除
      </el-button>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="officeName" label="所属机构" min-width="150" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)" v-permission="'user:edit'">
              编辑
            </el-button>
            <el-button type="warning" size="small" @click="handleAssignRole(row)" v-permission="'user:role'">
              分配角色
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)" v-permission="'user:delete'">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import type { User } from '@/types'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  username: '',
  name: '',
  status: undefined as number | undefined
})

// 表格数据
const tableData = ref<User[]>([])
const loading = ref(false)
const selectedIds = ref<number[]>([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const { getUserList } = await import('@/api/user')
    const res = await getUserList({
      current: pagination.current,
      size: pagination.size,
      username: searchForm.username || undefined,
      name: searchForm.name || undefined,
      status: searchForm.status
    })
    
    tableData.value = res.records
    pagination.total = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
    // 失败时使用模拟数据
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.name = ''
  searchForm.status = undefined
  handleSearch()
}

// 新增
const handleAdd = () => {
  router.push('/admin/user/edit')
}

// 编辑
const handleEdit = (row: User) => {
  router.push(`/admin/user/edit/${row.id}`)
}

// 分配角色
const handleAssignRole = (row: User) => {
  router.push(`/admin/user/role/${row.id}`)
}

// 删除
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.name}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const { deleteUser } = await import('@/api/user')
    await deleteUser(row.id)

    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个用户吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const { batchDeleteUser } = await import('@/api/user')
    await batchDeleteUser(selectedIds.value)
    
    ElMessage.success('删除成功')
    selectedIds.value = []
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 选择变化
const handleSelectionChange = (selection: User[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

// 分页大小变化
const handleSizeChange = () => {
  loadData()
}

// 当前页变化
const handleCurrentChange = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.user-management {
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
