// 封装banner轮播图相关的业务代码
import { ref, onMounted } from "vue";
import { getBannerAPI } from "@/apis/home";

export function useBanner() {
  // 获取banner
  const bannerList = ref([]);
  const getBanner = async () => {
    const res = await getBannerAPI({
      distributionSite: "2",
    });
    bannerList.value = res.result;
  };
  onMounted(() => {
    getBanner();
  });
  // 这里返回bannerList，因为bannerList是响应式数据，需要在模板中使用bannerList
  return {
    bannerList,
  };
}
