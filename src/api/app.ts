import request from '@/utils/request'
import type { App } from '@/types'

/**
 * 获取应用列表（分页）
 */
export const getAppList = (params: {
    current?: number
    size?: number
    name?: string
}) => {
    return request.get<{
        records: App[]
        total: number
    }>('/admin/app/list', { params })
}

/**
 * 保存应用（新增/修改）
 */
export const saveApp = (data: {
    id?: string
    name: string
    code: string
    sort?: number
    isEnable?: boolean
    userSyncUrl?: string
    deptSyncUrl?: string
}) => {
    return request.post('/admin/app/save', data)
}

/**
 * 启用/禁用应用
 */
export const enableApp = (ids: string, isEnable: boolean) => {
    return request.post('/admin/app/enable', { ids, isEnable })
}

/**
 * 删除应用
 */
export const deleteApp = (ids: string) => {
    return request.post('/admin/app/delete', { ids })
}

/**
 * 获取应用密钥信息
 */
export const getAppCredentials = (id: string) => {
    return request.get<{ clientId: string; clientSecret: string }>('/admin/app/credentials', { params: { id } })
}
