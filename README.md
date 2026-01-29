# 开发指南
## 后台

python版本需求>3.12
安装依赖，启动后台服务：

```
cd hear_bird_backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 前端

进入hear_bird_web\constants.ts文件修改API_URL后台地址
直接启动
```
cd hear_bird_web
npm install
npm run dev
```
访问 localhost:3000端口进入使用网页版

## 打包APP

进入hear_bird_web\constants.ts文件修改API_URL后台地址<br>
如果是后端部署在局域网就修改成局域网地址，如果公网就修改成公网地址<br>
电脑上先安装andriod studio
进入前端工程，安装capacitor依赖，执行以下
```
npm install @capacitor/core@latest @capacitor/cli@latest --save-dev
npx cap init
npm run build
npx cap sync
npm install @capacitor/android@latest
npx cap add android
npx cap open android
```
就会自动打开andriod studio


修改MainActivity.java
```
public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        WebView webView = getBridge().getWebView();
        WebSettings webSettings = webView.getSettings();
        // 方便本地后台调试，即https的页面可调用http后台
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
}
```

修改AndriodManifest.xml添加录音权限
```
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

修改AndriodManifest.xml添加 这一句usesCleartextTraffic
```
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:usesCleartextTraffic="true"
    </application>
</manifest>
```

安卓studio顶部Build->Generate App bundle or APKs-->Generate APK 即可打包APK