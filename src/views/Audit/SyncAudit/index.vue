<template>
    <div class="sync-audit">
        <!-- 搜索栏 -->
        <el-card class="search-card">
            <el-form :model="searchForm" :inline="true">
                <el-form-item label="同步类型">
                    <el-select v-model="searchForm.syncType" placeholder="全部" clearable style="width: 140px">
                        <el-option label="下发" value="PUSH" />
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
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 表格 -->
        <el-card>
            <el-table :data="tableData" v-loading="loading" stripe height="calc(100vh - 420px)">
                <el-table-column prop="batchNo" label="批次号" min-width="220" show-overflow-tooltip>
                    <template #default="{ row }">
                        <el-button type="primary" link size="small" @click="handleDetail(row)">
                            {{ row.batchNo }}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="syncType" label="同步类型" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag type="primary">{{ getSyncTypeLabel(row.syncType) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="dataType" label="数据类型" width="90" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getDataTypeTagType(row.dataType)">{{ getDataTypeLabel(row.dataType) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="action" label="操作类型" width="90" align="center">
                    <template #default="{ row }">
                        {{ getActionLabel(row.action) }}
                    </template>
                </el-table-column>
                <el-table-column prop="targetSystem" label="目标系统" width="140" show-overflow-tooltip />
                <el-table-column label="同步结果" width="180" align="center">
                    <template #default="{ row }">
                        <el-space :size="4">
                            <el-tag size="small" type="info">总 {{ row.totalCount }}</el-tag>
                            <el-tag size="small" type="success">成功 {{ row.successCount }}</el-tag>
                            <el-tag v-if="row.failedCount > 0" size="small" type="danger">失败 {{ row.failedCount }}</el-tag>
                        </el-space>
                    </template>
                </el-table-column>
                <el-table-column prop="syncStatus" label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getSyncStatusTagType(row.syncStatus)">{{ getSyncStatusLabel(row.syncStatus)
                            }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="operatorName" label="操作人" width="100" show-overflow-tooltip  align="center" />
                <el-table-column prop="updateTime" label="同步时间" min-width="160" />
                <el-table-column label="操作" width="100" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button type="primary" link size="small" @click="handleDetail(row)">
                            详情
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
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSyncLogPage, getSyncLogDetail } from '@/api/syncAudit'
import type { SyncLog, SyncType, SyncDataType, SyncAction, SyncStatus } from '@/types'
import DetailDialog from './components/DetailDialog.vue'

// 搜索表单
const searchForm = reactive({
    syncType: '' as SyncType | '',
    dataType: '' as SyncDataType | '',
    syncStatus: '' as SyncStatus | '',
    clientId: ''
})

// 表格数据
const tableData = ref<SyncLog[]>([])
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

// 同步类型标签
const getSyncTypeLabel = (type?: SyncType) => {
    const map: Record<SyncType, string> = {
        PUSH: '下发',
        RECEIVE: '接收'
    }
    return type ? map[type] : ''
}

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
        DELETE: '删除'
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

        const res = await getSyncLogPage(params)
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
    handleSearch()
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
    .search-card {
        margin-bottom: 16px;
    }

    .pagination-container {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
