# 阿里云IoT温湿度监控系统

基于阿里云IoT平台的温湿度实时监控与数据分析Web应用。

## 📋 项目介绍

本项目是一个网页版温湿度监控应用，能够实时读取ESP32设备上传到阿里云IoT平台的温湿度数据，并提供数据存储、分析和可视化功能。

### 核心特性

- **实时监控**：显示ESP32设备的两路温湿度数据
- **数据存储**：自动保存历史数据到本地存储
- **数据分析**：提供统计数据和趋势分析
- **历史记录**：支持按时间范围筛选和导出CSV
- **阈值告警**：可配置温湿度告警阈值
- **响应式设计**：适配桌面和移动设备

## 🔧 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **状态管理**：Zustand
- **样式方案**：CSS-in-JS（内联样式）
- **图表组件**：自定义SVG图表
- **数据存储**：LocalStorage
- **阿里云服务**：IoT Platform

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 9+ 或 yarn 1.22+
- 阿里云IoT平台账号
- ESP32温湿度采集设备（可选，用于真实数据测试）

### 本地开发

#### 1. 克隆项目

```bash
git clone <your-github-repo-url>
cd iot-monitor-web
```

#### 2. 安装依赖

```bash
npm install
```

或使用yarn：

```bash
yarn install
```

#### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173/ 启动。

#### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

## ☁️ 阿里云IoT配置教程

### 步骤1：创建阿里云IoT产品

1. 登录阿里云IoT平台：https://iot.console.aliyun.com/
2. 进入"产品"页面，点击"创建产品"
3. 填写产品信息：
   - 产品名称：`温湿度监测`
   - 所属品类：自定义品类
   - 节点类型：设备
   - 数据格式：JSON
   - 认证方式：设备密钥
4. 点击"确认"创建产品

### 步骤2：定义物模型（属性）

物模型定义了设备上报的数据结构。本项目需要4个属性：

1. 在产品详情页，点击"功能定义"
2. 点击"编辑草稿"
3. 添加以下属性：

**通道1温度**
- 属性名称：`temperature_1`
- 标识符：`temperature_1`
- 数据类型：float
- 取值范围：-40 ~ 80
- 单位：℃

**通道1湿度**
- 属性名称：`humidity_1`
- 标识符：`humidity_1`
- 数据类型：float
- 取值范围：0 ~ 100
- 单位：%

**通道2温度**
- 属性名称：`temperature_2`
- 标识符：`temperature_2`
- 数据类型：float
- 取值范围：-40 ~ 80
- 单位：℃

**通道2湿度**
- 属性名称：`humidity_2`
- 标识符：`humidity_2`
- 数据类型：float
- 取值范围：0 ~ 100
- 单位：%

4. 点击"发布上线"

### 步骤3：创建设备

1. 在产品详情页，点击"设备"标签
2. 点击"添加设备"
3. 填写设备信息：
   - 设备名称：`ESP32_Device`（或自定义）
   - 备注名称：温湿度传感器1
4. 点击"确认"
5. **重要**：保存设备证书信息（ProductKey、DeviceName、DeviceSecret）

### 步骤4：获取AccessKey

1. 登录阿里云RAM访问控制：https://ram.console.aliyun.com/
2. 创建AccessKey或使用已有AccessKey
3. **重要**：AccessKeySecret只会显示一次，请妥善保存

### 步骤5：配置应用

1. 启动应用后，点击底部导航的"设置"
2. 填写阿里云配置：
   - AccessKey ID：RAM用户的AccessKey ID
   - AccessKey Secret：RAM用户的AccessKey Secret
   - Product Key：产品密钥（从设备证书获取）
   - Device Name：设备名称（如`ESP32_Device`）
   - 区域：cn-shanghai（默认）
3. 设置刷新间隔（秒）
4. 配置温湿度告警阈值
5. 点击"保存配置"

## 📦 ESP32设备代码示例

以下是一个ESP32设备上报温湿度数据的示例代码（使用Arduino IDE）：

```cpp
#include <WiFi.h>
#include <AliyunIoTSDK.h>
#include <DHT.h>

// WiFi配置
#define WIFI_SSID "你的WiFi名称"
#define WIFI_PASSWORD "你的WiFi密码"

// 阿里云IoT配置
#define PRODUCT_KEY "你的ProductKey"
#define DEVICE_NAME "你的DeviceName"
#define DEVICE_SECRET "你的DeviceSecret"
#define REGION_ID "cn-shanghai"

// DHT传感器配置
#define DHT_PIN_1 4
#define DHT_PIN_2 5
#define DHT_TYPE DHT22

DHT dht1(DHT_PIN_1, DHT_TYPE);
DHT dht2(DHT_PIN_2, DHT_TYPE);

WiFiClient espClient;
AliyunIoTSDK iot(PRODUCT_KEY, DEVICE_NAME, DEVICE_SECRET, REGION_ID);

void setup() {
    Serial.begin(115200);
    
    // 连接WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");
    
    // 初始化DHT传感器
    dht1.begin();
    dht2.begin();
    
    // 初始化阿里云IoT
    iot.begin(espClient);
}

void loop() {
    // 读取传感器数据
    float temp1 = dht1.readTemperature();
    float humi1 = dht1.readHumidity();
    float temp2 = dht2.readTemperature();
    float humi2 = dht2.readHumidity();
    
    // 检查数据是否有效
    if (!isnan(temp1) && !isnan(humi1) && !isnan(temp2) && !isnan(humi2)) {
        // 上报数据到阿里云
        iot.send("temperature_1", temp1);
        iot.send("humidity_1", humi1);
        iot.send("temperature_2", temp2);
        iot.send("humidity_2", humi2);
        
        Serial.printf("Channel 1: %.1f°C %.1f%%\n", temp1, humi1);
        Serial.printf("Channel 2: %.1f°C %.1f%%\n", temp2, humi2);
    }
    
    // 每30秒上报一次
    delay(30000);
}
```

