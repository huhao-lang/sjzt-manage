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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Lock, Unlock, Delete } from '@element-plus/icons-vue'
import { getOfficeTree, enableOffice, deleteOffice } from '@/api/office'
import type { Office } from '@/types' 

const router = useRouter()

const tableRef = ref()
const officeTree = ref<Office[]>([])
const loading = ref(false)
const selectedRows = ref<Office[]>([])

const loadOfficeTree = async () => {
  loading.value = true
  try {
    officeTree.value = await getOfficeTree()
  } catch (error: any) {
    ElMessage.error(error.message || '加载机构树失败')
    officeTree.value = []
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (rows: Office[]) => {
  selectedRows.value = rows
}

const getSelectedIds = () => {
  return selectedRows.value.map(row => row.id).join(',')
}

const handleAdd = () => {
  router.push('/admin/office/edit')
}

const handleEdit = (row: Office) => {
  router.push(`/admin/office/edit?id=${row.id}`)
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
