<template>
  <el-dialog v-model="visible" title="审批拒绝" width="500px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="拒绝原因" prop="rejectReason">
        <el-input
          v-model="formData.rejectReason"
          type="textarea"
          :rows="4"
          placeholder="请输入拒绝原因"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="danger" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { rejectDeptAudit } from '@/api/deptAudit'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  modelValue: boolean
  ids: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const authStore = useAuthStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

const formData = reactive({
  rejectReason: ''
})

const rules: FormRules = {
  rejectReason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
}

const handleClose = () => {
  formData.rejectReason = ''
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const res = await rejectDeptAudit({
      ids: props.ids,
      auditorId: Number(authStore.userInfo?.id) || 0,
      auditorName: authStore.userInfo?.name || '',
      rejectReason: formData.rejectReason
    })

    if (res.data.failureCount > 0) {
      ElMessage.warning(`成功${res.data.successCount}条，失败${res.data.failureCount}条：${res.data.failureMessages.join('; ')}`)
    } else {
      ElMessage.success(`审批拒绝成功，共${res.data.successCount}条`)
    }

    visible.value = false
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '审批失败')
  } finally {
    submitting.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    formData.rejectReason = ''
  }
})
</script>
