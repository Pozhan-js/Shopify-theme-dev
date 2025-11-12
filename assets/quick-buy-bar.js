/**
 * 快速购买栏功能
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
      this.btnText.textContent = '加入购物车';
    } else {
      this.addToCartBtn.disabled = true;
      this.btnText.textContent = '售罄';
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
      
      // 更新购物车
      await this.updateCart();

    } catch (error) {
      console.error('添加到购物车失败:', error);
      this.addToCartBtn.classList.remove('loading');
      this.showError('添加失败，请重试');
    }
  }

  /**
   * 显示成功状态
   */
  showSuccess() {
    this.addToCartBtn.classList.add('success');
    
    setTimeout(() => {
      this.addToCartBtn.classList.remove('success');
      this.addToCartBtn.disabled = false;
    }, 1500);
  }

  /**
   * 播放飞入购物车动画
   */
  playFlyAnimation() {
    if (!this.flyItem || !this.flyImage || !this.productImage) return;

    // 获取产品图片位置
    const imageRect = this.productImage.getBoundingClientRect();
    
    // 获取购物车图标位置（尝试多个常见选择器）
    const cartIcon = document.querySelector('[data-cart-icon]') || 
                     document.querySelector('.cart-icon') ||
                     document.querySelector('[href="/cart"]') ||
                     document.querySelector('a[href*="cart"]');
    
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

    // 计算目标位置
    const deltaX = cartRect.left - imageRect.left;
    const deltaY = cartRect.top - imageRect.top;

    // 使用 CSS 变量设置动画终点
    this.flyItem.style.setProperty('--fly-x', deltaX + 'px');
    this.flyItem.style.setProperty('--fly-y', deltaY + 'px');

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
   * 更新购物车
   */
  async updateCart() {
    try {
      const cartResponse = await fetch('/cart.js');
      const cart = await cartResponse.json();
      
      // 更新购物车数量显示（支持多种选择器）
      const cartCountSelectors = [
        '[data-cart-count]',
        '.cart-count',
        '#cart-count',
        '.cart-item-count'
      ];

      cartCountSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.textContent = cart.item_count;
          // 添加弹出动画
          el.classList.add('cart-count-pop');
          setTimeout(() => {
            el.classList.remove('cart-count-pop');
          }, 400);
        });
      });

      // 购物车图标抖动动画
      const cartIcons = document.querySelectorAll('[data-cart-icon], .cart-icon, [href="/cart"]');
      cartIcons.forEach(icon => {
        icon.classList.add('cart-shake');
        setTimeout(() => {
          icon.classList.remove('cart-shake');
        }, 500);
      });

      // 触发自定义事件
      document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { 
          cart: cart,
          addedVariant: this.currentVariant
        }
      }));
      
    } catch (error) {
      console.error('更新购物车失败:', error);
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
    // 简化版，实际应使用 Shopify 的 money_format
    const amount = (cents / 100).toFixed(2);
    return `$${amount}`;
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new QuickBuyBar();
});
