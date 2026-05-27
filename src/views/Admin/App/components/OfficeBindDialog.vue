<template>
  <el-dialog
    v-model="visible"
    title="绑定组织架构"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="office-bind-dialog">
      <!-- 应用信息 -->
      <div class="app-info">
        <span class="label">应用名称：</span>
        <span class="value">{{ app?.name }}</span>
        <span class="label" style="margin-left: 24px;">应用编码：</span>
        <span class="value">{{ app?.code }}</span>
      </div>

      <!-- 组织架构树 -->
      <div class="tree-container">
        <el-tree
          ref="treeRef"
          :data="officeTree"
          node-key="id"
          :props="{ label: 'name', children: 'children' }"
          show-checkbox
          check-strictly
          default-expand-all
          v-loading="loading"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }}</span>
              <el-tag v-if="!data.isEnable" type="warning" size="small">已禁用</el-tag>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { App } from '@/types'
import { getOfficeTree, getOfficeAppClientIds, saveOfficeAppRel } from '@/api/office'

const props = defineProps<{
  modelValue: boolean
  app: App | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const visible = ref(false)
const loading = ref(false)
const saveLoading = ref(false)
const officeTree = ref<any[]>([])
const treeRef = ref()

// 扁平数据转树形结构（复用 Office/index.vue 中的逻辑）
const listToTree = (list: any[]) => {
  const validList = list.filter(item => item.id !== null && item.id !== undefined)

  const map: Record<string, any> = {}
  const roots: any[] = []

  const getSortValue = (value: unknown) => {
    const sort = Number(value)
    return Number.isFinite(sort) ? sort : Number.MAX_SAFE_INTEGER
  }

  const sortTree = (nodes: any[]) => {
    nodes.sort((a, b) => getSortValue(a.sort) - getSortValue(b.sort))
    nodes.forEach(node => {
      if (node.children?.length) {
        sortTree(node.children)
      }
    })
  }

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

  sortTree(roots)

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

// 加载组织架构树
const loadOfficeTree = async () => {
  loading.value = true
  try {
    const list = await getOfficeTree()
    officeTree.value = listToTree(list || [])
    // 加载完树后，查询已绑定的组织架构并回显
    await loadBoundOffices()
  } catch (error: any) {
    ElMessage.error(error.message || '加载组织架构树失败')
    officeTree.value = []
  } finally {
    loading.value = false
  }
}

// 加载当前应用已绑定的组织架构
const loadBoundOffices = async () => {
  if (!props.app?.clientId || officeTree.value.length === 0) return
  try {
    const officeIds = await getOfficeAppClientIds(props.app.clientId)
    // 设置树的勾选状态
    if (officeIds.length > 0 && treeRef.value) {
      treeRef.value.setCheckedKeys(officeIds)
    }
  } catch (error: any) {
    console.error('加载绑定关系失败:', error)
  }
}

// 保存绑定关系
const handleSave = async () => {
  if (!props.app?.clientId) {
    ElMessage.warning('应用信息不完整')
    return
  }

  const checkedKeys = treeRef.value?.getCheckedKeys() || []

  saveLoading.value = true
  try {
    await saveOfficeAppRel({
      clientId: props.app.clientId,
      officeIds: checkedKeys
    })
    ElMessage.success('保存成功')
    visible.value = false
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saveLoading.value = false
  }
}

// 监听显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.app) {
    loadOfficeTree()
  }
})

watch(() => visible.value, (val) => {
  emit('update:modelValue', val)
})
</script>

<style scoped lang="scss">
.office-bind-dialog {
  .app-info {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e4e7ed;
    
    .label {
      color: #606266;
    }
    
    .value {
      color: #303133;
      font-weight: 500;
    }
  }

  .tree-container {
    max-height: 400px;
    overflow-y: auto;
    
    .custom-tree-node {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
