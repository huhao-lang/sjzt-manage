import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { ApiResponse } from '@/types'

/**
 * 创建 Axios 实例
 */
const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 10000,
    withCredentials: true, // 允许携带 cookie（如果后端设置了 Set-Cookie，浏览器会自动处理）
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
})

/**
 * 请求拦截器
 */
service.interceptors.request.use(
    (config) => {
        // 认证通过 cookie 方式（TGC / smart-sso-token），由浏览器自动携带
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

        // 根据后端约定,code 为 1 表示成功
        if (code === 1) {
            return data
        } else {
            // 业务错误
            ElMessage.error(message || '请求失败')
            return Promise.reject(new Error(message || '请求失败'))
        }
    },
    (error: AxiosError<ApiResponse>) => {
        // HTTP 错误
        let errorMessage = '网络错误'

        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 400:
                    errorMessage = data?.message || '请求参数错误'
                    break
                case 401: {
                    errorMessage = '未授权,请重新登录'
                    // 清除登录信息并跳转到登录页
                    const authStore = useAuthStore()
                    authStore.logout()
                    break
                }
                case 403:
                    errorMessage = '拒绝访问'
                    break
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
    /**
     * GET 请求
     */
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.get(url, config)
    }

    /**
     * GET 请求（支持对象参数）
     */
    getWithOption<T = any>(option: { url: string; params?: any; config?: AxiosRequestConfig }): Promise<T> {
        const { url, params, config } = option
        return service.get(url, { ...config, params })
    }

    /**
     * POST 请求
     */
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.post(url, data, config)
    }

    /**
     * POST 请求（支持对象参数）
     */
    postWithOption<T = any>(option: { url: string; data?: any; params?: any; config?: AxiosRequestConfig }): Promise<T> {
        const { url, data, params, config } = option
        return service.post(url, data, { ...config, params })
    }

    /**
     * PUT 请求
     */
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.put(url, data, config)
    }

    /**
     * PUT 请求（支持对象参数）
     */
    putWithOption<T = any>(option: { url: string; data?: any; params?: any; config?: AxiosRequestConfig }): Promise<T> {
        const { url, data, params, config } = option
        return service.put(url, data, { ...config, params })
    }

    /**
     * DELETE 请求
     */
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.delete(url, config)
    }

    /**
     * DELETE 请求（支持对象参数）
     */
    deleteWithOption<T = any>(option: { url: string; params?: any; config?: AxiosRequestConfig }): Promise<T> {
        const { url, params, config } = option
        return service.delete(url, { ...config, params })
    }

    /**
     * PATCH 请求
     */
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.patch(url, data, config)
    }

    /**
     * PATCH 请求（支持对象参数）
     */
    patchWithOption<T = any>(option: { url: string; data?: any; params?: any; config?: AxiosRequestConfig }): Promise<T> {
        const { url, data, params, config } = option
        return service.patch(url, data, { ...config, params })
    }

    /**
     * 上传文件
     */
    upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
        return service.post(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }

    /**
     * 下载文件
     */
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
