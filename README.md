# Movie Subtitle Crop

一个用于处理电影字幕截图的工具，可以快速合并多张字幕截图，自动裁剪重复部分。

这个项目耗时 2 小时，利用 LLM 自动生成，中间有少许手动修改的部分，多数时间都是在用对话调整布局和样式，说明 LLM 缺少了视觉信息，所以还是挺难 get 到我想表达的视觉样貌。


在线演示 [https://metool.online/movie-subtitle-crop/](https://metool.online/movie-subtitle-crop/)

![demo](/demo/demo.png)

## 功能特性

- 📸 支持多图片上传
- ✂️ 自定义裁剪比例
- 🔄 拖拽排序图片
- 🖼️ 图片预览功能
- ⚡ 批量处理图片
- 💾 一键下载结果
- 🎯 支持图片替换
- 🗑️ 支持删除和清空

## 支持的图片格式

- JPEG/JPG
- PNG
- GIF
- WebP

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run serve
```

### 构建生产版本

```bash
npm run build
```

## 使用说明

1. **上传图片**
   - 点击"Choose Images"按钮选择多张图片
   - 或直接拖拽图片到上传区域

2. **管理图片**
   - 拖拽图片调整顺序
   - 点击图片可预览大图
   - 使用"Replace"按钮替换单张图片
   - 使用"Delete"按钮删除单张图片
   - 使用"Clear All"按钮清空所有图片

3. **设置和处理**
   - 调整裁剪百分比（5%-100%）
   - 点击"Start"开始处理
   - 等待处理完成后预览结果
   - 点击"Download"下载处理后的图片

## 工作原理

1. 第一张图片完整保留
2. 后续图片根据设定的百分比保留底部内容
3. 自动将所有图片垂直合并为一张完整图片

## 技术栈

- Vue 3
- TypeScript
- Composition API
- HTML5 Canvas

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解更多详情
