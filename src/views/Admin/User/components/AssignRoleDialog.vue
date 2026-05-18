<template>
  <el-dialog
    v-model="visible"
    title="分配角色"
    width="700px"
    :close-on-click-modal="false"
  >
    <el-checkbox-group v-model="selectedRoleIds" v-loading="loading" class="role-checkbox-group">
      <el-checkbox
        v-for="role in roleList"
        :key="role.id"
        :label="role.id"
        class="role-checkbox-item"
      >
        {{ role.name }}
      </el-checkbox>
    </el-checkbox-group>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserRoles, saveUserRoles } from '@/api/user'
import type { Role } from '@/types'

const emit = defineEmits<{
  success: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const loading = ref(false)
const submitting = ref(false)
const roleList = ref<Role[]>([])
const selectedRoleIds = ref<string[]>([])
const currentUserIds = ref<string>('')

const open = async (userIds: string) => {
  currentUserIds.value = userIds
  visible.value = true
  loading.value = true
  selectedRoleIds.value = []
  roleList.value = []

  try {
    const res = await getUserRoles(userIds)
    // 接口返回 { roleList, user }
    if (res && res.roleList) {
      roleList.value = res.roleList
      // 根据 checked 字段获取已选中的角色
      selectedRoleIds.value = res.roleList
        .filter((role: any) => role.checked)
        .map((role: any) => role.id)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取角色列表失败')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await saveUserRoles(currentUserIds.value, selectedRoleIds.value)
    ElMessage.success('分配角色成功')
    visible.value = false
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '分配角色失败')
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open
})
</script>

<style scoped lang="scss">
.role-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;

  .role-checkbox-item {
    width: calc(33.33% - 12px);
    margin-right: 0;
  }
}
</style>
