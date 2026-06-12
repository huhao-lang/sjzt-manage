<template>
  <el-dialog v-model="visible" title="密码修改详情" width="700px" @close="handleClose">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="登录账号">{{ detail?.account }}</el-descriptions-item>
      <el-descriptions-item label="用户姓名">{{ detail?.name }}</el-descriptions-item>
      <el-descriptions-item label="修改场景">
        <el-tag :type="getChangeTypeTagType(detail?.changeType)">{{ getChangeTypeLabel(detail?.changeType) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="验证方式">{{ getVerifyTypeLabel(detail?.verifyType) }}</el-descriptions-item>
      <el-descriptions-item label="操作人账号">{{ detail?.operatorAccount }}</el-descriptions-item>
      <el-descriptions-item label="操作人ID">{{ detail?.operatorUserId }}</el-descriptions-item>
      <el-descriptions-item label="客户端IP">{{ detail?.clientIp || '-' }}</el-descriptions-item>
      <el-descriptions-item label="修改时间">{{ detail?.updateTime }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail?.createTime }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ detail?.updateTime }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">{{ detail?.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item label="User Agent" :span="2">
        <el-input type="textarea" :rows="3" :model-value="detail?.userAgent" readonly />
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PasswordChangeLog, ChangeType, VerifyType } from '@/types'

const props = defineProps<{
  modelValue: boolean
  detail: PasswordChangeLog | null
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

const getChangeTypeTagType = (type?: ChangeType) => {
  const map: Record<ChangeType, string> = {
    PROFILE_CHANGE: 'primary',
    FORGOT_PASSWORD: 'warning'
  }
  return type ? map[type] : ''
}

const getChangeTypeLabel = (type?: ChangeType) => {
  const map: Record<ChangeType, string> = {
    PROFILE_CHANGE: '个人修改密码',
    FORGOT_PASSWORD: '忘记密码'
  }
  return type ? map[type] : ''
}

const getVerifyTypeLabel = (type?: VerifyType) => {
  const map: Record<VerifyType, string> = {
    LOGIN: '登录态验证',
    ID_CARD: '身份证验证',
    SMS: '短信验证',
    ID_CARD_SMS: '身份证+短信验证',
    UNKNOWN: '未知'
  }
  return type ? map[type] : ''
}
</script>
