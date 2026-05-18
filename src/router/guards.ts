import router from './index'
import { useAuthStore } from '@/stores/auth'
import { useRouteStore } from '@/stores/route'
import { ElMessage } from 'element-plus'
import * as authApi from '@/api/auth'
import storage from '@/utils/storage'

// SSO配置
const SSO_URL = import.meta.env.VITE_SSO_URL
const SSO_CLIENT_ID = import.meta.env.VITE_SSO_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI

/**
 * 跳转SSO登录页
 */
const redirectToSSO = () => {
    const redirectUri = encodeURIComponent(REDIRECT_URI)
    const ssoLoginUrl = `${SSO_URL}?clientId=${SSO_CLIENT_ID}&redirectUri=${redirectUri}`
    window.location.href = ssoLoginUrl
}

/**
 * 处理SSO回调的code授权码
 */
const handleSSOCallback = async (code: string, authStore: ReturnType<typeof useAuthStore>) => {
    try {
        // 用code换取accessToken
        const res = await authApi.getAccessTokenByCode(code)

        // 检查返回值是否有效
        if (!res || !res.accessToken) {
            console.error('SSO返回数据无效:', res)
            return false
        }

        // 存储token
        authStore.token = res.accessToken
        authStore.expiresIn = parseInt(res.expiresIn) || 7200

        // 构造用户信息
        authStore.userInfo = {
            id: res.userId,
            username: res.username || res.account,
            name: res.name,
            dept: res.dept,
            officeId: res.officeId
        }

        // 持久化存储
        const expireTime = authStore.expiresIn * 1000
        storage.set('token', authStore.token, expireTime)
        storage.set('userInfo', authStore.userInfo, expireTime)

        // 清除URL中的code参数
        window.history.replaceState({}, '', window.location.origin + window.location.pathname)

        return true
    } catch (error) {
        console.error('SSO授权码验证失败:', error)
        ElMessage.error('登录验证失败，请重试')
        return false
    }
}

/**
 * 全局前置守卫
 */
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const routeStore = useRouteStore()

    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 统一身份认证系统` : '统一身份认证系统'

    // 检查URL中是否有code参数（SSO回调）
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (code) {
        // 清除URL中的code参数
        window.history.replaceState({}, '', window.location.origin + window.location.pathname)

        // 如果已登录，先清除旧的登录状态（不调用logout接口，避免跳转）
        if (authStore.isLoggedIn) {
            authStore.token = ''
            authStore.userInfo = null
            authStore.expiresIn = 0
            storage.remove('token')
            storage.remove('userInfo')
            const { useRouteStore: _useRouteStore } = await import('@/stores/route')
            _useRouteStore().resetRoutes()
        }

        // 处理SSO回调
        const success = await handleSSOCallback(code, authStore)
        if (success) {
            // 登录成功，继续加载路由
            try {
                await routeStore.loadMenusAndRoutes()
                next({ path: '/admin/dashboard', replace: true })
            } catch (error) {
                console.error('加载路由失败:', error)
                authStore.logout()
                // SSO失败，标记后跳转本地登录页
                next({ path: '/login', query: { ssoFailed: '1' } })
            }
            return
        } else {
            // 登录失败，标记后跳转到本地登录页
            next({ path: '/login', query: { ssoFailed: '1' } })
            return
        }
    }

    // 判断是否已登录
    if (authStore.isLoggedIn) {
        if (to.path === '/login') {
            // 已登录访问登录页，跳转到首页
            next('/admin/dashboard')
        } else {
            // 检查动态路由是否已加载
            if (!routeStore.isRoutesLoaded) {
                try {
                    // 加载菜单和动态路由
                    await routeStore.loadMenusAndRoutes()
                    // 路由加载完成后，重新导航到目标页面
                    next({ ...to, replace: true })
                } catch (error) {
                    console.error('加载路由失败:', error)
                    // 加载失败，退出登录
                    authStore.logout()
                    next({ path: '/login', query: { ssoFailed: '1' } })
                }
            } else {
                next()
            }
        }
    } else {
        // 未登录
        if (to.path === '/404') {
            // 404页面允许访问
            next()
        } else if (to.path === '/login' && to.query.ssoFailed === '1') {
            // SSO失败后允许访问本地登录页
            next()
        } else {
            // 其他情况跳转到SSO登录页
            redirectToSSO()
        }
    }
})

/**
 * 全局后置守卫
 */
router.afterEach((to, from) => {
    // 可以在这里添加页面访问统计等逻辑
    console.log(`路由跳转: ${from.path} -> ${to.path}`)
})

/**
 * 全局错误处理
 */
router.onError((error) => {
    console.error('路由错误:', error)
    ElMessage.error('页面加载失败,请刷新重试')
})

export default router
