<template>
  <div class="breadcrumb-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">
        <el-icon>
          <HomeFilled />
        </el-icon>
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path ? { path: item.path } : undefined">
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()

interface Breadcrumb {
  path?: string
  title: string
}

// 生成面包屑
const breadcrumbs = computed<Breadcrumb[]>(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  const crumbs: Breadcrumb[] = []

  matched.forEach((item, index) => {
    // 跳过第一个(Admin布局)
    if (index === 0) return

    crumbs.push({
      path: item.path,
      title: item.meta.title as string
    })
  })

  return crumbs
})
</script>

<style scoped lang="scss">
.breadcrumb-container {
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;

  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-weight: 400;

      &:hover {
        color: #0154a1;
      }
    }

    &:last-child {
      .el-breadcrumb__inner {
        color: #333;
        font-weight: 500;
      }
    }
  }
}
</style>
