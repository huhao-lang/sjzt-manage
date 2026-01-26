import request from '@/utils/request'
import type { MenuItem } from '@/types'

/**
 * 获取菜单列表
 */
export const getMenuList = () => {
    return request.get<MenuItem[]>('/admin/admin/menu')
}
