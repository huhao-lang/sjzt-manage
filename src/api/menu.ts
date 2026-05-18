import request from '@/utils/request'
import type { MenuItem } from '@/types'

/**
 * 获取菜单列表（用于侧边栏和动态路由）
 */
export const getMenuList = () => {
    return request.get<MenuItem[]>('/admin/menu/list')
}
