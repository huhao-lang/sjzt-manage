import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 404 路由（需要在动态路由加载后再添加）
 */
export const notFoundRoute: RouteRecordRaw = {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Error/404.vue'),
    meta: {
        title: '页面不存在'
    }
}

/**
 * 静态路由（不需要权限）
 */
export const constantRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login/index.vue'),
        meta: {
            title: '登录',
            requiresAuth: false
        }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/components/Layout/index.vue'),
        redirect: '/admin/dashboard',
        meta: {
            title: '管理后台',
            requiresAuth: true
        },
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/Admin/Dashboard.vue'),
                meta: {
                    title: '首页',
                    icon: 'HomeFilled'
                }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/views/Admin/Profile.vue'),
                meta: {
                    title: '个人资料',
                    hidden: true
                }
            },
            // {
            //     path: 'permission',
            //     name: 'Permission',
            //     component: () => import('@/views/Admin/Permission/index.vue'),
            //     meta: {
            //         title: '权限管理',
            //         icon: 'Lock'
            //     }
            // }
        ]
    }
]

/**
 * 创建路由实例
 */
const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

export default router
