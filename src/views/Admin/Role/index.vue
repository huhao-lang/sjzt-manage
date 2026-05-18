<template>
  <div class="role-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="角色名">
          <el-input v-model="searchForm.name" placeholder="角色名" clearable @keyup.enter="handleSearch" />
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
      <el-button @click="handleBatchPermission">
        <el-icon><Setting /></el-icon>
        功能分配
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
        <el-table-column prop="name" label="角色名" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isEnable" label="是否启用" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEnable ? 'success' : 'warning'">
              {{ row.isEnable ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
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
            <el-button type="info" link size="small" @click="handlePermission(row)">
              角色授权
            </el-button>
            <el-button type="primary" link size="small" @click="handleDeptAssign(row)">
              部门分配
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
    <RoleEditDialog
      ref="editDialogRef"
      v-model:visible="editDialogVisible"
      @success="loadData"
    />

    <!-- 角色授权弹窗 -->
    <RolePermissionDialog
      ref="permissionDialogRef"
      v-model:visible="permissionDialogVisible"
      @success="loadData"
    />

    <!-- 部门分配弹窗 -->
    <RoleDeptDialog
      ref="deptDialogRef"
      v-model:visible="deptDialogVisible"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Lock, Unlock, Delete, Setting } from '@element-plus/icons-vue'
import { getRoleList, enableRole, deleteRole } from '@/api/role'
import type { Role } from '@/types'
import RoleEditDialog from './components/RoleEditDialog.vue'
import RolePermissionDialog from './components/RolePermissionDialog.vue'
import RoleDeptDialog from './components/RoleDeptDialog.vue'

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 表格数据
const tableRef = ref()
const tableData = ref<Role[]>([])
const loading = ref(false)
const selectedRows = ref<Role[]>([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 弹窗相关
const editDialogVisible = ref(false)
const editDialogRef = ref()
const permissionDialogVisible = ref(false)
const permissionDialogRef = ref()
const deptDialogVisible = ref(false)
const deptDialogRef = ref()

// 获取选中的ID
const getSelectedIds = () => {
  return selectedRows.value.map(row => row.id).join(',')
}

// 加载角色列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await getRoleList({
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
const handleSelectionChange = (rows: Role[]) => {
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
  editDialogRef.value?.open()
}

// 编辑
const handleEdit = (row: Role) => {
  editDialogRef.value?.open(row)
}

// 单个启用
const handleEnable = async (row: Role) => {
  try {
    await enableRole(row.id.toString(), true)
    ElMessage.success('启用成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '启用失败')
  }
}

// 单个禁用
const handleDisable = async (row: Role) => {
  try {
    await enableRole(row.id.toString(), false)
    ElMessage.success('禁用成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '禁用失败')
  }
}

// 单个删除
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm('删除角色会影响关联的权限，确认要删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRole(row.id.toString())
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
    await enableRole(ids, true)
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
    await enableRole(ids, false)
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
    await ElMessageBox.confirm('删除角色会影响关联的用户及权限，确认要删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRole(ids)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 角色授权
const handlePermission = (row: Role) => {
  permissionDialogRef.value?.open(row)
}

// 批量角色授权
const handleBatchPermission = () => {
  if (selectedRows.value.length !== 1) {
    ElMessage.warning('请选择一条记录')
    return
  }
  handlePermission(selectedRows.value[0])
}

// 部门分配
const handleDeptAssign = (row: Role) => {
  deptDialogRef.value?.open(row.id.toString())
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.role-management {
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
