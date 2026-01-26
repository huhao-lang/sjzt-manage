import CryptoJS from 'crypto-js'

/**
 * 密码加密密钥
 * 与原系统保持一致
 */
const SECRET_KEY = 'XiZangJiaoFaSSO2024@Secret#Key'

/**
 * 加密密码
 * @param password 明文密码
 * @returns 加密后的密码
 */
export const encryptPassword = (password: string): string => {
    try {
        return CryptoJS.AES.encrypt(password, SECRET_KEY).toString()
    } catch (error) {
        console.error('密码加密失败:', error)
        return ''
    }
}

/**
 * 解密密码
 * @param encryptedPassword 加密的密码
 * @returns 解密后的明文密码
 */
export const decryptPassword = (encryptedPassword: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY)
        return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
        console.error('密码解密失败:', error)
        return ''
    }
}

/**
 * MD5 哈希
 * @param text 待哈希的文本
 * @returns MD5 哈希值
 */
export const md5 = (text: string): string => {
    return CryptoJS.MD5(text).toString()
}

/**
 * SHA256 哈希
 * @param text 待哈希的文本
 * @returns SHA256 哈希值
 */
export const sha256 = (text: string): string => {
    return CryptoJS.SHA256(text).toString()
}

/**
 * Base64 编码
 * @param text 待编码的文本
 * @returns Base64 编码后的字符串
 */
export const base64Encode = (text: string): string => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))
}

/**
 * Base64 解码
 * @param encodedText Base64 编码的字符串
 * @returns 解码后的文本
 */
export const base64Decode = (encodedText: string): string => {
    return CryptoJS.enc.Base64.parse(encodedText).toString(CryptoJS.enc.Utf8)
}
