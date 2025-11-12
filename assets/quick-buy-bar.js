// ========== 快速购买栏动画和购物车更新 ==========

class QuickBuyBar {
  constructor() {
    this.quickBuyBar = document.querySelector('.quick-buy-bar');
    this.cartCountElements = document.querySelectorAll('.cart-count, [data-cart-count]');
    this.addToCartButtons = document.querySelectorAll('.quick-buy-button, [data-quick-buy]');
    
    this.init();
  }

  init() {
    // 绑定所有快速购买按钮
    this.addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => this.handleAddToCart(e));
    });

    // 页面加载时更新购物车数量
    this.updateCartCount();
  }

  // 处理添加到购物车
  async handleAddToCart(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const variantId = button.dataset.variantId;
    const quantity = parseInt(button.dataset.quantity) || 1;

    if (!variantId) {
      console.error('缺少 variant ID');
      return;
    }

    // 按钮加载状态
    this.setButtonLoading(button, true);

    try {
      // 添加到购物车
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: quantity
          }]
        })
      });

      if (!response.ok) {
        throw new Error('添加失败');
      }

      const data = await response.json();

      // 显示成功动画
      this.showSuccessAnimation(button);

      // 更新购物车数量
      await this.updateCartCount();

      // 可选：显示快速购买栏通知
      this.showQuickBuyNotification(data);

    } catch (error) {
      console.error('添加到购物车失败:', error);
      this.showErrorAnimation(button);
    } finally {
      this.setButtonLoading(button, false);
    }
  }

  // 更新购物车数量
  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // 更新所有购物车数量显示元素
      this.cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
        
        // 添加数量变化动画
        element.classList.add('cart-count-updated');
        setTimeout(() => {
          element.classList.remove('cart-count-updated');
        }, 600);
      });

      // 如果购物车为空，隐藏数量标记
      if (cart.item_count === 0) {
        this.cartCountElements.forEach(el => el.classList.add('hidden'));
      } else {
        this.cartCountElements.forEach(el => el.classList.remove('hidden'));
      }

      return cart;
    } catch (error) {
      console.error('更新购物车数量失败:', error);
    }
  }

  // 设置按钮加载状态
  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.innerHTML = '<span class="spinner"></span> 添加中...';
    } else {
      button.classList.remove('loading');
      button.disabled = false;
      button.textContent = button.dataset.originalText || '加入购物车';
    }
  }

  // 成功动画
  showSuccessAnimation(button) {
    button.classList.add('success');
    button.innerHTML = '<span class="checkmark">✓</span> 已添加';
    
    setTimeout(() => {
      button.classList.remove('success');
      button.textContent = button.dataset.originalText || '加入购物车';
    }, 2000);
  }

  // 错误动画
  showErrorAnimation(button) {
    button.classList.add('error');
    button.innerHTML = '<span class="error-mark">✕</span> 添加失败';
    
    setTimeout(() => {
      button.classList.remove('error');
      button.textContent = button.dataset.originalText || '加入购物车';
    }, 2000);
  }

  // 显示快速购买栏通知
  showQuickBuyNotification(item) {
    if (!this.quickBuyBar) return;

    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'quick-buy-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✓</span>
        <span class="notification-text">已添加到购物车</span>
      </div>
    `;

    this.quickBuyBar.appendChild(notification);

    // 显示动画
    setTimeout(() => notification.classList.add('show'), 10);

    // 3秒后移除
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// ========== 购物车抽屉/侧边栏（可选） ==========
class CartDrawer {
  constructor() {
    this.drawer = document.querySelector('.cart-drawer');
    this.overlay = document.querySelector('.cart-overlay');
    this.openButtons = document.querySelectorAll('[data-cart-open]');
    this.closeButtons = document.querySelectorAll('[data-cart-close]');
    
    if (this.drawer) {
      this.init();
    }
  }

  init() {
    this.openButtons.forEach(btn => {
      btn.addEventListener('click', () => this.open());
    });

    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
  }

  async open() {
    // 刷新购物车内容
    await this.refreshCart();
    
    this.drawer.classList.add('active');
    if (this.overlay) this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.drawer.classList.remove('active');
    if (this.overlay) this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  async refreshCart() {
    try {
      const response = await fetch('/cart?view=drawer');
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = doc.querySelector('.cart-drawer-content');
      
      if (newContent) {
        const currentContent = this.drawer.querySelector('.cart-drawer-content');
        if (currentContent) {
          currentContent.innerHTML = newContent.innerHTML;
        }
      }
    } catch (error) {
      console.error('刷新购物车失败:', error);
    }
  }
}

// ========== 页面加载时初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 初始化快速购买栏
  const quickBuyBar = new QuickBuyBar();
  
  // 初始化购物车抽屉（如果需要）
  const cartDrawer = new CartDrawer();

  // 监听 Shopify 主题事件（如果主题支持）
  document.addEventListener('cart:updated', () => {
    quickBuyBar.updateCartCount();
  });
});

// ========== 全局函数（供其他地方调用） ==========
window.updateCartCount = async function() {
  const response = await fetch('/cart.js');
  const cart = await response.json();
  document.querySelectorAll('.cart-count, [data-cart-count]').forEach(el => {
    el.textContent = cart.item_count;
  });
  return cart;
};
