<template>
  <div class="user-management">
    <el-row :gutter="16">
      <!-- 左侧机构树 -->
      <el-col :span="4">
        <el-card class="tree-card">
          <template #header>
            <span>机构</span>
          </template>
          <el-tree
            ref="treeRef"
            :data="officeTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :span="20">
        <!-- 搜索栏 -->
        <el-card class="search-card">
          <el-form :model="searchForm" :inline="true">
            <el-form-item label="登录名">
              <el-input v-model="searchForm.account" placeholder="登录名" clearable @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="searchForm.name" placeholder="姓名" clearable @keyup.enter="handleSearch" />
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
          <el-button @click="handleBatchResetPassword">
            <el-icon><Key /></el-icon>
            重置密码
          </el-button>
          <el-button @click="handleBatchAssignRole">
            <el-icon><Setting /></el-icon>
            分配角色
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
            <el-table-column prop="name" label="姓名" min-width="100" />
            <el-table-column prop="account" label="登录名" min-width="120" />
            <el-table-column prop="lastLoginTime" label="最后登录时间" min-width="160" />
            <el-table-column prop="isEnable" label="是否启用" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isEnable ? 'success' : 'warning'">
                  {{ row.isEnable ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
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
                <el-button type="info" link size="small" @click="handleResetPassword(row)">
                  重置密码
                </el-button>
                <el-button type="info" link size="small" @click="handleAssignRole(row)">
                  分配角色
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
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Lock, Unlock, Delete, Key, Setting } from '@element-plus/icons-vue'
import { getUserList, enableUser, deleteUser, resetPassword } from '@/api/user'
import { getOfficeTree } from '@/api/office'
import type { User, Office } from '@/types'

const router = useRouter()

// 机构树
const treeRef = ref()
const officeTree = ref<Office[]>([])

// 搜索表单
const searchForm = reactive({
  officeId: '' as string,
  account: '',
  name: ''
})

// 表格数据
const tableRef = ref()
const tableData = ref<User[]>([])
const loading = ref(false)
const selectedRows = ref<User[]>([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 获取选中的ID
const getSelectedIds = () => {
  return selectedRows.value.map(row => row.id).join(',')
}

// 加载机构树
const loadOfficeTree = async () => {
  try {
    officeTree.value = await getOfficeTree()
  } catch (error) {
    console.error('加载机构树失败:', error)
    officeTree.value = []
  }
}

// 加载用户列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      current: pagination.current,
      size: pagination.size,
      officeId: searchForm.officeId || undefined,
      account: searchForm.account || undefined,
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

// 点击机构树节点
const handleNodeClick = (node: Office) => {
  searchForm.officeId = node.id
  pagination.current = 1
  loadData()
}

// 选择变化
const handleSelectionChange = (rows: User[]) => {
  selectedRows.value = rows
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.officeId = ''
  searchForm.account = ''
  searchForm.name = ''
  treeRef.value?.setCurrentKey(null)
  handleSearch()
}

// 新增
const handleAdd = () => {
  router.push('/admin/user/edit')
}

// 编辑
const handleEdit = (row: User) => {
  router.push(`/admin/user/edit?id=${row.id}`)
}

// 单个启用
const handleEnable = async (row: User) => {
  try {
    await enableUser(row.id.toString(), true)
    ElMessage.success('启用成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '启用失败')
  }
}

// 单个禁用
const handleDisable = async (row: User) => {
  try {
    await enableUser(row.id.toString(), false)
    ElMessage.success('禁用成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '禁用失败')
  }
}

// 单个删除
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm('删除用户会关联对应的角色、权限，确认要删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteUser(row.id.toString())
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 单个重置密码
const handleResetPassword = async (row: User) => {
  try {
    await ElMessageBox.confirm('确认重置密码?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await resetPassword(row.id.toString())
    ElMessage.success('重置密码成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '重置密码失败')
    }
  }
}

// 分配角色
const handleAssignRole = (row: User) => {
  router.push(`/admin/user-role?userId=${row.id}`)
}

// 批量启用
const handleBatchEnable = async () => {
  const ids = getSelectedIds()
  if (!ids) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  try {
    await enableUser(ids, true)
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
    await enableUser(ids, false)
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
    await ElMessageBox.confirm('删除用户会关联对应的角色、权限，确认要删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteUser(ids)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量重置密码
const handleBatchResetPassword = async () => {
  const ids = getSelectedIds()
  if (!ids) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  try {
    await ElMessageBox.confirm('确认重置密码?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await resetPassword(ids)
    ElMessage.success('重置密码成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '重置密码失败')
    }
  }
}

// 批量分配角色
const handleBatchAssignRole = () => {
  const ids = getSelectedIds()
  if (!ids) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  router.push(`/admin/user-role?userId=${ids}`)
}

onMounted(() => {
  loadOfficeTree()
  loadData()
})
</script>

<style scoped lang="scss">
.user-management {
  .tree-card {
    height: calc(100vh - 140px);
    overflow: auto;
  }

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
