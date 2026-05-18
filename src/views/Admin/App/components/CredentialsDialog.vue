<template>
  <el-dialog v-model="visible" title="查看应用密钥信息" width="600px">
    <el-form label-width="120px">
      <el-form-item label="ClientId">
        <el-input v-model="credentials.clientId" readonly>
          <template #append>
            <el-button @click="copyToClipboard(credentials.clientId)">复制</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="ClientSecret">
        <el-input v-model="credentials.clientSecret" readonly>
          <template #append>
            <el-button @click="copyToClipboard(credentials.clientSecret)">复制</el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAppCredentials } from '@/api/app'
import type { App } from '@/types'

const props = defineProps<{
  modelValue: boolean
  app?: App | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = ref(false)
const credentials = reactive({
  clientId: '',
  clientSecret: ''
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val
    if (val && props.app) {
      try {
        const data = await getAppCredentials(props.app.id.toString())
        credentials.clientId = data.clientId
        credentials.clientSecret = data.clientSecret
      } catch (error: any) {
        ElMessage.error(error.message || '获取密钥信息失败')
        visible.value = false
      }
    }
  }
)

// 监听 visible 变化，同步到父组件
watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    credentials.clientId = ''
    credentials.clientSecret = ''
  }
})

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>
