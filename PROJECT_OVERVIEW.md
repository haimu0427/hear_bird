# 问题鸟 (Hear Bird) - 鸟类声音识别应用

## 📱 项目概述

**问题鸟** 是一个基于 AI 的鸟类声音识别应用，可以通过录音或上传音频文件来识别鸟类物种。它采用前后端分离架构，支持网页版和 Android 移动应用。

### 核心功能
- 🎤 **实时录音识别**：使用麦克风录制鸟鸣声进行分析
- 📁 **音频文件上传**：支持上传已有的音频文件
- 🔍 **智能识别**：基于 BirdNET AI 模型进行鸟类声音分析
- 📊 **置信度评分**：显示识别结果的可信度百分比
- 🌍 **地理位置支持**：可选提供经纬度以提高识别准确性
- 📖 **详细信息展示**：提供鸟类的学名、俗名、描述和图片
- 🌙 **深色模式支持**：优雅的 UI 设计，支持深浅主题

---

## 🏗️ 技术架构

### 后端 (hear_bird_backend/)
- **框架**: FastAPI (Python 3.12+)
- **核心依赖**: 
  - `birdnet-analyzer` - 基于深度学习的鸟类声音识别库
  - `uvicorn` - ASGI 服务器
- **功能**:
  - 接收音频文件（支持多种格式）
  - 调用 BirdNET 进行音频分析
  - 解析 CSV 结果并标准化字段名
  - 返回 JSON 格式的识别结果

**API 端点**:
```
POST /analyze
- 参数: file (音频文件), lat (可选), lon (可选)
- 返回: { msg: "success", results: [...] }
```

### 前端 (hear_bird_web/)
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS (纯工具类方案)
- **移动端**: Capacitor (用于打包 Android 应用)
- **主要组件**:
  - `HomeView` - 主界面，包含录音和上传功能
  - `ResultsScreen` - 结果展示界面
  - `Visualizer` - 音频可视化组件

---

## 🎯 工作流程

### 用户交互流程
```
1. 用户点击麦克风按钮开始录音 (或上传音频文件)
   ↓
2. 前端调用 MediaRecorder API 录制音频 (WebM 格式)
   ↓
3. 音频发送到后端 /analyze 端点
   ↓
4. 后端保存到临时目录，调用 BirdNET 分析
   ↓
5. BirdNET 生成 CSV 结果文件
   ↓
6. 后端解析 CSV，标准化字段名
   ↓
7. 返回 JSON 结果 (学名、俗名、置信度、时间段)
   ↓
8. 前端匹配本地鸟类数据库 (BIRD_DB)
   ↓
9. 展示结果：图片、描述、置信度、Wikipedia 链接
```

### 数据流示例
```typescript
// 后端返回
{
  "msg": "success",
  "results": [
    {
      "start": "0.0",
      "end": "2.62",
      "scientificName": "Passer montanus",
      "commonName": "Eurasian Tree Sparrow",
      "confidence": "0.9823"
    }
  ]
}

// 前端丰富数据
{
  ...result,
  image: "https://cdn.download.ams.birds.cornell.edu/...",
  description: "The Eurasian tree sparrow...",
  coverImage: "...",
  matchPercentage: 98  // 转换为百分比
}
```

---

## 🎨 UI/UX 设计特点

### HomeView (主界面)
- 森林背景图（来自 Unsplash）
- 脉动的状态指示器（绿色=就绪，红色=录音中，黄色=分析中）
- 大型圆形麦克风按钮（带光晕效果）
- 音频可视化动画
- 小型上传按钮（右下角）

### ResultsScreen (结果界面)
- 主要匹配结果大卡片（460px 高度）
- 置信度徽章（绿色发光效果）
- 悬停时图片放大动画
- 次要可能性列表（进度条显示置信度）
- 深浅主题自适应

---

## 🗄️ 数据管理

### 本地鸟类数据库 (BIRD_DB)
前端维护了一个硬编码的鸟类数据库，包含：
- 学名和俗名
- 详细描述
- 高质量图片（来自 Cornell Lab、Wikipedia 等）
- 封面图片中心点坐标（用于最佳显示）
- Wikipedia 链接

**当前收录物种**:
- Eurasian Collared-Dove (灰斑鸠)
- Eurasian Tree Sparrow (麻雀)
- Common Cuckoo (杜鹃)
- European Robin (知更鸟)
- 等 10 个物种

### 降级策略
如果后端不可用，前端会：
1. 捕获 API 错误
2. 返回 Mock 数据 (MOCK_RESULTS_FALLBACK)
3. 模拟 2 秒延迟
4. 继续展示 UI（用于演示）

---

## 📱 移动端部署

### Android 应用打包
使用 **Capacitor** 将网页应用打包为原生 Android 应用：

**特殊配置**:
```java
// 允许 HTTPS 页面调用 HTTP 后端 (本地调试)
webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
```

**权限要求**:
- `RECORD_AUDIO` - 录音权限
- `MODIFY_AUDIO_SETTINGS` - 音频设置权限

