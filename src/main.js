import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// 引入初始化样式
import "@/styles/common.scss";

// 引入懒加载指令插件
import { lazyPlugin } from "@/directives/index.js";

// 引入全局组件插件
import { componentPlugin } from "@/components/index.js";

// 引入pinia插件
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const app = createApp(App);
const pinia = createPinia();
// 注册pinia插件
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
// 注册懒加载指令插件
app.use(lazyPlugin);
// 注册全局组件插件
app.use(componentPlugin);

app.mount("#app");
