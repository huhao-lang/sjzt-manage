<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '修改机构' : '添加机构'"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="父机构" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="officeTreeForSelect"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          placeholder="请选择父机构"
          check-strictly
          clearable
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" maxlength="100" />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" :max="9999" />
      </el-form-item>

      <el-form-item label="是否启用" prop="isEnable">
        <el-radio-group v-model="formData.isEnable">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { saveOffice } from '@/api/office'
import type { Office } from '@/types'

const props = defineProps<{
  officeTree: Office[]
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
  parentId: '' as string,
  name: '',
  sort: 1,
  isEnable: true
})

// 用于下拉选择的机构树（排除当前编辑的节点及其子节点）
const officeTreeForSelect = computed(() => {
  if (!isEdit.value || !currentEditId.value) {
    return props.officeTree
  }
  const filterTree = (nodes: Office[]): Office[] => {
    return nodes
      .filter(node => node.id !== currentEditId.value)
      .map(node => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined
      }))
  }
  return filterTree(props.officeTree)
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { max: 100, message: '名称最多100个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ]
}

const resetFormData = () => {
  formData.parentId = ''
  formData.name = ''
  formData.sort = 1
  formData.isEnable = true
  currentEditId.value = ''
}

const open = (row?: Office) => {
  resetFormData()
  isEdit.value = !!row

  if (row) {
    currentEditId.value = row.id
    formData.parentId = row.parentId || ''
    formData.name = row.name
    formData.sort = row.sort || 1
    // 处理 isEnable 可能是数字 0/1 的情况
    formData.isEnable = row.isEnable === true || row.isEnable === 1
  }

  visible.value = true
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

    await saveOffice({
      id: isEdit.value ? currentEditId.value : undefined,
      parentId: formData.parentId || null,
      name: formData.name,
      sort: formData.sort,
      isEnable: formData.isEnable
    })

    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
    visible.value = false
    emit('success')
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open
})
</script>
