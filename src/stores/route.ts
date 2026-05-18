import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/types'
import { getMenuList } from '@/api/menu'
import { generateRoutes, resetRouter } from '@/router/dynamicRoutes'
import router, { notFoundRoute } from '@/router'

export const useRouteStore = defineStore('route', () => {
    // 菜单列表（用于侧边栏显示）
    const menus = ref<MenuItem[]>([])
    // 动态路由是否已加载
    const isRoutesLoaded = ref(false)

    /**
     * 加载菜单和动态路由
     */
    const loadMenusAndRoutes = async () => {
        if (isRoutesLoaded.value) return

        try {
            // 获取菜单数据
            const data = await getMenuList()
            menus.value = data || []

            // 生成动态路由
            const dynamicRoutes = generateRoutes(menus.value)

            // 添加动态路由到 /admin 下
            dynamicRoutes.forEach(route => {
                // 如果路由是顶级路由（有 Layout 组件），直接添加
                if (route.component && route.path.startsWith('/')) {
                    router.addRoute(route)
                } else {
                    // 否则添加为 Admin 的子路由
                    router.addRoute('Admin', route)
                }
            })

            // 最后添加 404 路由，确保它在所有路由之后
            router.addRoute(notFoundRoute)

            isRoutesLoaded.value = true
            return true
        } catch (error) {
            console.error('加载菜单失败:', error)
            return false
        }
    }

    /**
     * 重置路由状态（退出登录时调用）
     */
    const resetRoutes = () => {
        menus.value = []
        isRoutesLoaded.value = false
        resetRouter(router)
    }

    return {
        menus,
        isRoutesLoaded,
        loadMenusAndRoutes,
        resetRoutes
    }
})