**网络配置**:
- `usesCleartextTraffic="true"` - 允许明文 HTTP 流量（开发用）

---

## 🔧 配置说明

### 需要修改的地方

#### 1. **API 地址配置**
```typescript
// hear_bird_web/constants.ts
export const API_URL = 'http://localhost:8000/analyze';
```

**部署场景**:
- 本地开发: `http://localhost:8000/analyze`
- 局域网: `http://192.168.x.x:8000/analyze`
- 公网: `https://your-domain.com/analyze`

#### 2. **CORS 配置**
后端当前允许所有来源：
```python
allow_origins=["*"]  # 生产环境应限制
```

---

## 🚀 快速开始

### 启动后端
```bash
cd hear_bird_backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 启动前端
```bash
cd hear_bird_web
npm install
npm run dev  # 访问 http://localhost:3000
```

### 打包 Android 应用
```bash
cd hear_bird_web
# 修改 constants.ts 中的 API_URL
npm run build
npx cap sync
npx cap open android  # 在 Android Studio 中打开
# Build -> Generate APK
```

---

## 🔍 核心实现细节

### 后端关键逻辑

#### 音频分析流程
```python
def _run_birdnet_analyzer(audio_path, output_dir, lat, lon):
    # 1. 构建 BirdNET 命令
    command = [sys.executable, "-m", "birdnet_analyzer.analyze", ...]
    
    # 2. 如果有地理位置，添加参数
    if lat and lon:
        command.extend(["--lat", str(lat), "--lon", str(lon)])
    
    # 3. 执行分析
    result = subprocess.run(command, capture_output=True)
    
    # 4. 查找生成的 CSV 文件
    csv_candidates = glob.glob(os.path.join(output_dir, "*.csv"))
    
    # 5. 过滤掉参数文件，选择最新的结果
    return selected_csv_path
```

#### CSV 字段标准化
```python
def _normalize_header(header: str) -> str:
    # "Start (s)" -> "start"
    # "Scientific Name" -> "scientificName"
    # "Common Name" -> "commonName"
    cleaned = re.sub(r"\s*\(s\)\s*", " ", header)
    parts = re.split(r"[^0-9a-zA-Z]+", cleaned.strip())
    return parts[0].lower() + "".join(part.capitalize() for part in parts[1:])
```

### 前端关键逻辑

#### 录音实现
```typescript
const startRecording = async () => {
  // 1. 请求麦克风权限
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // 2. 创建 MediaRecorder
  const recorder = new MediaRecorder(stream);
  
  // 3. 收集音频数据块
  recorder.addEventListener('dataavailable', event => {
    chunksRef.current.push(event.data);
  });
  
  // 4. 停止时生成文件
  recorder.addEventListener('stop', () => {
    const blob = new Blob(chunksRef.current, { type: mimeType });
    const file = new File([blob], `recording-${Date.now()}.webm`);
    onFileSelect(file);  // 发送到后端
  });
  
  recorder.start();
};
```

#### 结果数据处理
```typescript
const processedData = useMemo(() => {
  return data.results.map(result => {
    const dbEntry = BIRD_DB[result.scientificName];
    return {
      ...result,
      image: dbEntry?.image ?? PLACEHOLDER_BIRD,
      description: dbEntry?.description ?? "No description available.",
      matchPercentage: Math.round(parseFloat(result.confidence) * 100)
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
}, [data]);
```

---

## 🎓 技术亮点

1. **BirdNET 集成**: 使用康奈尔大学的先进鸟类识别 AI 模型
2. **响应式设计**: 使用 `min-h-[100dvh]` 确保移动端视口正确
3. **优雅降级**: API 失败时自动使用 Mock 数据
4. **类型安全**: 全程 TypeScript，无 `any` 类型
5. **性能优化**: 使用 `useMemo` 缓存计算结果
6. **资源清理**: `useEffect` 清理函数停止媒体流
7. **跨平台**: 一套代码，支持网页和 Android

---

## 🐛 已知限制

1. **无测试框架** - 前后端都未配置单元测试
2. **CORS 全开** - 生产环境需限制来源
3. **硬编码数据库** - 鸟类数据在代码中，应使用数据库
4. **无错误边界** - React 应用缺少错误边界组件
5. **同步端点** - 后端未使用异步 (FastAPI 支持但未启用)
6. **临时文件清理** - 分析后的临时文件未自动清理

---

## 🎯 未来改进方向

- 添加 Pytest (后端) 和 Vitest (前端)
- 配置 ESLint + Prettier
- 启用 TypeScript strict 模式
- 实现鸟类数据库 API（替代硬编码）
- 添加用户历史记录功能
- 支持批量音频分析
- 添加地图显示识别位置
- 支持导出识别报告

---

这是一个**功能完整、UI 精美的鸟类识别应用**，核心技术栈现代且成熟。主要用途是帮助自然爱好者通过鸟鸣声快速识别鸟类物种。项目结构清晰，代码质量良好，适合作为 AI + 移动应用的学习案例。
