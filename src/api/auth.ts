import request from '@/utils/request'
import type {
    LoginParams,
    LoginResponse,
    QRCodeData,
    QRStatusData,
    VerifyIdentityParams,
    ResetPasswordParams
} from '@/types'

/**
 * 账号密码登录
 */
export const login = (params: LoginParams) => {
  return request.postWithOption<LoginResponse>({ url: '/auth/login', data: params })
}

/**
 * 生成二维码
 */
export const generateQRCode = (params: { clientId: string; redirectUri: string }) => {
    return request.postWithOption<QRCodeData>({ url: '/sso/qr/generate', params })
}

/**
 * 查询二维码状态
 */
export const checkQRStatus = (qrToken: string) => {
    return request.get<QRStatusData>('/sso/qr/status', { params: { qrToken } })
}

/**
 * 获取 OAuth2 访问令牌
 */
export const getAccessToken = (params: {
    grant_type: string
    code: string
    client_id: string
    redirect_uri: string
}) => {
    return request.post('/sso/oauth2/access-token', params)
}

/**
 * 忘记密码 - 验证身份
 */
export const verifyIdentity = (params: VerifyIdentityParams) => {
    return request.post('/sso/forgot-password/verify', params)
}

/**
 * 忘记密码 - 重置密码
 */
export const resetPassword = (params: ResetPasswordParams) => {
    return request.post('/sso/forgot-password/reset', params)
}

/**
 * 退出登录
 */
export const logout = () => {
    return request.post('/auth/logout')
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = (id: string) => {
    return request.get('/admin/user/get', { params: { id } })
}

/**
 * 通过授权码获取accessToken
 */
export const getAccessTokenByCode = (code: string) => {
  return request.post('/sso/accessToken', null, { params: { code } })
}

/**
 * 修改密码
 */
export const savePassword = (params: { newPassword: string; confirmPassword: string }) => {
  return request.post('/profile/save-password', params)
}
