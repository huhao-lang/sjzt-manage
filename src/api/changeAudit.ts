import request from '@/utils/request'
import type { PageResult, PasswordChangeLog, PasswordChangeLogQueryParams } from '@/types'

interface AuditApiResponse<T = any> {
    code: number
    message: string
    data: T
}

/**
 * 密码修改日志查询参数
 */
export interface PasswordChangeLogParams extends PasswordChangeLogQueryParams {
    current: number
    size: number
}

/**
 * 分页查询密码修改日志
 */
export const getPasswordChangeLogList = (params: PasswordChangeLogParams): Promise<AuditApiResponse<PageResult<PasswordChangeLog>>> => {
    return request.get('/admin/password-change-log/list', { params })
}