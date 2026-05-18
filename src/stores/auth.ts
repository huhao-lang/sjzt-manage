import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as authApi from '@/api/auth'
import storage from '@/utils/storage'
import type { UserInfo, LoginParams, LoginResponse } from '@/types'

/**
 * 认证状态管理
 */
export const useAuthStore = defineStore('auth', () => {
    const router = useRouter()

    // 状态
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)
    const expiresIn = ref<number>(0)

    // 计算属性
    const isLoggedIn = computed(() => !!token.value)
    const username = computed(() => userInfo.value?.name || userInfo.value?.username || '')
    const roles = computed(() => userInfo.value?.roles || [])
    const permissions = computed(() => userInfo.value?.permissions || [])

    /**
     * 初始化 - 从本地存储恢复状态
     */
    const init = () => {
        const savedToken = storage.get<string>('token')
        const savedUserInfo = storage.get<UserInfo>('userInfo')

        if (savedToken && savedUserInfo) {
            token.value = savedToken
            userInfo.value = savedUserInfo
        }
    }

    /**
     * 登录
     */
    const login = async (params: LoginParams): Promise<LoginResponse> => {
        try {
            const res = await authApi.login(params)

            // 存储 token
            token.value = res.accessToken
            expiresIn.value = parseInt(res.expiresIn) || 7200

            // 构造用户信息
            userInfo.value = {
                id: res.userId,
                username: params.username,
                name: res.name,
                dept: res.dept,
                officeId: res.officeId
            }

            // 持久化存储（根据 expiresIn 设置过期时间）
            const expireTime = expiresIn.value * 1000 // 转为毫秒
            storage.set('token', token.value, expireTime)
            storage.set('userInfo', userInfo.value, expireTime)

            return res
        } catch (error) {
            throw error
        }
    }

    /**
     * 登出
     */
    const logout = async () => {
        try {
            // 调用登出接口
            await authApi.logout()
        } catch (error) {
            console.error('登出接口调用失败:', error)
        } finally {
            // 清除状态
            token.value = ''
            userInfo.value = null
            expiresIn.value = 0

            // 清除本地存储
            storage.remove('token')
            storage.remove('userInfo')

            // 重置路由状态（延迟导入避免循环依赖）
            const { useRouteStore } = await import('./route')
            const routeStore = useRouteStore()
            routeStore.resetRoutes()

            // 跳转到本地登录页（带标记避免跳SSO）
            router.push({ path: '/login', query: { ssoFailed: '1' } })
        }
    }

    /**
     * 获取当前用户信息
     */
    const getCurrentUser = async () => {
        try {
            const userId = userInfo.value?.id
            if (!userId) {
                throw new Error('用户未登录')
            }
            const data = await authApi.getCurrentUser(userId)
            // 合并数据，保留登录时的基础信息
            userInfo.value = {
                ...userInfo.value,
                ...data,
                // 统一字段名
                username: data.account || userInfo.value?.username,
                email: data.companyEmail || data.email
            }
            storage.set('userInfo', userInfo.value, 7 * 24 * 60 * 60 * 1000)
            return userInfo.value
        } catch (error) {
            throw error
        }
    }

    /**
     * 检查权限
     */
    const hasPermission = (permission: string): boolean => {
        return permissions.value.includes(permission)
    }

    /**
     * 检查角色
     */
    const hasRole = (role: string): boolean => {
        return roles.value.includes(role)
    }

    /**
     * 检查是否有任一权限
     */
    const hasAnyPermission = (permissionList: string[]): boolean => {
        return permissionList.some((permission) => hasPermission(permission))
    }

    /**
     * 检查是否有任一角色
     */
    const hasAnyRole = (roleList: string[]): boolean => {
        return roleList.some((role) => hasRole(role))
    }

    return {
        // 状态
        token,
        userInfo,
        expiresIn,
        // 计算属性
        isLoggedIn,
        username,
        roles,
        permissions,
        // 方法
        init,
        login,
        logout,
        getCurrentUser,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAnyRole
    }
})
