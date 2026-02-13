# Wen Ti Niao - AI 鸟类识别应用

基于 BirdNET 的 AI 鸟类声音识别应用。支持录音识别和文件上传识别，提供 Web 和 Android 移动端支持。

## 功能特性

- 🎤 **实时录音识别** - 在浏览器中直接录制鸟鸣声
- 📁 **文件上传分析** - 支持多种音频格式（MP3, WAV, WebM, OGG, AAC, M4A）
- 🐦 **鸟种数据库** - 内置常见鸟类详细信息、图片和维基百科链接
- 📊 **置信度评分** - AI 提供识别置信度，按概率排序结果
- 🌐 **响应式设计** - 适配桌面、平板和移动设备
- 🔒 **API 密钥认证** - 生产环境安全的 API 访问控制
- ⚡ **异步处理** - 非阻塞的音频分析，支持并发请求
- 🛡️ **速率限制** - 防止 DoS 攻击，每 IP 每分钟 5 次请求
- 🔐 **CORS 保护** - 限制跨域访问的来源、方法和头部

## 环境要求

### 后端
- Python >= 3.12
- pip
- BirdNET（自动安装）

### 前端
- Node.js >= 18
- npm 或 yarn

### Android 打包
- Android Studio
- JDK 8 或更高版本

## 快速开始

### 后端设置

```bash
# 进入后端目录
cd hear_bird_backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量（可选）
export API_KEYS="your-secret-key-1,your-secret-key-2"
export ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"

# 启动开发服务器
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 后端环境变量

| 变量 | 说明 | 默认值 | 必需 |
|--------|------|----------|--------|
| `API_KEYS` | API 密钥列表，逗号分隔 | 空（开发模式开放） | 否 |
| `ALLOWED_ORIGINS` | 允许的跨域来源 | `http://localhost:3000,http://localhost:5173` | 否 |

#### 后端 API 端点

| 方法 | 路径 | 说明 |
|------|--------|------|
| GET | `/health` | 健康检查端点 |
| POST | `/analyze` | 音频文件分析（需 API 密钥） |

**请求限制：**
- 最大文件大小：50MB
- 速率限制：每 IP 每分钟 5 次
- 超时：5 分钟

### 前端设置

```bash
# 进入前端目录
cd hear_bird_web

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件配置 API 地址
# VITE_API_URL=http://localhost:8000/analyze

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 开始使用。

#### 前端环境变量

在 `hear_bird_web/.env` 文件中配置：

```bash
# 后端 API 地址
# 本地开发：http://localhost:8000/analyze
# 生产环境：https://api.yourdomain.com/analyze
VITE_API_URL=

# 启用 Mock 模式（仅测试，不要在生产环境使用）
VITE_ENABLE_MOCK=

# 启用分析统计（可选）
VITE_ENABLE_ANALYTICS=
```

## 构建生产版本

### 后端

```bash
cd hear_bird_backend
pip install -r requirements.txt

# 使用 gunicorn（生产推荐）
pip install gunicorn
gunicorn main:app --workers 4 --bind 0.0.0.0:8000
```

### 前端

```bash
cd hear_bird_web
npm install
npm run build

# 预览生产构建
npm run preview
```

构建产物在 `dist/` 目录，可部署到任何静态文件服务器（Nginx、Apache、Vercel 等）。

## Android 应用打包

> ⚠️ **安全警告**：以下配置使用了明文流量（HTTP），仅用于本地开发。**生产环境必须使用 HTTPS**。

### 1. 安装 Capacitor 依赖

```bash
cd hear_bird_web
npm install @capacitor/core@latest @capacitor/cli@latest --save-dev
npm run build
npx cap init
npx cap sync
npm install @capacitor/android@latest
npx cap add android
```

### 2. 配置 Android 项目

#### MainActivity.java

打开 `android/app/src/main/java/com/example/wenti/MainActivity.java`：

```java
public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        WebView webView = getBridge().getWebView();
        WebSettings webSettings = webView.getSettings();
        
        // ⚠️ 仅开发环境使用 - 生产环境需 HTTPS
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
}
```

#### AndroidManifest.xml - 权限

打开 `android/app/src/main/AndroidManifest.xml` 添加录音权限：

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

#### AndroidManifest.xml - 明文流量（⚠️ 仅开发）

打开 `android/app/src/main/AndroidManifest.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:usesCleartextTraffic="true"
    </application>
