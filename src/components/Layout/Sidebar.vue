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
      <template v-for="item in menuList" :key="item.id">
        <!-- 有子菜单 -->
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.id.toString()">
          <template #title>
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.name }}</span>
          </template>
          <el-menu-item v-for="child in item.children" :key="child.id" :index="child.url || ''">
            <el-icon v-if="child.icon">
              <component :is="child.icon" />
            </el-icon>
            <span>{{ child.name }}</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 无子菜单 -->
        <el-menu-item v-else :index="item.url || ''">
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Expand, Fold } from '@element-plus/icons-vue'
import type { MenuItem } from '@/types'
import { getMenuList } from '@/api/menu'
import storage from '@/utils/storage'

interface Props {
  collapsed: boolean
}

const props = defineProps<Props>()

interface Emits {
  (e: 'toggle'): void
}

const emit = defineEmits<Emits>()

const route = useRoute()

// 菜单列表
const menuList = ref<MenuItem[]>([])

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 加载菜单
const loadMenu = async () => {
  try {
    const data = await getMenuList({
      code:storage.get('code')
    })
    menuList.value = buildMenuTree(data)
  } catch (error) {
    console.error('加载菜单失败:', error)
  }
}

// 构建菜单树
const buildMenuTree = (list: MenuItem[]): MenuItem[] => {
  const tree: MenuItem[] = []
  const map = new Map<number, MenuItem>()

  // 先将所有节点放入 map
  list.forEach((item) => {
    map.set(item.id, { ...item, children: [] })
  })

  // 构建树形结构
  map.forEach((item) => {
    if (item.parentId === null) {
      tree.push(item)
    } else {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(item)
      }
    }
  })

  return tree
}

// 切换折叠状态
const handleToggle = () => {
  emit('toggle')
}

onMounted(() => {
  loadMenu()
})
</script>

<style scoped lang="scss">
.sidebar-container {
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 200px;
  background: #001529;
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
    background: #001529;

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
        background: #000c17;
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
