# Portrait Image 图片不显示问题调试指南

## 问题描述
Brand Story 区块中的 Portrait Image 图片无法正常显示。

## 已修复的问题
1. **图片URL生成**：优化了图片URL的生成方式，使用更灵活的响应式图片
2. **CSS样式**：修复了可能导致图片不显示的CSS样式问题
3. **错误处理**：添加了图片加载失败的错误处理
4. **占位符**：改进了占位符显示，提供更清晰的指导

## 调试步骤

### 1. 检查图片是否已上传
- 进入 Shopify 主题编辑器
- 找到 Brand Story 区块
- 确认 Portrait Image 部分已经上传了图片
- 如果没有上传，点击 "Upload Image" 上传图片

### 2. 检查图片URL
在浏览器开发者工具中：
- 右键点击图片区域 → 检查元素
- 查看 `<img>` 标签的 `src` 属性
- 确认URL格式正确：`//cdn.shopify.com/...`

### 3. 检查网络请求
- 打开浏览器开发者工具 (F12)
- 切换到 Network 标签
- 刷新页面
- 查看图片请求是否成功 (状态码 200)

### 4. 检查控制台错误
- 打开浏览器开发者工具
- 切换到 Console 标签
- 查看是否有JavaScript错误或图片加载错误

### 5. 测试图片显示
如果图片仍然不显示，可以尝试：
- 使用不同的图片格式 (JPG, PNG)
- 检查图片文件大小是否过大
- 确认图片没有被其他CSS规则隐藏

## 常见问题解决

### 问题1：图片显示为占位符
**原因**：图片未上传或图片路径错误
**解决**：在主题编辑器中重新上传图片

### 问题2：图片变形或裁剪
**原因**：CSS样式冲突
**解决**：已修复CSS样式，使用 `object-fit: cover` 确保图片正确显示

### 问题3：图片加载缓慢
**原因**：图片文件过大
**解决**：压缩图片文件，建议使用不超过500KB的图片

## 技术细节

### 图片标签优化
```liquid
<img src="{{ block.settings.image | image_url }}"
     srcset="{{ block.settings.image | image_url: width: 180 }} 180w,
             {{ block.settings.image | image_url: width: 360 }} 360w,
             {{ block.settings.image | image_url: width: 540 }} 540w"
     sizes="180px"
     alt="{{ block.settings.alt }}"
     loading="lazy"
     width="180"
     height="200"
     style="display: block; width: 100%; height: 100%; object-fit: cover;"
     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
```

### CSS样式修复
- 确保图片容器有固定尺寸 (180x200px)
- 使用 `object-fit: cover` 保持图片比例
- 添加 `display: block` 避免inline元素间隙
- 设置最小宽高确保图片始终可见

## 联系支持
如果以上步骤仍无法解决问题，请提供：
1. 浏览器控制台错误信息
2. 网络请求截图
3. 主题编辑器中的设置截图