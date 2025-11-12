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
    this.quantityInput = this.bar.querySelector('[data-quantity-input]');
    this.minusBtn = this.bar.querySelector('[data-quantity-minus]');
    this.plusBtn = this.bar.querySelector('[data-quantity-plus]');
    this.addToCartBtn = this.bar.querySelector('[data-quick-add-to-cart]');
    this.closeBtn = this.bar.querySelector('[data-quick-close]');
    this.priceElement = this.bar.querySelector('[data-quick-price]');
    this.comparePriceElement = this.bar.querySelector('[data-quick-compare-price]');
    this.btnText = this.bar.querySelector('[data-btn-text]');
    
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

    // 数量选择器事件
    this.minusBtn.addEventListener('click', () => this.changeQuantity(-1));
    this.plusBtn.addEventListener('click', () => this.changeQuantity(1));
    this.quantityInput.addEventListener('change', this.validateQuantity.bind(this));

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
    const documentHeight = document.documentElement.scrollHeight;
    
    // 滚动超过一屏后显示
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
   * 改变数量
   */
  changeQuantity(delta) {
    const currentValue = parseInt(this.quantityInput.value) || 1;
    const newValue = Math.max(1, Math.min(99, currentValue + delta));
    this.quantityInput.value = newValue;
    this.validateQuantity();
  }

  /**
   * 验证数量
   */
  validateQuantity() {
    let value = parseInt(this.quantityInput.value) || 1;
    value = Math.max(1, Math.min(99, value));
    this.quantityInput.value = value;

    // 更新按钮状态
    this.minusBtn.disabled = value <= 1;
    this.plusBtn.disabled = value >= 99;
  }

  /**
   * 添加到购物车
   */
  async addToCart() {
    if (!this.currentVariant || !this.currentVariant.available) return;

    const quantity = parseInt(this.quantityInput.value) || 1;
    
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
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error('添加失败');
      }

      const data = await response.json();
      
      // 成功提示
      this.showSuccess();
      
      // 更新购物车（如果有购物车组件）
      this.updateCart();
      
      // 触发自定义事件
      document.dispatchEvent(new CustomEvent('cart:item-added', {
        detail: { variant: this.currentVariant, quantity: quantity }
      }));

    } catch (error) {
      console.error('添加到购物车失败:', error);
      this.showError('添加失败，请重试');
    } finally {
      // 恢复按钮状态
      this.addToCartBtn.classList.remove('loading');
      this.addToCartBtn.disabled = false;
    }
  }

  /**
   * 显示成功提示
   */
  showSuccess() {
    const originalText = this.btnText.textContent;
    this.btnText.textContent = '✓ 已添加';
    
    setTimeout(() => {
      this.btnText.textContent = originalText;
    }, 2000);
  }

  /**
   * 显示错误提示
   */
  showError(message) {
    alert(message);
  }

  /**
   * 更新购物车
   */
  async updateCart() {
    // 如果页面有购物车图标或抽屉，触发更新
    try {
      const cartResponse = await fetch('/cart.js');
      const cart = await cartResponse.json();
      
      // 更新购物车数量显示
      const cartCountElements = document.querySelectorAll('[data-cart-count]');
      cartCountElements.forEach(el => {
        el.textContent = cart.item_count;
      });

      // 触发购物车更新事件
      document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { cart: cart }
      }));
      
    } catch (error) {
      console.error('更新购物车失败:', error);
    }
  }

  /**
   * 格式化金额
   */
  formatMoney(cents) {
    // 使用 Shopify 的 money_format
    // 这里是简化版，实际应该使用主题的 money format 设置
    const amount = (cents / 100).toFixed(2);
    return `$${amount}`;
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new QuickBuyBar();
});
