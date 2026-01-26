<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user">
              <el-icon :size="32">
                <User />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.userCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon role">
              <el-icon :size="32">
                <UserFilled />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.roleCount }}</div>
              <div class="stat-label">角色总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon app">
              <el-icon :size="32">
                <Grid />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.appCount }}</div>
              <div class="stat-label">应用总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon online">
              <el-icon :size="32">
                <Connection />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.onlineCount }}</div>
              <div class="stat-label">在线用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-24">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>登录趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">登录趋势图表区域</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">用户分布图表区域</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="mt-24">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="handleQuickAction('user')">
              <el-icon>
                <Plus />
              </el-icon>
              新增用户
            </el-button>
            <el-button type="success" @click="handleQuickAction('role')">
              <el-icon>
                <Plus />
              </el-icon>
              新增角色
            </el-button>
            <el-button type="warning" @click="handleQuickAction('app')">
              <el-icon>
                <Plus />
              </el-icon>
              新增应用
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, UserFilled, Grid, Connection, Plus } from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const statistics = ref({
  userCount: 0,
  roleCount: 0,
  appCount: 0,
  onlineCount: 0
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    // 实际项目中应该调用统计接口
    // const res = await getStatistics()
    // statistics.value = res
    
    // 模拟数据
    statistics.value = {
      userCount: 156,
      roleCount: 12,
      appCount: 8,
      onlineCount: 23
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 快捷操作
const handleQuickAction = (type: string) => {
  switch (type) {
    case 'user':
      router.push('/admin/user/edit')
      break
    case 'role':
      router.push('/admin/role/edit')
      break
    case 'app':
      router.push('/admin/app/edit')
      break
  }
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 0;
}

.stat-card {
  margin-bottom: 20px;

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;

      &.user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.role {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.app {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.online {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;

  .chart-placeholder {
    color: #909399;
    font-size: 14px;
  }
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mt-24 {
  margin-top: 24px;
}
</style>
