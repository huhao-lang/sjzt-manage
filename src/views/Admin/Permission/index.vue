<template>
  <div class="permission-management">
    <!-- 操作栏 -->
    <el-card class="toolbar-card">
      <el-button type="primary" @click="handleAdd" v-permission="'permission:create'">
        <el-icon><Plus /></el-icon>
        新增权限
      </el-button>
      <el-button @click="handleExpandAll">
        <el-icon><Expand /></el-icon>
        展开全部
      </el-button>
      <el-button @click="handleCollapseAll">
        <el-icon><Fold /></el-icon>
        折叠全部
      </el-button>
    </el-card>

    <!-- 权限树表格 -->
    <el-card>
      <el-table
        ref="tableRef"
        :data="permissionTree"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        v-loading="loading"
        default-expand-all
      >
        <el-table-column prop="name" label="权限名称" min-width="200" />
        <el-table-column prop="code" label="权限编码" min-width="180" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'menu' ? 'primary' : 'success'">
              {{ row.type === 'menu' ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="路由地址" min-width="180" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)" v-permission="'permission:edit'">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)" v-permission="'permission:delete'">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑权限' : '新增权限'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="上级权限" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="permissionTree"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择上级权限"
            check-strictly
            clearable
          />
        </el-form-item>

        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入权限名称" />
        </el-form-item>

        <el-form-item label="权限编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入权限编码" />
        </el-form-item>

        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="路由地址" prop="url" v-if="formData.type === 'menu'">
          <el-input v-model="formData.url" placeholder="请输入路由地址" />
        </el-form-item>

        <el-form-item label="图标" prop="icon" v-if="formData.type === 'menu'">
          <el-input v-model="formData.icon" placeholder="请输入图标名称" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>

        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Expand, Fold } from '@element-plus/icons-vue'
import type { Permission } from '@/types'

const tableRef = ref()
const formRef = ref<FormInstance>()

const permissionTree = ref<Permission[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)

const formData = reactive({
  id: undefined as number | undefined,
  parentId: null as number | null,
  name: '',
  code: '',
  type: 'menu' as 'menu' | 'button',
  url: '',
  icon: '',
  sort: 0,
  status: 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { pattern: /^[a-z:]+$/, message: '权限编码只能包含小写字母和冒号', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

const loadPermissionTree = async () => {
  loading.value = true
  try {
    // TODO: 调用实际接口
    permissionTree.value = []
  } catch (error: any) {
    ElMessage.error(error.message || '加载权限树失败')
  } finally {
    loading.value = false
  }
}

const handleExpandAll = () => {
  toggleExpand(permissionTree.value, true)
}

const handleCollapseAll = () => {
  toggleExpand(permissionTree.value, false)
}

const toggleExpand = (data: Permission[], isExpand: boolean) => {
  data.forEach((item) => {
    tableRef.value.toggleRowExpansion(item, isExpand)
    if (item.children && item.children.length > 0) {
      toggleExpand(item.children, isExpand)
    }
  })
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Permission) => {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row: Permission) => {
  try {
    await ElMessageBox.confirm(`确定要删除权限"${row.name}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用删除接口
    ElMessage.success('删除成功')
    loadPermissionTree()
  } catch (error) {
    // 用户取消
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // TODO: 调用实际接口
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    loadPermissionTree()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  formData.id = undefined
  formData.parentId = null
  formData.name = ''
  formData.code = ''
  formData.type = 'menu'
  formData.url = ''
  formData.icon = ''
  formData.sort = 0
  formData.status = 1
  formRef.value?.resetFields()
}

onMounted(() => {
  loadPermissionTree()
})
</script>

<style scoped lang="scss">
.permission-management {
  .toolbar-card {
    margin-bottom: 16px;
  }
}
</style>
