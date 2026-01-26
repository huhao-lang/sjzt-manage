<template>
  <el-dialog v-model="dialogVisible" title="忘记密码" width="500px" :close-on-click-modal="false"
    @close="handleClose">
    <!-- 第一步: 验证身份 -->
    <div v-if="currentStep === 1" class="step-container">
      <p class="step-description">请输入您的姓名和身份证号码进行身份验证</p>

      <el-form ref="step1FormRef" :model="step1Form" :rules="step1Rules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="step1Form.name" placeholder="请输入姓名" clearable />
        </el-form-item>

        <el-form-item label="身份证号码" prop="idNumber">
          <el-input v-model="step1Form.idNumber" placeholder="请输入身份证号码" maxlength="18" clearable />
        </el-form-item>
      </el-form>
    </div>

    <!-- 第二步: 重置密码 -->
    <div v-if="currentStep === 2" class="step-container">
      <el-alert title="身份验证成功" type="success" :closable="false" show-icon class="success-alert" />

      <el-form ref="step2FormRef" :model="step2Form" :rules="step2Rules" label-width="100px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="step2Form.newPassword" type="password" placeholder="请输入新密码(6-16位)" maxlength="16"
            show-password clearable />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="step2Form.confirmPassword" type="password" placeholder="请再次输入新密码" maxlength="16"
            show-password clearable @keydown.enter="handleResetPassword" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <template v-if="currentStep === 1">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleVerifyIdentity">
            验证身份
          </el-button>
        </template>

        <template v-if="currentStep === 2">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="success" :loading="loading" @click="handleResetPassword">
            确认修改
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { verifyIdentity, resetPassword } from '@/api/auth'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const emit = defineEmits<Emits>()

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 当前步骤
const currentStep = ref(1)

// 加载状态
const loading = ref(false)

// 第一步表单
const step1FormRef = ref<FormInstance>()
const step1Form = reactive({
  name: '',
  idNumber: ''
})

// 第二步表单
const step2FormRef = ref<FormInstance>()
const step2Form = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 身份证号码验证
const validateIdNumber = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入身份证号码'))
    return
  }

  const pattern18 = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  const pattern15 = /^[1-9]\d{5}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}$/

  if (!pattern18.test(value) && !pattern15.test(value)) {
    callback(new Error('身份证号码格式不正确'))
  } else {
    callback()
  }
}

// 确认密码验证
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== step2Form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 第一步验证规则
const step1Rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idNumber: [{ required: true, validator: validateIdNumber, trigger: 'blur' }]
}

// 第二步验证规则
const step2Rules: FormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
}

// 验证身份
const handleVerifyIdentity = async () => {
  if (!step1FormRef.value) return

  try {
    await step1FormRef.value.validate()

    loading.value = true

    await verifyIdentity({
      name: step1Form.name,
      idNumber: step1Form.idNumber
    })

    ElMessage.success('身份验证成功')
    currentStep.value = 2
  } catch (error: any) {
    ElMessage.error(error.message || '身份验证失败')
  } finally {
    loading.value = false
  }
}

// 重置密码
const handleResetPassword = async () => {
  if (!step2FormRef.value) return

  try {
    await step2FormRef.value.validate()

    loading.value = true

    await resetPassword({
      name: step1Form.name,
      idNumber: step1Form.idNumber,
      newPassword: step2Form.newPassword
    })

    ElMessage.success('密码重置成功!请使用新密码登录')
    handleClose()
  } catch (error: any) {
    ElMessage.error(error.message || '密码重置失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 重置表单
const resetForm = () => {
  currentStep.value = 1
  step1Form.name = ''
  step1Form.idNumber = ''
  step2Form.newPassword = ''
  step2Form.confirmPassword = ''
  step1FormRef.value?.resetFields()
  step2FormRef.value?.resetFields()
}

// 监听对话框关闭,重置表单
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    setTimeout(resetForm, 300)
  }
})
</script>

<style scoped lang="scss">
.step-container {
  padding: 20px 0;

  .step-description {
    color: #666;
    font-size: 14px;
    margin-bottom: 24px;
    text-align: center;
  }

  .success-alert {
    margin-bottom: 24px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__header) {
  text-align: center;
  font-size: 22px;
  font-weight: 600;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
