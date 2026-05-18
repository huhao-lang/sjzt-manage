<template>
  <!-- 隐藏的菜单不显示，按钮类型也不显示 -->
  <template v-if="item.visible !== false && item.menuType !== 2">
    <!-- 目录：menuType=0 或 有子菜单 -->
    <el-sub-menu v-if="isDirectory" :index="item.url || item.id">
      <template #title>
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.name }}</span>
      </template>
      <SidebarItem v-for="child in item.children" :key="child.id" :item="child" />
    </el-sub-menu>

    <!-- 菜单项：menuType=1，可以导航 -->
    <el-menu-item v-else :index="item.url || ''">
      <el-icon v-if="item.icon">
        <component :is="item.icon" />
      </el-icon>
      <span>{{ item.name }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem } from '@/types'

const props = defineProps<{
  item: MenuItem
}>()

// 判断是否是目录：menuType=0 或者 有子菜单
const isDirectory = computed(() => {
  const hasChildren = props.item.children && props.item.children.length > 0
  return props.item.menuType === 0 || hasChildren
})
</script>
