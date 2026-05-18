<template>
  <el-dialog
    v-model="visible"
    title="部门分配"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="treeLoading" class="tree-container">
      <el-tree
        ref="treeRef"
        :data="deptTree"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        show-checkbox
        default-expand-all
      />
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { assignRoleDept, getRoleDeptList } from '@/api/role'
import { getOfficeTree } from '@/api/office'

const emit = defineEmits<{
  success: []
}>()

const visible = defineModel<boolean>('visible', { default: false })

const treeRef = ref()
const treeLoading = ref(false)
const submitting = ref(false)
const currentRoleId = ref<string>('')
const deptTree = ref<any[]>([])

// 扁平数据转树形结构
const listToTree = (list: any[]) => {
  const validList = list.filter(item => item.id !== null && item.id !== undefined)

  const map: Record<string, any> = {}
  const roots: any[] = []

  validList.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })

  validList.forEach(item => {
    const node = map[item.id]
    const parentId = item.parentId

    if (parentId === '-1' || parentId === null || parentId === undefined || !map[parentId]) {
      roots.push(node)
    } else {
      map[parentId].children.push(node)
    }
  })

  const removeEmptyChildren = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.children.length === 0) {
        delete node.children
      } else {
        removeEmptyChildren(node.children)
      }
    })
  }
  removeEmptyChildren(roots)

  return roots
}

// 加载部门树
const loadDeptTree = async () => {
  treeLoading.value = true
  try {
    const list = await getOfficeTree()
    deptTree.value = listToTree(list || [])
  } catch (error) {
    console.error('加载部门树失败:', error)
    deptTree.value = []
  } finally {
    treeLoading.value = false
  }
}

const open = async (roleId: string) => {
  currentRoleId.value = roleId
  visible.value = true

  // 先加载部门树
  await loadDeptTree()

  // 获取已选中的部门
  try {
    const res = await getRoleDeptList(roleId)
    if (res && Array.isArray(res)) {
      const checkedIds = res.map((item: any) => item.officeId)
      treeRef.value?.setCheckedKeys(checkedIds)
    }
  } catch (error) {
    console.error('获取已选部门失败:', error)
  }
}

const handleClose = () => {
  treeRef.value?.setCheckedKeys([])
  currentRoleId.value = ''
}

const handleSubmit = async () => {
  const checkedKeys = treeRef.value?.getCheckedKeys() || []

  if (checkedKeys.length === 0) {
    ElMessage.warning('请至少选择一个部门')
    return
  }

  try {
    submitting.value = true

    await assignRoleDept({
      roleId: currentRoleId.value,
      officeIds: checkedKeys
    })

    ElMessage.success('分配成功')
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

<style scoped lang="scss">
.tree-container {
  max-height: 400px;
  overflow: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}
</style>
