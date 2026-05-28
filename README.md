# MAIPsy 微信小程序

基于 Taro 4 + React + TypeScript 开发的心理测评小程序。

## 开发

```bash
npm install
npm run dev:weapp
```

然后用「微信开发者工具」打开本项目（不是 `dist` 目录），编译后会自动产出到 `dist/`。

## 构建

```bash
npm run build:weapp
```

## 配置

- 后端 API：`https://maipsy.cn/api`
- 小程序 AppID：`wx6a9245767b5878ec`

## 角色

- **学生**：学号 + 密码登录，做测评、查看结果、AI 对话
- **辅导员**：邮箱 + 密码登录，发布测评、管理学生、查看分析

测试账号：`admin@maipsy.cn` / `123456`（辅导员）
