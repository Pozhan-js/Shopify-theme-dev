/**
 * 快速购买栏功能 - Savor 主题优化版
 */
class QuickBuyBar {
  constructor() {
    this.bar = document.getElementById('quickBuyBar');
    if (!this.bar) return;

    this.container = this.bar.querySelector('.quick-buy-container');
    this.productData = JSON.parse(document.getElementById('quick-buy-product-json').textContent);
    
    // DOM 元素
    this.variantSelects = this.bar.querySelectorAll('.quick-variant-select');
    this.addToCartBtn = this.bar.querySelector('[data-quick-add-to-cart]');
    this.closeBtn = this.bar.querySelector('[data-quick-close]');
    this.priceElement = this.bar.querySelector('[data-quick-price]');
    this.comparePriceElement = this.bar.querySelector('[data-quick-compare-price]');
    this.btnText = this.bar.querySelector('[data-btn-text]');
    this.btnIcon = this.bar.querySelector('.btn-icon');
    this.productImage = this.bar.querySelector('[data-quick-image]');
    this.flyItem = document.getElementById('cartFlyItem');
    this.flyImage = this.flyItem?.querySelector('[data-fly-image]');
    
    // 当前选中的变体
    this.currentVariant = this.productData.selected_or_first_available_variant || this.productData.variants[0];
    
    this.init();
  }

  init() {
    // 监听滚动显示/隐藏快速购买栏
    this.handleScroll();
    window.addEventListener('scroll', this.handleScroll.bind(this));

    // 变体选择器事件
    this.variantSelects.forEach(select => {
      select.addEventListener('change', this.handleVariantChange.bind(this));
    });

    // 添加到购物车事件
    this.addToCartBtn.addEventListener('click', this.addToCart.bind(this));

    // 关闭按钮事件
    this.closeBtn.addEventListener('click', this.hide.bind(this));

    // 从 URL 加载变体
    this.loadVariantFromUrl();
    
    // 页面加载时更新一次购物车数量
    this.updateCart();
  }

  /**
   * 处理滚动 - 显示/隐藏快速购买栏
   */
  handleScroll() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // 滚动超过半屏后显示
    if (scrollPosition > windowHeight * 0.5) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * 显示快速购买栏
   */
  show() {
    this.bar.classList.add('active');
  }

  /**
   * 隐藏快速购买栏
   */
  hide() {
    this.bar.classList.remove('active');
  }

  /**
   * 处理变体选择变化
   */
  handleVariantChange() {
    const selectedOptions = {};
    
    // 获取所有选中的选项
    this.variantSelects.forEach(select => {
      const position = select.dataset.optionPosition;
      selectedOptions[position] = select.value;
    });

    // 查找匹配的变体
    const variant = this.findVariant(selectedOptions);
    
    if (variant) {
      this.currentVariant = variant;
      this.updateVariant(variant);
    }
  }

  /**
   * 根据选项查找变体
   */
  findVariant(selectedOptions) {
    return this.productData.variants.find(variant => {
      return this.productData.options.every((option, index) => {
        const position = index + 1;
        return variant.options[index] === selectedOptions[position];
      });
    });
  }

  /**
   * 更新变体信息
   */
  updateVariant(variant) {
    // 更新价格
    this.updatePrice(variant);
    
    // 更新图片
    this.updateImage(variant);
    
    // 更新按钮状态
    this.updateButton(variant);
    
    // 更新 URL
    this.updateUrl(variant.id);
  }

