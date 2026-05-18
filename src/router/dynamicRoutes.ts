import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/types'
import Layout from '@/components/Layout/index.vue'

/**
 * 动态导入所有页面组件
 */
const modules = import.meta.glob('../views/**/*.vue')

/**
 * 根据组件路径获取组件
 * @param component 组件路径，如 "Admin/User/index"
 */
const loadComponent = (component: string) => {
    const path = `../views/${component}.vue`
    if (modules[path]) {
        return modules[path]
    }
    console.warn(`组件不存在: ${path}`)
    return () => import('@/views/Error/404.vue')
}

/**
 * 将后端菜单数据转换为路由配置
 * @param menus 后端返回的菜单数据
 */
export const generateRoutes = (menus: MenuItem[]): RouteRecordRaw[] => {
    const routes: RouteRecordRaw[] = []

    menus.forEach(menu => {
        const route = menuToRoute(menu)
        if (route) {
            routes.push(route)
        }
    })

    return routes
}

/**
 * 单个菜单转换为路由
 */
const menuToRoute = (menu: MenuItem): RouteRecordRaw | null => {
    // 如果没有 url，跳过
    if (!menu.url) return null

    // 顶级菜单（url 以 / 开头且没有 parentId）始终作为独立路由
    // 包裹在 Layout 中显示
    const isTopLevel = menu.url.startsWith('/') && !menu.parentId

    if (isTopLevel) {
        // 顶级路由，使用 Layout 包裹
        const route: RouteRecordRaw = {
            path: menu.url,
            name: menu.routeName || `Menu${menu.id}`,
            component: Layout,
            meta: {
                title: menu.name,
                icon: menu.icon,
                hidden: menu.visible === false
            },
            children: []
        }

        // 处理子菜单
        if (menu.children && menu.children.length > 0) {
            menu.children.forEach(child => {
                const childRoute = childMenuToRoute(child, menu.url)
                if (childRoute) {
                    route.children!.push(childRoute)
                }
            })

            // 设置默认重定向到第一个子路由
            if (route.children!.length > 0) {
                const firstChild = route.children![0]
                route.redirect = `${menu.url}/${firstChild.path}`
            }
        } else if (menu.component && menu.component !== 'Layout') {
            // 没有子菜单但有组件，作为单一页面路由（index 路由）
            route.children!.push({
                path: '',
                name: menu.routeName || `Menu${menu.id}Page`,
                component: loadComponent(menu.component),
                meta: {
                    title: menu.name,
                    icon: menu.icon,
                    hidden: menu.visible === false
                }
            })
        }

        return route
    } else {
        // 非顶级路由，作为 /admin 的子路由添加
        return {
            path: menu.url.startsWith('/') ? menu.url.slice(1) : menu.url,
            name: menu.routeName || `Menu${menu.id}`,
            component: menu.component ? loadComponent(menu.component) : loadComponent('Error/404'),
            meta: {
                title: menu.name,
                icon: menu.icon,
                hidden: menu.visible === false
            }
        }
    }
}

/**
 * 子菜单转换为路由
 */
const childMenuToRoute = (menu: MenuItem, parentPath: string): RouteRecordRaw | null => {
    if (!menu.url) return null

    // 子路由的 path 不需要以 / 开头
    let path = menu.url
    if (path.startsWith(parentPath + '/')) {
        path = path.slice(parentPath.length + 1)
    } else if (path.startsWith('/')) {
        path = path.slice(1)
    }

    const route: RouteRecordRaw = {
        path,
        name: menu.routeName || `Menu${menu.id}`,
        component: menu.component ? loadComponent(menu.component) : loadComponent('Error/404'),
        meta: {
            title: menu.name,
            icon: menu.icon,
            hidden: menu.visible === false
        }
    }

    // 递归处理子菜单
    if (menu.children && menu.children.length > 0) {
        route.children = []
        menu.children.forEach(child => {
            const childRoute = childMenuToRoute(child, `${parentPath}/${path}`)
            if (childRoute) {
                route.children!.push(childRoute)
            }
        })
    }

    return route
}

/**
 * 重置路由（用于退出登录）
 */
export const resetRouter = (router: any) => {
    // 获取所有路由名称
    router.getRoutes().forEach((route: any) => {
        const { name } = route
        // 只保留静态路由，移除动态添加的路由（包括 NotFound）
        if (name && !['Login', 'Admin', 'Dashboard', 'Profile'].includes(name as string)) {
            router.removeRoute(name)
        }
    })
}
