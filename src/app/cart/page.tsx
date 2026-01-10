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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#F05454]">Your Cart</h1>
          <button 
            onClick={continueShopping}
            className="px-4 py-2 bg-[#F05454] text-white rounded-md hover:bg-[#D64545] transition-all duration-200"
          >
            Continue Shopping
          </button>
        </div>

        {getTotalItems() === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-[#9CA3AF] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-[#E5E7EB] mb-2">Your cart is empty</h2>
            <p className="text-[#9CA3AF] mb-6">Looks like you haven't added anything to your cart yet</p>
            <button 
              onClick={continueShopping}
              className="px-6 py-3 bg-[#F05454] text-white rounded-md hover:bg-[#D64545] transition-all duration-200"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {products.map((product) => {
                    const quantity = cart[product.id] || 0;
                    if (quantity === 0) return null; // Skip products not in cart
                    
                    return (
                      <div key={product.id} className="p-6 flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center text-gray-500">
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
                              <h3 className="text-lg font-semibold text-[#F05454]">{product.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                              <p className="mt-2 text-[#F05454] font-bold">${Number(product.price).toFixed(2)}</p>
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveFromCart(product.id)}
                              className="text-red-500 hover:text-red-400 ml-4"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="mt-4 flex items-center">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button 
                                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                                className="px-3 py-1 text-[#F05454] hover:bg-gray-100"
                                disabled={quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-gray-700">{quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(product.id, quantity + 1)}
                                className="px-3 py-1 text-[#F05454] hover:bg-gray-100"
                                disabled={quantity >= product.stock}
                              >
                                +
                              </button>
                            </div>
                            <span className="ml-4 text-gray-500">
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
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold text-[#F05454] mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${Number(getTotalPrice()).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">$0.00</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${(Number(getTotalPrice()) * 0.08).toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold text-[#F05454]">
                      <span>Total</span>
                      <span>${(Number(getTotalPrice()) * 1.08).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full mt-6 py-3 bg-[#F05454] text-white rounded-md hover:bg-[#D64545] transition-all duration-200"
                >
                  Proceed to Checkout
                </button>
                
                <button 
                  onClick={continueShopping}
                  className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-200"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => window.location.href = `/product/${product.id}`}
                >
                  <div className="relative pb-[100%]"> {/* Square aspect ratio */}
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-gray-500">Product Image</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
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
                    <div className="mt-4 flex items-center">
                      <span className="text-lg font-bold text-[#F05454]">${Number(product.price).toFixed(2)}</span>
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