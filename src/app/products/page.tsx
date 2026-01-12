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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 py-8 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 mb-4">Loading Products</h1>
            <p className="text-purple-200 text-lg">We're getting everything ready for you...</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 border border-purple-500/30 glowing">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded w-5/6"></div>
                  <div className="h-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded w-4/6"></div>
                </div>
              </div>
            </div>
            <div className="md:w-3/4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-purple-500/30 glowing animate-pulse">
                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 h-48 w-full flex items-center justify-center">
                      <div className="h-32 w-32 bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-lg"></div>
                    </div>
                    <div className="p-4">
                      <div className="h-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded w-1/2 mb-3"></div>
                      <div className="h-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded w-1/3"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 mb-4">Our Products</h1>
          <p className="text-purple-200 text-xl mt-2">Discover our amazing collection of products</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 px-4 border-2 border-purple-500/50 bg-gray-700 text-white focus:outline-none rounded-l-lg bg-gradient-to-r from-purple-900/30 to-pink-900/30 focus:ring-2 focus:ring-pink-500/50"
              />
              <button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-r-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-pink-500/30">
                <FaSearch className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="md:w-1/4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 sticky top-24 border border-purple-500/30 glowing">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FaFilter className="mr-2 text-pink-400" /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">Filters</span>
                </h2>
                <button 
                  onClick={handleClearFilters}
                  className="text-sm text-pink-400 hover:text-pink-300 flex items-center transition-colors duration-300"
                >
                  <FaTimes className="mr-1" /> Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-md font-bold text-purple-200 mb-3">Category</h3>
                <div className="space-y-2">
                  {allCategories.map(category => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedCategory === category}
                        onChange={() => handleCategoryChange(category)}
                        className="h-4 w-4 text-pink-500 border-purple-500/50 bg-gray-700 rounded focus:ring-pink-500/50 focus:ring-2"
                      />
                      <label 
                        htmlFor={`category-${category}`} 
                        className="ml-2 text-sm text-purple-200"
                      >
                        {category} ({products.filter(p => p.category === category).length})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h3 className="text-md font-bold text-purple-200 mb-3">Brand</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-700/30 rounded-lg p-2">
                  {allBrands.map(brand => (
                    <div key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`brand-${brand}`}
                        checked={selectedBrand === brand}
                        onChange={() => handleBrandChange(brand)}
                        className="h-4 w-4 text-pink-500 border-purple-500/50 bg-gray-700 rounded focus:ring-pink-500/50 focus:ring-2"
                      />
                      <label 
                        htmlFor={`brand-${brand}`} 
                        className="ml-2 text-sm text-purple-200"
                      >
                        {brand} ({products.filter(p => p.brand === brand).length})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-md font-bold text-purple-200 mb-3">Price Range</h3>
                <div className="px-1">
                  <div className="flex justify-between text-sm text-purple-300 mb-2">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <h3 className="text-md font-bold text-purple-200 mb-3">Stock Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-all"
                      name="stock"
                      checked={stockFilter === 'all'}
                      onChange={() => setStockFilter('all')}
                      className="h-4 w-4 text-pink-500 border-purple-500/50 bg-gray-700 focus:ring-pink-500/50 focus:ring-2"
                    />
                    <label htmlFor="stock-all" className="ml-2 text-sm text-purple-200">All Products</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-in"
                      name="stock"
                      checked={stockFilter === 'in-stock'}
                      onChange={() => setStockFilter('in-stock')}
                      className="h-4 w-4 text-pink-500 border-purple-500/50 bg-gray-700 focus:ring-pink-500/50 focus:ring-2"
                    />
                    <label htmlFor="stock-in" className="ml-2 text-sm text-purple-200">In Stock</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-low"
                      name="stock"
                      checked={stockFilter === 'low-stock'}
                      onChange={() => setStockFilter('low-stock')}
                      className="h-4 w-4 text-pink-500 border-purple-500/50 bg-gray-700 focus:ring-pink-500/50 focus:ring-2"
                    />
                    <label htmlFor="stock-low" className="ml-2 text-sm text-purple-200">Low Stock</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stock-out"
                      name="stock"
                      checked={stockFilter === 'out-of-stock'}
                      onChange={() => setStockFilter('out-of-stock')}
                      className="h-4 w-4 text-pink-500 border-purple-500/50 bg-gray-700 focus:ring-pink-500/50 focus:ring-2"
                    />
                    <label htmlFor="stock-out" className="ml-2 text-sm text-purple-200">Out of Stock</label>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-md font-bold text-purple-200 mb-3">Sort By</h3>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full p-3 border-2 border-purple-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/50 bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                >
                  <option value="relevance" className="bg-gray-800 text-white">Relevance</option>
                  <option value="price-low" className="bg-gray-800 text-white">Price: Low to High</option>
                  <option value="price-high" className="bg-gray-800 text-white">Price: High to Low</option>
                  <option value="rating" className="bg-gray-800 text-white">Top Rated</option>
                  <option value="name" className="bg-gray-800 text-white">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="md:w-3/4">
            <div className="flex justify-between items-center mb-8">
              <p className="text-purple-200 text-lg">
                Showing <span className="font-bold text-white">{sortedProducts.length}</span> of <span className="font-bold text-white">{products.length}</span> products
              </p>
              <div className="text-sm text-purple-300">
                {selectedCategory || selectedBrand || searchQuery ? (
                  <span>
                    Filtered by: 
                    {selectedCategory && <span className="ml-1">Category: {selectedCategory}</span>}
                    {selectedBrand && <span className="ml-1">Brand: {selectedBrand}</span>}
                    {searchQuery && <span className="ml-1">Search: "{searchQuery}"</span>}
                  </span>
                ) : <span className="text-white font-medium">All products</span>}
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-purple-500/30 mb-6">
                  <FaBox className="mx-auto h-16 w-16 text-purple-400" />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-white">No products found</h3>
                <p className="mt-2 text-purple-300 text-lg">Try adjusting your search or filter criteria</p>
                <div className="mt-8">
                  <button 
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-pink-500/30 flex items-center mx-auto"
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
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group glowing"
                  >
                    <div className="relative pb-[100%]"> {/* Square aspect ratio */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-dashed border-purple-500/50 rounded-t-lg flex items-center justify-center overflow-hidden">
                        {(product.allImages && product.allImages.length > 0) ? (
                          <img 
                            src={product.allImages[0] || product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.jpg';
                            }}
                          />
                        ) : product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.jpg';
                            }}
                          />
                        ) : (
                          <span className="text-purple-300">Product Image</span>
                        )}
                      </div>
                      {product.discount && product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg shadow-pink-500/30">
                          {product.discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-pink-300 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-purple-300 text-sm">{product.category}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          product.stock > 5 
                            ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                            : product.stock > 0 
                              ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' 
                              : 'bg-red-900/50 text-red-300 border border-red-500/30'
                        }`}>
                          {product.stock > 5 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <p className="mt-3 text-purple-200 text-sm line-clamp-2">{product.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        {product.discount && product.discount > 0 ? (
                          <div className="flex items-center">
                            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            <span className="ml-2 text-sm text-purple-400 line-through">
                              ${(Number(product.price) * 100 / (100 - product.discount)).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        )}
                        <div className="flex flex-col items-start">
                          <div className="flex items-center">
                            <RatingStars rating={getProductAverageRating(product.id)} />
                            <span className="text-xs text-purple-300 ml-1">{getProductAverageRating(product.id)}</span>
                          </div>
                          <span className="text-xs text-purple-400 mt-1">{generateRandomReviews(product.id).length} reviews</span>
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