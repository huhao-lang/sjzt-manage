<template>
  <div class="office-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '修改机构' : '添加机构' }}</span>
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="父机构" prop="parentId">
          <el-select v-model="formData.parentId" placeholder="请选择" clearable style="width: 300px">
            <el-option
              v-for="item in officeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="名称" maxlength="100" style="width: 300px" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="99999999999" style="width: 300px" />
        </el-form-item>

        <el-form-item label="是否启用" prop="isEnable">
          <el-radio-group v-model="formData.isEnable">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

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
import { getOfficeList, saveOffice } from '@/api/office'
import type { Office } from '@/types'

const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const isEdit = computed(() => !!route.query.id)

const formData = reactive({
  id: '' as string,
  parentId: '' as string | null,
  name: '',
  sort: 0,
  isEnable: true
})

const officeList = ref<Office[]>([])

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  isEnable: [{ required: true, message: '请选择是否启用', trigger: 'change' }]
}

const loadOfficeList = async () => {
  try {
    officeList.value = await getOfficeList()
  } catch (error) {
    console.error('加载机构列表失败:', error)
    officeList.value = []
  }
}

const loadOfficeDetail = async () => {
  if (!isEdit.value) return

  // 从机构列表中找到当前编辑的机构
  const id = route.query.id as string
  const office = officeList.value.find(item => item.id === id)
  if (office) {
    formData.id = office.id
    formData.parentId = office.parentId
    formData.name = office.name
    formData.sort = office.sort || 0
    formData.isEnable = office.isEnable
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    const data: any = {
      parentId: formData.parentId || '',
      name: formData.name,
      sort: formData.sort,
      isEnable: formData.isEnable
    }

    if (isEdit.value) {
      data.id = route.query.id
    }

    await saveOffice(data)
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
    router.push('/admin/office')
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push('/admin/office')
}

onMounted(async () => {
  await loadOfficeList()
  loadOfficeDetail()
})
</script>

<style scoped lang="scss">
.office-edit {
  .card-header {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