  /**
   * 更新价格显示
   */
  updatePrice(variant) {
    if (this.priceElement) {
      this.priceElement.textContent = this.formatMoney(variant.price);
    }

    if (this.comparePriceElement) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        this.comparePriceElement.textContent = this.formatMoney(variant.compare_at_price);
        this.comparePriceElement.style.display = 'inline';
      } else {
        this.comparePriceElement.style.display = 'none';
      }
    }
  }

  /**
   * 更新图片
   */
  updateImage(variant) {
    if (variant.featured_image && this.productImage) {
      const imageUrl = variant.featured_image.src.replace(/\.(jpg|jpeg|png|gif|webp)/, '_100x100.$1');
      this.productImage.src = imageUrl;
    }
  }

  /**
   * 更新按钮状态
   */
  updateButton(variant) {
    if (variant.available) {
      this.addToCartBtn.disabled = false;
      this.btnText.textContent = 'ADD TO CART';
    } else {
      this.addToCartBtn.disabled = true;
      this.btnText.textContent = 'SOLD OUT';
    }
  }

  /**
   * 更新 URL
   */
  updateUrl(variantId) {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variantId);
    window.history.replaceState({ path: url.href }, '', url.href);
  }

  /**
   * 从 URL 加载变体
   */
  loadVariantFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const variantId = urlParams.get('variant');
    
    if (variantId) {
      const variant = this.productData.variants.find(v => v.id == variantId);
      if (variant) {
        this.currentVariant = variant;
        
        // 更新选择器
        variant.options.forEach((value, index) => {
          const select = this.bar.querySelector(`[data-option-position="${index + 1}"]`);
          if (select) {
            select.value = value;
          }
        });
        
        this.updateVariant(variant);
      }
    }
  }

  /**
   * 添加到购物车
   */
  async addToCart() {
    if (!this.currentVariant || !this.currentVariant.available) return;

    // 显示加载状态
    this.addToCartBtn.classList.add('loading');
    this.addToCartBtn.disabled = true;
    const originalText = this.btnText.textContent;
    this.btnText.textContent = '添加中...';

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: this.currentVariant.id,
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error('添加失败');
      }

      const data = await response.json();
      
      // 移除加载状态
      this.addToCartBtn.classList.remove('loading');
      
      // 显示成功状态
      this.showSuccess();
      
      // 播放飞入动画
      this.playFlyAnimation();
      
      // 更新购物车（多次尝试确保成功）
      await this.updateCart();
      setTimeout(() => this.updateCart(), 100);
      setTimeout(() => this.updateCart(), 300);

    } catch (error) {
      console.error('添加到购物车失败:', error);
      this.addToCartBtn.classList.remove('loading');
      this.btnText.textContent = originalText;
      this.showError('添加失败，请重试');
    }
  }

  /**
   * 显示成功状态
   */
  showSuccess() {
    this.addToCartBtn.classList.add('success');
    this.btnText.textContent = '✓ 已添加';
    
    setTimeout(() => {
      this.addToCartBtn.classList.remove('success');
      this.addToCartBtn.disabled = false;
      this.btnText.textContent = '加入购物车';
    }, 1500);
  }

  /**
   * 播放飞入购物车动画
   */
  playFlyAnimation() {
    if (!this.flyItem || !this.flyImage || !this.productImage) return;

    // 获取产品图片位置
    const imageRect = this.productImage.getBoundingClientRect();
    
    // 获取购物车图标位置 - Savor 主题专用
    const cartIcon = document.querySelector('cart-icon') || 
                     document.querySelector('.header-actions__cart-icon') ||
                     document.querySelector('[data-testid="cart-icon"]');
    
    if (!cartIcon) {
      console.warn('未找到购物车图标');
      return;
    }

    const cartRect = cartIcon.getBoundingClientRect();

    // 设置飞行元素的图片
    this.flyImage.src = this.productImage.src;

    // 设置初始位置
    this.flyItem.style.display = 'block';
    this.flyItem.style.left = imageRect.left + 'px';
    this.flyItem.style.top = imageRect.top + 'px';
    this.flyItem.style.opacity = '1';

    // 计算目标位置
    const deltaX = cartRect.left - imageRect.left;
    const deltaY = cartRect.top - imageRect.top;

    // 添加动画类
    requestAnimationFrame(() => {
      this.flyItem.classList.add('flying');
      
      // 使用 transform 实现飞行效果
      this.flyItem.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.3)`;
      this.flyItem.style.opacity = '0';
      this.flyItem.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    // 动画结束后清理
    setTimeout(() => {
      this.flyItem.classList.remove('flying');
      this.flyItem.style.display = 'none';
      this.flyItem.style.transform = '';
      this.flyItem.style.opacity = '';
      this.flyItem.style.transition = '';
    }, 800);
  }

  /**
   * 更新购物车 - Savor 主题专用版本
   */
  async updateCart() {
    try {
      const cartResponse = await fetch('/cart.js');
      const cart = await cartResponse.json();
      
      console.log('✓ 购物车数据:', cart);
      console.log('✓ 商品数量:', cart.item_count);
      
      let updatedCount = 0;
      
      // ========== Savor 主题的购物车数量元素 ==========
      
      // 1. 主要目标：cart-bubble__text-count
      const cartBubbleCount = document.querySelector('.cart-bubble__text-count');
      if (cartBubbleCount) {
        cartBubbleCount.textContent = cart.item_count;
        cartBubbleCount.setAttribute('aria-hidden', 'true');
        updatedCount++;
        console.log('✅ 已更新 .cart-bubble__text-count:', cart.item_count);
      }
      
      // 2. 更新 visually-hidden 的文本（用于屏幕阅读器）
      const visuallyHidden = document.querySelector('.cart-bubble__text .visually-hidden');
      if (visuallyHidden) {
        visuallyHidden.textContent = `Total items in cart: ${cart.item_count}`;
        updatedCount++;
        console.log('✅ 已更新 visually-hidden 文本');
      }
      
      // 3. 更新整个 cart-bubble__text 的 role status
      const cartBubbleText = document.querySelector('.cart-bubble__text');
      if (cartBubbleText) {
        cartBubbleText.setAttribute('role', 'status');
        updatedCount++;
      }
      
      // 4. 控制 cart-bubble 的显示/隐藏
      const cartBubble = document.querySelector('.cart-bubble');
      const cartIcon = document.querySelector('cart-icon');
      
      if (cart.item_count === 0) {
        // 购物车为空
        if (cartBubble) {
          cartBubble.style.opacity = '0';
          cartBubble.style.visibility = 'hidden';
        }
        if (cartIcon) {
          cartIcon.classList.remove('header-actions__cart-icon--has-cart');
        }
      } else {
        // 购物车有商品
        if (cartBubble) {
          cartBubble.style.opacity = '1';
          cartBubble.style.visibility = 'visible';
        }
        if (cartIcon) {
          cartIcon.classList.add('header-actions__cart-icon--has-cart');
        }
      }
      
      // 5. 添加弹出动画
      if (cartBubbleCount) {
        cartBubbleCount.classList.add('cart-count-pop');
        setTimeout(() => {
          cartBubbleCount.classList.remove('cart-count-pop');
        }, 400);
      }
      
      // 6. 购物车图标抖动动画
      if (cartIcon) {
        cartIcon.classList.add('cart-shake');
        setTimeout(() => {
          cartIcon.classList.remove('cart-shake');
        }, 500);
      }
      
      // 7. 备用方法：使用 data-testid
      const cartBubbleTestId = document.querySelector('[data-testid="cart-bubble"]');
      if (cartBubbleTestId && cartBubbleTestId !== cartBubbleCount) {
        cartBubbleTestId.textContent = cart.item_count;
        updatedCount++;
        console.log('✅ 已更新 [data-testid="cart-bubble"]');
      }
      
      // 8. 如果 cart-icon 是 Web Component，尝试调用其方法
      if (cartIcon && typeof cartIcon.updateCount === 'function') {
        cartIcon.updateCount(cart.item_count);
        console.log('✅ 已调用 cart-icon.updateCount()');
      }
      
      if (updatedCount === 0) {
        console.error('❌ 未找到购物车数量元素！');
      } else {
        console.log(`✅ 成功更新了 ${updatedCount} 个元素`);
      }

      // 刷新 cart drawer（如果有）
      await this.refreshCartDrawer(cart);

      // 触发自定义事件
      document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { 
          cart: cart,
          addedVariant: this.currentVariant,
          itemCount: cart.item_count
        }
      }));
      
      document.dispatchEvent(new CustomEvent('cart:refresh'));
      document.dispatchEvent(new CustomEvent('theme:cart:update', {
        detail: { cart: cart }
      }));
      
      return cart;
      
    } catch (error) {
      console.error('✗ 更新购物车失败:', error);
    }
  }

  /**
   * 刷新购物车抽屉（如果 Savor 主题使用）
   */
  async refreshCartDrawer(cart) {
    const cartDrawer = document.querySelector('cart-drawer') || 
                       document.querySelector('.cart-drawer') ||
                       document.querySelector('#cart-drawer');
    
    if (cartDrawer) {
      console.log('✓ 找到 cart drawer，正在刷新...');
      
      if (cartDrawer.tagName === 'CART-DRAWER' && typeof cartDrawer.renderContents === 'function') {
        cartDrawer.renderContents(cart);
      } else if (typeof cartDrawer.refresh === 'function') {
        cartDrawer.refresh();
      }
    }
  }

  /**
   * 显示错误提示
   */
  showError(message) {
    alert(message);
  }

  /**
   * 格式化金额
   */
  formatMoney(cents) {
    const moneyFormat = window.theme?.moneyFormat || '${{amount}}';
    const amount = (cents / 100).toFixed(2);
    return moneyFormat.replace('{{amount}}', amount).replace('{{amount_no_decimals}}', Math.round(cents / 100));
  }
}

// ========== 全局购物车更新函数 ==========
window.updateCartCount = async function() {
  try {
    const response = await fetch('/cart.js');
    const cart = await response.json();
    
    // Savor 主题专用更新
    const cartBubbleCount = document.querySelector('.cart-bubble__text-count');
    if (cartBubbleCount) {
      cartBubbleCount.textContent = cart.item_count;
      console.log('✓ 购物车数量已更新:', cart.item_count);
    }
    
    const visuallyHidden = document.querySelector('.cart-bubble__text .visually-hidden');
    if (visuallyHidden) {
      visuallyHidden.textContent = `Total items in cart: ${cart.item_count}`;
    }
    
    const cartBubble = document.querySelector('.cart-bubble');
    const cartIcon = document.querySelector('cart-icon');
    
    if (cart.item_count === 0) {
      if (cartBubble) {
        cartBubble.style.opacity = '0';
        cartBubble.style.visibility = 'hidden';
      }
      if (cartIcon) {
        cartIcon.classList.remove('header-actions__cart-icon--has-cart');
      }
    } else {
      if (cartBubble) {
        cartBubble.style.opacity = '1';
        cartBubble.style.visibility = 'visible';
      }
      if (cartIcon) {
        cartIcon.classList.add('header-actions__cart-icon--has-cart');
      }
    }
    
    return cart;
  } catch (error) {
    console.error('✗ 更新购物车失败:', error);
  }
};

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 初始化快速购买栏
  const quickBuyBar = new QuickBuyBar();
  
  // 页面加载时更新购物车数量
  window.updateCartCount();
  
  // 监听其他可能的购物车更新事件
  document.addEventListener('cart:updated', () => {
    window.updateCartCount();
  });
  
  document.addEventListener('cart:refresh', () => {
    window.updateCartCount();
  });
});

// ========== 页面可见性变化时更新购物车 ==========
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    window.updateCartCount();
  }
});
