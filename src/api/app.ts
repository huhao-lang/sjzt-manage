import request from '@/utils/request'
import type { App } from '@/types'

/**
 * 获取应用列表
 */
export const getAppList = (current: number = 1, size: number = 100) => {
    return request.get<App[]>('/admin/app/list', { params: { current, size } })
}

/**
 * 获取单个应用详情
 */
export const getApp = (id: number) => {
    return request.get<App>('/admin/app/get', { params: { id } })
}

/**
 * 保存应用（新增/修改）
 */
export const saveApp = (data: Partial<App>) => {
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
