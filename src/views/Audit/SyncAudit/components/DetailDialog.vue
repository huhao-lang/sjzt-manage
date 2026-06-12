<template>
  <el-dialog v-model="visible" title="数据同步日志详情" width="800px" @close="handleClose">
    <div v-loading="loading">
      <!-- 基础信息 -->
      <el-descriptions title="基础信息" :column="2" border class="detail-section">
        <el-descriptions-item label="批次号">{{ detail?.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="目标系统">{{ detail?.targetSystem || '-' }}</el-descriptions-item>
        <el-descriptions-item label="同步类型">
          <el-tag type="primary">{{ getSyncTypeLabel(detail?.syncType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数据类型">
          <el-tag :type="getDataTypeTagType(detail?.dataType)">{{ getDataTypeLabel(detail?.dataType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ getActionLabel(detail?.action) }}</el-descriptions-item>
        <el-descriptions-item label="同步状态">
          <el-tag :type="getSyncStatusTagType(detail?.syncStatus)">{{ getSyncStatusLabel(detail?.syncStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户端ID">{{ detail?.clientId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="同步URL" :span="1">
          <span class="url-text">{{ detail?.syncUrl || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ detail?.operatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作人ID">{{ detail?.operatorId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="同步时间">{{ detail?.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail?.createTime }}</el-descriptions-item>
      </el-descriptions>

      <!-- 统计信息 -->
      <el-descriptions title="统计信息" :column="3" border class="detail-section">
        <el-descriptions-item label="总数">{{ detail?.totalCount ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="成功数">
          <span class="success-count">{{ detail?.successCount ?? '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="失败数">
          <span :class="{ 'failed-count': (detail?.failedCount ?? 0) > 0 }">{{ detail?.failedCount ?? '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 错误信息 -->
      <el-card v-if="detail?.failedCount && detail?.failedCount > 0 && detail?.errorMessage" class="detail-section error-section">
        <template #header>
          <span class="error-title">错误信息</span>
        </template>
        <div class="error-list">
          <div v-for="(item, index) in errorMessages" :key="index" class="error-item">
            <el-tag type="danger" size="small" class="error-tag">{{ index + 1 }}</el-tag>
            <span>{{ item }}</span>
          </div>
        </div>
      </el-card>

      <!-- 请求数据 -->
      <el-card v-if="detail?.requestBody" class="detail-section">
        <template #header>
          <span>请求数据</span>
          <el-button type="primary" link size="small" class="copy-btn" @click="copyText(formatJson(detail?.requestBody))">复制</el-button>
        </template>
        <div class="code-block">
          <pre>{{ formatJson(detail?.requestBody) }}</pre>
        </div>
      </el-card>

      <!-- 响应数据 -->
      <el-card v-if="detail?.responseBody" class="detail-section">
        <template #header>
          <span>响应数据</span>
          <el-button type="primary" link size="small" class="copy-btn" @click="copyText(formatJson(detail?.responseBody))">复制</el-button>
        </template>
        <div class="code-block">
          <pre>{{ formatJson(detail?.responseBody) }}</pre>
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { SyncLog, SyncType, SyncDataType, SyncAction, SyncStatus } from '@/types'

const props = defineProps<{
  modelValue: boolean
  detail: SyncLog | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  emit('update:modelValue', false)
}

// 解析错误信息（按分号分割）
const errorMessages = computed(() => {
  if (!props.detail?.errorMessage) return []
  return props.detail.errorMessage.split(';').map(s => s.trim()).filter(Boolean)
})

// 格式化JSON
const formatJson = (str?: string) => {
  if (!str) return ''
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

// 复制文本
const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 同步类型标签
const getSyncTypeLabel = (type?: SyncType) => {
  const map: Record<SyncType, string> = { PUSH: '下发', RECEIVE: '接收' }
  return type ? map[type] : ''
}

// 数据类型标签
const getDataTypeLabel = (type?: SyncDataType) => {
  const map: Record<SyncDataType, string> = { USER: '用户', DEPT: '部门' }
  return type ? map[type] : ''
}

const getDataTypeTagType = (type?: SyncDataType) => {
  const map: Record<SyncDataType, string> = { USER: 'primary', DEPT: 'success' }
  return type ? map[type] : ''
}

// 操作类型标签
const getActionLabel = (action?: SyncAction) => {
  const map: Record<SyncAction, string> = { CREATE: '新增', UPDATE: '修改', DELETE: '删除' }
  return action ? map[action] : ''
}

// 同步状态标签
const getSyncStatusLabel = (status?: SyncStatus) => {
  const map: Record<SyncStatus, string> = {
    SUCCESS: '成功',
    FAILED: '失败',
    PARTIAL: '部分成功',
    PROCESSING: '处理中'
  }
  return status ? map[status] : ''
}

const getSyncStatusTagType = (status?: SyncStatus) => {
  const map: Record<SyncStatus, string> = {
    SUCCESS: 'success',
    FAILED: 'danger',
    PARTIAL: 'warning',
    PROCESSING: 'primary'
  }
  return status ? map[status] : ''
}
</script>

<style scoped lang="scss">
.detail-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.url-text {
  word-break: break-all;
  font-size: 12px;
}

.success-count {
  color: var(--el-color-success);
  font-weight: 600;
}

.failed-count {
  color: var(--el-color-danger);
  font-weight: 600;
}

.error-section {
  border-color: var(--el-color-danger);

  :deep(.el-card__header) {
    background-color: var(--el-color-danger-light-9);
    border-bottom-color: var(--el-color-danger-light-7);
  }
}

.error-title {
  color: var(--el-color-danger);
  font-weight: 600;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.6;

  .error-tag {
    flex-shrink: 0;
    margin-top: 2px;
  }
}

.code-block {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 12px 16px;
  max-height: 300px;
  overflow: auto;

  pre {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    color: #303133;
  }
}

.copy-btn {
  float: right;
}
</style>
