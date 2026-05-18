<template>
  <el-form ref="formRef" :model="loginForm" :rules="rules" class="account-login-form">
    <!-- 用户名输入框 -->
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" placeholder="账号" size="large" clearable @input="handleUsernameChange">
        <template #prefix>
          <img src="/assets/img/login-user.png" alt="用户名" class="input-icon" />
        </template>
      </el-input>
    </el-form-item>

    <!-- 密码输入框 -->
    <el-form-item prop="password">
      <el-input v-model="loginForm.password" :type="passwordVisible ? 'text' : 'password'" placeholder="密码"
        size="large" clearable @keydown.enter="handleLogin">
        <template #prefix>
          <img src="/assets/img/login-password.png" alt="密码" class="input-icon" />
        </template>
        <template #suffix>
          <img :src="passwordIconSrc" alt="显示/隐藏密码" class="password-toggle" @click="togglePasswordVisible" />
        </template>
      </el-input>
    </el-form-item>

    <!-- 记住密码和忘记密码 -->
    <div class="form-options">
      <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
      <a href="javascript:void(0);" class="forgot-password" @click="handleForgotPassword">忘记密码?</a>
    </div>

    <!-- 登录按钮 -->
    <el-button type="primary" size="large" class="login-button" :loading="loading" @click="handleLogin">
      登录
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { verifyCode } from '@/api/auth'
import { encryptPassword, decryptPassword } from '@/utils/crypto'
import storage from '@/utils/storage'

interface Props {
  redirectUri?: string
  clientId?: string
}

const props = defineProps<Props>()

const router = useRouter()
const authStore = useAuthStore()

// 注入忘记密码弹窗控制
const openForgotPassword = inject<() => void>('openForgotPassword')

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 记住密码
const rememberMe = ref(false)

// 密码可见性
const passwordVisible = ref(false)

// 加载状态
const loading = ref(false)

// 保存的用户名和密码
const savedUsername = ref('')
const savedPassword = ref('')

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, message: '账号长度至少2位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' }
  ]
}

// 计算属性
const passwordIconSrc = computed(() => {
  return passwordVisible.value
    ? '/assets/img/login-visible.png'
    : '/assets/img/login-noVisible.png'
})

// 切换密码可见性
const togglePasswordVisible = () => {
  passwordVisible.value = !passwordVisible.value
}

// 处理用户名变化
const handleUsernameChange = () => {
  // 如果当前输入的用户名与保存的不同,取消勾选"记住密码"并清空密码
  if (savedUsername.value && loginForm.username !== savedUsername.value) {
    rememberMe.value = false
    loginForm.password = ''
  } else if (loginForm.username === savedUsername.value && savedPassword.value) {
    // 如果改回原来的用户名,重新勾选并填充密码
    rememberMe.value = true
    const decrypted = decryptPassword(savedPassword.value)
    if (decrypted) {
      loginForm.password = decrypted
    }
  }
}

// 处理登录
const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    loading.value = true

    // 处理记住密码
    if (rememberMe.value) {
      const encrypted = encryptPassword(loginForm.password)
      if (encrypted) {
        storage.set('_username', loginForm.username, 30 * 24 * 60 * 60 * 1000) // 30天
        storage.set('_password', encrypted, 30 * 24 * 60 * 60 * 1000)
      }
    } else {
      storage.remove('_username')
      storage.remove('_password')
    }

    // 调用登录接口
    const res = await authStore.login({
      username: loginForm.username,
      password: loginForm.password
    })

    // 调用 /code 接口验证授权码（不等待返回）
    // if (res.code) {
    //   verifyCode(res.code)
    // }

    ElMessage.success('登录成功')

    // 登录成功后跳转到管理后台
    router.push('/admin/dashboard')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 处理忘记密码
const handleForgotPassword = () => {
  openForgotPassword?.()
}

// 页面加载时从 Cookie 读取用户名和密码
onMounted(() => {
  savedUsername.value = storage.get<string>('_username') || ''
  savedPassword.value = storage.get<string>('_password') || ''

  if (savedUsername.value) {
    loginForm.username = savedUsername.value
    rememberMe.value = true

    if (savedPassword.value) {
      const decrypted = decryptPassword(savedPassword.value)
      if (decrypted) {
        loginForm.password = decrypted
      }
    }
  }
})
</script>

<style scoped lang="scss">
.account-login-form {
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  :deep(.el-input__wrapper) {
    padding: 12px 16px;
    border-radius: 8px;
  }

  .input-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }

  .password-toggle {
    width: 16px;
    height: 16px;
    cursor: pointer;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.7;
    }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .forgot-password {
    color: #0154a1;
    font-size: 14px;
    text-decoration: none;
    transition: color 0.3s;

    &:hover {
      color: #3a7bd5;
    }
  }
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #0154a1 0%, #3a7bd5 100%);
  border: none;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 84, 161, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
