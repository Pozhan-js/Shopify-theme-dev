# 自定义头部导航栏设置指南

## 功能概述
本自定义头部导航栏实现了以下功能：
- 主题色设置为 #DE9B57
- 导航项悬停时颜色变为 #DE9B57
- 当前页面导航项颜色为 #DE9B57 并带有下划线
- 响应式设计，支持移动端

## 使用方法

### 方法1：使用现有header.liquid（推荐）
已更新现有的 `sections/header.liquid` 文件，自动加载了自定义样式。

### 方法2：使用自定义导航栏
1. 在主题编辑器中添加 "Custom Navigation Header" section
2. 配置菜单和颜色设置
3. 设置主题色为 #DE9B57

### 方法3：手动添加CSS
如果需要更精细的控制，可以直接在 `assets/custom-header.css` 中修改样式。

## 文件说明
- `assets/custom-header.css` - 自定义导航栏样式文件
- `sections/header.liquid` - 已更新的原始头部文件
- `sections/custom-navigation-header.liquid` - 全新的自定义导航栏section

## 样式特性
- 平滑的悬停动画效果
- 当前页面高亮显示
- 移动端友好的响应式设计
- 与现有主题颜色方案兼容

## 颜色配置
- 主题色：#DE9B57
- 悬停色：#DE9B57
- 激活色：#DE9B57
- 下划线：#DE9B57

## 使用步骤
1. 文件已自动部署到相应位置
2. 在Shopify主题编辑器中刷新页面
3. 导航栏将自动应用新的样式
4. 如需调整，可编辑 `assets/custom-header.css` 文件
