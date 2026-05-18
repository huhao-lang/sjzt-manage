<template>
  <el-dialog
    v-model="visible"
    title="功能分配"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form label-width="100px">
      <el-form-item label="当前角色">
        <el-input :value="currentRole?.name" disabled />
      </el-form-item>

      <el-form-item label="权限">
        <div class="tree-toolbar">
          <el-checkbox v-model="checkAll" @change="handleCheckAll">全选</el-checkbox>
        </div>
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          show-checkbox
          default-expand-all
          v-loading="treeLoading"
          class="permission-tree"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { saveRolePermission } from '@/api/role'
import { getPermissionTree } from '@/api/permission'
import type { Role, Permission } from '@/types'

const emit = defineEmits<{
  success: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const currentRole = ref<Role | null>(null)
const permissionTree = ref<Permission[]>([])
const permissionTreeRef = ref()
const treeLoading = ref(false)
const submitting = ref(false)
const checkAll = ref(false)

// 递归收集所有已选中的权限ID
const collectCheckedIds = (nodes: any[]): string[] => {
  const ids: string[] = []
  const traverse = (list: any[]) => {
    for (const node of list) {
      if (node.checked) {
        ids.push(node.id)
      }
      if (node.children?.length) {
        traverse(node.children)
      }
    }
  }
  traverse(nodes)
  return ids
}

// 递归收集所有节点ID
const collectAllIds = (nodes: any[]): string[] => {
  const ids: string[] = []
  const traverse = (list: any[]) => {
    for (const node of list) {
      ids.push(node.id)
      if (node.children?.length) {
        traverse(node.children)
      }
    }
  }
  traverse(nodes)
  return ids
}

// 全选/取消全选
const handleCheckAll = (val: boolean) => {
  if (val) {
    const allIds = collectAllIds(permissionTree.value)
    permissionTreeRef.value?.setCheckedKeys(allIds)
  } else {
    permissionTreeRef.value?.setCheckedKeys([])
  }
}

// 加载权限树
const loadPermissionTree = async () => {
  if (!currentRole.value) return

  treeLoading.value = true
  checkAll.value = false
  try {
    // 获取权限树，传入 roleId 返回带 checked 状态
    const data = await getPermissionTree({ roleId: currentRole.value.id.toString() })

    // 后端返回的是数组，第一个元素是根节点
    if (Array.isArray(data) && data.length > 0) {
      permissionTree.value = data[0].children || []

      await nextTick()

      // 设置已选中的权限
      const checkedIds = collectCheckedIds(data)
      permissionTreeRef.value?.setCheckedKeys(checkedIds)
    } else {
      permissionTree.value = []
    }
  } catch (error) {
    console.error('加载权限树失败:', error)
    permissionTree.value = []
  } finally {
    treeLoading.value = false
  }
}

const open = async (role: Role) => {
  currentRole.value = role
  visible.value = true
  await nextTick()
  await loadPermissionTree()
}

const handleSubmit = async () => {
  if (!currentRole.value) return

  submitting.value = true
  try {
    const checkedNodes = permissionTreeRef.value?.getCheckedNodes(false, true) || []
    const permissionIds = checkedNodes.map((node: any) => node.id).join(',')

    await saveRolePermission({
      roleId: currentRole.value.id.toString(),
      name: currentRole.value.name,
      isEnable: currentRole.value.isEnable,
      permissionIds
    })

    ElMessage.success('保存成功')
    visible.value = false
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open
})
</script>

<style scoped lang="scss">
.tree-toolbar {
  margin-bottom: 10px;
}

.permission-tree {
  max-height: 400px;
  overflow: auto;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}
</style>
