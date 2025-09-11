# 分类模块使用指南

## 概述
我们为您创建了两个动态分类模块，可以根据后台数据自动展示产品分类，样式为圆形边框，上面图片，下面文字。

## 模块类型

### 1. Auto Category Section (自动分类模块)
- **文件**: `sections/auto-category-section.liquid`
- **特点**: 自动获取所有产品系列，无需手动配置
- **使用场景**: 希望自动展示所有产品分类

### 2. Dynamic Category Section (动态分类模块)
- **文件**: `sections/dynamic-category-section.liquid`
- **特点**: 手动选择要展示的产品系列
- **使用场景**: 需要精确控制展示的分类

## 使用方法

### 方法一：添加到首页
1. 进入 Shopify 后台 → 在线商店 → 模板
2. 点击"自定义"进入主题编辑器
3. 在左侧添加分区 → 选择"Auto Category Section"或"Dynamic Category Section"
4. 配置相关设置

### 方法二：添加到特定页面
1. 在页面模板中添加：
```liquid
{% section 'auto-category-section' %}
```
或
```liquid
{% section 'dynamic-category-section' %}
```

### 方法三：使用示例页面
- 我们已创建示例页面：`templates/page.category-demo.liquid`
- 访问路径：`/pages/category-demo`

## 配置选项

### 通用设置
- **标题设置**: 可自定义模块标题和副标题
- **颜色设置**: 背景色、文字颜色、边框颜色等
- **显示选项**: 是否显示产品数量、查看全部按钮等

### Auto Category Section 特有设置
- **最大显示数量**: 控制最多显示多少个分类
- **自动过滤**: 自动排除空分类和系统分类

### Dynamic Category Section 特有设置
- **手动选择**: 可精确选择要展示的产品系列
- **自定义图片**: 可为每个分类设置自定义图片

## 样式特点
- **圆形边框**: 2px 灰色边框，悬停时变色
- **响应式设计**: 自动适配桌面、平板、手机
- **悬停效果**: 鼠标悬停时轻微上浮动画
- **图片优化**: 自动优化图片尺寸和加载

## 技术特性
- **SEO友好**: 使用语义化HTML标签
- **性能优化**: 图片懒加载，减少初始加载时间
- **无障碍访问**: 支持键盘导航和屏幕阅读器
- **多语言支持**: 支持Shopify多语言功能

## 自定义样式
如需进一步自定义样式，可以在主题的CSS文件中添加：

```css
/* 自定义分类圆圈大小 */
.category-circle {
  width: 200px;
  height: 200px;
}

/* 自定义边框颜色 */
.category-circle {
  border-color: #your-color;
}

/* 自定义悬停效果 */
.category-item:hover {
  transform: scale(1.05);
}
```

## 常见问题

### Q: 如何修改边框颜色？
A: 在主题编辑器中，找到对应的分类模块，在"Hover border color"设置中修改颜色。

### Q: 如何控制显示的分类数量？
A: 
- Auto Category Section: 使用"Maximum collections to show"设置
- Dynamic Category Section: 手动添加/删除分类块

### Q: 如何为分类设置自定义图片？
A: 
- Auto Category Section: 在Shopify后台 → 产品 → 系列 → 编辑系列图片
- Dynamic Category Section: 在模块设置中为每个分类单独上传图片

### Q: 如何调整圆圈大小？
A: 在CSS中修改`.category-circle`的width和height属性。

## 支持
如有任何问题，请联系开发团队获取技术支持。
