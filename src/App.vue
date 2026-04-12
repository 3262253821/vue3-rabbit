<script setup></script>

<template>
  <div class="test">test scss</div>
  <!-- 一级路由出口组件 -->
  <router-view></router-view>
</template>

<style scoped lang="scss">
.test {
  color: $xtxColor;
}
</style>
