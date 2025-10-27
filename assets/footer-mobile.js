// 移动端footer下拉菜单功能
document.addEventListener('DOMContentLoaded', function() {
  // 只在移动端启用下拉功能
  if (window.innerWidth <= 749) {
    initializeMobileFooter();
  }

  // 监听窗口大小变化
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 749) {
      initializeMobileFooter();
    } else {
      // 桌面端移除移动端样式
      const columns = document.querySelectorAll('.footer-links-column');
      columns.forEach(column => {
        column.classList.remove('active');
        const h3 = column.querySelector('h3');
        if (h3) {
          h3.style.cursor = 'default';
          h3.removeEventListener('click', toggleFooterColumn);
        }
      });
    }
  });
});

function initializeMobileFooter() {
  const columns = document.querySelectorAll('.footer-links-column');
  
  columns.forEach(column => {
    const h3 = column.querySelector('h3');
    if (h3) {
      h3.style.cursor = 'pointer';
      h3.addEventListener('click', toggleFooterColumn);
    }
  });
}

function toggleFooterColumn(event) {
  const column = event.target.closest('.footer-links-column');
  if (column) {
    // 关闭其他打开的列
    const allColumns = document.querySelectorAll('.footer-links-column');
    allColumns.forEach(col => {
      if (col !== column) {
        col.classList.remove('active');
      }
    });
    
    // 切换当前列
    column.classList.toggle('active');
  }
}

// 防止在桌面端执行
if (window.innerWidth <= 749) {
  initializeMobileFooter();
}
