<template>
  <div class="user-role">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分配角色 - {{ userName }}</span>
        </div>
      </template>

      <el-transfer
        v-model="selectedRoles"
        :data="allRoles"
        :titles="['可选角色', '已选角色']"
        :props="{ key: 'id', label: 'name' }"
        filterable
        filter-placeholder="请输入角色名称"
      >
        <template #default="{ option }">
          <span>{{ option.name }}</span>
          <span class="role-code">{{ option.code }}</span>
        </template>
      </el-transfer>

      <div class="footer-actions">
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Role } from '@/types'

const router = useRouter()
const route = useRoute()

const userName = ref('')
const allRoles = ref<Role[]>([])
const selectedRoles = ref<number[]>([])
const submitting = ref(false)

const loadAllRoles = async () => {
  try {
    const { getAllRoles } = await import('@/api/role')
    allRoles.value = await getAllRoles()
  } catch (error: any) {
    ElMessage.error(error.message || '加载角色列表失败')
    allRoles.value = []
  }
}

const loadUserRoles = async () => {
  try {
    const { getUserRoles } = await import('@/api/user')
    selectedRoles.value = await getUserRoles(Number(route.params.id))
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户角色失败')
    selectedRoles.value = []
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true

    const { assignUserRoles } = await import('@/api/user')
    await assignUserRoles(Number(route.params.id), selectedRoles.value)
    
    ElMessage.success('保存成功')
    router.back()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(() => {
  loadAllRoles()
  loadUserRoles()
})
</script>

<style scoped lang="scss">
.user-role {
  .card-header {
    font-size: 16px;
    font-weight: 600;
  }

  :deep(.el-transfer) {
    .el-transfer-panel {
      width: 300px;
    }
  }

  .role-code {
    margin-left: 8px;
    color: #909399;
    font-size: 12px;
  }

  .footer-actions {
    margin-top: 24px;
    text-align: center;
  }
}
</style>
