<template>
  <div class="dashboard-container">
    <div class="welcome-content">
      <h1 class="welcome-title">欢迎使用统一身份认证管理系统</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.dashboard-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.welcome-content {
  text-align: center;

  .welcome-title {
    font-size: 32px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}
</style>
