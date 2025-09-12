# Custom Navigation Header

## 功能特点

1. **Logo位置**：固定在导航栏最左侧
2. **导航菜单**：靠右对齐展示
3. **翻译切换**：位于导航栏最右侧
4. **悬浮菜单**：鼠标悬停Category时显示产品类型，包含图片和名称
5. **响应式设计**：支持移动端适配

## 文件结构

- `sections/custom-navigation-header.liquid` - 主要section文件
- `assets/custom-navigation-header.css` - 样式文件
- `templates/page.custom-nav-demo.liquid` - 演示页面

## 使用方法

1. **添加Section**：
   - 在Shopify后台 → 在线商店 → 主题 → 自定义
   - 添加"Custom Navigation Header" section

2. **配置菜单**：
   - 在section设置中选择导航菜单
   - 确保菜单有子菜单项以显示悬浮菜单

3. **设置颜色**：
   - 支持主题颜色方案
   - 渐变金色：#C89F73

4. **翻译功能**：
   - 自动检测可用语言
   - 支持多语言切换

## 悬浮菜单配置

悬浮菜单会自动显示子菜单项，每个项目包含：
- 产品图片（来自collection）
- 产品名称
- 点击跳转到对应collection

## 响应式特性

- **桌面端**：完整导航栏
- **平板端**：调整间距和大小
- **移动端**：汉堡菜单抽屉式导航

## 自定义选项

在section设置中可以调整：
- 导航菜单选择
- 颜色方案
- Logo高度

## 演示页面

访问 `/pages/custom-nav-demo` 查看效果
