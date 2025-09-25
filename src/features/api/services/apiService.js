
import { mockProducts, mockArmenianSuggestions } from '../mocks/mockData.js';

export const searchProducts = async (query, options = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!query || query.trim() === '') {
    return {
      success: true,
      data: [],
      message: 'Enter search query'
    };
  }

  const searchQuery = query.toLowerCase().trim();
  const results = mockProducts.filter(product => {
    const searchableText = [
      product.title,
      product.model,
      product.brand,
      product.type,
      product.category,
      product.description,
      ...product.tags,
      ...(product.specs.connectivity || []),
      ...(product.specs.colors || [])
    ].join(' ').toLowerCase();

    return searchableText.includes(searchQuery);
  });

  const sortedResults = results.sort((a, b) => {
    const aTitleMatch = a.title.toLowerCase().includes(searchQuery);
    const bTitleMatch = b.title.toLowerCase().includes(searchQuery);
    
    if (aTitleMatch && !bTitleMatch) return -1;
    if (!aTitleMatch && bTitleMatch) return 1;
    return b.rating - a.rating;
  });

  let filteredResults = sortedResults;
  
  if (options.category) {
    filteredResults = filteredResults.filter(item => 
      item.category.toLowerCase() === options.category.toLowerCase()
    );
  }
  
  if (options.brand) {
    filteredResults = filteredResults.filter(item => 
      item.brand.toLowerCase() === options.brand.toLowerCase()
    );
  }
  
  if (options.inStock !== undefined) {
    filteredResults = filteredResults.filter(item => 
      item.inStock === options.inStock
    );
  }
  
  if (options.priceRange) {
    filteredResults = filteredResults.filter(item => 
      item.priceNum >= options.priceRange.min && 
      item.priceNum <= options.priceRange.max
    );
  }

  return {
    success: true,
    data: filteredResults,
    total: filteredResults.length,
    query: searchQuery,
    message: filteredResults.length > 0 
      ? `Found ${filteredResults.length} results` 
      : 'Nothing found'
  };
};

export const getPopularSearches = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    success: true,
    data: [
      "iPhone 15",
      "MacBook Air",
      "Samsung Galaxy",
      "AirPods Pro",
      "PlayStation 5",
      "iPad Pro",
      "Nintendo Switch",
      "Apple Watch"
    ]
  };
};

export const getSearchSuggestions = async (query) => {
  if (!query || query.length < 2) {
    return {
      success: true,
      data: []
    };
  }

  await new Promise(resolve => setTimeout(resolve, 150));

  const searchQuery = query.toLowerCase();
  
  const armenianSuggestions = [];
  Object.keys(mockArmenianSuggestions).forEach(key => {
    if (key.includes(searchQuery) || searchQuery.includes(key)) {
      armenianSuggestions.push(...mockArmenianSuggestions[key]);
    }
  });
  
  const suggestions = new Set();
  armenianSuggestions.forEach(suggestion => {
    if (suggestion.toLowerCase().includes(searchQuery)) {
      suggestions.add(suggestion);
    }
  });
  
  mockProducts.forEach(product => {
    if (product.title.toLowerCase().includes(searchQuery)) {
      suggestions.add(product.title);
    }
    
    if (product.model.toLowerCase().includes(searchQuery)) {
      suggestions.add(product.model);
    }
    
    if (product.brand.toLowerCase().includes(searchQuery)) {
      suggestions.add(product.brand);
    }
    
    if (product.type.toLowerCase().includes(searchQuery)) {
      suggestions.add(product.type);
    }
  });

  const suggestionsArray = Array.from(suggestions).slice(0, 6);

  return {
    success: true,
    data: suggestionsArray,
    query: searchQuery
  };
};

export const getProductById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const product = mockProducts.find(item => item.id === parseInt(id));
  
  if (!product) {
    return {
      success: false,
      message: 'Product not found'
    };
  }

  return {
    success: true,
    data: product
  };
};

export const getProductsByCategory = async (category, options = {}) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const products = mockProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );

  return {
    success: true,
    data: products,
    total: products.length,
    category: category
  };
};

export const getProductsByType = async (type, options = {}) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const products = mockProducts.filter(product => 
    product.type.toLowerCase() === type.toLowerCase()
  );

  return {
    success: true,
    data: products,
    total: products.length,
    type: type
  };
};

export const getProductsByBrand = async (brand, options = {}) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const products = mockProducts.filter(product => 
    product.brand.toLowerCase() === brand.toLowerCase()
  );

  return {
    success: true,
    data: products,
    total: products.length,
    brand: brand
  };
};

export const apiService = {
  searchProducts,
  getPopularSearches,
  getSearchSuggestions,
  getProductById,
  getProductsByCategory,
  getProductsByType,
  getProductsByBrand
};

export default apiService;
