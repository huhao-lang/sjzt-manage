import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由配置
 */
const routes: RouteRecordRaw[] = [
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
                    icon: 'fa-home'
                }
            },
            {
                path: 'user',
                name: 'UserManagement',
                component: () => import('@/views/Admin/User/index.vue'),
                meta: {
                    title: '用户管理',
                    icon: 'fa-user',
                    permission: 'user:view'
                }
            },
            {
                path: 'user/edit/:id?',
                name: 'UserEdit',
                component: () => import('@/views/Admin/User/UserEdit.vue'),
                meta: {
                    title: '用户编辑',
                    hidden: true,
                    permission: 'user:edit'
                }
            },
            {
                path: 'role',
                name: 'RoleManagement',
                component: () => import('@/views/Admin/Role/index.vue'),
                meta: {
                    title: '角色管理',
                    icon: 'fa-users',
                    permission: 'role:view'
                }
            },
            {
                path: 'role/edit/:id?',
                name: 'RoleEdit',
                component: () => import('@/views/Admin/Role/RoleEdit.vue'),
                meta: {
                    title: '角色编辑',
                    hidden: true,
                    permission: 'role:edit'
                }
            },
            {
                path: 'permission',
                name: 'PermissionManagement',
                component: () => import('@/views/Admin/Permission/index.vue'),
                meta: {
                    title: '权限管理',
                    icon: 'fa-lock',
                    permission: 'permission:view'
                }
            },
            {
                path: 'app',
                name: 'AppManagement',
                component: () => import('@/views/Admin/App/index.vue'),
                meta: {
                    title: '应用管理',
                    icon: 'fa-th',
                    permission: 'app:view'
                }
            },
            {
                path: 'app/edit/:id?',
                name: 'AppEdit',
                component: () => import('@/views/Admin/App/AppEdit.vue'),
                meta: {
                    title: '应用编辑',
                    hidden: true,
                    permission: 'app:edit'
                }
            },
            {
                path: 'office',
                name: 'OfficeManagement',
                component: () => import('@/views/Admin/Office/index.vue'),
                meta: {
                    title: '机构管理',
                    icon: 'fa-sitemap',
                    permission: 'office:view'
                }
            },
            {
                path: 'office/edit',
                name: 'OfficeEdit',
                component: () => import('@/views/Admin/Office/OfficeEdit.vue'),
                meta: {
                    title: '机构编辑',
                    hidden: true,
                    permission: 'office:edit'
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
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/Error/404.vue'),
        meta: {
            title: '页面不存在'
        }
    }
]

/**
 * 创建路由实例
 */
const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

export default router
