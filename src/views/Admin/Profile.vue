<template>
  <div class="profile">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :xs="24" :lg="8">
        <el-card>
          <div class="profile-header">
            <el-avatar :size="100" :src="userInfo?.avatar">
              <img src="/assets/avatars/user.jpg" />
            </el-avatar>
            <h3 class="username">{{ userInfo?.name }}</h3>
            <p class="user-role">{{ userInfo?.username }}</p>
          </div>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="邮箱">{{ userInfo?.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ userInfo?.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="所属机构">{{ userInfo?.officeName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="userInfo?.status === 1 ? 'success' : 'danger'">
                {{ userInfo?.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 右侧信息编辑 -->
      <el-col :xs="24" :lg="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>

          <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile" :loading="submitting">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>

          <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleUpdatePassword" :loading="passwordSubmitting">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validatePhone } from '@/utils/validator'

const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const submitting = ref(false)
const passwordSubmitting = ref(false)

const userInfo = computed(() => authStore.userInfo)

const formData = reactive({
  name: '',
  email: '',
  phone: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && !validateEmail(value)) {
          callback(new Error('邮箱格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && !validatePhone(value)) {
          callback(new Error('手机号格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleUpdateProfile = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // TODO: 调用实际接口
    ElMessage.success('保存成功')
    authStore.getCurrentUser()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()

    passwordSubmitting.value = true

    // TODO: 调用实际接口
    ElMessage.success('密码修改成功,请重新登录')
    
    // 重置表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordFormRef.value.resetFields()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    passwordSubmitting.value = false
  }
}

onMounted(() => {
  if (userInfo.value) {
    formData.name = userInfo.value.name
    formData.email = userInfo.value.email || ''
    formData.phone = userInfo.value.phone || ''
  }
})
</script>

<style scoped lang="scss">
.profile {
  .profile-header {
    text-align: center;
    padding: 20px 0;

    .username {
      margin: 16px 0 8px;
      font-size: 20px;
      font-weight: 600;
    }

    .user-role {
      color: #909399;
      font-size: 14px;
    }
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
  }

  .mt-20 {
    margin-top: 20px;
  }
}
</style>
