# PolyMicro - Polymarket 交易微服务

PolyMicro 是一个高性能、可扩展且易于维护的企业级 Polymarket 自动化交易中台。它不仅是一个 API 转发器，而是一个集成了账户隔离、状态同步、实时推送、可视化管理的完整解决方案。

## 核心功能

- **多账户管理**: 安全地添加和管理多个 Polymarket 账户。系统会自动从您的私钥派生钱包地址和 CLOB API 凭证。
- **实时仪表盘**: 实时监控活跃账户、当前挂单和系统运行日志。
- **批量下单**: 支持同时下多个限价单或执行快速市价单。
- **市场浏览器**: 直接从 Polymarket Gamma API 浏览和搜索活跃市场。选择一个市场即可自动填充交易表单，包含正确的 `tokenID`、`tickSize` 和 `negRisk`。
- **自定义 UI**: 支持中英文双语，以及浅色、深色和跟随系统的主题切换。
- **安全架构**: 私钥安全处理，绝不在 API 响应中暴露。

## 技术栈

- **前端**: React 19, Vite, Tailwind CSS, Lucide React
- **后端**: Node.js, Express.js
- **数据库**: Firebase Firestore (实时同步与持久化)
- **SDK**: `@polymarket/clob-client`, `ethers`

## 快速开始

### 前置条件

- Node.js (v18+)
- Firebase 项目 (已启用 Firestore)
- Polymarket 账户 (私钥)

### 安装

1. 克隆仓库并安装依赖：
   ```bash
   npm install
   ```

2. 设置环境变量。确保在 `.env` 或 `firebase-applet-config.json` 文件中配置了 Firebase 和 Gemini API 密钥（如适用）。

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 生产环境构建：
   ```bash
   npm run build
   npm start
   ```

## 使用指南

1. **添加账户**: 导航到“账户管理”选项卡。点击“添加账户”，提供名称和钱包私钥。系统将自动派生您的 Polymarket CLOB API 凭证。
2. **查找市场**: 前往“市场信息”选项卡浏览活跃市场。点击市场上的“Trade”按钮即可预填快速交易表单。
3. **下订单**: 在“仪表盘”选项卡中，使用快速交易部分下市价单或限价单。您可以添加多行以进行批量限价单。
4. **监控**: 在各自的部分查看您的当前挂单和实时系统日志。

## 免责声明

本软件仅供教育和参考之用。请勿使用您无法承受损失的资金进行交易。开发者对使用本软件造成的任何财务损失概不负责。

## 许可证

MIT License
