import request from '@/utils/request'
import type { SyncLog, SyncLogQueryParams, PageResult, ApiResponse } from '@/types'

/**
 * 分页查询数据同步日志
 */
export const getSyncLogPage = (params: SyncLogQueryParams): Promise<ApiResponse<PageResult<SyncLog>>> => {
    return request.get('/admin/dataSyncLog/page', { params })
}

/**
 * 查询同步日志详情
 */
export const getSyncLogDetail = (id: number): Promise<ApiResponse<SyncLog>> => {
    return request.get(`/admin/dataSyncLog/${id}`)
}
