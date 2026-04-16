// createRouter：创建Router实例对象
// createWebHistory：创建history模式的路由
import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/views/Layout/index.vue";
import Login from "@/views/Login/index.vue";
import Home from "@/views/Home/index.vue";
import Category from "@/views/Category/index.vue";
import SubCategory from "@/views/SubCategory/index.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 配置path和component对应关系的位置
  routes: [
    {
      path: "/",
      component: Layout,
      // 二级路由在children中配置
      children: [
        {
          // 置空的原因是：/home和/category都是二级路由，/home是默认路由
          path: "",
          component: Home,
        },
        {
          path: "category/:id",
          component: Category,
        },
        {
          path: "category/sub/:id",
          component: SubCategory,
        },
      ],
    },
    {
      path: "/login",
      component: Login,
    },
  ],
  // 路由滚动行为定制
  scrollBehavior() {
    return {
      top: 0,
    };
  },
  // 路由重定向
  redirect: "/home",
});

export default router;
