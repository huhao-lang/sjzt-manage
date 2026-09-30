<template>
    <div class="sync-audit">
        <!-- 搜索栏 -->
        <el-card class="search-card">
            <el-form :model="searchForm" :inline="true">
                <el-form-item label="同步类型">
                    <el-select v-model="searchForm.syncType" placeholder="全部" clearable style="width: 140px">
                        <el-option label="下发" value="PUSH" />
                        <el-option label="接收" value="RECEIVE" />
                    </el-select>
                </el-form-item>
                <el-form-item label="数据类型">
                    <el-select v-model="searchForm.dataType" placeholder="全部" clearable style="width: 140px">
                        <el-option label="用户" value="USER" />
                        <el-option label="部门" value="DEPT" />
                    </el-select>
                </el-form-item>
                <el-form-item label="同步状态">
                    <el-select v-model="searchForm.syncStatus" placeholder="全部" clearable style="width: 140px">
                        <el-option label="成功" value="SUCCESS" />
                        <el-option label="失败" value="FAILED" />
                        <el-option label="部分成功" value="PARTIAL" />
                        <el-option label="处理中" value="PROCESSING" />
                    </el-select>
                </el-form-item>
                <el-form-item label="客户端ID">
                    <el-input v-model="searchForm.clientId" placeholder="客户端ID" clearable @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item label="链路批次号">
                    <el-input v-model="searchForm.batchNo" placeholder="接收批次号/推送批次号" clearable @keyup.enter="handleSearch" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-alert
            title="列表按接收批次分组：上方是一次接收，下方是这次接收产生的全部下发。"
            type="info"
            :closable="false"
            class="trace-tip"
        />

        <!-- 按链路分组的表格 -->
        <el-card>
            <el-table :data="tableData" v-loading="loading" stripe height="calc(100vh - 470px)" class="trace-table">
                <el-table-column label="链路起点（父节点）" min-width="320">
                    <template #default="{ row }">
                        <div v-if="row.receive" class="receive-node">
                            <div class="node-title">
                                <el-tag type="warning" size="small">接收</el-tag>
                                <span>人资系统</span>
                                <el-tag :type="getDataTypeTagType(row.receive.dataType)" size="small">
                                    {{ getDataTypeLabel(row.receive.dataType) }}
                                </el-tag>
                            </div>
                            <el-link type="primary" :underline="false" @click="handleDetail(row.receive)">
                                {{ row.receive.batchNo }}
                            </el-link>
                            <div class="node-meta">
                                {{ getActionLabel(row.receive.action) }} ·
                                {{ formatDateTime(row.receive.syncTime || row.receive.createTime) }}
                            </div>
                        </div>
                        <div v-else class="receive-node manual-node">
                            <div class="node-title">
                                <el-tag type="primary" size="small">手动推送</el-tag>
                                <span>{{ row.pushes[0]?.operatorName || '操作人未知' }}</span>
                                <el-tag :type="getDataTypeTagType(row.pushes[0]?.dataType)" size="small">
                                    {{ getDataTypeLabel(row.pushes[0]?.dataType) }}
                                </el-tag>
                            </div>
                            <el-link
                                v-if="row.pushes[0]"
                                type="primary"
                                :underline="false"
                                @click="handleDetail(row.pushes[0])"
                            >
                                {{ row.pushes[0].batchNo }}
                            </el-link>
                            <div class="node-meta">
                                {{ getActionLabel(row.pushes[0]?.action) }} ·
                                {{ formatDateTime(row.pushes[0]?.syncTime || row.pushes[0]?.createTime) }}
                            </div>
                            <div class="node-meta">
                                请求IP：{{ row.pushes[0]?.sourceIp || '-' }}
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="下发链路（子节点）" min-width="560">
                    <template #default="{ row }">
                        <div v-if="!row.pushes.length" class="no-push-record">暂无下发记录</div>
                        <el-scrollbar v-else max-height="180">
                            <div v-for="push in row.pushes" :key="push.id" class="push-node">
                                <div class="push-node-title">
                                    <span class="flow-arrow">↓</span>
                                    <el-tag type="primary" size="small">下发</el-tag>
                                    <span class="push-target">{{ push.targetSystem || '-' }}</span>
                                    <el-tag :type="getSyncStatusTagType(push.syncStatus)" size="small">
                                        {{ getSyncStatusLabel(push.syncStatus) }}
                                    </el-tag>
                                </div>
                                <div class="push-node-meta">
                                    <span>下发批次：</span>
                                    <el-link type="primary" :underline="false" @click="handleDetail(push)">
                                        {{ push.batchNo }}
                                    </el-link>
                            <span v-if="push.operatorName" class="push-operator">操作人：{{ push.operatorName }}</span>
                            <span v-if="push.sourceIp" class="push-ip">请求IP：{{ push.sourceIp }}</span>
                            <span class="push-count">
                                {{ push.successCount ?? 0 }}/{{ push.totalCount ?? 0 }} 成功
                                    </span>
                                    <span>{{ formatDateTime(push.syncTime || push.createTime) }}</span>
                                </div>
                            </div>
                        </el-scrollbar>
                    </template>
                </el-table-column>
                <el-table-column label="链路结果" width="220" align="center">
                    <template #default="{ row }">
                        <div class="result-line">
                            <template v-if="row.receive">
                                <span>接收：</span>
                                <el-tag size="small" :type="getSyncStatusTagType(row.receive.syncStatus)">
                                    {{ row.receive.successCount ?? 0 }}/{{ row.receive.totalCount ?? 0 }}
                                </el-tag>
                            </template>
                            <template v-else>
                                <span>来源：</span>
                                <el-tag size="small" type="primary">手动推送</el-tag>
                            </template>
                        </div>
                        <div class="result-line">
                            <span>下发目标：</span>
                            <el-tag size="small" type="info">{{ row.pushCount }} 个</el-tag>
                        </div>
                        <div v-if="row.pushCount" class="result-line">
                            <span>下发合计：</span>
                            <el-tag size="small" type="success">成功 {{ row.pushSuccessCount }}</el-tag>
                            <el-tag size="small" type="danger">失败 {{ row.pushFailedCount }}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="来源/请求IP" width="150" align="center">
                    <template #default="{ row }">
                        {{ row.receive?.sourceIp || row.pushes[0]?.sourceIp || '-' }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button
                            type="primary"
                            link
                            size="small"
                            @click="handleDetail(row.receive || row.pushes[0])"
                        >
                            详情
                        </el-button>
                        <el-button
                            type="success"
                            link
                            size="small"
                            @click="handleTrace(row.receive || row.pushes[0])"
                        >
                            链路
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
                    :total="pagination.total" :page-sizes="[10, 20, 50, 100]" :hide-on-single-page="false" background
                    layout="total, sizes, prev, pager, next, jumper" @size-change="loadData"
                    @current-change="loadData" />
            </div>
        </el-card>

        <!-- 详情弹窗 -->
        <DetailDialog v-model="detailVisible" :detail="currentDetail" :loading="detailLoading" />
        <TraceDialog
            v-model="traceVisible"
            :trace="currentTrace"
            :loading="traceLoading"
            :detail-current="traceDetailPagination.current"
            :detail-size="traceDetailPagination.size"
            :detail-total="traceDetailPagination.total"
            :detail-loading="traceDetailLoading"
            @detail-page-change="handleTraceDetailPageChange"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSyncTracePage, getSyncLogDetail, getSyncLogTrace, getSyncLogTraceDetails } from '@/api/syncAudit'
