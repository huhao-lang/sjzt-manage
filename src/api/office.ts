import request from '@/utils/request'
import type { Office } from '@/types'

/**
 * 获取机构树
 */
export const getOfficeTree = () => {
    return request.get<Office[]>('/admin/user/office/tree')
}

/**
 * 获取机构列表（用于下拉选择）
 */
export const getOfficeList = () => {
    return request.get<Office[]>('/admin/office/list')
}

/**
 * 保存机构（新增/修改）
 */
export const saveOffice = (data: Partial<Office>) => {
    return request.post('/admin/office/save', data)
}

/**
 * 启用/禁用机构
 */
export const enableOffice = (ids: string, isEnable: boolean) => {
    return request.post('/admin/office/enable', { ids, isEnable })
}

/**
 * 删除机构
 */
export const deleteOffice = (ids: string) => {
    return request.post('/admin/office/delete', { ids })
}
