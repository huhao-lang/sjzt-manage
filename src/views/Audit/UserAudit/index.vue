<template>
  <div class="user-audit">
    <el-row :gutter="16">
      <!-- 左侧部门树 -->
      <el-col :span="5">
        <el-card class="tree-card">
          <template #header>
            <span>部门</span>
          </template>
          <el-tree
            ref="treeRef"
            :data="deptTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          >
            <template #empty>
              <span class="tree-empty">暂无数据</span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :span="19">
        <!-- 搜索栏 -->
        <el-card class="search-card">
          <el-form :model="searchForm" :inline="true">
            <el-form-item label="审计状态">
              <el-select v-model="searchForm.auditStatus" placeholder="全部" clearable style="width: 120px">
                <el-option label="待审计" value="PENDING" />
                <el-option label="挂起" value="SUSPENDED" />
                <el-option label="已通过" value="APPROVED" />
                <el-option label="已拒绝" value="REJECTED" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户姓名">
              <el-input v-model="searchForm.userName" placeholder="用户姓名" clearable @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="提交时间">
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 360px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 操作栏 -->
        <el-card class="toolbar-card">
          <el-button type="success" @click="handleBatchApprove" :disabled="selectedRows.length === 0">
            <el-icon><Select /></el-icon>
            批量通过
          </el-button>
          <el-button type="danger" @click="handleBatchReject" :disabled="selectedRows.length === 0">
            <el-icon><CloseBold /></el-icon>
            批量拒绝
          </el-button>
        </el-card>

        <!-- 表格 -->
        <el-card>
          <el-table
            ref="tableRef"
            :data="tableData"
            v-loading="loading"
            @selection-change="handleSelectionChange"
            stripe
            height="calc(100vh - 500px)"
          >
            <el-table-column type="selection" width="55" :selectable="canSelect" />
            <el-table-column prop="name" label="姓名" min-width="100" />
            <el-table-column prop="gender" label="性别" width="60" />
            <el-table-column prop="phone" label="手机号" min-width="120" />
            <el-table-column prop="officeName" label="部门名称" min-width="120" />
            <el-table-column prop="posts" label="岗位" min-width="100" show-overflow-tooltip />
            <el-table-column prop="event" label="事件类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getEventTagType(row.event)">{{ getEventLabel(row.event) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sourceSystem" label="来源系统" min-width="100" />
            <el-table-column prop="submitTime" label="提交时间" min-width="160" />
            <el-table-column prop="auditStatus" label="审计状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.auditStatus)">{{ getStatusLabel(row.auditStatus) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleDetail(row)">
                  详情
                </el-button>
                <template v-if="row.auditStatus === 'PENDING'">
                  <el-button type="success" link size="small" @click="handleApprove(row)">
                    通过
                  </el-button>
                  <el-button type="danger" link size="small" @click="handleReject(row)">
                    拒绝
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              :hide-on-single-page="false"
              background
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadData"
              @current-change="loadData"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹窗组件 -->
    <DetailDialog v-model="detailVisible" :detail="currentDetail" />
    <ApproveDialog v-model="approveVisible" :ids="operatingIds" @success="loadData" />
    <RejectDialog v-model="rejectVisible" :ids="operatingIds" @success="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Select, CloseBold } from '@element-plus/icons-vue'
import { getUserAuditList, getUserAuditDetail } from '@/api/userAudit'
import { getOfficeTree } from '@/api/office'
import type { UserAudit, AuditStatus, EventType } from '@/types'
import { useAuthStore } from '@/stores/auth'
import DetailDialog from './components/DetailDialog.vue'
import ApproveDialog from './components/ApproveDialog.vue'
import RejectDialog from './components/RejectDialog.vue'
const authStore = useAuthStore()
// 部门树
const treeRef = ref()
const deptTree = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  auditStatus: '' as AuditStatus | '',
  clientId: '',
  userName: '',
  officeId: '' as string
})
const dateRange = ref<[string, string] | null>(null)

// 表格数据
const tableRef = ref()
const tableData = ref<UserAudit[]>([])
const loading = ref(false)
const selectedRows = ref<UserAudit[]>([])

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 详情弹窗
const detailVisible = ref(false)
const currentDetail = ref<UserAudit | null>(null)

// 审批弹窗
const approveVisible = ref(false)
const rejectVisible = ref(false)
const operatingIds = ref<number[]>([])

// 获取事件类型标签
const getEventTagType = (event?: EventType) => {
  const map: Record<EventType, string> = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'danger'
  }
  return event ? map[event] : ''
}

const getEventLabel = (event?: EventType) => {
  const map: Record<EventType, string> = {
    CREATE: '新增',
    UPDATE: '修改',
    DELETE: '删除'
  }
  return event ? map[event] : ''
}

// 获取状态标签
const getStatusTagType = (status?: AuditStatus) => {
  const map: Record<AuditStatus, string> = {
    PENDING: 'warning',
    SUSPENDED: 'info',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return status ? map[status] : ''
}

const getStatusLabel = (status?: AuditStatus) => {
  const map: Record<AuditStatus, string> = {
    PENDING: '待审计',
    SUSPENDED: '挂起',
    APPROVED: '已通过',
    REJECTED: '已拒绝'
  }
  return status ? map[status] : ''
}

// 是否可选择（只有待审计的可以选择）
const canSelect = (row: UserAudit) => row.auditStatus === 'PENDING'

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
  try {
    const res = await getOfficeTree()
    deptTree.value = listToTree(res || [])
  } catch (error) {
    console.error('加载部门树失败:', error)
    deptTree.value = []
  }
}

// 点击部门树节点
const handleNodeClick = (node: any) => {
  searchForm.officeId = node.id || ''
  pagination.current = 1
  loadData()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      currentUserId: authStore.userInfo.id
    }
    if (searchForm.auditStatus) params.auditStatus = searchForm.auditStatus
    if (searchForm.clientId) params.clientId = searchForm.clientId
    if (searchForm.userName) params.userName = searchForm.userName
    if (searchForm.officeId) params.officeId = searchForm.officeId
    if (dateRange.value) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }

    const res = await getUserAuditList(params)
    // 兼容 code:1（返回 data）和 code:200（返回完整响应）两种格式
    const pageData = res.data || res
    tableData.value = pageData.records || []
    pagination.total = Number(pageData.total) || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 选择变化
