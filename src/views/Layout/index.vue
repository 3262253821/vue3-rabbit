<script setup>
import LayoutNav from "./components/LayoutNav.vue";
import LayoutHeader from "./components/LayoutHeader.vue";
import LayoutFooter from "./components/LayoutFooter.vue";
</script>

<template>
  <!-- 顶部导航栏组件 -->
  <LayoutNav></LayoutNav>
  <!-- 头部导航栏组件 -->
  <LayoutHeader></LayoutHeader>
  <!-- 二级路由出口组件 -->
  <RouterView></RouterView>
  <!-- 底部导航栏组件 -->
  <LayoutFooter></LayoutFooter>
</template>
