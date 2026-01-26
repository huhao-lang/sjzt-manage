// ==================== 通用类型 ====================

/**
 * API 响应结构
 */
export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
}

/**
 * 分页参数
 */
export interface PageParams {
    current: number
    size: number
}

/**
 * 分页结果
 */
export interface PageResult<T> {
    records: T[]
    total: number
    current: number
    size: number
    pages: number
}

/**
 * 菜单项
 */
export interface MenuItem {
    id: number
    parentId: number | null
    name: string
    url?: string
    icon?: string
    sort?: number
    children?: MenuItem[]
}

/**
 * 用户信息（来自 tokenUser）
 */
export interface TokenUser {
    id: string
    username: string
    phone?: string
    idNumber?: string
    org1Id?: string | null
    org1Name?: string | null
    org2Id?: string | null
    org2Name?: string | null
}

/**
 * 用户信息
 */
export interface UserInfo {
    id: string
    username: string
    name: string
    dept?: string
    email?: string
    phone?: string
    idNumber?: string
    avatar?: string
    roles?: string[]
    permissions?: string[]
}

// ==================== 认证相关类型 ====================

/**
 * 登录参数
 */
export interface LoginParams {
    username: string
    password: string
    redirectUri?: string
    clientId?: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
    expiresIn: number
    tgt: string
    redirectUri: string
    name: string
    dept: string
    tokenUser: TokenUser
    accessToken: string
    userId: string
    refreshToken: string
}

/**
 * 二维码数据
 */
export interface QRCodeData {
    qrToken: string
    qrCodeImage: string
    expireTime: number
}

/**
 * 二维码状态
 */
export type QRStatus = 'waiting' | 'scanned' | 'confirmed' | 'cancelled' | 'expired'

/**
 * 二维码状态数据
 */
export interface QRStatusData {
    status: QRStatus
    message: string
    redirectUrl?: string
    authCode?: string
}

/**
 * 忘记密码 - 验证身份参数
 */
export interface VerifyIdentityParams {
    name: string
    idNumber: string
}

/**
 * 忘记密码 - 重置密码参数
 */
export interface ResetPasswordParams {
    name: string
    idNumber: string
    newPassword: string
}

// ==================== 用户管理相关类型 ====================

/**
 * 用户
 */
export interface User {
    id: number
    username: string
    name: string
    email?: string
    phone?: string
    idNumber?: string
    officeId?: number
    officeName?: string
    status: number
    createTime: string
    updateTime?: string
}

/**
 * 用户分页参数
 */
export interface UserPageParams extends PageParams {
    username?: string
    name?: string
    officeId?: number
    status?: number
}

/**
 * 用户创建参数
 */
export interface UserCreateParams {
    username: string
    password: string
    name: string
    email?: string
    phone?: string
    idNumber?: string
    officeId?: number
}

/**
 * 用户更新参数
 */
export interface UserUpdateParams {
    id: number
    name: string
    email?: string
    phone?: string
    idNumber?: string
    officeId?: number
    status?: number
}

/**
 * 用户角色
 */
export interface UserRole {
    userId: number
    roleId: number
}

// ==================== 角色管理相关类型 ====================

/**
 * 角色
 */
export interface Role {
    id: number
    name: string
    code: string
    description?: string
    sort?: number
    status: number
    createTime: string
    updateTime?: string
}

/**
 * 角色分页参数
 */
export interface RolePageParams extends PageParams {
    name?: string
    code?: string
    status?: number
}

/**
 * 角色创建参数
 */
export interface RoleCreateParams {
    name: string
    code: string
    description?: string
    sort?: number
}

/**
 * 角色更新参数
 */
export interface RoleUpdateParams {
    id: number
    name: string
    code: string
    description?: string
    sort?: number
    status?: number
}

/**
 * 角色权限
 */
export interface RolePermission {
    roleId: number
    permissionId: number
}

// ==================== 权限管理相关类型 ====================

/**
 * 权限
 */
export interface Permission {
    id: number
    parentId: number | null
    name: string
    code: string
    type: 'menu' | 'button'
    url?: string
    icon?: string
    sort?: number
    status: number
    createTime: string
    updateTime?: string
    children?: Permission[]
}

/**
 * 权限树参数
 */
export interface PermissionTreeParams {
    type?: 'menu' | 'button'
    status?: number
}

// ==================== 应用管理相关类型 ====================

/**
 * 应用
 */
export interface App {
    id: number
    name: string
    code: string
    redirectUri: string
    logoutUri?: string
    description?: string
    status: number
    createTime: string
    updateTime?: string
}

/**
 * 应用分页参数
 */
export interface AppPageParams extends PageParams {
    name?: string
    code?: string
    status?: number
}

/**
 * 应用创建参数
 */
export interface AppCreateParams {
    name: string
    code: string
    redirectUri: string
    logoutUri?: string
    description?: string
}

/**
 * 应用更新参数
 */
export interface AppUpdateParams {
    id: number
    name: string
    code: string
    redirectUri: string
    logoutUri?: string
    description?: string
    status?: number
}

// ==================== 机构管理相关类型 ====================

/**
 * 机构
 */
export interface Office {
    id: string
    parentId: string | null
    name: string
    code?: string
    type?: string
    address?: string
    phone?: string
    sort?: number
    isEnable: boolean
    status?: number
    createTime?: string
    updateTime?: string
    children?: Office[]
}

/**
 * 机构树参数
 */
export interface OfficeTreeParams {
    type?: string
    status?: number
}

/**
 * 机构创建参数
 */
export interface OfficeCreateParams {
    parentId: number | null
    name: string
    code: string
    type: string
    address?: string
    phone?: string
    sort?: number
}

/**
 * 机构更新参数
 */
export interface OfficeUpdateParams {
    id: number
    parentId: number | null
    name: string
    code: string
    type: string
    address?: string
    phone?: string
    sort?: number
    status?: number
}