const handleSelectionChange = (rows: UserAudit[]) => {
  selectedRows.value = rows.filter(r => r.auditStatus === 'PENDING')
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.auditStatus = ''
  searchForm.clientId = ''
  searchForm.userName = ''
  searchForm.officeId = ''
  dateRange.value = null
  treeRef.value?.setCurrentKey(null)
  handleSearch()
}

// 查看详情
const handleDetail = async (row: UserAudit) => {
  try {
    const res = await getUserAuditDetail(row.id)
    currentDetail.value = res.data || res
    detailVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '获取详情失败')
  }
}

// 单个通过
const handleApprove = (row: UserAudit) => {
  operatingIds.value = [row.id]
  approveVisible.value = true
}

// 单个拒绝
const handleReject = (row: UserAudit) => {
  operatingIds.value = [row.id]
  rejectVisible.value = true
}

// 批量通过
const handleBatchApprove = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择待审计的记录')
    return
  }
  operatingIds.value = selectedRows.value.map(r => r.id)
  approveVisible.value = true
}

// 批量拒绝
const handleBatchReject = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择待审计的记录')
    return
  }
  operatingIds.value = selectedRows.value.map(r => r.id)
  rejectVisible.value = true
}

onMounted(() => {
  loadDeptTree()
  loadData()
})
</script>

<style scoped lang="scss">
.user-audit {
  .tree-card {
    height: calc(100vh - 165px);
    overflow: auto;
  }

  .search-card,
  .toolbar-card {
    margin-bottom: 16px;
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
