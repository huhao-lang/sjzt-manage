<template>
  <div class="change-audit">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="登录账号">
          <el-input v-model="searchForm.account" placeholder="登录账号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="用户姓名">
          <el-input v-model="searchForm.name" placeholder="用户姓名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="修改场景">
          <el-select v-model="searchForm.changeType" placeholder="全部" clearable style="width: 140px">
            <el-option label="个人修改密码" value="PROFILE_CHANGE" />
            <el-option label="忘记密码" value="FORGOT_PASSWORD" />
          </el-select>
        </el-form-item>
        <el-form-item label="验证方式">
          <el-select v-model="searchForm.verifyType" placeholder="全部" clearable style="width: 160px">
            <el-option label="登录态验证" value="LOGIN" />
            <el-option label="身份证验证" value="ID_CARD" />
            <el-option label="短信验证" value="SMS" />
            <el-option label="身份证+短信验证" value="ID_CARD_SMS" />
            <el-option label="未知" value="UNKNOWN" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        height="calc(100vh - 420px)"
      >
        <el-table-column prop="account" label="登录账号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="name" label="用户姓名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="changeType" label="修改场景" width="130">
          <template #default="{ row }">
            <el-tag :type="getChangeTypeTagType(row.changeType)">{{ getChangeTypeLabel(row.changeType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="verifyType" label="验证方式" width="150">
          <template #default="{ row }">
            {{ getVerifyTypeLabel(row.verifyType) }}
          </template>
        </el-table-column>
        <el-table-column prop="operatorAccount" label="操作人账号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="clientIp" label="客户端IP" min-width="130" show-overflow-tooltip />
        <el-table-column prop="changeTime" label="修改时间" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">
              详情
            </el-button>
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

    <!-- 详情弹窗 -->
    <DetailDialog v-model="detailVisible" :detail="currentDetail" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPasswordChangeLogList } from '@/api/changeAudit'
import type { PasswordChangeLog, ChangeType, VerifyType } from '@/types'
import DetailDialog from './components/DetailDialog.vue'

// 搜索表单
const searchForm = reactive({
  account: '',
  name: '',
  changeType: '' as ChangeType | '',
  verifyType: '' as VerifyType | ''
})

// 表格数据
const tableData = ref<PasswordChangeLog[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 详情弹窗
const detailVisible = ref(false)
const currentDetail = ref<PasswordChangeLog | null>(null)

// 获取修改场景标签
const getChangeTypeTagType = (type?: ChangeType) => {
  const map: Record<ChangeType, string> = {
    PROFILE_CHANGE: 'primary',
    FORGOT_PASSWORD: 'warning'
  }
  return type ? map[type] : ''
}

const getChangeTypeLabel = (type?: ChangeType) => {
  const map: Record<ChangeType, string> = {
    PROFILE_CHANGE: '个人修改密码',
    FORGOT_PASSWORD: '忘记密码'
  }
  return type ? map[type] : ''
}

// 获取验证方式标签
const getVerifyTypeLabel = (type?: VerifyType) => {
  const map: Record<VerifyType, string> = {
    LOGIN: '登录态验证',
    ID_CARD: '身份证验证',
    SMS: '短信验证',
    ID_CARD_SMS: '身份证+短信验证',
    UNKNOWN: '未知'
  }
  return type ? map[type] : ''
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      current: pagination.current,
      size: pagination.size
    }
    if (searchForm.account) params.account = searchForm.account
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.changeType) params.changeType = searchForm.changeType
    if (searchForm.verifyType) params.verifyType = searchForm.verifyType

    const res = await getPasswordChangeLogList(params)
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

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.account = ''
  searchForm.name = ''
  searchForm.changeType = ''
  searchForm.verifyType = ''
  handleSearch()
}

// 查看详情
const handleDetail = (row: PasswordChangeLog) => {
  currentDetail.value = row
  detailVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.change-audit {
  .search-card {
    margin-bottom: 16px;
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>