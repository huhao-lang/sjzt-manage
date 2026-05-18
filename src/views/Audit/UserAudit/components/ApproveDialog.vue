<template>
  <el-dialog v-model="visible" title="审批通过" width="600px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="目标平台" prop="targetClientIds">
        <el-select
          v-model="formData.targetClientIds"
          multiple
          placeholder="请选择目标平台"
          style="width: 100%"
        >
          <el-option
            v-for="app in appList"
            :key="app.clientId"
            :label="app.name"
            :value="app.clientId.toString()"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审批意见" prop="auditOpinion">
        <el-input
          v-model="formData.auditOpinion"
          type="textarea"
          :rows="3"
          placeholder="请输入审批意见（可选）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getAppList } from '@/api/app'
import { approveUserAudit } from '@/api/userAudit'
import { useAuthStore } from '@/stores/auth'
import type { App } from '@/types'

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
const appList = ref<App[]>([])

const formData = reactive({
  targetClientIds: [] as string[],
  auditOpinion: ''
})

const rules: FormRules = {
  targetClientIds: [{ required: true, message: '请选择目标平台', trigger: 'change', type: 'array', min: 1 }]
}

const loadAppList = async () => {
  try {
    const res = await getAppList({ current: 1, size: 100 })
    appList.value = res.records.filter(item=>item.id!=1) || []
  } catch (error) {
    // console.error('加载应用列表失败:', error)
  }
}

const handleClose = () => {
  formData.targetClientIds = []
  formData.auditOpinion = ''
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const res = await approveUserAudit({
      ids: props.ids,
      auditorId: Number(authStore.userInfo?.id) || 0,
      auditorName: authStore.userInfo?.name || '',
      auditOpinion: formData.auditOpinion || undefined,
      targetClientIds: formData.targetClientIds
    })

    if (res.failureCount > 0) {
      ElMessage.warning(`成功${res.successCount}条，失败${res.failureCount}条：${res.failureMessages.join('; ')}`)
    } else {
      ElMessage.success(`审批通过成功，共${res.successCount}条`)
    }

    visible.value = false
    emit('success')
  } catch (error: any) {
    // ElMessage.error(error.message || '审批失败')
  } finally {
    submitting.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    formData.targetClientIds = []
    formData.auditOpinion = ''
    loadAppList()
  }
})
</script>
