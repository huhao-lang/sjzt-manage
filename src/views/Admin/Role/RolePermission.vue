<template>
  <div class="role-permission">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分配权限 - {{ roleName }}</span>
        </div>
      </template>

      <el-tree
        ref="treeRef"
        :data="permissionTree"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="checkedKeys"
      >
        <template #default="{ node, data }">
          <span class="tree-node">
            <el-icon v-if="data.type === 'menu'"><Menu /></el-icon>
            <el-icon v-else><Key /></el-icon>
            <span class="node-label">{{ node.label }}</span>
            <el-tag v-if="data.type === 'button'" size="small" type="info">按钮</el-tag>
          </span>
        </template>
      </el-tree>

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
import { Menu, Key } from '@element-plus/icons-vue'
import type { Permission } from '@/types'

const router = useRouter()
const route = useRoute()

const treeRef = ref()
const roleName = ref('')
const permissionTree = ref<Permission[]>([])
const checkedKeys = ref<number[]>([])
const submitting = ref(false)

const loadPermissionTree = async () => {
  try {
    // TODO: 调用实际接口
    permissionTree.value = []
  } catch (error: any) {
    ElMessage.error(error.message || '加载权限树失败')
  }
}

const loadRolePermissions = async () => {
  try {
    // TODO: 调用实际接口
    checkedKeys.value = []
  } catch (error: any) {
    ElMessage.error(error.message || '加载角色权限失败')
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true

    const checkedNodes = treeRef.value.getCheckedKeys()
    const halfCheckedNodes = treeRef.value.getHalfCheckedKeys()
    const permissionIds = [...checkedNodes, ...halfCheckedNodes]

    // TODO: 调用实际接口
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
  loadPermissionTree()
  loadRolePermissions()
})
</script>

<style scoped lang="scss">
.role-permission {
  .card-header {
    font-size: 16px;
    font-weight: 600;
  }

  .tree-node {
    display: flex;
    align-items: center;
    gap: 8px;

    .node-label {
      margin-right: 8px;
    }
  }

  .footer-actions {
    margin-top: 24px;
    text-align: center;
  }
}
</style>
