<template>
  <div class="app-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑应用' : '新增应用' }}</span>
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="应用名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入应用名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="应用编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入应用编码" :disabled="isEdit" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="回调地址" prop="redirectUri">
              <el-input v-model="formData.redirectUri" placeholder="请输入回调地址" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="4"
                placeholder="请输入应用描述"
              />
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
import { validateUrl } from '@/utils/validator'

const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const isEdit = computed(() => !!route.params.id)

const formData = reactive({
  name: '',
  code: '',
  redirectUri: '',
  description: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入应用编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '应用编码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  redirectUri: [
    { required: true, message: '请输入回调地址', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && !validateUrl(value)) {
          callback(new Error('回调地址格式不正确'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const loadAppDetail = async () => {
  if (!isEdit.value) return

  try {
    const { getAppDetail } = await import('@/api/app')
    const data = await getAppDetail(Number(route.params.id))
    Object.assign(formData, data)
  } catch (error: any) {
    ElMessage.error(error.message || '加载应用详情失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    if (isEdit.value) {
      const { updateApp } = await import('@/api/app')
      await updateApp({
        id: Number(route.params.id),
        ...formData
      })
      ElMessage.success('更新成功')
    } else {
      const { createApp } = await import('@/api/app')
      await createApp(formData)
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

const handleCancel = () => {
  router.back()
}

onMounted(() => {
  loadAppDetail()
})
</script>

<style scoped lang="scss">
.app-edit {
  .card-header {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
