'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  commissionPercentage?: number;
  createdAt: string;
  updatedAt: string;
  allImages?: string[];
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number | string;
  image: string;
  category: string;
  stock: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [allImages, setAllImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showModal, setShowModal] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cart') || '{}') : {};
    setCart(savedCart);
  }, []);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          // Map backend field names to frontend interface
          const mappedProduct = {
            ...data,
            stock: data.stockQuantity
          };
          setProduct(mappedProduct);
                            
          // Set up images - use allImages if available, otherwise just the main image
          const images = data.allImages && data.allImages.length > 0 
            ? [...data.allImages] 
            : [data.image || '/placeholder-product.jpg'];
                            
          setAllImages(images);
          setSelectedImage(images[0] || '/placeholder-product.jpg');
        } else {
          console.error('Failed to fetch product');
          router.push('/shop'); // Redirect if product not found
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/shop');
      }
    };

    // Fetch related products from the same category
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          // Map backend field names to frontend interface
          const mappedProducts = data.map((p: any) => ({
            ...p,
            stock: p.stockQuantity
          }));
          
          if (product) {
            // Filter products from the same category, excluding the current product
            const sameCategoryProducts = mappedProducts.filter(
              (p: RelatedProduct) => p.category === product.category && p.id !== productId
            ).slice(0, 4); // Limit to 4 related products
            setRelatedProducts(sameCategoryProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    if (productId) {
      fetchProduct();
      fetchRelatedProducts();
    }

    setLoading(false);
  }, [productId, product, router]);

  // Update related products when product is loaded
  useEffect(() => {
    if (product) {
      const fetchRelatedProducts = async () => {
        try {
          const response = await fetch('/api/products');
          if (response.ok) {
            const data = await response.json();
            // Map backend field names to frontend interface
            const mappedProducts = data.map((p: any) => ({
              ...p,
              stock: p.stockQuantity
            }));
            
            // Filter products from the same category, excluding the current product
            const sameCategoryProducts = mappedProducts.filter(
              (p: RelatedProduct) => p.category === product.category && p.id !== productId
            ).slice(0, 4); // Limit to 4 related products
            setRelatedProducts(sameCategoryProducts);
          }
        } catch (error) {
          console.error('Error fetching related products:', error);
        }
      };

      fetchRelatedProducts();
    }
  }, [product, productId]);

  const handleAddToCart = (productId: string) => {
    setCart(prevCart => {
      const currentQuantity = prevCart[productId] || 0;
      const newCart = { ...prevCart, [productId]: currentQuantity + quantity };
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      return newCart;
    });
    alert(`${quantity} ${product?.name || 'item'}(s) added to cart!`);
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
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
  
  // Calculate average rating from generated reviews
  const calculateAverageRating = (productId: string) => {
    const reviews = generateRandomReviews(productId);
    if (reviews.length === 0) return 4.5; // Default to 4.5 if somehow no reviews
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  };

  // Star rating component
  const StarRating = ({ rating, size = 'text-lg' }: { rating: number; size?: string }) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="text-2xl text-white font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 z-10">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="text-2xl text-white font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 z-10">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      
      {/* Navigation Bar */}
      <nav className="bg-gray-800/70 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img 
                  src="https://res.cloudinary.com/dsddldquo/image/upload/v1767897434/fh3gbxyxerehs6qryxqn.png" 
                  alt="Logo" 
                  className="h-10 w-10 mr-2 rounded-full border-2 border-pink-500/50"
                />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">AWM</span>
              </a>
            </div>
            <div className="hidden md:block flex-grow max-w-2xl mx-10">
              <div className="flex">
                <select className="border border-purple-500/50 bg-gray-700 text-white rounded-l-lg px-4 py-2 hidden md:block bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                  <option className="bg-gray-800 text-white">All Categories</option>
                  <option className="bg-gray-800 text-white">Electronics</option>
                  <option className="bg-gray-800 text-white">Fashion</option>
                  <option className="bg-gray-800 text-white">Home</option>
                  <option className="bg-gray-800 text-white">Health</option>
                </select>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full p-2 px-4 border border-purple-500/50 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                />
                <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-r-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-pink-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-6">
                <a href="/" className="text-purple-200 hover:text-pink-400 text-sm font-medium transition-colors duration-300">
                  Home
                </a>
                <a href="/shop" className="text-purple-200 hover:text-pink-400 text-sm font-medium transition-colors duration-300">
                  Shop
                </a>
                <a href="/cart" className="text-purple-200 hover:text-pink-400 text-sm font-medium flex items-center transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 000 4 2 2 0 000-4zm-8 2a2 2 0 01-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart
                </a>
                <a href="/login" className="text-purple-200 hover:text-pink-400 text-sm font-medium transition-colors duration-300">
                  Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Product Detail Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-purple-500/30 glowing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="relative rounded-xl overflow-hidden w-full h-96 flex items-center justify-center mb-4 border-2 border-dashed border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt={product.name} 
                    className="w-full h-full object-contain cursor-pointer transition-transform duration-500 hover:scale-105"
                    onClick={() => setShowModal(true)}
                  />
                ) : (
                  <span className="text-purple-300 text-lg">Product Image</span>
                )}
              </div>
                    
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                {/* Show the main product image as a thumbnail */}
                {allImages.map((imgUrl: string, index: number) => (
                  <div 
                    key={`img-${index}`}
                    className={`rounded-lg overflow-hidden border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      selectedImage === imgUrl ? 'border-pink-500 scale-105 shadow-lg shadow-pink-500/30' : 'border-purple-500/50 hover:border-purple-400'
                    }`}
                    onClick={() => setSelectedImage(imgUrl)}
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-purple-300 text-xs">{index + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
                  
            {/* Product Details */}
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">{product.name}</h1>
              <div className="flex items-center mb-6">
                <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">${Number(product.price).toFixed(2)}</span>
                <span className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-700 to-pink-700 text-white text-sm rounded-full">
                  {product.category}
                </span>
              </div>
                    
              {/* Average Rating Display */}
              <div className="flex items-center mb-6">
                <StarRating rating={calculateAverageRating(product.id)} />
                <span className="ml-2 text-purple-200 text-sm">{calculateAverageRating(product.id).toFixed(1)} out of 5</span>
              </div>
                    
              <div className="mb-8">
                <p className="text-purple-200 mb-6 text-lg leading-relaxed">{product.description}</p>
                      
                <div className="flex items-center mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    product.stock > 5 
                      ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                      : product.stock > 0 
                        ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' 
                        : 'bg-red-900/50 text-red-300 border border-red-500/30'
                  }`}>
                    {product.stock > 5 
                      ? 'In Stock' 
                      : product.stock > 0 
                        ? `Only ${product.stock} left` 
                        : 'Out of Stock'}
                  </span>
                  <span className="ml-4 text-purple-300 text-sm">
                    {product.stock > 0 ? `${product.stock} available` : '0 available'}
                  </span>
                </div>
              </div>
                    
              {/* Quantity Selector */}
              <div className="flex items-center mb-8">
                <span className="text-purple-200 mr-4 text-lg font-medium">Quantity:</span>
                <div className="flex items-center border-2 border-purple-500/50 rounded-lg bg-gray-700/50">
                  <button 
                    onClick={decrementQuantity}
                    className="px-5 py-3 text-purple-200 hover:bg-purple-600/50 transition-colors rounded-l-lg"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-6 py-3 text-white font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={incrementQuantity}
                    className="px-5 py-3 text-purple-200 hover:bg-purple-600/50 transition-colors rounded-r-lg"
                    disabled={quantity >= (product.stock || 10)}
                  >
                    +
                  </button>
                </div>
              </div>
                    
              {/* Add to Cart Button */}
              <div className="flex space-x-4 mb-8">
                <button 
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock <= 0}
                  className={`px-8 py-4 rounded-xl transition-all duration-300 font-bold text-lg ${
                    product.stock <= 0 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transform hover:-translate-y-1'
                  }`}
                >
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
                    
              {/* Product Info */}
              <div className="mt-8 pt-6 border-t border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-purple-200">
                  <div>
                    <span className="text-purple-400 font-medium">Category:</span> <span className="text-white">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-medium">Availability:</span> 
                    <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                      {product.stock > 0 ? ' In Stock' : ' Out of Stock'}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-medium">Added:</span> <span className="text-white">{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-medium">Updated:</span> <span className="text-white">{new Date(product.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 relative z-10">
            <h2 className="text-3xl font-extrabold text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.id} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group glowing"
                  onClick={() => router.push(`/product/${relatedProduct.id}`)}
                >
                  <div className="relative pb-[100%]"> {/* Square aspect ratio */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-dashed border-purple-500/50 rounded-t-lg flex items-center justify-center overflow-hidden">
                      {relatedProduct.image ? (
                        <img src={relatedProduct.image} alt={relatedProduct.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-purple-300">Product Image</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">{relatedProduct.name}</h3>
                        <p className="text-purple-300 text-sm">{relatedProduct.category}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        relatedProduct.stock > 5 
                          ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                          : relatedProduct.stock > 0 
                            ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' 
                            : 'bg-red-900/50 text-red-300 border border-red-500/30'
                      }`}>
                        {relatedProduct.stock > 5 
                          ? 'In Stock' 
                          : relatedProduct.stock > 0 
                            ? 'Low Stock' 
                            : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">${Number(relatedProduct.price).toFixed(2)}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(relatedProduct.id);
                        }}
                        disabled={relatedProduct.stock <= 0}
                        className={`px-4 py-2 text-sm rounded-lg transition-all duration-300 ${
                          relatedProduct.stock <= 0 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 shadow-lg shadow-pink-500/20'
                        }`}
                      >
                        {relatedProduct.stock <= 0 ? 'Out' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Image Enlargement Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <div className="relative max-w-4xl max-h-4xl p-4" onClick={(e) => e.stopPropagation()}>
              <button 
                className="absolute -top-12 right-0 text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center z-10 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <div className="border-2 border-purple-500/50 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}