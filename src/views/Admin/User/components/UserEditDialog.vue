<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名" prop="account">
            <el-input v-model="formData.account" placeholder="请输入用户名" :disabled="isEdit" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="!isEdit">
          <el-form-item label="密码" prop="password">
            <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="!isEdit">
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="formData.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="身份证号" prop="idNumber">
            <el-input v-model="formData.idNumber" placeholder="请输入身份证号" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="所属机构" prop="officeId">
            <el-tree-select
              v-model="formData.officeId"
              :data="officeTree"
              :props="{ label: 'name', value: 'id' }"
              placeholder="请选择所属机构"
              check-strictly
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" v-if="isEdit">
          <el-form-item label="状态" prop="isEnable">
            <el-radio-group v-model="formData.isEnable">
              <el-radio :label="true">启用</el-radio>
              <el-radio :label="false">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="职位" prop="posts">
            <el-input v-model="formData.posts" placeholder="请输入职位" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="职级" prop="jobGrade">
            <el-input v-model="formData.jobGrade" placeholder="请输入职级" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUserDetail, createUser, updateUser } from '@/api/user'
import { validateEmail, validatePhone, validateIdNumber } from '@/utils/validator'
import type { Office } from '@/types'

const props = defineProps<{
  officeTree: Office[]
}>()

const emit = defineEmits<{
  success: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const isEdit = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const currentEditId = ref<string>('')

const formData = reactive({
  account: '',
  name: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  idNumber: '',
  officeId: '',
  isEnable: true,
  posts: '',
  jobGrade: ''
})

const resetFormData = () => {
  formData.account = ''
  formData.name = ''
  formData.password = ''
  formData.confirmPassword = ''
  formData.email = ''
  formData.phone = ''
  formData.idNumber = ''
  formData.officeId = ''
  formData.isEnable = true
  formData.posts = ''
  formData.jobGrade = ''
  currentEditId.value = ''
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!isEdit.value && !value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  account: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 16, message: '用户名长度为2-16位', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  officeId: [
    { required: true, message: '请选择所属机构', trigger: 'change' }
  ],
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
    { required: true, message: '请输入手机号', trigger: 'blur' },
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
  ],
  idNumber: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && !validateIdNumber(value)) {
          callback(new Error('身份证号格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const open = async (id?: string) => {
  resetFormData()
  isEdit.value = !!id

  if (id) {
    currentEditId.value = id
    try {
      const data = await getUserDetail(id)
      formData.account = data.account || ''
      formData.name = data.name || ''
      formData.email = data.email || ''
      formData.phone = data.phone || ''
      formData.idNumber = data.idNumber || ''
      formData.officeId = data.officeId || ''
      formData.isEnable = data.isEnable ?? true
      formData.posts = data.posts || ''
      formData.jobGrade = data.jobGrade || ''
    } catch (error: any) {
      ElMessage.error(error.message || '获取用户信息失败')
      return
    }
  }

  visible.value = true
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetFormData()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEdit.value) {
      await updateUser({
        id: currentEditId.value,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        officeId: formData.officeId,
        isEnable: formData.isEnable,
        posts: formData.posts,
        jobGrade: formData.jobGrade
      })
      ElMessage.success('更新成功')
    } else {
      await createUser({
        account: formData.account,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        officeId: formData.officeId,
        posts: formData.posts,
        jobGrade: formData.jobGrade
      })
      ElMessage.success('创建成功')
    }

    visible.value = false
    emit('success')
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open
})
</script>
