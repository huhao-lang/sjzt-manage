import request from '@/utils/request'
import type { Role } from '@/types'

/**
 * 获取角色列表
 */
export const getRoleList = (params: {
    current?: number
    size?: number
    name?: string
}) => {
    return request.get<{
        records: Role[]
        total: number
    }>('/admin/role/list', { params })
}

/**
 * 保存角色（新增/修改）
 */
export const saveRole = (data: {
    id?: string
    name: string
    sort?: number
    description?: string
    isEnable?: boolean
}) => {
    return request.post('/admin/role/save', data)
}

/**
 * 启用/禁用角色
 */
export const enableRole = (ids: string, isEnable: boolean) => {
    return request.post('/admin/role/enable', { ids, isEnable })
}

/**
 * 删除角色
 */
export const deleteRole = (ids: string) => {
    return request.post('/admin/role/delete', { ids })
}

/**
 * 保存角色权限
 */
export const saveRolePermission = (data: {
    roleId: string
    name: string
    isEnable: boolean
    permissionIds: string
}) => {
    return request.post('/admin/role-permission/save', data)
}

/**
 * 分配部门
 */
export const assignRoleDept = (data: {
    roleId: string
    officeIds: string[]
}) => {
    return request.post('/admin/role/manage-scope/save', data)
}

/**
 * 获取角色已分配的部门
 */
export const getRoleDeptList = (roleId: string) => {
    return request.get<any>(`/admin/role/manage-scope/list/${roleId}`)
}
