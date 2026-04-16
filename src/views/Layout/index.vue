<script setup>
import LayoutNav from "./components/LayoutNav.vue";
import LayoutHeader from "./components/LayoutHeader.vue";
import LayoutFooter from "./components/LayoutFooter.vue";
import LayoutFixed from "./components/LayoutFixed.vue";
import { onMounted } from "vue";

// 触发获取导航列表的action
import { useCategoryStore } from "@/stores/category";
const categoryStore = useCategoryStore();
onMounted(() => {
  categoryStore.getCategory();
});
</script>

<template>
  <!-- 固定导航栏组件 -->
  <LayoutFixed></LayoutFixed>
  <!-- 顶部导航栏组件 -->
  <LayoutNav></LayoutNav>
  <!-- 头部导航栏组件 -->
  <LayoutHeader></LayoutHeader>
  <!-- 二级路由出口组件 -->
  <!-- 添加key 破坏复用机制 强制销毁重建-->
  <!-- <RouterView :key="$route.fullPath"></RouterView> -->
  <RouterView></RouterView>
  <!-- 底部导航栏组件 -->
  <LayoutFooter></LayoutFooter>
</template>
