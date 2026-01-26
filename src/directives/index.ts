import { App, Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * 权限指令
 * 用法: v-permission="'user:edit'"
 * 或: v-permission="['user:edit', 'user:delete']"
 */
const permission: Directive = {
    mounted(el, binding) {
        const { value } = binding
        const authStore = useAuthStore()

        if (value) {
            let hasPermission = false

            if (Array.isArray(value)) {
                // 数组形式,只要有一个权限即可
                hasPermission = authStore.hasAnyPermission(value)
            } else if (typeof value === 'string') {
                // 字符串形式
                hasPermission = authStore.hasPermission(value)
            }

            if (!hasPermission) {
                // 没有权限,移除元素
                el.parentNode?.removeChild(el)
            }
        } else {
            throw new Error('权限指令需要指定权限值')
        }
    }
}

/**
 * 角色指令
 * 用法: v-role="'admin'"
 * 或: v-role="['admin', 'manager']"
 */
const role: Directive = {
    mounted(el, binding) {
        const { value } = binding
        const authStore = useAuthStore()

        if (value) {
            let hasRole = false

            if (Array.isArray(value)) {
                // 数组形式,只要有一个角色即可
                hasRole = authStore.hasAnyRole(value)
            } else if (typeof value === 'string') {
                // 字符串形式
                hasRole = authStore.hasRole(value)
            }

            if (!hasRole) {
                // 没有角色,移除元素
                el.parentNode?.removeChild(el)
            }
        } else {
            throw new Error('角色指令需要指定角色值')
        }
    }
}

/**
 * 注册所有自定义指令
 */
export const setupDirectives = (app: App) => {
    app.directive('permission', permission)
    app.directive('role', role)
}

export default {
    permission,
    role
}
