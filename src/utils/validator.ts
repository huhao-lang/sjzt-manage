/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): boolean => {
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return reg.test(email)
}

/**
 * 验证手机号格式
 */
export const validatePhone = (phone: string): boolean => {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(phone)
}

/**
 * 验证身份证号格式
 */
export const validateIdNumber = (idCard: string): boolean => {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return reg.test(idCard)
}

/**
 * 验证密码强度（至少6位，包含字母和数字）
 */
export const validatePassword = (password: string): boolean => {
    const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
    return reg.test(password)
}
