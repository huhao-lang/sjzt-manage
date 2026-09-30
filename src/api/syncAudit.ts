import request from '@/utils/request'
import type { SyncLog, SyncLogQueryParams, PageResult, ApiResponse, SyncTrace, SyncDetailLog, SyncTraceGroup } from '@/types'

/**
 * 分页查询数据同步日志
 */
export const getSyncLogPage = (params: SyncLogQueryParams): Promise<ApiResponse<PageResult<SyncLog>>> => {
    return request.get('/admin/dataSyncLog/page', { params })
}

/**
 * 以接收批次为单位分页查询同步链路
 */
export const getSyncTracePage = (params: SyncLogQueryParams): Promise<ApiResponse<PageResult<SyncTraceGroup>>> => {
    return request.get('/admin/dataSyncLog/trace/page', { params })
}

/**
 * 查询同步日志详情
 */
export const getSyncLogDetail = (id: number): Promise<ApiResponse<SyncLog>> => {
    return request.get(`/admin/dataSyncLog/${id}`)
}

/**
 * 查询一条接收记录对应的完整同步链路
 */
export const getSyncLogTrace = (batchNo: string): Promise<ApiResponse<SyncTrace>> => {
    return request.get('/admin/dataSyncLog/trace', { params: { batchNo } })
}

/**
 * 分页查询同步链路中的单条数据明细
 */
export const getSyncLogTraceDetails = (
    batchNo: string,
    current: number,
    size: number
): Promise<ApiResponse<PageResult<SyncDetailLog>>> => {
    return request.get('/admin/dataSyncLog/trace/details', {
        params: { batchNo, current, size }
    })
}
