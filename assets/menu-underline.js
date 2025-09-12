// 导航栏滑动下划线效果
class MenuUnderline {
  constructor() {
    this.init();
  }

  init() {
    const menuContainer = document.querySelector('.header__inline-menu');
    if (!menuContainer) return;

    const menuItems = menuContainer.querySelectorAll('.header__menu-item');
    if (menuItems.length === 0) return;

    // 创建滑动下划线元素
    this.createUnderline(menuContainer);
    
    // 设置初始位置
    this.setInitialPosition(menuItems);
    
    // 绑定事件
    this.bindEvents(menuItems);
  }

  createUnderline(container) {
    const underline = document.createElement('div');
    underline.className = 'menu-underline';
    underline.style.cssText = `
      position: absolute;
      bottom: 0.5rem;
      height: 2px;
      background-color: #E5E5E5;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      z-index: 1;
    `;
    
    const listMenu = container.querySelector('.list-menu--inline');
    if (listMenu) {
      listMenu.style.position = 'relative';
      listMenu.appendChild(underline);
    }
    
    this.underline = underline;
  }

  setInitialPosition(menuItems) {
    // 默认第一个菜单项（Home）为激活状态
    const firstItem = menuItems[0];
    if (firstItem) {
      this.updateUnderlinePosition(firstItem);
    }
  }

  updateUnderlinePosition(item) {
    if (!this.underline || !item) return;
    
    const itemRect = item.getBoundingClientRect();
    const containerRect = item.parentElement.getBoundingClientRect();
    
    const left = itemRect.left - containerRect.left;
    const width = itemRect.width;
    
    this.underline.style.left = `${left}px`;
    this.underline.style.width = `${width}px`;
  }

  bindEvents(menuItems) {
    menuItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.updateUnderlinePosition(item);
      });
      
      item.addEventListener('mouseleave', () => {
        // 返回到当前激活的菜单项或第一个菜单项
        const activeItem = document.querySelector('.header__active-menu-item') || menuItems[0];
        this.updateUnderlinePosition(activeItem);
      });
    });

    // 处理窗口大小变化
    window.addEventListener('resize', () => {
      const activeItem = document.querySelector('.header__active-menu-item') || menuItems[0];
      this.updateUnderlinePosition(activeItem);
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new MenuUnderline();
});

// 处理Shopify的页面切换
document.addEventListener('shopify:section:load', () => {
  new MenuUnderline();
});
