<template>
  <el-popover
    :visible="popoverVisible"
    placement="bottom-start"
    :width="400"
    trigger="click"
    @update:visible="popoverVisible = $event"
  >
    <template #reference>
      <el-input
        :model-value="modelValue"
        :placeholder="placeholder"
        readonly
      >
        <template #prepend>
          <el-icon v-if="modelValue" :size="18">
            <component :is="modelValue" />
          </el-icon>
          <el-icon v-else :size="18"><Search /></el-icon>
        </template>
        <template #suffix>
          <el-icon
            v-if="modelValue"
            class="clear-icon"
            @click.stop="handleClear"
          >
            <CircleClose />
          </el-icon>
        </template>
      </el-input>
    </template>

    <div class="icon-select-container">
      <el-input
        v-model="searchText"
        placeholder="搜索图标"
        clearable
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-scrollbar height="280px" class="icon-list-wrapper">
        <div class="icon-list">
          <div
            v-for="icon in filteredIcons"
            :key="icon"
            class="icon-item"
            :class="{ active: modelValue === icon }"
            @click="handleSelect(icon)"
          >
            <el-icon :size="20">
              <component :is="icon" />
            </el-icon>
            <span class="icon-name">{{ icon }}</span>
          </div>
        </div>
        <el-empty v-if="filteredIcons.length === 0" description="未找到图标" :image-size="60" />
      </el-scrollbar>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, CircleClose } from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps<{
  placeholder?: string
}>()

const modelValue = defineModel<string>({ default: '' })

const popoverVisible = ref(false)
const searchText = ref('')

// 获取所有图标名称
const iconNames = Object.keys(ElementPlusIconsVue)

// 过滤图标
const filteredIcons = computed(() => {
  if (!searchText.value) return iconNames
  const search = searchText.value.toLowerCase()
  return iconNames.filter(name => name.toLowerCase().includes(search))
})

const handleSelect = (icon: string) => {
  modelValue.value = icon
  popoverVisible.value = false
}

const handleClear = () => {
  modelValue.value = ''
}
</script>

<style scoped lang="scss">
.icon-select-container {
  .search-input {
    margin-bottom: 12px;
  }

  .icon-list-wrapper {
    .icon-list {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
    }

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 4px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      .icon-name {
        font-size: 10px;
        margin-top: 4px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
    }
  }
}

.clear-icon {
  cursor: pointer;
  &:hover {
    color: var(--el-color-danger);
  }
}
</style>
