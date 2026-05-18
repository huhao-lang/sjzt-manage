<template>
  <div class="permission-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="菜单名称">
          <el-input v-model="searchName" placeholder="请输入菜单名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 权限树表格 -->
    <el-card>
      <template #header>
        <el-button type="primary" @click="handleAddRoot">新增</el-button>
      </template>
      <el-table
        ref="tableRef"
        :data="permissionList"
        v-loading="loading"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="名称" min-width="200">
          <template #default="{ row }">
            <el-icon v-if="row.icon" style="margin-right: 5px; vertical-align: middle;">
              <component :is="row.icon" />
            </el-icon>
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="perms" label="权限标识" min-width="150" />
        <el-table-column prop="url" label="路由路径" min-width="150" />
        <el-table-column prop="component" label="组件路径" min-width="180" />
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column prop="menuType" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.menuType === 0" type="info" size="small">目录</el-tag>
            <el-tag v-else-if="row.menuType === 1" type="primary" size="small">菜单</el-tag>
            <el-tag v-else type="warning" size="small">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="visible" label="显示" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.visible !== false ? 'success' : 'info'" size="small">
              {{ row.visible !== false ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isEnable" label="状态" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isEnable ? 'success' : 'danger'" size="small">
              {{ row.isEnable ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleAdd(row)">
              添加
            </el-button>
            <el-button type="success" link size="small" @click="handleEdit(row)">
              修改
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑弹窗 -->
    <PermissionEditDialog
      ref="editDialogRef"
      v-model:visible="editDialogVisible"
      :permission-list="permissionTreeData?.children || []"
      @success="loadPermissionTree"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Permission } from '@/types'
import { getPermissionTree, deletePermission } from '@/api/permission'
import PermissionEditDialog from './components/PermissionEditDialog.vue'

const tableRef = ref()

// 搜索
const searchName = ref('')

// 权限树原始数据（包含根节点）
const permissionTreeData = ref<Permission | null>(null)
const loading = ref(false)

// 弹窗相关
const editDialogVisible = ref(false)
const editDialogRef = ref()

// 获取一级权限列表（根节点的children）
const permissionList = computed(() => {
  return permissionTreeData.value?.children || []
})

// 加载权限树
const loadPermissionTree = async () => {
  loading.value = true
  try {
    const data = await getPermissionTree(searchName.value ? { name: searchName.value } : undefined)
    // 后端返回的是数组，第一个元素是根节点
    if (Array.isArray(data) && data.length > 0) {
      permissionTreeData.value = data[0] as Permission
    } else {
      permissionTreeData.value = null
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载权限树失败')
    permissionTreeData.value = null
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  loadPermissionTree()
}

// 重置
const handleReset = () => {
  searchName.value = ''
  loadPermissionTree()
}

// 新增根级菜单
const handleAddRoot = () => {
  editDialogRef.value?.openAdd({ id: null } as any)
}

// 新增权限（添加子节点）
const handleAdd = (row: Permission) => {
  editDialogRef.value?.openAdd(row)
}

// 编辑权限
const handleEdit = (row: Permission) => {
  editDialogRef.value?.openEdit(row)
}

// 删除权限
const handleDelete = async (row: Permission) => {
  try {
    await ElMessageBox.confirm('会删除该权限所有子权限，确认要删除吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deletePermission(row.id)
    ElMessage.success('删除成功')
    await loadPermissionTree()
  } catch (error: any) {
    // 用户点击取消不做处理
    if (error === 'cancel' || error?.message === 'cancel') {
      return
    }
    ElMessage.error(error?.message || '删除失败')
  }
}

onMounted(() => {
  loadPermissionTree()
})
</script>

<style scoped lang="scss">
.permission-management {
  .search-card {
    margin-bottom: 16px;
  }
}
</style>
