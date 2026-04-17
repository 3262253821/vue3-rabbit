// 封装所所有和用户相关的接口函数
import httpInstance from "@/utils/http";

// 使用对象的解构赋值,接收account和password
export const loginAPI = ({ account, password }) => {
  return httpInstance({
    url: "/login",
    method: "POST",
    data: {
      account,
      password,
    },
  });
};
