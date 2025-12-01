// Custom Search Functionality based on Design
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('.search__input');
  const predictiveSearch = document.querySelector('[data-predictive-search]');
  
  if (!searchInput || !predictiveSearch) return;
  
  // Override the default predictive search rendering
  const originalRender = predictiveSearch.render;
  predictiveSearch.render = function(results) {
    if (!results) return;
    
    const products = results.resources?.products || [];
    const queries = results.resources?.queries || [];
    
    let html = `
      <div class="search-results-container">
        <div class="search-results-header">
          <span class="results-count">${products.length}</span>
          <a href="/search?q=${encodeURIComponent(searchInput.value)}" class="view-all-results">
            VIEW ALL RESULTS
          </a>
        </div>
    `;
    
    if (queries.length > 0) {
      html += `
        <div class="search-suggestions">
          <h3 class="suggestions-title">SUGGESTIONS</h3>
          <ul class="suggestions-list">
            ${queries.map(query => `<li><a href="${query.url}">${query.text}</a></li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    if (products.length > 0) {
      html += `
        <div class="search-products">
          <h3 class="products-title">PRODUCTS</h3>
          <div class="products-grid">
            ${products.slice(0, 6).map(product => `
              <div class="product-item">
                <div class="product-image">
                  <img src="${product.featured_image?.url || 'https://via.placeholder.com/80x80'}" 
                       alt="${product.title}" width="80" height="80">
                </div>
                <div class="product-info">
                  <h4 class="product-title">${product.title}</h4>
                  <p class="product-price">${product.price ? '$' + product.price : ''}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    
    predictiveSearch.innerHTML = html;
  };
  
  // Add custom styles
  const style = document.createElement('style');
  style.textContent = `
    .search-results-container {
      padding: 2rem 0;
      max-width: 100%;
    }
    
    .search-results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 0 2rem;
    }
    
    .results-count {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }
    
    .view-all-results {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .view-all-results:hover {
      text-decoration: underline;
    }
    
    .search-suggestions {
      margin-bottom: 2rem;
      padding: 0 2rem;
    }
    
    .suggestions-title,
    .products-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .suggestions-list {
      list-style: none;
      padding: 0;
    }
    
    .suggestions-list li {
      margin-bottom: 0.5rem;
    }
    
    .suggestions-list a {
      color: #666;
      text-decoration: none;
      font-size: 1rem;
    }
    
    .suggestions-list a:hover {
      color: #333;
    }
    
    .search-products {
      padding: 0 2rem;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .product-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .product-image {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-info {
      flex: 1;
    }
    
    .product-title {
      font-size: 0.9rem;
      font-weight: 400;
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
    }
    
    .product-price {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: 1fr;
      }
      
      .search-results-header,
      .search-suggestions,
      .search-products {
        padding: 0 1rem;
      }
    }
  `;
  document.head.appendChild(style);
});