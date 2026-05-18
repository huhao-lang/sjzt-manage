<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <Header />

    <div class="main-container">
      <!-- 侧边菜单栏 -->
      <Sidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

      <!-- 主内容区 -->
      <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <!-- 面包屑导航 -->
        <!-- <Breadcrumb /> -->

        <!-- 页面内容 -->
        <div class="page-content">
          <router-view v-slot="{ Component }">
            <keep-alive :include="cachedViews">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </div>

        <!-- 页脚 -->
        <Footer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Breadcrumb from './Breadcrumb.vue'
import Footer from './Footer.vue'

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 需要缓存的视图
const cachedViews = ref<string[]>(['Dashboard', 'UserManagement', 'RoleManagement'])

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: url('@/assets/images/bg.jpg') no-repeat center center;
  background-size: 100%;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 200px;
  transition: margin-left 0.3s;

  &.sidebar-collapsed {
    margin-left: 64px;
  }
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
