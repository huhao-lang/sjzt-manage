<template>
  <div class="user-management">
    <el-row :gutter="16">
      <!-- 左侧机构树 -->
      <el-col :span="5">
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
          >
            <template #empty>
              <span class="tree-empty">暂无数据</span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :span="19">
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
                <el-button type="info" link size="small" @click="handleResetPassword(row)">
                  重置密码
                </el-button>
                <el-button type="info" link size="small" @click="handleAssignRole(row)">
                  分配角色
                </el-button>
                <el-button type="primary" link size="small" @click="handlePush(row)">
                  推送
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
      </el-col>
    </el-row>

    <!-- 新增/编辑弹窗 -->
    <UserEditDialog
      ref="userEditDialogRef"
      v-model:visible="editDialogVisible"
      :office-tree="officeTree"
      @success="loadData"
    />

    <!-- 分配角色弹窗 -->
    <AssignRoleDialog
      ref="assignRoleDialogRef"
      v-model:visible="roleDialogVisible"
      @success="loadData"
    />

    <!-- 推送用户弹窗 -->
    <UserPushDialog
      ref="userPushDialogRef"
      v-model:visible="pushDialogVisible"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Lock, Unlock, Delete, Key } from '@element-plus/icons-vue'
import { getUserList, enableUser, deleteUser, resetPassword, getUserOfficeTree } from '@/api/user'
import type { User, Office } from '@/types'
import UserEditDialog from './components/UserEditDialog.vue'
import AssignRoleDialog from './components/AssignRoleDialog.vue'
import UserPushDialog from './components/UserPushDialog.vue'
import { useAuthStore } from '@/stores/auth'
const authStore=useAuthStore()
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

// 弹窗相关
const editDialogVisible = ref(false)
const userEditDialogRef = ref()
const roleDialogVisible = ref(false)
const assignRoleDialogRef = ref()
const pushDialogVisible = ref(false)
const userPushDialogRef = ref()

// 获取选中的ID
const getSelectedIds = () => {
  return selectedRows.value.map(row => row.id).join(',')
}

// 扁平数据转树形结构
const listToTree = (list: any[]) => {
  const validList = list.filter(item => item.id !== null && item.id !== undefined)

  const map: Record<string, any> = {}
  const roots: any[] = []

  const getSortValue = (value: unknown) => {
    const sort = Number(value)
    return Number.isFinite(sort) ? sort : Number.MAX_SAFE_INTEGER
  }

  const sortTree = (nodes: any[]) => {
    nodes.sort((a, b) => getSortValue(a.sort) - getSortValue(b.sort))
    nodes.forEach(node => {
      if (node.children?.length) {
        sortTree(node.children)
      }
    })
  }

  validList.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })

  validList.forEach(item => {
    const node = map[item.id]
    const parentId = item.parentId

    if (parentId === '-1' || parentId === null || parentId === undefined || !map[parentId]) {
      roots.push(node)
    } else {
      map[parentId].children.push(node)
    }
  })

  sortTree(roots)

  const removeEmptyChildren = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.children.length === 0) {
        delete node.children
      } else {
        removeEmptyChildren(node.children)
      }
    })
  }
  removeEmptyChildren(roots)

  return roots
}

// 加载机构树
const loadOfficeTree = async () => {
  try {
    const list = await getUserOfficeTree()
    officeTree.value = listToTree(list || [])
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
      name: searchForm.name || undefined,
      currentUserId: authStore.userInfo?.id
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
  userEditDialogRef.value?.open()
}

// 编辑
const handleEdit = (row: User) => {
  userEditDialogRef.value?.open(row.id.toString())
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
  assignRoleDialogRef.value?.open(row.id.toString())
}

// 推送用户
const handlePush = (row: User) => {
  userPushDialogRef.value?.open(row.id.toString())
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
