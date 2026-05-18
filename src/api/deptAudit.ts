import request from '@/utils/request'
import type { DeptAudit, DeptAuditQueryParams, AuditApproveRequest, AuditRejectRequest, AuditResult } from '@/types'

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
 * 查询待审计部门列表
 */
export const getDeptAuditList = (params: DeptAuditQueryParams): Promise<AuditApiResponse<PageResponse<DeptAudit>>> => {
    return request.get('/dept_audit/pending/list', { params })
}

/**
 * 查询部门审计树
 */
export const getDeptAuditTree = (params?: DeptAuditQueryParams): Promise<DeptAudit[]> => {
    return request.get('/dept_audit/tree', { params })
}

/**
 * 获取部门审计详情
 */
export const getDeptAuditDetail = (id: number): Promise<AuditApiResponse<DeptAudit>> => {
    return request.get(`/dept_audit/pending/${id}`)
}

/**
 * 批量审计通过
 */
export const approveDeptAudit = (data: AuditApproveRequest): Promise<AuditApiResponse<AuditResult>> => {
    return request.post('/dept_audit/approve', data)
}

/**
 * 批量审计拒绝
 */
export const rejectDeptAudit = (data: AuditRejectRequest): Promise<AuditApiResponse<AuditResult>> => {
    return request.post('/dept_audit/reject', data)
}
