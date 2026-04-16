// 封装分类数据业务相关代码
import { getCateAPI } from "@/apis/category";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { ref, onMounted } from "vue";

export function useCategory() {
  // 获取分类数据
  const categoryData = ref({});
  const route = useRoute();
  // async里面接收下面onBeforeRouteUpdate传递的id参数，给一个默认值，为当前路由参数的id值
  const getCategory = async (id = route.params.id) => {
    const res = await getCateAPI(id); // 使用id接收上面传过来的id参数
    categoryData.value = res.result;
    console.log(categoryData.value);
  };
  // 在一开始没有参数的话使用的是async里面的默认值id参数为当前路由参数的id值
  onMounted(() => {
    getCategory();
  });

  // 目标：路由参数变化的时候，可以把分类数据接口重新发送
  onBeforeRouteUpdate((to) => {
    // 存在问题：使用最新的路由参数请求最新的分类数据
    // 解决方案：使用to.params.id向上面的getCategory函数传递参数
    getCategory(to.params.id);
  });
  return {
    categoryData,
  };
}
