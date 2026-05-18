<template>
  <div class="sidebar-container" :class="{ collapsed }">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="handleToggle">
      <el-icon>
        <Expand v-if="collapsed" />
        <Fold v-else />
      </el-icon>
    </div>

    <!-- 菜单 -->
    <el-menu :default-active="activeMenu" :collapse="collapsed" :unique-opened="true" router>
      <SidebarItem v-for="item in menuList" :key="item.id" :item="item" />
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Expand, Fold } from '@element-plus/icons-vue'
import { useRouteStore } from '@/stores/route'
import SidebarItem from './SidebarItem.vue'

interface Props {
  collapsed: boolean
}

const props = defineProps<Props>()

interface Emits {
  (e: 'toggle'): void
}

const emit = defineEmits<Emits>()

const route = useRoute()
const routeStore = useRouteStore()

// 菜单列表（从 store 获取）
const menuList = computed(() => routeStore.menus)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 切换折叠状态
const handleToggle = () => {
  emit('toggle')
}
</script>

<style scoped lang="scss">
.sidebar-container {
  position: fixed;
  left: 0;
  top: 80px;
  bottom: 0;
  width: 200px;
  background: #3d508a;
  transition: width 0.3s;
  overflow-x: hidden;
  overflow-y: auto;

  &.collapsed {
    width: 64px;
  }

  .collapse-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    color: #fff;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  :deep(.el-menu) {
    border-right: none;
    background: #3d508a;

    .el-menu-item,
    .el-sub-menu__title {
      color: rgba(255, 255, 255, 0.65);

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      &.is-active {
        background: #0154a1;
        color: #fff;
      }
    }

    .el-sub-menu {
      .el-menu {
        background: #334575;
      }
    }
  }
}

// 滚动条样式
.sidebar-container::-webkit-scrollbar {
  width: 6px;
}

.sidebar-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
