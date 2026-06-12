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
 * 菜单项（用于侧边栏和动态路由）
 */
export interface MenuItem {
    id: string
    parentId: string | null
    name: string
    url?: string
    icon?: string
    sort?: number
    visible?: boolean
    component?: string         // 组件路径
    routeName?: string         // 路由名称
    menuType?: number          // 菜单类型：0=目录, 1=菜单, 2=按钮
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
    username?: string
    account?: string
    name: string
    dept?: string
    officeId?: string
    officeName?: string
    email?: string
    companyEmail?: string
    phone?: string
    idNumber?: string
    gender?: string
    avatar?: string
    roles?: string[]
    permissions?: string[]
    createTime?: string
    updateTime?: string
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
    expiresIn: string
    officeId: string
    userId: string
    name: string
    dept: string
    accessToken: string
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
    account: string
    username: string
    name: string
    email?: string
    phone?: string
    idNumber?: string
    officeId?: string
    officeName?: string
    isEnable: boolean
    lastLoginTime?: string
    createTime?: string
    updateTime?: string
    posts?: string
    jobGrade?: string
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
    code?: string
    description?: string
    sort?: number
    isEnable: boolean
    createTime?: string
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
 * 权限/菜单
 */
export interface Permission {
    id: string
    parentId: string | null
    appId: string,
    name: string
    icon?: string
    url?: string
    routeName?: string         // 路由名称
    component?: string         // 组件路径（相对于 views 目录）
    redirect?: string          // 重定向地址
    perms?: string             // 权限标识
    query?: string             // 路由参数
    visible?: boolean          // 是否显示在菜单中
    isCache?: boolean          // 是否缓存（keep-alive）
    isFrame?: boolean          // 是否外链
    sort?: number
    menuType?: number          // 菜单类型：0=目录, 1=菜单, 2=按钮
    isMenu: boolean
    isEnable: boolean
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
  code: string,
  clientId:string,
    redirectUri?: string
    logoutUri?: string
    description?: string
    sort?: number
    isEnable?: boolean
    status?: number
    userSyncUrl?: string
    deptSyncUrl?: string
    createTime?: string
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

// ==================== 审计管理相关类型 ====================

/**
 * 审计状态
 */
export type AuditStatus = 'PENDING' | 'SUSPENDED' | 'APPROVED' | 'REJECTED'

/**
 * 事件类型
 */
export type EventType = 'CREATE' | 'UPDATE' | 'DELETE'

/**
 * 部门审计记录
 */
export interface DeptAudit {
    id: number
    deptId: number
    parentId: number | null
    name: string
    deptCode: string
    sort: number
    isEnable: boolean
    event: EventType
    eventTime: string
    clientId: string
    sourceSystem: string
    batchNo: string
    auditStatus: AuditStatus
    submitTime: string
    auditorId?: number
    auditorName?: string
    auditTime?: string
    auditOpinion?: string
    rejectReason?: string
}

/**
 * 用户审计记录
 */
export interface UserAudit {
    id: number
    userId: number
    officeId: number
    name: string
    gender: string
    idNumber: string
    phone: string
    jobGrade: string
    deptCode: string
    posts: string
    isEnable: boolean
    event: EventType
    eventTime: string
    clientId: string
    sourceSystem: string
    batchNo: string
    auditStatus: AuditStatus
    submitTime: string
    auditorId?: number
    auditorName?: string
    auditTime?: string
    auditOpinion?: string
    rejectReason?: string
}

/**
 * 审计查询参数
 */
export interface AuditQueryParams {
    auditStatus?: AuditStatus
    clientId?: string
    startTime?: string
    endTime?: string
    pageNum?: number
    pageSize?: number
}

/**
 * 部门审计查询参数
 */
export interface DeptAuditQueryParams extends AuditQueryParams {
    deptName?: string
    parentId?: number | string
    deptId?: number | string
}

/**
 * 用户审计查询参数
 */
export interface UserAuditQueryParams extends AuditQueryParams {
    userName?: string
}

/**
 * 审计通过请求
 */
export interface AuditApproveRequest {
    ids: number[]
    auditorId: number
    auditorName: string
    auditOpinion?: string
    targetClientIds: string[]
}

/**
 * 审计拒绝请求
 */
export interface AuditRejectRequest {
    ids: number[]
    auditorId: number
    auditorName: string
    rejectReason: string
}

/**
 * 审计结果
 */
export interface AuditResult {
    successCount: number
    failureCount: number
    failureMessages: string[]
}

// ==================== 密码修改日志相关类型 ====================

/**
 * 密码修改场景
 */
export type ChangeType = 'PROFILE_CHANGE' | 'FORGOT_PASSWORD'

/**
 * 验证方式
 */
export type VerifyType = 'LOGIN' | 'ID_CARD' | 'SMS' | 'ID_CARD_SMS' | 'UNKNOWN'

/**
 * 密码修改日志
 */
export interface PasswordChangeLog {
    id: number
    userId: number
    account: string
    name: string
    changeType: ChangeType
    verifyType: VerifyType
    operatorUserId: number
    operatorAccount: string
    clientIp: string
    userAgent: string
    changeTime: string
    remark: string
    createTime: string
    updateTime: string
}

/**
 * 密码修改日志查询参数
 */
export interface PasswordChangeLogQueryParams {
    userId?: number
    account?: string
    name?: string
    changeType?: ChangeType
    verifyType?: VerifyType
}

// ==================== 数据同步日志相关类型 ====================

/**
 * 同步类型
 */
export type SyncType = 'PUSH' | 'RECEIVE'

/**
 * 同步数据类型
 */
export type SyncDataType = 'USER' | 'DEPT'

/**
 * 同步操作类型
 */
export type SyncAction = 'CREATE' | 'UPDATE' | 'DELETE'

/**
 * 同步状态
 */
export type SyncStatus = 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'PROCESSING'

/**
 * 数据同步日志记录
 */
export interface SyncLog {
    id: number
    batchNo: string
    syncType: SyncType
    dataType: SyncDataType
    action: SyncAction
    targetSystem: string
    clientId: string
    totalCount: number
    successCount: number
    failedCount: number
    syncStatus: SyncStatus
    syncUrl: string
    errorMessage?: string
    requestBody?: string
    responseBody?: string
    operatorId: number
    operatorName: string
    syncTime: string
    createTime: string
    updateTime: string
}

/**
 * 数据同步日志查询参数
 */
export interface SyncLogQueryParams extends PageParams {
    syncType?: SyncType | ''
    dataType?: SyncDataType | ''
    syncStatus?: SyncStatus | ''
    clientId?: string
}
