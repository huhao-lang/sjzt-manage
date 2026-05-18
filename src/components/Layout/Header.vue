<template>
  <div class="header-container">
    <div class="header-left">
      <div class="logo">
        <img :src="logoImg" alt="西藏交发" />
      </div>
    </div>

    <div class="header-right">
      <!-- 通知图标 -->
      <div class="header-item">
        <el-badge :value="notificationCount" :hidden="notificationCount === 0">
          <el-icon :size="20">
            <Bell />
          </el-icon>
        </el-badge>
      </div>

      <!-- 用户信息下拉菜单 -->
      <el-dropdown class="user-dropdown" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userAvatar">
            <img :src="defaultAvatar" />
          </el-avatar>
          <span class="username">{{ username }}</span>
          <el-icon class="arrow">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon>
                <User />
              </el-icon>
              个人资料
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon>
                <Setting />
              </el-icon>
              设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Bell, ArrowDown, User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import defaultAvatar from '@/assets/images/avatars/user.jpg'
import logoImg from '@/assets/images/header/logo.png'

const router = useRouter()
const authStore = useAuthStore()

// 用户信息
const username = computed(() => authStore.username)
const userAvatar = computed(() => authStore.userInfo?.avatar || '')

// 通知数量
const notificationCount = ref(0)

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'settings':
      // 打开设置页面
      break
    case 'logout':
      await handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await authStore.logout()
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  padding: 0 20px;
  // background: rgba(69,78,134, 0.3);
  // border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      height: 70px;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;

  .header-item {
    cursor: pointer;
    color: #666;
    transition: color 0.3s;

    &:hover {
      color: #0154a1;
    }
  }

  .user-dropdown {
    cursor: pointer;

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .username {
        font-size: 14px;
        color: #333;
      }

      .arrow {
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>
