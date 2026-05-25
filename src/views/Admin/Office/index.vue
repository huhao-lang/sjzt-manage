<template>
  <div class="office-management">
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
    </el-card>

    <!-- 机构树表格 -->
    <el-card>
      <el-table
        ref="tableRef"
        :data="officeTree"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        v-loading="loading"
        default-expand-all
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="isEnable" label="是否启用" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEnable ? 'success' : 'warning'">
              {{ row.isEnable ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <OfficeEditDialog
      ref="editDialogRef"
      v-model:visible="editDialogVisible"
      :office-tree="officeTree"
      @success="loadOfficeTree"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Lock, Unlock, Delete } from '@element-plus/icons-vue'
import { getOfficeTree, enableOffice, deleteOffice } from '@/api/office'
import type { Office } from '@/types'
import OfficeEditDialog from './components/OfficeEditDialog.vue'

// 表格数据
const tableRef = ref()
const officeTree = ref<Office[]>([])
const loading = ref(false)
const selectedRows = ref<Office[]>([])

// 弹窗相关
const editDialogVisible = ref(false)
const editDialogRef = ref()

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
  loading.value = true
  try {
    const list = await getOfficeTree()
    officeTree.value = listToTree(list || [])
  } catch (error: any) {
    ElMessage.error(error.message || '加载机构树失败')
    officeTree.value = []
  } finally {
    loading.value = false
  }
}

// 选择变化
const handleSelectionChange = (rows: Office[]) => {
  selectedRows.value = rows
}

// 新增
const handleAdd = () => {
  editDialogRef.value?.open()
}

// 编辑
const handleEdit = (row: Office) => {
  editDialogRef.value?.open(row)
}

// 单个启用
const handleEnable = async (row: Office) => {
  try {
    await enableOffice(row.id, true)
    ElMessage.success('启用成功')
    loadOfficeTree()
  } catch (error: any) {
    ElMessage.error(error.message || '启用失败')
  }
}

// 单个禁用
const handleDisable = async (row: Office) => {
  try {
    await enableOffice(row.id, false)
    ElMessage.success('禁用成功')
    loadOfficeTree()
  } catch (error: any) {
    ElMessage.error(error.message || '禁用失败')
  }
}

// 单个删除
const handleDelete = async (row: Office) => {
  try {
    await ElMessageBox.confirm('确认删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteOffice(row.id)
    ElMessage.success('删除成功')
    loadOfficeTree()
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
    await enableOffice(ids, true)
    ElMessage.success('启用成功')
    loadOfficeTree()
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
    await enableOffice(ids, false)
    ElMessage.success('禁用成功')
    loadOfficeTree()
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
    await ElMessageBox.confirm('确认删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteOffice(ids)
    ElMessage.success('删除成功')
    loadOfficeTree()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadOfficeTree()
})
</script>

<style scoped lang="scss">
.office-management {
  .toolbar-card {
    margin-bottom: 16px;
  }
}
</style>
