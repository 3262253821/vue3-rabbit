import httpInstance from "@/utils/http";

// 获取banner
export function getBannerAPI(params = {}) {
  // 解构赋值
  // 从params中提取distributionSite属性
  // 默认为1，商品为2
  const { distributionSite = "1" } = params;
  return httpInstance({
    url: "/home/banner",
    method: "GET",
    params: {
      distributionSite,
    },
  });
}

/**
 * @description: 获取新鲜好物
 * @param {*}
 * @return {*}
 */
export const findNewAPI = () => {
  return httpInstance({
    url: "/home/new",
  });
};

/**
 * @description: 获取人气推荐
 * @param {*}
 * @return {*}
 */
export const getHotAPI = () => {
  return httpInstance({
    url: "/home/hot",
    method: "GET",
  });
};

/**
 * @description: 获取所有商品模块
 * @param {*}
 * @return {*}
 */
export const getGoodsAPI = () => {
  return httpInstance({
    url: "/home/goods",
    method: "GET",
  });
};
