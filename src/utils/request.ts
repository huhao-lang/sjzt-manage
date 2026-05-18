import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { ApiResponse } from '@/types'

/**
 * API 前缀（从环境变量读取）
 */
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api'

/**
 * 创建 Axios 实例
 */
const service: AxiosInstance = axios.create({
    baseURL: API_PREFIX,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
})

/**
 * 请求拦截器
 */
service.interceptors.request.use(
    (config) => {
        const tokenStr = localStorage.getItem('token')
        if (tokenStr) {
            try {
                const tokenData = JSON.parse(tokenStr)
                if (tokenData.value) {
                    config.headers.Authorization = `Bearer ${tokenData.value}`
                }
            } catch {
                config.headers.Authorization = `Bearer ${tokenStr}`
            }
        }
        return config
    },
    (error: AxiosError) => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

/**
 * 响应拦截器
 */
service.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        const { code, data, message } = response.data

        // code 1: 成功，返回 data（现有接口）
        // code 200: 成功，返回完整响应（审计接口）
        // code 0: 部分成功，返回完整响应（审计接口批量操作）
        if (code === 1) {
            return data
        } else if (code === 200 || code === 0) {
            return response.data
        } else {
            // ElMessage.error(message || '请求失败')
            return Promise.reject(new Error(message || '请求失败'))
        }
    },
    (error: AxiosError<ApiResponse>) => {
        let errorMessage = '网络错误'

        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 400:
                    errorMessage = data?.message || '请求参数错误'
                    break
                case 401: {
                    errorMessage = '未授权,请重新登录'
                    const authStore = useAuthStore()
                    authStore.logout()
                    break
                }
                case 403: {
                    errorMessage = '拒绝访问'
                    const authStore = useAuthStore()
                    authStore.logout()
                    break
                }
                case 404:
                    errorMessage = '请求的资源不存在'
                    break
                case 500:
                    errorMessage = data?.message || '服务器内部错误'
                    break
                case 502:
                    errorMessage = '网关错误'
                    break
                case 503:
                    errorMessage = '服务不可用'
                    break
                case 504:
                    errorMessage = '网关超时'
                    break
                default:
                    errorMessage = data?.message || `请求失败(${status})`
            }
        } else if (error.request) {
            errorMessage = '网络连接失败,请检查网络'
        } else {
            errorMessage = error.message || '请求配置错误'
        }

        ElMessage.error(errorMessage)
        return Promise.reject(error)
    }
)

/**
 * 封装请求方法
 */
class Request {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.get(url, config)
    }

    getWithOption<T = any>(option: { url: string; params?: any; config?: AxiosRequestConfig }): Promise<T> {
        const { url, params, config } = option
        return service.get(url, { ...config, params })
    }

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.post(url, data, config)
    }

    postWithOption<T = any>(option: { url: string; data?: any; params?: any; config?: AxiosRequestConfig }): Promise<T> {
        const { url, data, params, config } = option
        return service.post(url, data, { ...config, params })
    }

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.put(url, data, config)
    }

    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.delete(url, config)
    }

    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.patch(url, data, config)
    }

    upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
        return service.post(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }

    download(url: string, filename: string, config?: AxiosRequestConfig): Promise<void> {
        return service
            .get(url, {
                ...config,
                responseType: 'blob'
            })
            .then((data: any) => {
                const blob = new Blob([data])
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = filename
                link.click()
                URL.revokeObjectURL(link.href)
            })
    }
}

export default new Request()
