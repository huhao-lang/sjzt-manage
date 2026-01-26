<template>
  <div class="qr-login-container">
    <!-- 二维码容器 -->
    <div class="qr-code-wrapper">
      <img :src="qrCodeImage" alt="扫码登录二维码" class="qr-code-image" />

      <!-- 过期覆盖层 -->
      <div v-if="isExpired" class="qr-expired-overlay" @click="refreshQRCode">
        <div class="expired-content">
          <el-icon :size="32" class="refresh-icon">
            <Refresh />
          </el-icon>
          <div class="expired-title">二维码已过期</div>
          <div class="expired-subtitle">点击刷新</div>
        </div>
      </div>
    </div>

    <!-- 状态文本 -->
    <p class="qr-status-text">{{ statusText }}</p>

    <!-- 返回账号登录 -->
    <div class="back-to-account">
      <a href="javascript:void(0);" @click="handleBackToAccount">使用账号密码登录</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { generateQRCode, checkQRStatus, type QRCodeData, type QRStatusData } from '@/api/auth'

interface Props {
  redirectUri?: string
  clientId?: string
}

const props = defineProps<Props>()

interface Emits {
  (e: 'switchToAccount'): void
}

const emit = defineEmits<Emits>()

const router = useRouter()

// 二维码数据
const qrToken = ref('')
const qrCodeImage = ref('/assets/img/login-qr.png')
const qrExpireTime = ref(0)
const statusText = ref('正在加载二维码...')
const isExpired = ref(false)

// 轮询定时器
let statusInterval: number | null = null
let countdownInterval: number | null = null

// 状态文本映射
const statusTextMap: Record<string, string> = {
  waiting: '请使用手机APP扫描二维码登录',
  scanned: '已扫描,请在手机上确认登录',
  confirmed: '登录成功,正在跳转...',
  cancelled: '登录已取消,请重新扫码',
  expired: '二维码已过期,点击刷新'
}

// 获取二维码
const getQRCode = async () => {
  try {
    statusText.value = '正在生成二维码...'
    qrCodeImage.value = '/assets/img/login-qr.png'
    isExpired.value = false

    const data = await generateQRCode({
      clientId: props.clientId || '1000',
      redirectUri: props.redirectUri || ''
    })

    qrToken.value = data.qrToken
    qrExpireTime.value = data.expireTime
    qrCodeImage.value = data.qrCodeImage

    statusText.value = statusTextMap.waiting

    // 开始轮询状态
    startStatusPolling()
    // 开始倒计时
    startCountdown()
  } catch (error: any) {
    ElMessage.error(error.message || '获取二维码失败')
    statusText.value = '获取二维码失败,请稍后重试'
  }
}

// 开始轮询二维码状态
const startStatusPolling = () => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }

  statusInterval = window.setInterval(async () => {
    // 检查本地过期时间
    if (qrExpireTime.value && Date.now() >= qrExpireTime.value) {
      showExpired()
      return
    }

    if (qrToken.value) {
      await checkStatus()
    }
  }, 2000) // 每2秒轮询一次
}

// 检查二维码状态
const checkStatus = async () => {
  try {
    const data = await checkQRStatus(qrToken.value)

    statusText.value = statusTextMap[data.status] || data.message

    switch (data.status) {
      case 'scanned':
        // 已扫描
        break
      case 'confirmed':
        // 已确认,登录成功
        stopPolling()
        handleLoginSuccess(data)
        break
      case 'cancelled':
        // 已取消
        stopPolling()
        break
      case 'expired':
        // 已过期
        showExpired()
        break
    }
  } catch (error: any) {
    console.error('状态检查失败:', error)
  }
}

// 处理登录成功
const handleLoginSuccess = (data: QRStatusData) => {
  ElMessage.success('登录成功')

  setTimeout(() => {
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl
    } else if (props.redirectUri) {
      window.location.href = props.redirectUri
    } else {
      router.push('/admin/dashboard')
    }
  }, 500)
}

// 显示过期状态
const showExpired = () => {
  stopPolling()
  isExpired.value = true
  statusText.value = statusTextMap.expired
}

// 刷新二维码
const refreshQRCode = () => {
  cleanup()
  getQRCode()
}

// 开始倒计时
const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  if (!qrExpireTime.value) return

  countdownInterval = window.setInterval(() => {
    const remaining = qrExpireTime.value - Date.now()
    if (remaining <= 0) {
      clearInterval(countdownInterval!)
      showExpired()
    }
  }, 1000)
}

// 停止轮询
const stopPolling = () => {
  if (statusInterval) {
    clearInterval(statusInterval)
    statusInterval = null
  }
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

// 清理资源
const cleanup = () => {
  stopPolling()
  qrToken.value = ''
  qrExpireTime.value = 0
  isExpired.value = false
}

// 返回账号登录
const handleBackToAccount = () => {
  cleanup()
  emit('switchToAccount')
}

// 组件挂载时获取二维码
onMounted(() => {
  getQRCode()
})

// 组件卸载时清理资源
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.qr-login-container {
  text-align: center;
  padding: 20px 0;
}

.qr-code-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;

  .qr-code-image {
    width: 276px;
    height: 276px;
    border: 1px solid #ddd;
    border-radius: 8px;
    transition: opacity 0.3s;
  }

  .qr-expired-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    .expired-content {
      color: white;
      text-align: center;

      .refresh-icon {
        margin-bottom: 10px;
        animation: rotate 2s linear infinite;
      }

      .expired-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .expired-subtitle {
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }
}

.qr-status-text {
  color: #999;
  font-size: 14px;
  margin: 16px 0;
  min-height: 20px;
}

.back-to-account {
  margin-top: 16px;

  a {
    color: #0154a1;
    font-size: 14px;
    text-decoration: none;
    transition: color 0.3s;

    &:hover {
      color: #3a7bd5;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .qr-code-wrapper {
    .qr-code-image {
      width: 220px;
      height: 220px;
    }
  }
}
</style>
