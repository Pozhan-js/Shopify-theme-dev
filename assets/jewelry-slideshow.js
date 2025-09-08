class JewelrySlideshowComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('.jewelry-slideshow');
    this.slides = this.querySelectorAll('.jewelry-slideshow__slide');
    this.dots = this.querySelectorAll('.jewelry-slideshow__dot');
    this.hoverAreas = this.querySelectorAll('.jewelry-slideshow__hover-area');
    
    this.currentSlide = 0;
    this.slideCount = this.slides.length;
    this.autoplayInterval = null;
    this.autoplayDelay = parseInt(this.slider.dataset.speed) * 1000 || 5000;
    
    this.init();
  }

  init() {
    if (this.slideCount <= 1) return;
    
    this.setupEventListeners();
    this.startAutoplay();
    this.updateSlideVisibility();
  }

  setupEventListeners() {
    // 小圆点点击事件
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
        this.resetAutoplay();
      });
    });

    // 悬停区域点击事件
    this.hoverAreas.forEach(area => {
      area.addEventListener('click', (e) => {
        const direction = area.dataset.direction;
        if (direction === 'prev') {
          this.previousSlide();
        } else if (direction === 'next') {
          this.nextSlide();
        }
        this.resetAutoplay();
      });
    });

    // 鼠标悬停暂停自动播放
    this.addEventListener('mouseenter', () => {
      this.stopAutoplay();
    });

    this.addEventListener('mouseleave', () => {
      this.startAutoplay();
    });

    // 触摸事件支持
    let touchStartX = 0;
    let touchEndX = 0;

    this.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      this.stopAutoplay();
    });

    this.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
      this.startAutoplay();
    });

    // 键盘导航
    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousSlide();
        this.resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
        this.resetAutoplay();
      }
    });

    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoplay();
      } else {
        this.startAutoplay();
      }
    });
  }

  handleSwipe(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
    }
  }

  goToSlide(index) {
    if (index < 0) {
      index = this.slideCount - 1;
    } else if (index >= this.slideCount) {
      index = 0;
    }
    
    this.currentSlide = index;
    this.updateSlideVisibility();
  }

  nextSlide() {
    this.goToSlide(this.currentSlide + 1);
  }

  previousSlide() {
    this.goToSlide(this.currentSlide - 1);
  }

  updateSlideVisibility() {
    // 更新幻灯片显示
    this.slides.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.classList.add('jewelry-slideshow__slide--active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('jewelry-slideshow__slide--active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // 更新小圆点状态
    this.dots.forEach((dot, index) => {
      if (index === this.currentSlide) {
        dot.classList.add('jewelry-slideshow__dot--active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('jewelry-slideshow__dot--active');
        dot.removeAttribute('aria-current');
      }
    });

    // 更新aria-live区域
    this.slider.setAttribute('aria-label', `幻灯片 ${this.currentSlide + 1} / ${this.slideCount}`);
  }

  startAutoplay() {
    if (this.slider.dataset.autoplay === 'true') {
      this.stopAutoplay();
      this.autoplayInterval = setInterval(() => {
        this.nextSlide();
      }, this.autoplayDelay);
    }
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }
}

// 注册自定义元素
customElements.define('jewelry-slideshow-component', JewelrySlideshowComponent);

// 初始化所有轮播图
document.addEventListener('DOMContentLoaded', () => {
  const slideshows = document.querySelectorAll('jewelry-slideshow-component');
  slideshows.forEach(slideshow => {
    // 确保组件已初始化
    if (!slideshow.initialized) {
      slideshow.initialized = true;
    }
  });
});

// 处理Shopify主题编辑器
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    const section = event.target;
    const slideshow = section.querySelector('jewelry-slideshow-component');
    if (slideshow) {
      // 重新初始化
      slideshow.dispatchEvent(new CustomEvent('reinitialize'));
    }
  });

  document.addEventListener('shopify:section:unload', (event) => {
    const section = event.target;
    const slideshow = section.querySelector('jewelry-slideshow-component');
    if (slideshow) {
      slideshow.disconnectedCallback();
    }
  });

  document.addEventListener('shopify:section:select', (event) => {
    const section = event.target;
    const slideshow = section.querySelector('jewelry-slideshow-component');
    if (slideshow) {
      slideshow.stopAutoplay();
    }
  });

  document.addEventListener('shopify:section:deselect', (event) => {
    const section = event.target;
    const slideshow = section.querySelector('jewelry-slideshow-component');
    if (slideshow) {
      slideshow.startAutoplay();
    }
  });

  document.addEventListener('shopify:block:select', (event) => {
    const block = event.target;
    const slideshow = block.closest('jewelry-slideshow-component');
    if (slideshow) {
      const slideIndex = Array.from(block.parentNode.children).indexOf(block);
      slideshow.goToSlide(slideIndex);
      slideshow.stopAutoplay();
    }
  });

  document.addEventListener('shopify:block:deselect', (event) => {
    const block = event.target;
    const slideshow = block.closest('jewelry-slideshow-component');
    if (slideshow) {
      slideshow.startAutoplay();
    }
  });
}
