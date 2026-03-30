# PolyMicro - Polymarket 交易微服务

PolyMicro 是一个高性能、可扩展且易于维护的企业级 Polymarket 自动化交易中台。它不仅是一个 API 转发器，而是一个集成了账户隔离、状态同步、实时推送、可视化管理的完整解决方案。

## 核心功能

- **多账户管理**: 安全地添加和管理多个 Polymarket 账户。系统会自动从您的私钥派生钱包地址和 CLOB API 凭证。
- **实时仪表盘**: 实时监控活跃账户、当前挂单和系统运行日志。在仪表盘可直接查看派生的钱包地址，并支持一键复制，方便充值。
- **双数据库支持**: 灵活的数据库架构，同时支持 **Firebase Firestore** 和 **MongoDB**。可通过环境变量轻松切换。
- **高级市场浏览器**: 支持本地搜索活跃市场，当本地无结果时，提供一键线上搜索功能，直接查询 Polymarket Gamma API。
- **实时订单簿与市场详情**: 通过稳定的后端 WebSocket 代理，实时查看订单簿（买单/卖单）。市场详情包含完整的问题、详细说明和结束日期。
- **智能快速交易**: 支持下市价单、限价单以及批量下单。在实时订单簿中点击任意价格，即可自动将该价格填入交易表单中。
- **自定义 UI**: 支持中英文双语，以及浅色、深色和跟随系统的主题切换。
- **安全架构**: 私钥安全处理，绝不在 API 响应中暴露。

## 技术栈

- **前端**: React 19, Vite, Tailwind CSS, Lucide React
- **后端**: Node.js, Express.js
- **数据库**: MongoDB (通过 Mongoose) & Firebase Firestore
- **SDK**: `@polymarket/clob-client`, `ethers`
- **实时通信**: 原生 WebSockets (前端) & `ws` (后端代理)

## 快速开始

### 前置条件

- Node.js (v18+)
- MongoDB 数据库 或 Firebase 项目 (已启用 Firestore)
- Polymarket 账户 (私钥)

### 安装

1. 克隆仓库并安装依赖：
   ```bash
   npm install
   ```

2. 复制 `.env.example` 到 `.env` 并设置环境变量：
   ```bash
   cp .env.example .env
   ```
   配置您的数据库偏好：
   ```env
   # 选项: firebase, mongodb
   DATABASE_TYPE=mongodb
   # 如果 DATABASE_TYPE=mongodb，则必须提供
   MONGODB_URI=mongodb://localhost:27017/polymarket-bot
   ```

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
2. **查找市场**: 前往“市场信息”选项卡浏览活跃市场或使用线上搜索。点击市场上的“Trade”按钮即可预填快速交易表单。
3. **分析与交易**: 在“仪表盘”选项卡中，查看选中市场的详细信息和实时订单簿。点击任意买单/卖单价格即可自动填充订单价格，然后提交市价单或限价单。
4. **监控**: 在各自的部分查看您的当前挂单、活跃账户（包含可复制的钱包地址）和实时系统日志。

## 免责声明

本软件仅供教育和参考之用。请勿使用您无法承受损失的资金进行交易。开发者对使用本软件造成的任何财务损失概不负责。

## 许可证

MIT License