import type { SyncLog, SyncTrace, SyncTraceGroup, SyncType, SyncDataType, SyncAction, SyncStatus } from '@/types'
import DetailDialog from './components/DetailDialog.vue'
import TraceDialog from './components/TraceDialog.vue'
import { formatDateTime } from '@/utils/date'

// 搜索表单
const searchForm = reactive({
    syncType: '' as SyncType | '',
    dataType: '' as SyncDataType | '',
    syncStatus: '' as SyncStatus | '',
    clientId: '',
    batchNo: ''
})

// 表格数据
const tableData = ref<SyncTraceGroup[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
})

// 详情弹窗
const detailVisible = ref(false)
const currentDetail = ref<SyncLog | null>(null)
const detailLoading = ref(false)
const traceVisible = ref(false)
const traceLoading = ref(false)
const currentTrace = ref<SyncTrace | null>(null)
const traceBatchNo = ref('')
const traceDetailLoading = ref(false)
const traceDetailPagination = reactive({
    current: 1,
    size: 20,
    total: 0
})

// 数据类型标签
const getDataTypeLabel = (type?: SyncDataType) => {
    const map: Record<SyncDataType, string> = {
        USER: '用户',
        DEPT: '部门'
    }
    return type ? map[type] : ''
}

const getDataTypeTagType = (type?: SyncDataType) => {
    const map: Record<SyncDataType, string> = {
        USER: 'primary',
        DEPT: 'success'
    }
    return type ? map[type] : ''
}

