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
    
    // 调试：查找购物车元素（开发时使用，生产环境可删除）
    if (window.location.search.includes('debug=true')) {
      setTimeout(() => {
        this.debugCartElements();
      }, 1000);
    }
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
      setTimeout(() => this.updateCart(), 500);

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
    
    // 获取购物车图标位置（尝试多个 Savor 主题常见选择器）
    const cartIcon = document.querySelector('.header__cart') || 
                     document.querySelector('.cart-link') ||
                     document.querySelector('[data-cart-icon]') || 
                     document.querySelector('.header__icon--cart') ||
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
   * 更新购物车 - Savor 主题优化版
   */
  async updateCart() {
    try {
      const cartResponse = await fetch('/cart.js');
      const cart = await cartResponse.json();
      
      console.log('✓ 购物车数据:', cart);
      console.log('✓ 商品数量:', cart.item_count);
      
      // Savor 主题特定的选择器 + 通用选择器
      const cartCountSelectors = [
        // Savor 主题常用选择器
        '.header__cart-count',
        '.cart__count',
        '.cart-count-bubble',
        '.cart-link__bubble',
        // 通用选择器
        '#cart-count',
        '[data-cart-count]',
        '.cart-count',
        '.cart-item-count',
        '#CartCount',
        '.header-cart-count',
        // 额外的可能选择器
        '.cart-counter',
        '[data-cart-item-count]',
        '.js-cart-count'
      ];

      let foundElements = 0;
      cartCountSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`✓ 找到 ${elements.length} 个元素: ${selector}`);
          foundElements += elements.length;
          
          elements.forEach(el => {
            // 更新文本内容
            el.textContent = cart.item_count;
            el.innerText = cart.item_count;
            
            // 更新 data 属性（如果存在）
            if (el.hasAttribute('data-cart-count')) {
              el.setAttribute('data-cart-count', cart.item_count);
            }
            
            // 控制显示/隐藏
            if (cart.item_count === 0) {
              el.classList.add('hidden');
              el.style.opacity = '0';
              el.style.visibility = 'hidden';
            } else {
              el.classList.remove('hidden');
              el.style.opacity = '1';
              el.style.visibility = 'visible';
            }
            
            // 添加弹出动画
            el.classList.add('cart-count-pop');
            setTimeout(() => {
              el.classList.remove('cart-count-pop');
            }, 400);
          });
        }
      });

      if (foundElements === 0) {
        console.warn('⚠️ 未找到购物车数量元素，尝试自动检测...');
        this.autoDetectAndUpdateCartCount(cart.item_count);
      } else {
        console.log(`✓ 成功更新 ${foundElements} 个购物车数量元素`);
      }

      // 更新购物车图标（添加抖动动画）
      const cartIconSelectors = [
        '.header__cart',
        '.cart-link',
        '[data-cart-icon]',
        '.header__icon--cart',
        'a[href="/cart"]',
        'a[href*="/cart"]',
        '.cart-icon'
      ];

      cartIconSelectors.forEach(selector => {
        const icons = document.querySelectorAll(selector);
        icons.forEach(icon => {
          icon.classList.add('cart-shake');
          setTimeout(() => {
            icon.classList.remove('cart-shake');
          }, 500);
        });
      });

      // 如果 Savor 主题使用 cart drawer，刷新它
      await this.refreshCartDrawer(cart);

      // 触发自定义事件
      document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { 
          cart: cart,
          addedVariant: this.currentVariant,
          itemCount: cart.item_count
        }
      }));

      // 触发 Savor 主题可能监听的事件
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
   * 自动检测并更新购物车数量
   */
  autoDetectAndUpdateCartCount(itemCount) {
    // 查找所有可能包含购物车数量的元素
    const allElements = document.querySelectorAll('span, div, p, a');
    
    allElements.forEach(el => {
      const text = el.textContent.trim();
      const isNumber = text.match(/^\d+$/);
      const isSmall = el.offsetWidth < 50 && el.offsetHeight < 50;
      const hasCartInClass = el.className.toLowerCase().includes('cart');
      const hasCartInParent = el.parentElement?.className.toLowerCase().includes('cart');
      
      // 如果是小的数字元素，且与购物车相关
      if (isNumber && isSmall && (hasCartInClass || hasCartInParent)) {
        console.log('🎯 自动检测到可能的购物车数量元素:', el);
        el.textContent = itemCount;
        el.classList.add('cart-count-pop');
        setTimeout(() => {
          el.classList.remove('cart-count-pop');
        }, 400);
      }
    });
  }

  /**
   * 刷新购物车抽屉（如果 Savor 主题使用）
   */
  async refreshCartDrawer(cart) {
    // 查找 cart drawer 元素
    const cartDrawer = document.querySelector('cart-drawer') || 
                       document.querySelector('.cart-drawer') ||
                       document.querySelector('#cart-drawer') ||
                       document.querySelector('[data-cart-drawer]');
    
    if (cartDrawer) {
      console.log('✓ 找到 cart drawer，正在刷新...');
      
      // 如果是 Web Component
      if (cartDrawer.tagName === 'CART-DRAWER' && typeof cartDrawer.renderContents === 'function') {
        cartDrawer.renderContents(cart);
      }
      // 如果有刷新方法
      else if (typeof cartDrawer.refresh === 'function') {
        cartDrawer.refresh();
      }
      // 手动刷新 drawer 内容
      else {
        try {
          const response = await fetch('/cart?section_id=cart-drawer');
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const newContent = doc.querySelector('.cart-drawer__inner') || 
                            doc.querySelector('.drawer__inner');
          
          if (newContent) {
            const currentContent = cartDrawer.querySelector('.cart-drawer__inner') || 
                                  cartDrawer.querySelector('.drawer__inner');
            if (currentContent) {
              currentContent.innerHTML = newContent.innerHTML;
              console.log('✓ Cart drawer 内容已刷新');
            }
          }
        } catch (error) {
          console.error('刷新 cart drawer 失败:', error);
        }
      }
    }
  }

  /**
   * 调试：查找所有购物车相关元素
   */
  debugCartElements() {
    console.log('=== 🔍 调试：查找购物车元素 ===');
    
    // 查找所有包含 "cart" 的类名
    const cartElements = document.querySelectorAll('[class*="cart"]');
    console.log(`找到 ${cartElements.length} 个包含 "cart" 的元素:`);
    
    cartElements.forEach(el => {
      const text = el.textContent.trim();
      if (text.match(/^\d+$/) && parseInt(text) < 100) {
        console.log('✓ 可能的购物车数量元素:', {
          element: el,
          className: el.className,
          id: el.id,
          textContent: text,
          selector: this.getSelector(el)
        });
      }
    });
    
    // 查找所有包含数字的小元素
    const allElements = document.querySelectorAll('span, div, p');
    console.log('\n查找所有小的数字元素:');
    
    allElements.forEach(el => {
      const text = el.textContent.trim();
      if (text.match(/^\d+$/) && parseInt(text) < 100 && el.offsetWidth < 50) {
        console.log('✓ 可能的数量标记:', {
          element: el,
          className: el.className,
          id: el.id,
          textContent: text,
          width: el.offsetWidth,
          height: el.offsetHeight
        });
      }
    });
  }

  /**
   * 获取元素的 CSS 选择器
   */
  getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className) {
      const classes = el.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) return `.${classes.join('.')}`;
    }
    return el.tagName.toLowerCase();
  }

  /**
   * 显示错误提示
   */
  showError(message) {
    // 可以替换为更友好的提示方式
    alert(message);
    
    // 或者使用自定义通知
    // this.showNotification(message, 'error');
  }

  /**
   * 格式化金额
   */
  formatMoney(cents) {
    // 获取 Shopify 的货币格式设置
    const moneyFormat = window.theme?.moneyFormat || '${{amount}}';
    const amount = (cents / 100).toFixed(2);
    
    // 简单替换
    return moneyFormat.replace('{{amount}}', amount).replace('{{amount_no_decimals}}', Math.round(cents / 100));
  }
}

// ========== 全局购物车更新函数 ==========
window.updateCartCount = async function() {
  try {
    const response = await fetch('/cart.js');
    const cart = await response.json();
    
    // 尝试所有可能的选择器
    const selectors = [
      '.header__cart-count',
      '.cart__count',
      '.cart-count-bubble',
      '.cart-link__bubble',
      '[data-cart-count]',
      '.cart-count',
      '#cart-count',
      '.cart-item-count',
      '#CartCount'
    ];
    
    let updated = false;
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.textContent = cart.item_count;
        if (cart.item_count === 0) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
        updated = true;
      });
    });
    
    if (updated) {
      console.log('✓ 购物车数量已更新:', cart.item_count);
    } else {
      console.warn('⚠️ 未找到购物车数量元素');
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
