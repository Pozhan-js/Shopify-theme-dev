// JSON解析工具函数
window.shopifyJsonParse = function(input) {
  try {
    const result = typeof input === 'string' ? JSON.parse(input) : input;
    window.parsedJsonData = result; // 存储到全局变量
    return result;
  } catch (e) {
    console.error('JSON解析错误:', e);
    return null;
  }
};

// 初始化检查
document.addEventListener('DOMContentLoaded', function() {
  console.log('JSON解析工具已加载');
});
