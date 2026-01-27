import request from '@/utils/request'
import type { Permission } from '@/types'

/**
 * 获取权限树
 */
export const getPermissionTree = (appId?: string) => {
    return request.get<Permission[]>('/admin/permission/tree', { params: { appId } })
}

/**
 * 获取单个权限详情
 */
export const getPermission = (id: string) => {
    return request.get<Permission>('/admin/permission/get', { params: { id } })
}

/**
 * 保存权限（新增/修改）
 */
export const savePermission = (data: Partial<Permission>) => {
    return request.post('/admin/permission/save', data)
}

/**
 * 启用/禁用权限
 */
export const enablePermission = (ids: string, isEnable: boolean) => {
    return request.post('/admin/permission/enable', { ids, isEnable })
}

/**
 * 删除权限
 */
export const deletePermission = (id: string, appId: string) => {
    return request.post('/admin/permission/delete', { id, appId })
}
