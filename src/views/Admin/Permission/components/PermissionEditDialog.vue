<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="上级菜单" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="parentTreeData"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          placeholder="请选择上级菜单"
          check-strictly
          clearable
          :render-after-expand="false"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="菜单类型" prop="menuType">
        <el-radio-group v-model="formData.menuType">
          <el-radio :value="0">目录</el-radio>
          <el-radio :value="1">菜单</el-radio>
          <el-radio :value="2">按钮</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 目录和菜单类型显示：菜单图标 + 显示排序 -->
      <el-row v-if="formData.menuType !== 2" :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单图标" prop="icon">
            <IconSelect v-model="formData.icon" placeholder="点击选择图标" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="1" :max="9999" style="width: 100%;" controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 按钮类型显示：显示排序（单独一行） -->
      <el-form-item v-if="formData.menuType === 2" label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" :max="9999" style="width: 200px;" controls-position="right" />
      </el-form-item>

      <!-- 目录和菜单类型：菜单名称 + 路由名称 -->
      <el-row v-if="formData.menuType !== 2" :gutter="20">
        <el-col :span="12">
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入菜单名称" maxlength="64" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="formData.menuType === 1" label="路由名称" prop="routeName">
            <el-input v-model="formData.routeName" placeholder="请输入路由名称" maxlength="64" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 按钮类型：菜单名称（单独一行） -->
      <el-form-item v-if="formData.menuType === 2" label="菜单名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入菜单名称" maxlength="64" style="width: 350px;" />
      </el-form-item>

      <!-- 按钮类型：权限字符（单独一行） -->
      <el-form-item v-if="formData.menuType === 2" label="权限字符" prop="perms">
        <el-input v-model="formData.perms" placeholder="请输入权限标识" maxlength="100" style="width: 350px;" />
      </el-form-item>

      <!-- 目录和菜单类型：是否外链 + 路由地址 -->
      <el-row v-if="formData.menuType !== 2" :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否外链" prop="isFrame">
            <el-radio-group v-model="formData.isFrame">
              <el-radio :value="true">是</el-radio>
              <el-radio :value="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="路由地址" prop="url">
            <el-input v-model="formData.url" placeholder="请输入路由地址" maxlength="200" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 菜单类型：组件路径 + 权限字符 -->
      <el-row v-if="formData.menuType === 1" :gutter="20">
        <el-col :span="12">
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="formData.component" placeholder="请输入组件路径" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="权限字符" prop="perms">
            <el-input v-model="formData.perms" placeholder="请输入权限标识" maxlength="100" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 菜单类型：路由参数 + 是否缓存 -->
      <el-row v-if="formData.menuType === 1" :gutter="20">
        <el-col :span="12">
          <el-form-item label="路由参数" prop="query">
            <el-input v-model="formData.query" placeholder="请输入路由参数" maxlength="200" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否缓存" prop="isCache">
            <el-radio-group v-model="formData.isCache">
              <el-radio :value="true">缓存</el-radio>
              <el-radio :value="false">不缓存</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 目录和菜单类型：显示状态 + 菜单状态 -->
      <el-row v-if="formData.menuType !== 2" :gutter="20">
        <el-col :span="12">
          <el-form-item label="显示状态" prop="visible">
            <el-radio-group v-model="formData.visible">
              <el-radio :value="true">显示</el-radio>
              <el-radio :value="false">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单状态" prop="isEnable">
            <el-radio-group v-model="formData.isEnable">
              <el-radio :value="true">正常</el-radio>
              <el-radio :value="false">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 按钮类型：菜单状态（单独一行） -->
      <el-form-item v-if="formData.menuType === 2" label="菜单状态" prop="isEnable">
        <el-radio-group v-model="formData.isEnable">
          <el-radio :value="true">正常</el-radio>
          <el-radio :value="false">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getPermission, savePermission } from '@/api/permission'
import type { Permission } from '@/types'
import IconSelect from '@/components/IconSelect/index.vue'

const props = defineProps<{
  permissionList: Permission[]
}>()

const emit = defineEmits<{
  success: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const isEdit = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const currentEditId = ref<string>('')

const formData = reactive({
  id: '' as string,
  parentId: null as string | null,
  name: '',
  menuType: 0 as number, // 0=目录, 1=菜单, 2=按钮
  icon: '',
  url: '',
  routeName: '',
  component: '',
  perms: '',
  query: '',
  isFrame: false,
  isCache: true,
  visible: true,
  sort: 1,
  isEnable: true
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入显示排序', trigger: 'blur' }]
}

// 过滤掉当前编辑的节点及其子节点（防止循环引用）
const filterSelfAndChildren = (nodes: Permission[], editId: string): Permission[] => {
  return nodes
    .filter(node => node.id !== editId)
    .map(node => ({
      ...node,
      children: node.children ? filterSelfAndChildren(node.children, editId) : undefined
    }))
}

// 父级树数据（包含根节点选项）
const parentTreeData = computed(() => {
  const rootNode = { id: null, name: '根节点', children: [] as Permission[] }
  if (isEdit.value && currentEditId.value) {
    rootNode.children = filterSelfAndChildren(props.permissionList, currentEditId.value)
  } else {
    rootNode.children = props.permissionList
  }
  return [rootNode]
})

const resetFormData = () => {
  formData.id = ''
  formData.parentId = null
  formData.name = ''
  formData.menuType = 0
  formData.icon = ''
  formData.url = ''
  formData.routeName = ''
  formData.component = ''
  formData.perms = ''
  formData.query = ''
  formData.isFrame = false
  formData.isCache = true
  formData.visible = true
  formData.sort = 1
  formData.isEnable = true
  currentEditId.value = ''
}

// 新增（添加子节点）
const openAdd = (parentRow: Permission) => {
  resetFormData()
  isEdit.value = false
  formData.parentId = parentRow.id
  visible.value = true
}

// 编辑
const openEdit = async (row: Permission) => {
  resetFormData()
  isEdit.value = true
  currentEditId.value = row.id

  try {
    const data = await getPermission(row.id)
    formData.id = data.id
    formData.parentId = data.parentId
    formData.name = data.name
    // 兼容 isMenu 和 menuType，确保转换为数字类型
    if (data.menuType !== undefined && data.menuType !== null) {
      formData.menuType = Number(data.menuType)
    } else {
      formData.menuType = data.isMenu ? 1 : 2
    }
    formData.icon = data.icon || ''
    formData.url = data.url || ''
    formData.routeName = data.routeName || ''
    formData.component = data.component || ''
    formData.perms = data.perms || ''
    formData.query = data.query || ''
    formData.isFrame = data.isFrame || false
    formData.isCache = data.isCache !== false
    formData.visible = data.visible !== false
    formData.sort = data.sort || 1
    formData.isEnable = data.isEnable !== false
    visible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取菜单详情失败')
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetFormData()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    await savePermission({
      id: formData.id || undefined,
      parentId: formData.parentId,
      name: formData.name,
      menuType: formData.menuType,
      isMenu: formData.menuType !== 2, // 兼容旧字段
      icon: formData.icon,
      url: formData.url,
      routeName: formData.routeName,
      component: formData.component,
      perms: formData.perms,
      query: formData.query,
      isFrame: formData.isFrame,
      isCache: formData.isCache,
      visible: formData.visible,
      sort: formData.sort,
      isEnable: formData.isEnable
    })

    ElMessage.success('保存成功')
    emit('success')
    visible.value = false
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

defineExpose({
  openAdd,
  openEdit
})
</script>
