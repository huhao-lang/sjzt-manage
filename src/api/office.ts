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

/**
 * 查询组织架构绑定的业务系统
 * @param officeId 组织架构ID
 */
export const getOfficeAppClientIds = (clientId: string | number) => {
    return request.get<string[]>('/admin/office-app-rel/office-ids', { params: { clientId } })
}

/**
 * 保存组织架构绑定的业务系统
 * @param data clientId 和 officeIds
 */
export const saveOfficeAppRel = (data: { clientId: string | number; officeIds: string[] }) => {
    return request.post('/admin/office-app-rel/save-by-client', data)
}

/**
 * 推送机构
 */
export const pushOffice = (data: { deptIds: string[], clientIds: string[], event: string }) => {
    return request.post('/admin/office/push', data)
}
