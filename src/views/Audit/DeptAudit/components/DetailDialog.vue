<template>
  <el-dialog v-model="visible" title="审计详情" width="700px" @close="handleClose">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="部门名称">{{ detail?.name }}</el-descriptions-item>
      <el-descriptions-item label="是否启用">
        <el-tag :type="detail?.isEnable ? 'success' : 'warning'">
          {{ detail?.isEnable ? '是' : '否' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="事件类型">
        <el-tag :type="getEventTagType(detail?.event)">{{ getEventLabel(detail?.event) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="事件时间">{{ detail?.eventTime }}</el-descriptions-item>
      <el-descriptions-item label="来源系统">{{ detail?.sourceSystem }}</el-descriptions-item>
      <el-descriptions-item label="客户端ID">{{ detail?.clientId }}</el-descriptions-item>
      <el-descriptions-item label="审计状态">
        <el-tag :type="getStatusTagType(detail?.auditStatus)">{{ getStatusLabel(detail?.auditStatus) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="提交时间">{{ detail?.submitTime }}</el-descriptions-item>
      <el-descriptions-item label="审核人">{{ detail?.auditorName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="审核时间">{{ detail?.auditTime || '-' }}</el-descriptions-item>
      <el-descriptions-item label="拒绝原因" :span="2" v-if="detail?.rejectReason">{{ detail?.rejectReason }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DeptAudit, AuditStatus, EventType } from '@/types'

const props = defineProps<{
  modelValue: boolean
  detail: DeptAudit | null
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

const getEventTagType = (event?: EventType) => {
  const map: Record<EventType, string> = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'danger'
  }
  return event ? map[event] : ''
}

const getEventLabel = (event?: EventType) => {
  const map: Record<EventType, string> = {
    CREATE: '新增',
    UPDATE: '修改',
    DELETE: '删除'
  }
  return event ? map[event] : ''
}

const getStatusTagType = (status?: AuditStatus) => {
  const map: Record<AuditStatus, string> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return status ? map[status] : ''
}

const getStatusLabel = (status?: AuditStatus) => {
  const map: Record<AuditStatus, string> = {
    PENDING: '待审计',
    APPROVED: '已通过',
    REJECTED: '已拒绝'
  }
  return status ? map[status] : ''
}
</script>
