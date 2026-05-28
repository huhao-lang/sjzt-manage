<template>
  <el-dialog
    v-model="visible"
    title="推送用户"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="选择应用" prop="clientId">
        <el-select
          v-model="formData.clientId"
          placeholder="请选择应用"
          style="width: 100%"
          v-loading="appLoading"
          filterable
        >
          <el-option
            v-for="app in appList"
            :key="app.id"
            :label="app.name"
            :value="app.clientId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="推送类型" prop="event">
        <el-select
          v-model="formData.event"
          placeholder="请选择推送类型"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="event in eventList"
            :key="event.value"
            :label="event.label"
            :value="event.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { pushUser } from '@/api/user'
import { getAppList } from '@/api/app'
import type { App } from '@/types'

const emit = defineEmits<{
  success: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const formRef = ref<FormInstance>()
const submitting = ref(false)
const appLoading = ref(false)
const currentUserId = ref<string>('')
const appList = ref<App[]>([])
const eventList = [
  { label: '新建', value: 'CREATE' },
  { label: '修改', value: 'UPDATE' },
  { label: '删除', value: 'DELETE' }
]

const formData = reactive({
  clientId: '' as string,
  event: '' as string,
})

const rules: FormRules = {
  clientId: [
    { required: true, message: '请选择应用', trigger: 'change' }
  ],
  event: [
    { required: true, message: '请选择推送类型', trigger: 'change' }
  ]
}

// 加载应用列表
const loadAppList = async () => {
  appLoading.value = true
  try {
    const res = await getAppList({
      current: 1,
      size: 1000
    })
    appList.value = res.records || []
  } catch (error) {
    console.error('加载应用列表失败:', error)
    appList.value = []
  } finally {
    appLoading.value = false
  }
}

const open = (userId: string) => {
  currentUserId.value = userId
  formData.clientId = ''
  formData.event = ''
  visible.value = true
  loadAppList()
}

const handleClose = () => {
  formRef.value?.resetFields()
  formData.clientId = ''
  formData.event = ''
  currentUserId.value = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    await pushUser({
      userIds: [currentUserId.value],
      clientIds: [formData.clientId],
      event: formData.event
    })

    ElMessage.success('推送成功')
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
