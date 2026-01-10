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
      <div className="min-h-screen bg-gradient-to-br from-[#0B1220] to-[#111827] flex items-center justify-center">
        <div className="text-2xl text-[#E5E7EB]">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1220] to-[#111827] flex items-center justify-center">
        <div className="text-2xl text-[#E5E7EB]">Product not found</div>
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
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home</option>
                  <option>Health</option>
                </select>
                <input
                  type="text"
                  placeholder="Search products..."
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
                  Cart
                </a>
                <a href="/login" className="text-gray-700 hover:text-[#F05454] text-sm font-medium">
                  Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Product Detail Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="bg-gray-100 rounded-lg w-full h-96 flex items-center justify-center mb-4 relative">
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt={product.name} 
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setShowModal(true)}
                  />
                ) : (
                  <span className="text-gray-500">Product Image</span>
                )}
              </div>
                      
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-4">
                {/* Show the main product image as a thumbnail */}
                {allImages.map((imgUrl: string, index: number) => (
                  <div 
                    key={`img-${index}`}
                    className={`bg-gray-100 rounded border w-full h-24 flex items-center justify-center cursor-pointer ${
                      selectedImage === imgUrl ? 'border-[#F05454]' : 'border-gray-300'
                    }`}
                    onClick={() => setSelectedImage(imgUrl)}
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-contain rounded" />
                    ) : (
                      <span className="text-gray-500">{index + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
                    
            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-[#F05454]">${Number(product.price).toFixed(2)}</span>
                <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                  {product.category}
                </span>
              </div>
                            
              {/* Average Rating Display */}
              <div className="flex items-center mb-4">
                <StarRating rating={calculateAverageRating(product.id)} />
                <span className="ml-2 text-gray-600 text-sm">{calculateAverageRating(product.id).toFixed(1)} out of 5</span>
              </div>
                            
              <div className="mb-6">
                <p className="text-gray-600 mb-4">{product.description}</p>
                        
                <div className="flex items-center mb-4">
                  <span className={`px-3 py-1 rounded text-sm ${
                    product.stock > 5 
                      ? 'bg-green-100 text-green-800' 
                      : product.stock > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 5 
                      ? 'In Stock' 
                      : product.stock > 0 
                        ? `Only ${product.stock} left` 
                        : 'Out of Stock'}
                  </span>
                  <span className="ml-4 text-gray-600 text-sm">
                    {product.stock > 0 ? `${product.stock} available` : '0 available'}
                  </span>
                </div>
              </div>
                      
              {/* Quantity Selector */}
              <div className="flex items-center mb-6">
                <span className="text-gray-700 mr-4">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={decrementQuantity}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-gray-700">{quantity}</span>
                  <button 
                    onClick={incrementQuantity}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= (product.stock || 10)}
                  >
                    +
                  </button>
                </div>
              </div>
                            
              {/* Add to Cart Button */}
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock <= 0}
                  className={`px-8 py-3 rounded-md transition-colors ${
                    product.stock <= 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#F05454] text-white hover:bg-[#D64545]'
                  }`}
                >
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
                            
              {/* Product Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <span className="text-gray-500">Category:</span> <span>{product.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Availability:</span> 
                    <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock > 0 ? ' In Stock' : ' Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/product/${relatedProduct.id}`)}
                >
                  <div className="relative pb-[100%]"> {/* Square aspect ratio */}
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {relatedProduct.image ? (
                        <img src={relatedProduct.image} alt={relatedProduct.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-gray-500">Product Image</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-[#F05454]">{relatedProduct.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{relatedProduct.category}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        relatedProduct.stock > 5 
                          ? 'bg-green-100 text-green-800' 
                          : relatedProduct.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {relatedProduct.stock > 5 
                          ? 'In Stock' 
                          : relatedProduct.stock > 0 
                            ? 'Low Stock' 
                            : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-[#F05454]">${Number(relatedProduct.price).toFixed(2)}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(relatedProduct.id);
                        }}
                        disabled={relatedProduct.stock <= 0}
                        className={`px-3 py-1.5 text-sm rounded transition-colors ${
                          relatedProduct.stock <= 0 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#F05454] text-white hover:bg-[#D64545]'
                        }`}
                      >
                        {relatedProduct.stock <= 0 ? 'Out of Stock' : 'Add'}
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
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <div className="relative max-w-4xl max-h-4xl p-4" onClick={(e) => e.stopPropagation()}>
              <button 
                className="absolute top-4 right-4 text-white bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center z-10"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}