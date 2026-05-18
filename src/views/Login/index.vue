<template>
  <div class="login-container">
    <!-- 背景图片 -->
    <div class="background-image"></div>

    <!-- 左上角Logo和标题 -->
    <div class="header-section">
      <div class="logo-container">
        <div class="logo"></div>
      </div>
    </div>

    <!-- 登录表单容器 -->
    <div class="login-form-container">
      <div class="login-form">
        <!-- 表单标题 -->
        <div class="form-header">
          <h2 class="welcome-text">欢迎使用交发平台</h2>
          <!-- <div class="login-method">{{ loginMethodText }}</div> -->
        </div>

        <!-- 二维码/账号切换图标 -->
        <!-- <div class="qr-code-icon" :title="switchIconTitle" @click="toggleLoginMethod">
          <img :src="switchIconSrc" alt="切换登录方式" />
        </div> -->

        <!-- 账号密码登录表单 -->
        <AccountLogin :redirect-uri="redirectUri" :client-id="clientId" />

        <!-- 二维码登录 -->
        <!-- <QRLogin v-show="loginMethod === 'qrcode'" :redirect-uri="redirectUri" :client-id="clientId"
          @switch-to-account="switchToAccount" /> -->
      </div>
    </div>

    <!-- 忘记密码模态框 -->
    <ForgotPassword v-model:visible="showForgotPassword" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import AccountLogin from './AccountLogin.vue'
import QRLogin from './QRLogin.vue'
import ForgotPassword from './ForgotPassword.vue'

// 登录方式: account | qrcode
const loginMethod = ref<'account' | 'qrcode'>('account')
const showForgotPassword = ref(false)

// 从 URL 获取参数
const route = useRoute()
console.log(route.query.redirectUri);

const redirectUri = ref(route.query.redirectUri as string || '')
const clientId = ref(route.query.clientId as string || '')

// 计算属性
const loginMethodText = computed(() => {
  return loginMethod.value === 'account' ? '账号登录' : '扫码登录'
})

const switchIconSrc = computed(() => {
  return loginMethod.value === 'account'
    ? '/assets/img/login-qr.png'
    : '/assets/img/login-amount.png'
})

const switchIconTitle = computed(() => {
  return loginMethod.value === 'account' ? '切换到扫码登录' : '切换到账号登录'
})

// 切换登录方式
const toggleLoginMethod = () => {
  loginMethod.value = loginMethod.value === 'account' ? 'qrcode' : 'account'
}

// 切换到账号登录
const switchToAccount = () => {
  loginMethod.value = 'account'
}

// 提供忘记密码弹窗控制
const openForgotPassword = () => {
  showForgotPassword.value = true
}

provide('openForgotPassword', openForgotPassword)

// 页面加载时检查 URL
onMounted(() => {

})
</script>

<style scoped lang="scss">
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/images/login/bg.png') no-repeat center center;
  background-size: cover;
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }
}

.header-section {
  position: absolute;
  top: 40px;
  left: 60px;
  z-index: 10;

  .logo-container {
    display: flex;
    align-items: center;

    .logo {
      width: 180px;
      height: 60px;
      background: url('/static/custom/assets/logo.png') no-repeat center;
      background-size: contain;
    }
  }
}

.login-form-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;

  .login-form {
    position: relative;
    width: 420px;
    padding: 50px 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }
}

.form-header {
  text-align: center;
  margin-bottom: 40px;

  .welcome-text {
    font-size: 28px;
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
  }

  .login-method {
    font-size: 16px;
    color: #666;
  }
}

.qr-code-icon {
  position: absolute;
  top: 50px;
  right: 40px;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.1);
  }

  img {
    width: 72px;
    height: 72px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header-section {
    top: 20px;
    left: 20px;

    .logo {
      width: 120px;
      height: 40px;
    }
  }

  .login-form-container {
    right: 50%;
    transform: translate(50%, -50%);

    .login-form {
      width: 90vw;
      max-width: 400px;
      padding: 40px 30px;
    }
  }

  .qr-code-icon {
    top: 40px;
    right: 30px;

    img {
      width: 56px;
      height: 56px;
    }
  }
}
</style>
