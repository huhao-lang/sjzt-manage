<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-description">抱歉,您访问的页面不存在或已被删除</div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          <el-icon>
            <HomeFilled />
          </el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack">
          <el-icon>
            <Back />
          </el-icon>
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, Back } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/admin/dashboard')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .error-content {
    text-align: center;
    color: #fff;

    .error-code {
      font-size: 120px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 20px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .error-title {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .error-description {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 32px;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }
}
</style>
