import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// 引入初始化样式
import "@/styles/common.scss";

// 引入懒加载指令插件并注册
import { lazyPlugin } from "@/directives/index.js";

const app = createApp(App);

app.use(createPinia());
app.use(router);
// 注册懒加载指令插件
app.use(lazyPlugin);

app.mount("#app");
