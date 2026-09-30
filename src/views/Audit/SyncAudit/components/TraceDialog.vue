<template>
  <el-dialog v-model="visible" title="同步链路" width="900px" @close="handleClose">
    <el-alert
      title="同一链路中的记录按处理时间排序，接收批次是整条链路的起点。"
      type="info"
      :closable="false"
      class="trace-tip"
    />
    <div v-loading="loading" class="trace-content">
      <div class="root-batch">对应接收批次号：{{ trace?.rootBatchNo || '-' }}</div>
      <el-empty v-if="!trace?.records?.length && !loading" description="没有找到关联记录" />
      <el-timeline v-else>
        <el-timeline-item
          v-for="record in trace?.records || []"
          :key="record.id"
          :timestamp="formatDateTime(record.syncTime || record.createTime)"
          placement="top"
          :type="getStatusTagType(record.syncStatus) as any"
        >
          <el-card shadow="never" class="trace-card">
            <div class="trace-card-header">
              <el-space wrap>
                <el-tag :type="record.syncType === 'RECEIVE' ? 'warning' : 'primary'">
                  {{ record.syncType === 'RECEIVE' ? '人资接收' : '下发' }}
                </el-tag>
                <el-tag :type="record.dataType === 'DEPT' ? 'success' : 'primary'">
                  {{ record.dataType === 'DEPT' ? '部门' : '用户' }}
                </el-tag>
                <el-tag :type="getStatusTagType(record.syncStatus) as any">
                  {{ getStatusLabel(record.syncStatus) }}
                </el-tag>
              </el-space>
              <span class="batch-no">{{ record.batchNo }}</span>
            </div>
            <el-descriptions :column="3" size="small" class="trace-info">
              <el-descriptions-item label="操作">{{ getActionLabel(record.action) }}</el-descriptions-item>
              <el-descriptions-item label="来源系统">{{ record.sourceSystem || '-' }}</el-descriptions-item>
              <el-descriptions-item label="目标系统">{{ record.targetSystem || '-' }}</el-descriptions-item>
              <el-descriptions-item label="客户端ID">{{ record.clientId || '-' }}</el-descriptions-item>
              <el-descriptions-item v-if="record.syncType === 'RECEIVE'" label="接收来源IP">
                {{ record.sourceIp || '-' }}
              </el-descriptions-item>
              <el-descriptions-item v-else-if="record.operatorName || record.sourceIp" label="推送请求IP">
                {{ record.sourceIp || '-' }}
              </el-descriptions-item>
              <el-descriptions-item v-if="record.syncType === 'PUSH' && record.operatorName" label="推送操作人">
                {{ record.operatorName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="数据量">
                {{ record.successCount ?? 0 }}/{{ record.totalCount ?? 0 }} 成功
              </el-descriptions-item>
            </el-descriptions>
            <div v-if="record.errorMessage" class="trace-error">{{ record.errorMessage }}</div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <template v-if="hasPushRecords">
        <div class="details-title">单条数据下发明细</div>
        <el-table v-loading="detailLoading" :data="trace?.details || []" stripe border max-height="360" size="small">
          <el-table-column prop="dataId" label="数据ID" width="100" />
          <el-table-column prop="dataName" label="名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="dataType" label="类型" width="80">
            <template #default="{ row }">
              {{ row.dataType === 'DEPT' ? '部门' : '用户' }}
            </template>
          </el-table-column>
          <el-table-column prop="event" label="操作" width="80">
            <template #default="{ row }">{{ getActionLabel(row.event) }}</template>
          </el-table-column>
          <el-table-column prop="targetSystem" label="目标系统" min-width="120" show-overflow-tooltip />
          <el-table-column prop="syncStatus" label="结果" width="90">
            <template #default="{ row }">
              <el-tag :type="row.syncStatus === 'SUCCESS' ? 'success' : 'danger'">
                {{ row.syncStatus === 'SUCCESS' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="errorMessage" label="失败原因" min-width="200" show-overflow-tooltip />
          <el-table-column prop="batchNo" label="下发批次" min-width="210" show-overflow-tooltip />
        </el-table>
        <div v-if="detailTotal > 0" class="details-pagination">
          <el-pagination
            :current-page="detailCurrent"
            :page-size="detailSize"
            :total="detailTotal"
            :page-sizes="[10, 20, 50, 100]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleDetailSizeChange"
            @current-change="handleDetailCurrentChange"
          />
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SyncAction, SyncStatus, SyncTrace } from '@/types'
import { formatDateTime } from '@/utils/date'

const props = defineProps<{
  modelValue: boolean
  trace: SyncTrace | null
  loading?: boolean
  detailCurrent?: number
  detailSize?: number
  detailTotal?: number
  detailLoading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'detail-page-change': [current: number, size: number]
}>()

const detailCurrent = computed(() => props.detailCurrent || 1)
const detailSize = computed(() => props.detailSize || 20)
const detailTotal = computed(() => props.detailTotal || 0)
const detailLoading = computed(() => props.detailLoading || false)
const hasPushRecords = computed(() =>
  (props.trace?.records || []).some(record => record.syncType === 'PUSH')
)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => emit('update:modelValue', false)

const handleDetailSizeChange = (size: number) => {
  emit('detail-page-change', 1, size)
}

const handleDetailCurrentChange = (current: number) => {
  emit('detail-page-change', current, detailSize.value)
}

const getActionLabel = (action?: SyncAction) => {
  const map: Record<SyncAction, string> = {
    CREATE: '新增',
    UPDATE: '修改',
    DELETE: '删除',
    FULL_SYNC: '全量同步'
  }
  return action ? map[action] || action : '-'
}

const getStatusLabel = (status?: SyncStatus) => {
  const map: Record<SyncStatus, string> = {
    SUCCESS: '成功',
    FAILED: '失败',
    PARTIAL: '部分成功',
    PROCESSING: '处理中'
  }
  return status ? map[status] || status : '-'
}

const getStatusTagType = (status?: SyncStatus) => {
  const map: Record<SyncStatus, string> = {
    SUCCESS: 'success',
    FAILED: 'danger',
    PARTIAL: 'warning',
    PROCESSING: 'primary'
  }
  return status ? map[status] || 'info' : 'info'
}
</script>

<style scoped lang="scss">
.trace-tip {
  margin-bottom: 16px;
}

.root-batch {
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  word-break: break-all;
}

.trace-card {
  margin-bottom: 4px;
}

.trace-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.batch-no {
  color: var(--el-color-primary);
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  text-align: right;
}

.trace-info {
  margin-top: 4px;
}

.trace-error {
  margin-top: 8px;
  padding: 8px;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-radius: 4px;
  word-break: break-all;
}

.details-title {
  margin: 20px 0 10px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.details-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
