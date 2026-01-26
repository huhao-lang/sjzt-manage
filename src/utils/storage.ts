/**
 * 本地存储数据结构
 */
interface StorageData<T> {
    value: T
    expire: number | null
}

/**
 * 本地存储工具类
 */
class Storage {
    /**
     * 设置存储项
     * @param key 键名
     * @param value 值
     * @param expire 过期时间(毫秒),不传则永久有效
     */
    set<T>(key: string, value: T, expire?: number): void {
        const data: StorageData<T> = {
            value,
            expire: expire ? Date.now() + expire : null
        }
        try {
            localStorage.setItem(key, JSON.stringify(data))
        } catch (error) {
            console.error('存储数据失败:', error)
        }
    }

    /**
     * 获取存储项
     * @param key 键名
     * @returns 值,如果不存在或已过期则返回 null
     */
    get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key)
            if (!item) return null

            const data: StorageData<T> = JSON.parse(item)

            // 检查是否过期
            if (data.expire && Date.now() > data.expire) {
                this.remove(key)
                return null
            }

            return data.value
        } catch (error) {
            console.error('读取数据失败:', error)
            return null
        }
    }

    /**
     * 移除存储项
     * @param key 键名
     */
    remove(key: string): void {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error('移除数据失败:', error)
        }
    }

    /**
     * 清空所有存储项
     */
    clear(): void {
        try {
            localStorage.clear()
        } catch (error) {
            console.error('清空存储失败:', error)
        }
    }

    /**
     * 检查键是否存在
     * @param key 键名
     * @returns 是否存在
     */
    has(key: string): boolean {
        return this.get(key) !== null
    }

    /**
     * 获取所有键名
     * @returns 键名数组
     */
    keys(): string[] {
        try {
            return Object.keys(localStorage)
        } catch (error) {
            console.error('获取键名失败:', error)
            return []
        }
    }
}

/**
 * Session 存储工具类
 */
class SessionStorage {
    /**
     * 设置存储项
     * @param key 键名
     * @param value 值
     */
    set<T>(key: string, value: T): void {
        try {
            sessionStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error('存储数据失败:', error)
        }
    }

    /**
     * 获取存储项
     * @param key 键名
     * @returns 值,如果不存在则返回 null
     */
    get<T>(key: string): T | null {
        try {
            const item = sessionStorage.getItem(key)
            return item ? JSON.parse(item) : null
        } catch (error) {
            console.error('读取数据失败:', error)
            return null
        }
    }

    /**
     * 移除存储项
     * @param key 键名
     */
    remove(key: string): void {
        try {
            sessionStorage.removeItem(key)
        } catch (error) {
            console.error('移除数据失败:', error)
        }
    }

    /**
     * 清空所有存储项
     */
    clear(): void {
        try {
            sessionStorage.clear()
        } catch (error) {
            console.error('清空存储失败:', error)
        }
    }

    /**
     * 检查键是否存在
     * @param key 键名
     * @returns 是否存在
     */
    has(key: string): boolean {
        return this.get(key) !== null
    }
}

// 导出单例
export const storage = new Storage()
export const sessionStorage = new SessionStorage()

export default storage
