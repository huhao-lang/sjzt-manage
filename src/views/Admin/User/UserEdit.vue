<template>
  <div class="user-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑用户' : '新增用户' }}</span>
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="isEdit" />
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
              <el-tree-select v-model="formData.officeId" :data="officeTree" :props="{ label: 'name', value: 'id' }"
                placeholder="请选择所属机构" check-strictly />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="isEdit">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            提交
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { validateEmail, validatePhone, validateIdNumber } from '@/utils/validator'

const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)

// 表单数据
const formData = reactive({
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  idNumber: '',
  officeId: undefined as number | undefined,
  status: 1
})

// 机构树
const officeTree = ref([])

// 验证规则
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 16, message: '用户名长度为4-16位', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [
    { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: !isEdit.value, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
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
  ],
  idNumber: [
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

// 加载机构树
const loadOfficeTree = async () => {
  try {
    const { getOfficeTree } = await import('@/api/office')
    const data = await getOfficeTree({ status: 1 })
    officeTree.value = data
  } catch (error) {
    console.error('加载机构树失败:', error)
    officeTree.value = []
  }
}

// 加载用户详情
const loadUserDetail = async () => {
  if (!isEdit.value) return

  try {
    const { getUserDetail } = await import('@/api/user')
    const data = await getUserDetail(Number(route.params.id))
    Object.assign(formData, data)
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户详情失败')
  }
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    if (isEdit.value) {
      const { updateUser } = await import('@/api/user')
      await updateUser({
        id: Number(route.params.id),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        officeId: formData.officeId,
        status: formData.status
      })
      ElMessage.success('更新成功')
    } else {
      const { createUser } = await import('@/api/user')
      await createUser({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        idNumber: formData.idNumber,
        officeId: formData.officeId
      })
      ElMessage.success('创建成功')
    }

    router.back()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  loadOfficeTree()
  loadUserDetail()
})
</script>

<style scoped lang="scss">
.user-edit {
  .card-header {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
