'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  image: string;
  category: string;
  stock: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralAgent, setReferralAgent] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check for referral agent in localStorage
    const referralDataStr = localStorage.getItem('referralAgentId');
    if (referralDataStr) {
      try {
        const referralData = JSON.parse(referralDataStr);
        // Only use referral agent if the timestamp is within the last 24 hours (86400000 ms)
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (referralData.timestamp && referralData.timestamp > twentyFourHoursAgo) {
          setReferralAgent(referralData.agentId);
        } else {
          // Clear expired referral data
          localStorage.removeItem('referralAgentId');
        }
      } catch (e) {
        console.error('Error parsing referral data:', e);
        // If there's an error parsing, remove the invalid data
        localStorage.removeItem('referralAgentId');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Load cart from localStorage or session storage
    const savedCart = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cart') || '{}') : {};
    setCart(savedCart);

    // Fetch products that are in the cart
    if (Object.keys(savedCart).length > 0) {
      fetchCartProducts(Object.keys(savedCart));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCartProducts = async (productIds: string[]) => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const allProducts: Product[] = await response.json();
        // Filter to only products that are in the cart
        const cartProducts = allProducts.filter(product => productIds.includes(product.id));
        setProducts(cartProducts);
        
        // Get categories of products in cart to fetch related products
        if (cartProducts.length > 0) {
          const cartCategoriesSet = new Set(cartProducts.map(p => p.category));
          const cartCategories = Array.from(cartCategoriesSet);
          const relatedProds = allProducts.filter(product => 
            !productIds.includes(product.id) && 
            cartCategories.includes(product.category)
          ).slice(0, 8); // Limit to 8 related products
          setRelatedProducts(relatedProds);
        }
      }
    } catch (error) {
      console.error('Error fetching cart products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartInStorage = (updatedCart: {[key: string]: number}) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      delete newCart[productId];
      updateCartInStorage(newCart);
      // Also update products list
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      return newCart;
    });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock) return; // Don't allow more than stock
    
    setCart(prevCart => {
      const newCart = { ...prevCart, [productId]: newQuantity };
      updateCartInStorage(newCart);
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

  const handleCheckout = () => {
    // Redirect to checkout page
    router.push('/checkout');
  };

  const continueShopping = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1220] to-[#111827] flex items-center justify-center">
        <div className="text-2xl text-[#E5E7EB]">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Navigation Bar */}
      <nav className="bg-black/30 backdrop-blur-lg sticky top-0 z-50 border-b border-purple-500/30 relative z-10">
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
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">AWM Store</span>
            </div>
            <div className="hidden md:block flex-grow max-w-2xl mx-10">
              <div className="flex">
                <select className="border border-purple-500/50 bg-gray-800 text-white rounded-l-lg px-4 py-2 hidden md:block">
                  <option className="text-gray-800">All Categories</option>
                  <option className="text-gray-800">Electronics</option>
                  <option className="text-gray-800">Fashion</option>
                  <option className="text-gray-800">Home</option>
                  <option className="text-gray-800">Health</option>
                </select>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full p-2 px-4 border border-purple-500/50 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                />
                <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-r-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-6">
                <a href="/" className="text-purple-200 hover:text-pink-400 text-sm font-medium transition-all duration-300 transform hover:scale-105">
                  Home
                </a>
                <a href="/shop" className="text-purple-200 hover:text-pink-400 text-sm font-medium transition-all duration-300 transform hover:scale-105">
                  Shop
                </a>
                <a href="/cart" className="text-pink-400 font-medium text-sm border-b-2 border-pink-400 pb-1 transition-all duration-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 000 4 2 2 0 000-4zm-8 2a2 2 0 01-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart
                </a>
                <a href="/login" className="text-purple-200 hover:text-pink-400 text-sm font-medium transition-all duration-300 transform hover:scale-105">
                  Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">Your Cart</h1>
          <button 
            onClick={continueShopping}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Continue Shopping
          </button>
        </div>

        {getTotalItems() === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-purple-200 mb-2">Your cart is empty</h2>
            <p className="text-purple-400 mb-6">Looks like you haven't added anything to your cart yet</p>
            <button 
              onClick={continueShopping}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-purple-500/30 overflow-hidden">
                <div className="divide-y divide-purple-500/30">
                  {products.map((product) => {
                    const quantity = cart[product.id] || 0;
                    if (quantity === 0) return null; // Skip products not in cart
                    
                    return (
                      <div key={product.id} className="p-6 flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-dashed border-purple-500/50 rounded-xl w-24 h-24 flex items-center justify-center text-purple-300">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              <span>Image</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-pink-400">{product.name}</h3>
                              <p className="text-sm text-purple-300 mt-1">{product.category}</p>
                              <p className="mt-2 text-pink-400 font-bold">${Number(product.price).toFixed(2)}</p>
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveFromCart(product.id)}
                              className="text-red-400 hover:text-red-300 ml-4"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="mt-4 flex items-center">
                            <div className="flex items-center border border-purple-500/50 rounded-lg bg-gray-700">
                              <button 
                                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                                className="px-3 py-1 text-pink-400 hover:bg-gray-600 rounded-l-lg"
                                disabled={quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-white">{quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(product.id, quantity + 1)}
                                className="px-3 py-1 text-pink-400 hover:bg-gray-600 rounded-r-lg"
                                disabled={quantity >= product.stock}
                              >
                                +
                              </button>
                            </div>
                            <span className="ml-4 text-purple-300">
                              {product.stock > quantity ? 'In Stock' : 'Low Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-purple-500/30 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-pink-400 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-purple-300">Subtotal</span>
                    <span className="text-white">${Number(getTotalPrice()).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-purple-300">Shipping</span>
                    <span className="text-white">$0.00</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-purple-300">Tax</span>
                    <span className="text-white">${(Number(getTotalPrice()) * 0.08).toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-purple-500/30 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold text-pink-400">
                      <span>Total</span>
                      <span>${(Number(getTotalPrice()) * 1.08).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Proceed to Checkout
                </button>
                
                <button 
                  onClick={continueShopping}
                  className="w-full mt-3 py-3 border border-purple-500/50 text-purple-200 rounded-lg hover:bg-purple-900/50 transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-purple-500/30 glowing group"
                  onClick={() => window.location.href = `/product/${product.id}`}
                >
                  <div className="relative pb-[100%]"> {/* Square aspect ratio */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-purple-300">Product Image</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-pink-400 transition-colors duration-300">{product.name}</h3>
                        <p className="text-xs text-purple-300 mt-1">{product.category}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        product.stock > 5 
                          ? 'bg-green-900/50 text-green-400' 
                          : product.stock > 0 
                            ? 'bg-yellow-900/50 text-yellow-400' 
                            : 'bg-red-900/50 text-red-400'
                      }`}>
                        {product.stock > 5 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-purple-200 line-clamp-2">{product.description}</p>
                    <div className="mt-4 flex items-center">
                      <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">${Number(product.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}