// 操作类型标签
const getActionLabel = (action?: SyncAction) => {
    const map: Record<SyncAction, string> = {
        CREATE: '新增',
        UPDATE: '修改',
        DELETE: '删除',
        FULL_SYNC: '全量同步'
    }
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

// 加载列表数据
const loadData = async () => {
    loading.value = true
    try {
        const params: any = {
            current: pagination.current,
            size: pagination.size
        }
        if (searchForm.syncType) params.syncType = searchForm.syncType
        if (searchForm.dataType) params.dataType = searchForm.dataType
        if (searchForm.syncStatus) params.syncStatus = searchForm.syncStatus
        if (searchForm.clientId) params.clientId = searchForm.clientId
        if (searchForm.batchNo) {
            params.batchNo = searchForm.batchNo
        }

        const res = await getSyncTracePage(params)
        const pageData = res.data || res
        tableData.value = pageData.records || []
        pagination.total = Number(pageData.total) || 0
    } catch (error: any) {
        ElMessage.error(error.message || '加载数据失败')
        tableData.value = []
        pagination.total = 0
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    pagination.current = 1
    loadData()
}

// 重置
const handleReset = () => {
    searchForm.syncType = ''
    searchForm.dataType = ''
    searchForm.syncStatus = ''
    searchForm.clientId = ''
    searchForm.batchNo = ''
    handleSearch()
}

// 查看一条人资接收批次对应的完整下发链路
const handleTrace = async (row: SyncLog) => {
    const batchNo = row.syncType === 'RECEIVE' ? row.batchNo : (row.sourceBatchNo || row.batchNo)
    traceVisible.value = true
    traceLoading.value = true
    currentTrace.value = null
    traceBatchNo.value = batchNo
    traceDetailPagination.current = 1
    traceDetailPagination.total = 0
    try {
        const res = await getSyncLogTrace(batchNo)
        const traceData = (res as any).data || res as any
        currentTrace.value = { ...traceData, details: [] }
        traceBatchNo.value = traceData.rootBatchNo || batchNo
        await loadTraceDetails()
    } catch (error: any) {
        ElMessage.error(error.message || '加载同步链路失败')
    } finally {
        traceLoading.value = false
    }
}

const loadTraceDetails = async () => {
    if (!traceBatchNo.value) return
    traceDetailLoading.value = true
    try {
        const res = await getSyncLogTraceDetails(
            traceBatchNo.value,
            traceDetailPagination.current,
            traceDetailPagination.size
        )
        const pageData = (res as any).data || res as any
        traceDetailPagination.total = Number(pageData.total) || 0
        if (currentTrace.value) {
            currentTrace.value = { ...currentTrace.value, details: pageData.records || [] }
        }
    } catch (error: any) {
        traceDetailPagination.total = 0
        if (currentTrace.value) {
            currentTrace.value = { ...currentTrace.value, details: [] }
        }
        ElMessage.error(error.message || '加载链路明细失败')
    } finally {
        traceDetailLoading.value = false
    }
}

const handleTraceDetailPageChange = (current: number, size: number) => {
    traceDetailPagination.current = current
    traceDetailPagination.size = size
    loadTraceDetails()
}

// 查看详情
const handleDetail = async (row: SyncLog) => {
    detailVisible.value = true
    detailLoading.value = true
    try {
        const res = await getSyncLogDetail(row.id)
        currentDetail.value = res.data || res
    } catch (error: any) {
        ElMessage.error(error.message || '加载详情失败')
        // 加载详情失败时用列表数据兜底
        currentDetail.value = row
    } finally {
        detailLoading.value = false
    }
}

onMounted(() => {
    loadData()
})
</script>

<style scoped lang="scss">
.sync-audit {
    .trace-tip {
        margin-bottom: 16px;
    }

    .search-card {
        margin-bottom: 16px;
    }

    .receive-node {
        padding: 4px 0 4px 12px;
        border-left: 3px solid var(--el-color-warning);

        .node-title {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
            color: var(--el-text-color-regular);
            font-weight: 600;
        }

        .node-meta {
            margin-top: 8px;
            color: var(--el-text-color-secondary);
            font-size: 12px;
        }
    }

    .manual-node {
        border-left-color: var(--el-color-primary);
    }

    .push-node {
        padding: 6px 10px;
        border-left: 2px solid var(--el-color-primary-light-5);

        & + .push-node {
            margin-top: 8px;
        }

        .push-node-title,
        .push-node-meta {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .push-node-title {
            font-weight: 600;
        }

        .push-node-meta {
            margin-top: 4px;
            color: var(--el-text-color-secondary);
            font-size: 12px;
            white-space: nowrap;
        }

        .flow-arrow {
            color: var(--el-color-primary);
            font-size: 18px;
            font-weight: 700;
        }

        .push-target {
            min-width: 100px;
        }

        .push-count {
            color: var(--el-color-success);
        }

        .push-operator,
        .push-ip {
            color: var(--el-text-color-regular);
        }
    }

    .no-push-record {
        color: var(--el-text-color-secondary);
    }

    .result-line {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-height: 28px;
        white-space: nowrap;
    }

    .pagination-container {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
