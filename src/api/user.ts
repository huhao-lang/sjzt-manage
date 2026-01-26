import request from '@/utils/request'
import type { User } from '@/types'

/**
 * 获取用户列表
 */
export const getUserList = (params: {
    current?: number
    size?: number
    officeId?: string
    account?: string
    name?: string
}) => {
    return request.get<{
        records: User[]
        total: number
    }>('/admin/user/list', { params })
}

/**
 * 保存用户（新增/修改）
 */
export const saveUser = (data: Partial<User>) => {
    return request.post('/admin/user/save', data)
}

/**
 * 启用/禁用用户
 */
export const enableUser = (ids: string, isEnable: boolean) => {
    return request.post('/admin/user/enable', { ids, isEnable })
}

/**
 * 删除用户
 */
export const deleteUser = (ids: string) => {
    return request.post('/admin/user/delete', { ids })
}

/**
 * 批量删除用户
 */
export const batchDeleteUser = (ids: number[]) => {
    return request.post('/admin/user/delete', { ids: ids.join(',') })
}

/**
 * 重置密码
 */
export const resetPassword = (ids: string) => {
    return request.post('/admin/user/reset-password', { ids })
}

/**
 * 获取用户角色
 */
export const getUserRoles = (userId: string) => {
    return request.get('/admin/user-role', { params: { userId } })
}

/**
 * 保存用户角色
 */
export const saveUserRoles = (userId: string, roleIds: string[]) => {
    return request.post('/admin/user-role/save', { userId, roleIds: roleIds.join(',') })
}
