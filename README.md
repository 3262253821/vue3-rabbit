# vue3-rabbit

一个基于 `Vue 3 + Vite + Pinia + Element Plus` 实现的电商前台项目，覆盖首页、分类、商品详情、购物车、结算、支付、登录和会员中心等核心购物流程，适合作为 Vue 3 组合式 API、电商前台业务拆分和状态管理练手项目。

## 项目简介

本项目以“小兔鲜”风格商城为主题，完成了常见电商前台链路：

- 首页内容展示
- 商品分类与二级分类
- 商品详情与规格选择
- 登录与用户状态持久化
- 购物车增删改查
- 结算页与支付页
- 会员中心与订单页

项目使用组合式 API、Pinia 持久化、Axios 请求封装和 Element Plus 组件库，整体结构清晰，比较适合用于整理 Vue 3 项目经验并展示到 GitHub。

## 功能特性

- 首页包含轮播图、分类导航、新鲜好物、人气推荐和商品模块展示。
- 支持一级分类、二级分类和商品列表浏览。
- 商品详情页支持 SKU 规格选择、相关商品推荐和加入购物车。
- 购物车支持本地购物车与登录后购物车合并。
- 登录后自动携带 `token` 请求，并支持 `401` 失效统一处理。
- 会员中心包含个人信息页和订单页。
- 使用 `pinia-plugin-persistedstate` 持久化用户与购物车状态。
- 封装了懒加载指令和全局组件插件，减少模板层重复代码。

## 技术栈

- Vue 3
- Vite
- Vue Router
- Pinia
- pinia-plugin-persistedstate
- Axios
- Element Plus
- Sass
- unplugin-auto-import
- unplugin-vue-components
- VueUse

## 页面结构

- `/`：首页
- `/category/:id`：一级分类页
- `/category/sub/:id`：二级分类页
- `/detail/:id`：商品详情页
- `/cartlist`：购物车页
- `/checkout`：结算页
- `/pay`：支付页
- `/paycallback`：支付回跳页
- `/member/user`：会员中心 - 个人信息
- `/member/order`：会员中心 - 我的订单
- `/login`：登录页

## 项目结构

```text
vue3-rabbit/
├─ public/
├─ src/
│  ├─ apis/               # 业务接口封装
│  ├─ assets/             # 静态资源
│  ├─ components/         # 全局组件与业务组件
│  ├─ composables/        # 组合式逻辑封装
│  ├─ directives/         # 自定义指令
│  ├─ router/             # 路由配置
│  ├─ stores/             # Pinia 状态管理
│  ├─ styles/             # 全局样式与主题变量
│  ├─ utils/              # 工具与请求封装
│  └─ views/              # 页面级组件
├─ index.html
├─ vite.config.js
├─ package.json
└─ README.md
```

## 核心实现说明

### 状态管理

- `src/stores/user.js`：管理登录用户信息、退出登录、登录后购物车合并。
- `src/stores/cartStore.js`：管理购物车商品、全选、单选、统计金额和远程同步。
- `src/stores/category.js`：管理页面分类数据。

### 请求封装

- `src/utils/http.js` 中统一封装了 Axios 实例。
- 请求拦截器会自动注入登录 `token`。
- 响应拦截器会统一提示错误信息，并在 `401` 时清空用户信息并跳转登录页。

### UI 与工程化

- 通过 `unplugin-auto-import` 和 `unplugin-vue-components` 自动按需引入 Element Plus。
- 通过 Vite 别名 `@` 指向 `src`，方便模块引用。
- 全局注入 SCSS 变量和 Element Plus 主题样式，减少重复导入。

## 接口说明

当前项目前端接口基地址写在 [src/utils/http.js](./src/utils/http.js) 中：

```js
baseURL: "http://pcapi-xiaotuxian-front-devtest.itheima.net"
```

这意味着：

- 本仓库是前端项目，本身不包含后端服务。
- 默认依赖外部测试接口返回商品、用户、购物车、订单等数据。
- 如果你后续要接自己的后端，可以修改 `src/utils/http.js` 里的 `baseURL`。

## 本地启动

### 环境要求

- Node.js `20.19+` 或 `22.12+`
- npm

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

默认开发地址通常为：

- `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 脚本说明

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 打包生产环境资源 |
| `npm run preview` | 本地预览打包结果 |
| `npm run lint` | 执行 `oxlint` + `eslint` 检查并自动修复 |

## 已验证

本项目当前已实际验证通过：

- `npm run build`
- `npm run lint`

## 提交到 GitHub 前建议

- 可以在仓库里补充 2 到 4 张项目截图，展示首页、详情页、购物车页和会员中心。
- 如果你后续要接自己的后端，建议把 `baseURL` 改为环境变量，而不是直接写死在代码里。
- 构建时会出现 Sass 的 `lighten()` 弃用警告，当前不影响运行，但后续可以逐步替换为 `color.adjust` 或 `color.scale`。

## License

当前仓库未附带许可证文件。如果你准备公开开源，建议补充 `LICENSE`，例如 `MIT`。