## 🌐 GitHub部署教程

### 方式一：部署到GitHub Pages（推荐）

#### 步骤1：创建GitHub仓库

1. 登录GitHub：https://github.com/
2. 点击右上角"+"，选择"New repository"
3. 填写仓库信息：
   - Repository name：`iot-monitor-web`
   - Description：阿里云IoT温湿度监控系统
   - 选择"Public"（公开仓库）
4. 点击"Create repository"

#### 步骤2：初始化本地Git仓库

```bash
# 进入项目目录
cd iot-monitor-web

# 初始化Git仓库
git init

# 添加所有文件到暂存区
git add .

# 提交代码
git commit -m "Initial commit: 阿里云IoT温湿度监控系统"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/iot-monitor-web.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

#### 步骤3：配置GitHub Pages

1. 在GitHub仓库页面，点击"Settings"
2. 左侧菜单选择"Pages"
3. 配置Source：
   - Source：Deploy from a branch
   - Branch：gh-pages / (root)
   - Folder：/ (root)
4. 点击"Save"
5. 等待1-2分钟，页面将发布到：`https://你的用户名.github.io/iot-monitor-web/`

#### 步骤4：启用自动部署（可选）

项目已配置GitHub Actions，每次推送到main分支会自动部署。

### 方式二：手动部署

如果不想使用自动部署，可以手动构建并上传：

```bash
# 构建项目
npm run build

# 将dist目录内容推送到gh-pages分支
cd dist
git init
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/你的用户名/iot-monitor-web.git
git push -f origin gh-pages
```

## 📂 项目结构

```
iot-monitor-web/
├── src/
│   ├── components/          # React组件
│   │   ├── DataCard.tsx           # 数据卡片组件
│   │   ├── SimpleLineChart.tsx    # 简单折线图组件
│   │   └── StatusIndicator.tsx    # 状态指示器组件
│   ├── screens/             # 页面组件
│   │   ├── HomeScreen.tsx         # 实时监控页面
│   │   ├── HistoryScreen.tsx      # 历史数据页面
│   │   ├── AnalyticsScreen.tsx    # 数据分析页面
│   │   └── SettingsScreen.tsx    # 设置页面
│   ├── store/               # 状态管理
│   │   └── useStore.ts            # Zustand状态存储
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts               # 类型和常量定义
│   ├── utils/               # 工具函数
│   │   ├── aliIoT.ts              # 阿里云IoT API封装
│   │   ├── database.ts            # 本地数据库操作
│   │   └── storage.ts             # 本地存储操作
│   ├── App.tsx              # 应用主组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── dist/                    # 构建输出目录（部署用）
├── public/                  # 静态资源
├── .gitignore              # Git忽略规则
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── README.md               # 项目文档
```

## ⚙️ 应用功能说明

### 实时监控页面

- 显示两路温湿度数据（通道1和通道2）
- 实时状态指示（正常/警告/危险）
- 设备信息展示
- 手动刷新数据按钮
- 自动刷新功能（可配置间隔）

### 历史数据页面

- 按时间范围筛选（今天/本周/本月/全部）
- 温湿度趋势图表
- 历史数据列表
- 导出CSV功能
- 数据详情查看

### 数据分析页面

- 通道切换（通道1/通道2）
- 统计卡片（平均值、范围）
- 数据趋势可视化

### 设置页面

- 阿里云IoT连接配置
- 刷新间隔设置
- 温湿度阈值配置（警告/危险）
- 配置保存和重置

## 🛠️ 常见问题

### Q1: 页面显示"无法获取数据"？

检查以下内容：
1. 阿里云配置是否正确
2. ESP32设备是否在线
3. 设备是否已上报数据到阿里云
4. 物模型属性标识符是否正确（temperature_1, humidity_1等）

### Q2: 如何查看设备是否在线？

登录阿里云IoT控制台，进入设备详情页查看设备状态。

### Q3: 数据多久刷新一次？

可在设置页面调整刷新间隔，默认30秒。

### Q4: 历史数据保存在哪里？

历史数据保存在浏览器的LocalStorage中，清除浏览器数据会丢失。

## 📝 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题，请通过GitHub Issues联系我们。
