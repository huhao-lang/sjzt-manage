/**
 * 格式化后端返回的日期时间，仅调整展示格式，不做时区换算。
 * 例如：2026-09-11T13:55:29.000+00:00 -> 2026-09-11 13:55:29
 */
export const formatDateTime = (value?: string | Date | number | null): string => {
    if (value === null || value === undefined || value === '') {
        return '-'
    }

    const text = String(value).trim()
    const match = text.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/)
    return match ? `${match[1]} ${match[2]}` : text
}
