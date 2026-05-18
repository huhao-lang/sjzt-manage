import request from '@/utils/request'
import type { UserAudit, UserAuditQueryParams, AuditApproveRequest, AuditRejectRequest, AuditResult } from '@/types'

interface AuditApiResponse<T = any> {
    code: number
    message: string
    data: T
}

interface PageResponse<T> {
    records: T[]
    total: number
    size: number
    current: number
    pages: number
}

/**
 * 查询待审计用户列表
 */
export const getUserAuditList = (params: UserAuditQueryParams): Promise<AuditApiResponse<PageResponse<UserAudit>>> => {
    return request.get('/user_audit/pending/list', { params })
}

/**
 * 获取用户审计详情
 */
export const getUserAuditDetail = (id: number): Promise<AuditApiResponse<UserAudit>> => {
    return request.get(`/user_audit/pending/${id}`)
}

/**
 * 批量审计通过
 */
export const approveUserAudit = (data: AuditApproveRequest): Promise<AuditApiResponse<AuditResult>> => {
    return request.post('/user_audit/approve', data)
}

/**
 * 批量审计拒绝
 */
export const rejectUserAudit = (data: AuditRejectRequest): Promise<AuditApiResponse<AuditResult>> => {
    return request.post('/user_audit/reject', data)
}
