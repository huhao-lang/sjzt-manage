<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '修改应用' : '添加应用'"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入应用名称" maxlength="64" />
      </el-form-item>

      <el-form-item label="编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入应用编码" maxlength="64" />
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

      <el-form-item label="用户同步地址" prop="userSyncUrl">
        <el-input v-model="formData.userSyncUrl" placeholder="请输入用户同步地址" maxlength="255" />
      </el-form-item>

      <el-form-item label="部门同步地址" prop="deptSyncUrl">
        <el-input v-model="formData.deptSyncUrl" placeholder="请输入部门同步地址" maxlength="255" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { saveApp } from '@/api/app'
import type { App } from '@/types'

const props = defineProps<{
  modelValue: boolean
  editData?: App | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const currentEditId = ref<string>('')

// 表单数据
const formData = reactive({
  name: '',
  code: '',
  sort: 1,
  isEnable: true,
  userSyncUrl: '',
  deptSyncUrl: ''
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { max: 64, message: '名称最多64个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入编码', trigger: 'blur' },
    { max: 64, message: '编码最多64个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ],
  userSyncUrl: [
    { max: 255, message: '用户同步地址最多255个字符', trigger: 'blur' }
  ],
  deptSyncUrl: [
    { max: 255, message: '部门同步地址最多255个字符', trigger: 'blur' }
  ]
}

// 重置表单
const resetFormData = () => {
  formData.name = ''
  formData.code = ''
  formData.sort = 1
  formData.isEnable = true
  formData.userSyncUrl = ''
  formData.deptSyncUrl = ''
  currentEditId.value = ''
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      if (props.editData) {
        isEdit.value = true
        currentEditId.value = props.editData.id.toString()
        formData.name = props.editData.name
        formData.code = props.editData.code || ''
        formData.sort = props.editData.sort || 1
        formData.isEnable = props.editData.isEnable ?? true
        formData.userSyncUrl = props.editData.userSyncUrl || ''
        formData.deptSyncUrl = props.editData.deptSyncUrl || ''
      } else {
        isEdit.value = false
        resetFormData()
      }
    }
  }
)

// 监听 visible 变化，同步到父组件
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 弹窗关闭
const handleClose = () => {
  formRef.value?.resetFields()
  resetFormData()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    await saveApp({
      id: isEdit.value ? currentEditId.value : undefined,
      name: formData.name,
      code: formData.code,
      sort: formData.sort,
      isEnable: formData.isEnable,
      userSyncUrl: formData.userSyncUrl,
      deptSyncUrl: formData.deptSyncUrl
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
</script>
