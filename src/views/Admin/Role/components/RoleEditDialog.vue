<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '修改功能角色' : '添加功能角色'"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" maxlength="64" />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" :max="9999" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入描述"
          :rows="4"
        />
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { saveRole } from '@/api/role'
import type { Role } from '@/types'

const emit = defineEmits<{
  success: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const isEdit = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const currentEditId = ref<string>('')

const formData = reactive({
  name: '',
  sort: 1,
  description: '',
  isEnable: true
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { max: 64, message: '名称最多64个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ]
}

const resetFormData = () => {
  formData.name = ''
  formData.sort = 1
  formData.description = ''
  formData.isEnable = true
  currentEditId.value = ''
}

const open = (row?: Role) => {
  resetFormData()
  isEdit.value = !!row

  if (row) {
    currentEditId.value = row.id.toString()
    formData.name = row.name
    formData.sort = row.sort || 1
    formData.description = row.description || ''
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

    await saveRole({
      id: isEdit.value ? currentEditId.value : undefined,
      name: formData.name,
      sort: formData.sort,
      description: formData.description,
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
