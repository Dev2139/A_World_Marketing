'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaStar, FaRegStar, FaStarHalfAlt, FaSearch, FaTimes, FaFilter, FaBox } from 'react-icons/fa';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  image: string;
  category: string;
  stock: number;
  brand?: string;
  rating?: number;
  discount?: number;
  allImages?: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('relevance');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the backend data to match our Product interface
        const transformedProducts: Product[] = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          image: product.image,
          category: product.category,
          stock: Number(product.stockQuantity),
          brand: product.brand || 'Unknown',
          rating: Number(product.rating) || 0,
          discount: Number(product.discount) || 0,
          allImages: product.allImages || []
        }));
        
        setProducts(transformedProducts);
        
        // Extract unique categories and brands for filters
        const categories: string[] = Array.from(new Set(transformedProducts.map(p => p.category)));
        const brands: string[] = Array.from(new Set(transformedProducts.map(p => p.brand || 'Unknown')));
        
        setAllCategories(categories);
        setAllBrands(brands);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        // In case of error, we could show an error message or fallback data
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter products based on all criteria
  const filteredProducts = products.filter(product => {
    // Search query filter
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    // Brand filter
    const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
    
    // Price range filter
    const price = Number(product.price);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    // Stock filter
    let matchesStock = true;
    if (stockFilter === 'in-stock') {
      matchesStock = product.stock > 0;
    } else if (stockFilter === 'low-stock') {
      matchesStock = product.stock > 0 && product.stock <= 5;
    } else if (stockFilter === 'out-of-stock') {
      matchesStock = product.stock === 0;
    }
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesStock;
  });

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return Number(a.price) - Number(b.price);
      case 'price-high':
        return Number(b.price) - Number(a.price);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0; // Relevance would be the default, so no sorting
    }
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(selectedBrand === brand ? null : brand);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setPriceRange([0, 1000]);
    setStockFilter('all');
    setSortOption('relevance');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
            <div className="md:w-3/4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div className="bg-gray-200 h-48 w-full"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper component to render star ratings
  const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="w-4 h-4 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <FaStarHalfAlt key="half" className="w-4 h-4 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };
  
  // Cache for product ratings to ensure stability
  const productRatingCache = new Map<string, number>();
  
  // Generate random rating for a product
  const getRandomRating = (productId: string) => {
    // Check if rating is already cached
    if (productRatingCache.has(productId)) {
      return productRatingCache.get(productId)!;
    }
    
    // Use productId to create a deterministic random rating
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = productId.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate a rating between 4.0 and 5.0 based on the hash
    const rating = 4.0 + (Math.abs(hash) % 11) / 10; // Will give a value between 4.0 and 5.0
    const roundedRating = parseFloat(rating.toFixed(1));
    
    // Cache the rating
    productRatingCache.set(productId, roundedRating);
    
    return roundedRating;
  };
  
  // Cache for product reviews to ensure stability
  const productReviewsCache = new Map<string, Array<any>>();
  
  // Generate random reviews for a product
  const generateRandomReviews = (productId: string) => {
    // Check if reviews are already cached
    if (productReviewsCache.has(productId)) {
      return productReviewsCache.get(productId)!;
    }
    
    // Use productId to create a deterministic seed for consistent reviews
    let seed = 0;
    for (let i = 0; i < productId.length; i++) {
      seed = (productId.charCodeAt(i) + (seed << 6) - seed) % 2147483647;
    }
    
    // Use the seed to create a predictable sequence
    const randomGenerator = (seed: number) => {
      return () => {
        seed = (seed * 1103515245 + 12345) % 2147483647;
        return seed / 2147483647;
      };
    };
    
    const rand = randomGenerator(seed);
    
    const names = [
      "John Doe", "Jane Smith", "Robert Johnson", "Emily Davis", "Michael Brown",
      "Sarah Wilson", "David Miller", "Lisa Anderson", "James Taylor", "Jennifer Thomas"
    ];
    
    const comments = [
      "Great product, highly recommend!",
      "Excellent quality and fast delivery.",
      "Value for money, satisfied with purchase.",
      "Good product, met my expectations.",
      "Amazing quality, will buy again.",
      "Perfect as described, great service.",
      "Impressed with the quality.",
      "Nice product, worth the price.",
      "Exceeded my expectations.",
      "Very happy with this purchase."
    ];
    
    const reviewCount = Math.floor(rand() * 4) + 3; // Generate 3-6 reviews
    const reviews = [];
    
    for (let i = 0; i < reviewCount; i++) {
      const randomNameIndex = Math.floor(rand() * names.length);
      const randomCommentIndex = Math.floor(rand() * comments.length);
      const randomRating = Math.floor(rand() * 2) + 4; // Generate 4-5 stars
      
      reviews.push({
        id: `${productId}-review-${i}`,
        name: names[randomNameIndex],
        comment: comments[randomCommentIndex],
        rating: randomRating,
        date: new Date(Date.now() - Math.floor(rand() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString() // Random date in last 30 days
      });
    }
    
    // Cache the reviews
    productReviewsCache.set(productId, reviews);
    
    return reviews;
  };
  
  // Get average rating for a product
  const getProductAverageRating = (productId: string) => {
    const reviews = generateRandomReviews(productId);
    if (reviews.length === 0) return 4.5; // Default to 4.5 if somehow no reviews
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Browse our wide selection of products</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 px-4 border border-gray-300 text-gray-700 focus:outline-none rounded-l-lg"
              />
              <button className="bg-[#F05454] text-white px-6 py-3 rounded-r-lg hover:bg-[#D64545] transition-colors">
                <FaSearch className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaFilter className="mr-2" /> Filters
                </h2>
                <button 
                  onClick={handleClearFilters}
                  className="text-sm text-[#F05454] hover:text-[#D64545] flex items-center"
                >
                  <FaTimes className="mr-1" /> Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {allCategories.map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedCategory === category}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 text-[#F05454] border-gray-300 rounded focus:ring-[#F05454]"
                      />
                      <label 
                        htmlFor={`category-${category}`} 
                        className="ml-2 text-sm text-gray-700"
                      >
                        {category} ({products.filter(p => p.category === category).length})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Brand</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allBrands.map(brand => (
                    <div key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`brand-${brand}`}
                        checked={selectedBrand === brand}
                        onChange={() => handleBrandChange(brand)}
                        className="h-4 w-4 text-[#F05454] border-gray-300 rounded focus:ring-[#F05454]"
                      />
                      <label 
                        htmlFor={`brand-${brand}`} 
                        className="ml-2 text-sm text-gray-700"
                      >
                        {brand} ({products.filter(p => p.brand === brand).length})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="px-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F05454]"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Stock Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-all"
                      name="stock"
                      checked={stockFilter === 'all'}
                      onChange={() => setStockFilter('all')}
                      className="h-4 w-4 text-[#F05454] border-gray-300 focus:ring-[#F05454]"
                    />
                    <label htmlFor="stock-all" className="ml-2 text-sm text-gray-700">All Products</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-in"
                      name="stock"
                      checked={stockFilter === 'in-stock'}
                      onChange={() => setStockFilter('in-stock')}
                      className="h-4 w-4 text-[#F05454] border-gray-300 focus:ring-[#F05454]"
                    />
                    <label htmlFor="stock-in" className="ml-2 text-sm text-gray-700">In Stock</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-low"
                      name="stock"
                      checked={stockFilter === 'low-stock'}
                      onChange={() => setStockFilter('low-stock')}
                      className="h-4 w-4 text-[#F05454] border-gray-300 focus:ring-[#F05454]"
                    />
                    <label htmlFor="stock-low" className="ml-2 text-sm text-gray-700">Low Stock</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-out"
                      name="stock"
                      checked={stockFilter === 'out-of-stock'}
                      onChange={() => setStockFilter('out-of-stock')}
                      className="h-4 w-4 text-[#F05454] border-gray-300 focus:ring-[#F05454]"
                    />
                    <label htmlFor="stock-out" className="ml-2 text-sm text-gray-700">Out of Stock</label>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Sort By</h3>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#F05454]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing <span className="font-medium">{sortedProducts.length}</span> of <span className="font-medium">{products.length}</span> products
              </p>
              <div className="text-sm text-gray-500">
                {selectedCategory || selectedBrand || searchQuery ? (
                  <span>
                    Filtered by: 
                    {selectedCategory && <span className="ml-1">Category: {selectedCategory}</span>}
                    {selectedBrand && <span className="ml-1">Brand: {selectedBrand}</span>}
                    {searchQuery && <span className="ml-1">Search: "{searchQuery}"</span>}
                  </span>
                ) : 'All products'}
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <FaBox className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
                <div className="mt-6">
                  <button 
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-[#F05454] text-white rounded-md hover:bg-[#D64545] transition-colors flex items-center"
                  >
                    <FaTimes className="mr-2" /> Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="relative pb-[100%]"> {/* Square aspect ratio */}
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {(product.allImages && product.allImages.length > 0) ? (
                          <img 
                            src={product.allImages[0] || product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.jpg';
                            }}
                          />
                        ) : product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.jpg';
                            }}
                          />
                        ) : (
                          <span className="text-gray-500">Product Image</span>
                        )}
                      </div>
                      {product.discount && product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {product.discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-[#F05454]">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          product.stock > 5 
                            ? 'bg-green-100 text-green-800' 
                            : product.stock > 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 5 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        {product.discount && product.discount > 0 ? (
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-[#F05454]">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              ${(Number(product.price) * 100 / (100 - product.discount)).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-[#F05454]">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        )}
                        <div className="flex flex-col items-start">
                          <div className="flex items-center">
                            <RatingStars rating={getProductAverageRating(product.id)} />
                            <span className="text-xs text-gray-600 ml-1">{getProductAverageRating(product.id)}</span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{generateRandomReviews(product.id).length} reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}