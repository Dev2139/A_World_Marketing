'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  image: string;
  category: string;
  stock: number;
  stockQuantity?: number;
}

export default function ShoppingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [referralAgent, setReferralAgent] = useState<string | null>(null);
  const predefinedCategories = [
    'All',
    'Electronics',
    'Home & Kitchen',
    'Furniture',
    'Clothing',
    'Beauty',
    'Sports',
    'Books',
    'Toys',
    'Automotive',
    'Health',
    'Jewelry',
    'Office Supplies',
    'Pet Supplies'
  ];
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cart') || '{}') : {};
    setCart(savedCart);
    
    // Check for referral agent
    const referralAgentId = localStorage.getItem('referralAgentId');
    if (referralAgentId) {
      fetchReferralAgentInfo(referralAgentId);
    }

    // Fetch products
    fetchProducts();

    // Set loading to false after initial fetch
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Using predefined categories, so no need to extract from products

  const fetchReferralAgentInfo = async (agentId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/${agentId}`);
      if (response.ok) {
        const agentData = await response.json();
        setReferralAgent(agentData.email || `Agent ${agentId.substring(0, 8)}`);
      }
    } catch (error) {
      console.error('Error fetching referral agent info:', error);
      // Fallback to showing just the agent ID
      setReferralAgent(`Agent ${agentId.substring(0, 8)}`);
    }
  };

  const fetchProducts = async () => {
    try {
      // Fetch products from the API
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        // Map backend field names to frontend interface
        const mappedProducts = data.map((product: any) => ({
          ...product,
          stock: product.stock !== undefined ? product.stock : product.stockQuantity
        }));
        setProducts(mappedProducts);
      } else {
        console.error('Failed to fetch products');
        // Fallback to mock data if API fails
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Premium Headphones',
            description: 'High-quality wireless headphones with noise cancellation',
            price: 199.99,
            image: '/placeholder-product.jpg',
            category: 'Electronics',
            stock: 10
          },
          {
            id: '2',
            name: 'Smart Watch',
            description: 'Feature-rich smartwatch with health monitoring',
            price: 249.99,
            image: '/placeholder-product.jpg',
            category: 'Electronics',
            stock: 5
          },
          {
            id: '3',
            name: 'Wireless Earbuds',
            description: 'Compact earbuds with excellent sound quality',
            price: 129.99,
            image: '/placeholder-product.jpg',
            category: 'Electronics',
            stock: 15
          },
          {
            id: '4',
            name: 'Bluetooth Speaker',
            description: 'Portable speaker with rich bass and clear sound',
            price: 89.99,
            image: '/placeholder-product.jpg',
            category: 'Electronics',
            stock: 8
          },
          {
            id: '5',
            name: 'Gaming Mouse',
            description: 'High-precision gaming mouse with customizable RGB lighting',
            price: 79.99,
            image: '/placeholder-product.jpg',
            category: 'Electronics',
            stock: 12
          },
          {
            id: '6',
            name: 'Designer Backpack',
            description: 'Water-resistant backpack with laptop compartment',
            price: 89.99,
            image: '/placeholder-product.jpg',
            category: 'Fashion',
            stock: 20
          },
          {
            id: '7',
            name: 'Fitness Tracker',
            description: 'Advanced fitness tracker with heart rate monitor',
            price: 59.99,
            image: '/placeholder-product.jpg',
            category: 'Health',
            stock: 18
          },
          {
            id: '8',
            name: 'Desk Lamp',
            description: 'Adjustable LED desk lamp with multiple brightness settings',
            price: 49.99,
            image: '/placeholder-product.jpg',
            category: 'Home',
            stock: 25
          }
        ];
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data if there's an error
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Premium Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 199.99,
          image: '/placeholder-product.jpg',
          category: 'Electronics',
          stock: 10
        },
        {
          id: '2',
          name: 'Smart Watch',
          description: 'Feature-rich smartwatch with health monitoring',
          price: 249.99,
          image: '/placeholder-product.jpg',
          category: 'Electronics',
          stock: 5
        },
        {
          id: '3',
          name: 'Wireless Earbuds',
          description: 'Compact earbuds with excellent sound quality',
          price: 129.99,
          image: '/placeholder-product.jpg',
          category: 'Electronics',
          stock: 15
        },
        {
          id: '4',
          name: 'Bluetooth Speaker',
          description: 'Portable speaker with rich bass and clear sound',
          price: 89.99,
          image: '/placeholder-product.jpg',
          category: 'Electronics',
          stock: 8
        },
        {
          id: '5',
          name: 'Gaming Mouse',
          description: 'High-precision gaming mouse with customizable RGB lighting',
          price: 79.99,
          image: '/placeholder-product.jpg',
          category: 'Electronics',
          stock: 12
        },
        {
          id: '6',
          name: 'Designer Backpack',
          description: 'Water-resistant backpack with laptop compartment',
          price: 89.99,
          image: '/placeholder-product.jpg',
          category: 'Fashion',
          stock: 20
        },
        {
          id: '7',
          name: 'Fitness Tracker',
          description: 'Advanced fitness tracker with heart rate monitor',
          price: 59.99,
          image: '/placeholder-product.jpg',
          category: 'Health',
          stock: 18
        },
        {
          id: '8',
          name: 'Desk Lamp',
          description: 'Adjustable LED desk lamp with multiple brightness settings',
          price: 49.99,
          image: '/placeholder-product.jpg',
          category: 'Home',
          stock: 25
        }
      ];
      setProducts(mockProducts);
    }
  };

  const handleAddToCart = (productId: string) => {
    setCart(prevCart => {
      const currentQuantity = prevCart[productId] || 0;
      const newCart = { ...prevCart, [productId]: currentQuantity + 1 };
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      return newCart;
    });
    alert('Product added to cart!');
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
  
  // Star rating component
  const StarRating = ({ rating, size = 'text-sm' }: { rating: number; size?: string }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className={`${size} text-yellow-400`} />
        ))}
        {hasHalfStar && (
          <FaStarHalfAlt key="half" className={`${size} text-yellow-400`} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className={`${size} text-gray-300`} />
        ))}
      </div>
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[productId] > 1) {
        newCart[productId] = newCart[productId] - 1;
      } else {
        delete newCart[productId];
      }
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? Number(product.price) * quantity : 0);
    }, 0);
  };

  // Filter products based on selected category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1220] to-[#111827] flex items-center justify-center">
        <div className="text-2xl text-[#E5E7EB]">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/">
                <img 
                  src="https://res.cloudinary.com/dsddldquo/image/upload/v1767897434/fh3gbxyxerehs6qryxqn.png" 
                  alt="Logo" 
                  className="h-10 w-10 mr-2"
                />
              </a>
            </div>
            <div className="hidden md:block flex-grow max-w-2xl mx-10">
              <div className="flex">
                <select className="border border-gray-300 bg-gray-100 text-gray-700 rounded-l-lg px-4 py-2 hidden md:block">
                  <option>All Categories</option>
                  {predefinedCategories.slice(1).map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 px-4 border border-gray-300 text-gray-700 focus:outline-none"
                />
                <button className="bg-[#F05454] text-white px-6 py-2 rounded-r-lg hover:bg-[#D64545] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-6">
                <a href="/" className="text-gray-700 hover:text-[#F05454] text-sm font-medium">
                  Home
                </a>
                <a href="/shop" className="text-gray-700 hover:text-[#F05454] text-sm font-medium">
                  Shop
                </a>
                <a href="/cart" className="text-gray-700 hover:text-[#F05454] text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 000 4 2 2 0 000-4zm-8 2a2 2 0 01-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart ({getTotalItems()})
                </a>
                <a href="/login" className="text-gray-700 hover:text-[#F05454] text-sm font-medium">
                  Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Referral Banner */}
      {referralAgent && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="max-w-7xl mx-auto flex items-center">
            <div className="mr-3 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                You're shopping through <span className="font-semibold text-[#F05454]">{referralAgent}</span>'s referral link
              </p>
              <p className="text-xs text-gray-600">Any purchase will credit to their account</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Discover Amazing Products
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Find everything you need at unbeatable prices. Quality products with exceptional service.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#products" 
                  className="px-6 py-3 bg-[#F05454] text-white rounded-lg hover:bg-[#D64545] transition-colors font-medium"
                >
                  Shop Now
                </a>
                <a 
                  href="#categories" 
                  className="px-6 py-3 bg-white text-[#F05454] border border-[#F05454] rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  View Categories
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 md:h-80 flex items-center justify-center text-gray-500">
                Banner Image
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Products Section */}
      <div className="py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Sidebar - Filters */}
          <div className="lg:w-1/4 bg-gray-50 p-4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              
              {/* Categories Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {predefinedCategories.slice(1).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#F05454] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <button className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Under $50</button>
                  <button className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">$50 - $100</button>
                  <button className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">$100 - $200</button>
                  <button className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Over $200</button>
                </div>
              </div>
              
              {/* Stock Status Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Stock Status</h3>
                <div className="space-y-2">
                  <button className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">In Stock</button>
                  <button className="block w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">Low Stock</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content - Products */}
          <div className="lg:w-3/4">
            <section id="products" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-[#F05454] to-[#D4AF37] bg-clip-text text-transparent">
                    Our Products
                  </span>
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#F05454] to-transparent mx-auto mb-6"></div>
                <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
                  {referralAgent 
                    ? `Shopping through ${referralAgent}'s referral link` 
                    : 'Browse our premium collection'}
                </p>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="text-[#E5E7EB]">
                  Showing {filteredProducts.length} of {products.length} products
                  {selectedCategory !== 'All' && <span> in <span className="text-[#F05454]">{selectedCategory}</span></span>}
                  {searchQuery && <span> matching '<span className="text-[#F05454]">{searchQuery}</span>'</span>}
                </div>
                <div className="text-sm text-gray-600">
                  Sort by: <select className="border border-gray-300 rounded-md px-2 py-1 ml-2">
                    <option>Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Customer Rating</option>
                  </select>
                </div>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#F05454]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No products found</h3>
                  <p className="text-gray-600 text-lg mb-6">Try changing your search or filter criteria</p>
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-8 py-3 bg-[#F05454] text-white rounded-lg hover:bg-[#D64545] transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => window.location.href = `/product/${product.id}`}
                    >
                      <div className="relative pb-[100%]"> {/* Square aspect ratio */}
                        <div className="absolute inset-0 bg-gray-200 border-2 border-dashed rounded-t-lg flex items-center justify-center overflow-hidden">
                          {product.image ? (
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
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-[#F05454]">{product.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{product.category}</p>
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
                        <div className="mt-2 flex flex-col items-start">
                          <div className="flex items-center">
                            <StarRating rating={getProductAverageRating(product.id)} size="text-xs" />
                            <span className="ml-1 text-xs text-gray-600">{getProductAverageRating(product.id)}</span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{generateRandomReviews(product.id).length} reviews</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xl font-bold text-[#F05454]">${Number(product.price).toFixed(2)}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent click from propagating to parent div
                              handleAddToCart(product.id)
                            }}
                            disabled={product.stock <= 0}
                            className={`px-3 py-1.5 text-sm rounded transition-colors ${
                              product.stock <= 0 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-[#F05454] text-white hover:bg-[#D64545]'
                            }`}
                          >
                            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="https://res.cloudinary.com/dsddldquo/image/upload/v1767897434/fh3gbxyxerehs6qryxqn.png" 
                  alt="Logo" 
                  className="h-8 w-8 mr-2"
                />
                <span className="text-xl font-bold">A World Marketing</span>
              </div>
              <p className="text-gray-400 text-sm">Premium products at unbeatable prices. Quality guaranteed with fast delivery.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="/shop" className="text-gray-400 hover:text-white transition-colors">Shop</a></li>
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</a></li>
                <li><a href="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@aworldmarketing.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Business St, City</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 A World Marketing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}