</manifest>
```

### 3. 打包 APK

```bash
npx cap open android
```

在 Android Studio 中：
1. Build → Generate App Bundle or APKs
2. 选择 Generate APK
3. 等待构建完成

## 安全配置

### 生产环境部署检查清单

- [ ] 后端配置了 `API_KEYS` 环境变量
- [ ] 使用 HTTPS（TLS 1.2+）部署后端
- [ ] `ALLOWED_ORIGINS` 配置为实际域名
- [ ] 移除 Android 的 `usesCleartextTraffic` 或配置网络安全
- [ ] 启用防火墙规则限制 8000 端口访问
- [ ] 定期轮换 API 密钥
- [ ] 配置监控和日志收集

### Content Security Policy

前端已配置 CSP 头以防止 XSS 攻击：

- 默认来源：`'self'`
- 脚本来源：`'self'`, `esm.sh` (React)
- 样式来源：`'self'`, `'unsafe-inline'`, `fonts.googleapis.com`
- 字体来源：`'self'`, `fonts.gstatic.com`
- 图片来源：`'self'`, `data:`, 外部图片域名
- 连接来源：`'self'`, `http://localhost:*`, `https:`

## 项目结构

```
hear_bird/
├── hear_bird_backend/         # Python/FastAPI 后端
│   ├── main.py              # 主应用文件
│   └── requirements.txt     # Python 依赖
├── hear_bird_web/           # React/TypeScript 前端
│   ├── src/
│   │   ├── components/      # React 组件
│   │   │   ├── HomeView.tsx
│   │   │   ├── ResultsScreen.tsx
│   │   │   └── Visualizer.tsx
│   │   ├── services/        # API 服务
│   │   │   └── birdService.ts
│   │   ├── constants.ts      # 常量和配置
│   │   └── types.ts         # TypeScript 类型
│   ├── vite.config.ts       # Vite 配置
│   ├── tsconfig.json        # TypeScript 配置
│   ├── .env.example         # 环境变量模板
│   └── package.json
└── README.md
```

## API 使用示例

### 使用 curl 测试

```bash
# 健康检查
curl http://localhost:8000/health

# 分析音频文件（需要 API 密钥）
curl -X POST http://localhost:8000/analyze \
  -H "X-API-Key: your-secret-key" \
  -F "file=@bird_recording.mp3" \
  -F "lat=37.7749" \
  -F "lon=-122.4194"
```

### JavaScript 示例

```javascript
const formData = new FormData();
formData.append('file', audioFile);
formData.append('lat', 37.7749);
formData.append('lon', -122.4194);

const response = await fetch('http://localhost:8000/analyze', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-secret-key'
  },
  body: formData
});

const data = await response.json();
console.log(data.results);
```

## 故障排除

### 后端无法启动

1. 检查 Python 版本：`python --version`（需要 >= 3.12）
2. 检查依赖安装：`pip list | grep fastapi`
3. 检查端口占用：`netstat -ano | findstr :8000`

### 前端无法连接后端

1. 检查 `.env` 文件中的 `VITE_API_URL`
2. 确认后端正在运行：访问 http://localhost:8000/health
3. 检查 CORS 配置的 `ALLOWED_ORIGINS`
4. 查看浏览器控制台的错误信息

### Android 应用无法录音

1. 确认 `AndroidManifest.xml` 中有录音权限
2. 在手机设置中授予应用麦克风权限
3. 检查 `MainActivity.java` 的 `onStart()` 方法

### 速率限制错误

收到 `429 Too Many Requests` 错误：
- 等待 1 分钟后重试
- 或配置后端环境变量增加限制（不推荐）
- 在生产环境为每个用户分配不同的 API 密钥

## 技术栈

### 后端
- FastAPI 0.115.0
- Uvicorn 0.32.0
- BirdNET 1.5.0
- slowapi 0.1.9（速率限制）
- python-multipart 0.0.9（文件上传）

### 前端
- React 19.2.3
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS 4.1.18
- Capacitor（Android 打包）

## 许可证

请查看项目根目录的 LICENSE 文件。

## 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 支持

如有问题或建议，请创建 [Issue](https://github.com/yourusername/hear_bird/issues)。
