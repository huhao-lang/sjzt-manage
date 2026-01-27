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
    const refreshToken = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)
    const expiresIn = ref<number>(0)
    const code = ref<string>('')

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
        const savedRefreshToken = storage.get<string>('refreshToken')
        const savedUserInfo = storage.get<UserInfo>('userInfo')

        if (savedToken && savedUserInfo) {
            token.value = savedToken
            refreshToken.value = savedRefreshToken || ''
            userInfo.value = savedUserInfo
        }
    }

    /**
     * 登录
     */
    const login = async (params: LoginParams): Promise<LoginResponse> => {
        try {
            const res = await authApi.login(params)

            // 打印后端设置的 cookie
            console.log('===== 后端设置的 Cookie =====')
            console.log(document.cookie)
            console.log('=============================')

            // 存储 token（cookie 由后端通过 Set-Cookie 自动设置）
            token.value = res.accessToken
            refreshToken.value = res.refreshToken
            expiresIn.value = res.expiresIn
            code.value = res.code || ''

            // 构造用户信息
            userInfo.value = {
                id: res.userId,
                username: res.tokenUser.username,
                name: res.name,
                dept: res.dept,
                phone: res.tokenUser.phone,
                idNumber: res.tokenUser.idNumber
            }

            // 持久化存储（根据 expiresIn 设置过期时间）
            const expireTime = res.expiresIn * 1000 // 转为毫秒
            storage.set('token', token.value, expireTime)
            storage.set('refreshToken', refreshToken.value, expireTime)
            storage.set('userInfo', userInfo.value, expireTime)
            storage.set('code', code.value, expireTime)

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
            // 调用登出接口（后端会清除 cookie）
            await authApi.logout()
        } catch (error) {
            console.error('登出接口调用失败:', error)
        } finally {
            // 清除状态
            token.value = ''
            refreshToken.value = ''
            userInfo.value = null
            expiresIn.value = 0

            // 清除本地存储
            storage.remove('token')
            storage.remove('refreshToken')
            storage.remove('userInfo')

            // 跳转到登录页
            router.push('/login')
        }
    }

    /**
     * 获取当前用户信息
     */
    const getCurrentUser = async () => {
        try {
            const data = await authApi.getCurrentUser()
            userInfo.value = data
            storage.set('userInfo', userInfo.value, 7 * 24 * 60 * 60 * 1000)
            return data
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
        refreshToken,
        userInfo,
        expiresIn,
        code,
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
