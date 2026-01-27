<template>
  <div class="permission-management">
    <!-- 搜索栏 -->
    <el-card class="toolbar-card">
      <el-form :inline="true">
        <el-form-item label="应用">
          <el-select v-model="searchAppId" style="width: 200px;" placeholder="请选择应用" @change="handleAppChange">
            <el-option
              v-for="item in appList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 权限树表格 -->
    <el-card>
      <el-table
        ref="tableRef"
        :data="permissionList"
        v-loading="loading"
        row-key="id"
        border
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content" v-if="row.children && row.children.length > 0">
              <el-table :data="row.children" border size="small">
                <el-table-column prop="name" label="名称" min-width="120" />
                <el-table-column prop="perms" label="权限标识" min-width="120" />
                <el-table-column prop="url" label="路由路径" min-width="120" />
                <el-table-column prop="component" label="组件路径" min-width="120" />
                <el-table-column prop="isMenu" label="类型" width="80">
                  <template #default="{ row: child }">
                    <el-tag :type="child.isMenu ? 'primary' : 'warning'" size="small">
                      {{ child.isMenu ? '菜单' : '按钮' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="visible" label="显示" width="70">
                  <template #default="{ row: child }">
                    <el-tag :type="child.visible !== false ? 'success' : 'info'" size="small">
                      {{ child.visible !== false ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="{ row: child }">
                    <el-button type="primary" link size="small" @click="handleAdd(child)">
                      添加
                    </el-button>
                    <el-button type="success" link size="small" @click="handleEdit(child)">
                      修改
                    </el-button>
                    <el-button type="danger" link size="small" @click="handleDelete(child)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="no-children">
              暂无子权限
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <i v-if="row.icon" :class="['fa', row.icon]" style="margin-right: 5px;"></i>
            <span :style="{ color: row.isMenu ? '#438eb9' : '', fontWeight: 'bold' }">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="perms" label="权限标识" min-width="120" />
        <el-table-column prop="url" label="路由路径" min-width="130" />
        <el-table-column prop="component" label="组件路径" min-width="150" />
        <el-table-column prop="sort" label="排序" width="70" />
        <el-table-column prop="isMenu" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isMenu ? 'primary' : 'warning'">
              {{ row.isMenu ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="visible" label="显示" width="70">
          <template #default="{ row }">
            <el-tag :type="row.visible !== false ? 'success' : 'info'" size="small">
              {{ row.visible !== false ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isEnable" label="状态" width="70">
          <template #default="{ row }">
            <el-tag :type="row.isEnable ? 'success' : 'danger'" size="small">
              {{ row.isEnable ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
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

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑权限' : '新增权限'"
      width="650px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="应用" prop="appId">
              <el-select v-model="formData.appId" style="width: 100%;" placeholder="请选择应用" disabled>
                <el-option
                  v-for="item in appList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="父级" prop="parentId">
              <el-input v-model="formData.parentName" placeholder="父级" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入名称" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限标识" prop="perms">
              <el-input v-model="formData.perms" placeholder="如: office:list" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路由路径" prop="url">
              <el-input v-model="formData.url" placeholder="如: /admin/office" maxlength="200" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="formData.component" placeholder="如: admin/office/index" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="重定向" prop="redirect">
              <el-input v-model="formData.redirect" placeholder="目录类型需要填写" maxlength="200" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标" prop="icon">
              <el-input v-model="formData.icon" placeholder="如: fa-cogs">
                <template #append>
                  <i v-if="formData.icon" :class="['fa', formData.icon]"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="formData.sort" :min="1" :max="9999" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="isMenu">
              <el-radio-group v-model="formData.isMenu">
                <el-radio :value="true">菜单</el-radio>
                <el-radio :value="false">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="显示" prop="visible">
              <el-radio-group v-model="formData.visible">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="缓存" prop="isCache">
              <el-radio-group v-model="formData.isCache">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="外链" prop="isFrame">
              <el-radio-group v-model="formData.isFrame">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否启用" prop="isEnable">
              <el-radio-group v-model="formData.isEnable">
                <el-radio :value="true">启用</el-radio>
                <el-radio :value="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Permission, App } from '@/types'
import { getPermissionTree, getPermission, savePermission, deletePermission } from '@/api/permission'
import { getAppList } from '@/api/app'

const tableRef = ref()
const formRef = ref<FormInstance>()

// 应用列表
const appList = ref<App[]>([])
const searchAppId = ref<number>()

// 权限树原始数据（包含根节点）
const permissionTreeData = ref<Permission | null>(null)
const loading = ref(false)

// 获取一级权限列表（根节点的children）
const permissionList = computed(() => {
  return permissionTreeData.value?.children || []
})

// 对话框
const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  id: '' as string,
  parentId: '' as string | null,
  parentName: '',
  appId: undefined as number | undefined,
  name: '',
  icon: '',
  url: '',
  component: '',
  redirect: '',
  perms: '',
  visible: true,
  isCache: true,
  isFrame: false,
  sort: 1,
  isMenu: true,
  isEnable: true
})

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

// 默认应用（单点登录权限管理系统）
const DEFAULT_APP: App = {
  id: 1,
  name: '单点登录权限管理系统',
  code: 'sso',
  redirectUri: '',
  status: 1,
  createTime: ''
}

// 加载应用列表
const loadAppList = async () => {
  try {
    const list = await getAppList()
    // 将默认应用放在第一位
    appList.value = [DEFAULT_APP, ...list.filter(item => item.id !== DEFAULT_APP.id)]
    searchAppId.value = appList.value[0].id
    loadPermissionTree()
  } catch (error: any) {
    // 加载失败时使用默认应用
    appList.value = [DEFAULT_APP]
    searchAppId.value = DEFAULT_APP.id
    loadPermissionTree()
    console.error('加载应用列表失败:', error)
  }
}

// 加载权限树
const loadPermissionTree = async () => {
  if (!searchAppId.value) return

  loading.value = true
  try {
    const data = await getPermissionTree(String(searchAppId.value))
    // 后端返回的是包含根节点的对象
    permissionTreeData.value = data as unknown as Permission
  } catch (error: any) {
    ElMessage.error(error.message || '加载权限树失败')
    permissionTreeData.value = null
  } finally {
    loading.value = false
  }
}

// 应用切换
const handleAppChange = () => {
  loadPermissionTree()
}

// 新增权限（添加子节点）
const handleAdd = (row: Permission) => {
  isEdit.value = false
  resetForm()
  formData.parentId = row.id
  formData.parentName = row.name
  formData.appId = searchAppId.value
  dialogVisible.value = true
}

// 编辑权限
const handleEdit = async (row: Permission) => {
  isEdit.value = true
  resetForm()

  try {
    const data = await getPermission(row.id)
    formData.id = data.id
    formData.parentId = data.parentId
    formData.parentName = findParentName(data.parentId)
    formData.appId = searchAppId.value
    formData.name = data.name
    formData.icon = data.icon || ''
    formData.url = data.url || ''
    formData.component = data.component || ''
    formData.redirect = data.redirect || ''
    formData.perms = data.perms || ''
    formData.visible = data.visible !== false
    formData.isCache = data.isCache !== false
    formData.isFrame = data.isFrame || false
    formData.sort = data.sort || 1
    formData.isMenu = data.isMenu
    formData.isEnable = data.isEnable
    dialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取权限详情失败')
  }
}

// 查找父级名称
const findParentName = (parentId: string | null): string => {
  if (!parentId) return '根节点'

  const findInList = (nodes: Permission[]): string => {
    for (const node of nodes) {
      if (node.id === parentId) return node.name
      if (node.children) {
        const found = findInList(node.children)
        if (found) return found
      }
    }
    return ''
  }

  return findInList(permissionList.value) || '根节点'
}

// 删除权限
const handleDelete = async (row: Permission) => {
  try {
    await ElMessageBox.confirm('会删除该权限所有子权限，确认要删除吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deletePermission(row.id, String(searchAppId.value))
    ElMessage.success('删除成功')
    loadPermissionTree()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    await savePermission({
      id: formData.id || undefined,
      parentId: formData.parentId,
      appId: String(formData.appId),
      name: formData.name,
      icon: formData.icon,
      url: formData.url,
      component: formData.component,
      redirect: formData.redirect,
      perms: formData.perms,
      visible: formData.visible,
      isCache: formData.isCache,
      isFrame: formData.isFrame,
      sort: formData.sort,
      isMenu: formData.isMenu,
      isEnable: formData.isEnable
    })

    ElMessage.success('保存成功')
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

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.id = ''
  formData.parentId = null
  formData.parentName = ''
  formData.appId = undefined
  formData.name = ''
  formData.icon = ''
  formData.url = ''
  formData.component = ''
  formData.redirect = ''
  formData.perms = ''
  formData.visible = true
  formData.isCache = true
  formData.isFrame = false
  formData.sort = 1
  formData.isMenu = true
  formData.isEnable = true
  formRef.value?.resetFields()
}

onMounted(() => {
  loadAppList()
})
</script>

<style scoped lang="scss">
.permission-management {
  .toolbar-card {
    margin-bottom: 16px;
  }

  .expand-content {
    padding: 10px 20px;
    background-color: #f5f7fa;
  }

  .no-children {
    padding: 20px;
    text-align: center;
    color: #909399;
  }
}
</style>
