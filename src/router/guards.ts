import router from './index'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

/**
 * 全局前置守卫
 */
// router.beforeEach(async (to, from, next) => {
//     const authStore = useAuthStore()

//     // 设置页面标题
//     document.title = to.meta.title ? `${to.meta.title} - 统一身份认证系统` : '统一身份认证系统'

//     // 判断是否需要登录
//     if (to.meta.requiresAuth) {
//         if (authStore.isLoggedIn) {
//             // 已登录,检查权限
//             if (to.meta.permission) {
//                 const permission = to.meta.permission as string
//                 if (authStore.hasPermission(permission)) {
//                     next()
//                 } else {
//                     ElMessage.error('您没有权限访问该页面')
//                     next(false)
//                 }
//             } else {
//                 next()
//             }
//         } else {
//             // 未登录,跳转到登录页
//             next({
//                 path: '/login',
//                 query: {
//                     redirect: to.fullPath
//                 }
//             })
//         }
//     } else {
//         // 不需要登录
//         if (to.path === '/login' && authStore.isLoggedIn) {
//             // 已登录用户访问登录页,跳转到首页
//             next('/admin/dashboard')
//         } else {
//             next()
//         }
//     }
// })

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
