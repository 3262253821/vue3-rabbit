// 引入vueuse/core的useIntersectionObserver
// 用于实现图片懒加载
import { useIntersectionObserver } from "@vueuse/core";

// 定义懒加载插件
export const lazyPlugin = {
  install(app) {
    // 懒加载指令
    app.directive("img-lazy", {
      mounted(el, binding) {
        // el:指令绑定的元素 img
        // binding: binding.value  指令等于号后面绑定的表达式的值  图片url
        // console.log(el, binding.value);
        const { stop } = useIntersectionObserver(el, ([{ isIntersecting }]) => {
          console.log(isIntersecting);
          if (isIntersecting) {
            // isIntersecting 为true时，代表图片进入视口,发送请求
            el.src = binding.value;
            // 移除指令，防止重复加载图片
            stop();
          }
        });
      },
    });
  },
};
