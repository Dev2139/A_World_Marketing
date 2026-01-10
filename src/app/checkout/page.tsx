'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  image: string;
  category: string;
  stock: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card'); // Card or UPI

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [referralAgent, setReferralAgent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cart') || '{}') : {};
    setCart(savedCart);



    // Check for referral agent
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

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? Number(product.price) * quantity : 0);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const orderItems = products.map(product => ({
        productId: product.id,
        quantity: cart[product.id],
        price: Number(product.price)
      }));

      const subtotal = getTotalPrice(); // Original price without tax
      const tax = subtotal * 0.08; // Calculate tax amount
      const totalAmount = subtotal + tax; // Total with tax
      
      // Prepare payment method data for the order
      let paymentMethodDetails = {};
      if (paymentMethod === 'card') {
        paymentMethodDetails = {
          cardNumber: cardNumber,
          expiryDate: cardExpiry,
          cvc: cardCvc,
          postalCode: '12345' // In a real app, you'd collect this
        };
      } else if (paymentMethod === 'upi') {
        paymentMethodDetails = {
          upiId: 'user@example.upi' // Placeholder - in a real app, you'd collect the actual UPI ID
        };
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Create the order in our system
      const orderResponse = await fetch('http://localhost:5002/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderItems,
          referralAgentId: referralAgent,
          totalAmount: totalAmount, // Send total with tax
          subtotal: subtotal,
          tax: tax,
          shipping: 0,
          customerInfo: {
            firstName,
            lastName,
            phone: mobileNumber,
            shippingAddress: shippingAddress || null,
            billingAddress: billingAddress || shippingAddress || null
          },
          paymentMethod: paymentMethod, // 'card' or 'upi'
          paymentDetails: {
            ...paymentMethodDetails,
            status: 'succeeded'
          }
        })
      });

      const orderResult = await orderResponse.json();

      if (orderResponse.ok) {
        // Clear the cart after successful order
        localStorage.removeItem('cart');
        
        // Clear the referral agent ID after successful order to prevent reuse
        localStorage.removeItem('referralAgentId');
        
        // Show success message
        setOrderSuccess(true);
        
        // Redirect after delay, passing the order ID
        setTimeout(() => {
          router.push(`/order-success?orderId=${orderResult.orderId}`);
        }, 2000);
      } else {
        alert(orderResult.message || 'Failed to place order');
      }

      
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing the order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-[#F05454] mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-900 text-lg mb-6">Thank you for your purchase. Your order is being processed.</p>
            <p className="text-gray-600">Redirecting to order confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-900">Loading checkout...</div>
      </div>
    );
  }

  if (getTotalItems() === 0) {
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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some items to your cart before checking out</p>
            <button 
              onClick={() => router.push('/shop')}
              className="px-6 py-3 bg-[#F05454] text-white rounded-md hover:bg-[#D64545] transition-all duration-200"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Shipping Address
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#F05454] mb-6">Shipping Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
                  placeholder="Enter your mobile number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
                  rows={3}
                  placeholder="Enter your shipping address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address (optional)</label>
                <textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
                  rows={3}
                  placeholder="Same as shipping if left empty"
                />
              </div>
              
              {referralAgent && (
                <div className="p-3 bg-gray-50 border border-gray-300 rounded-md">
                  <p className="text-sm text-gray-700">Referral Agent: <span className="text-[#F05454]">{referralAgent}</span></p>
                  <p className="text-xs text-gray-600 mt-1">Commission will be credited to their account</p>
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={nextStep}
                  disabled={!firstName || !lastName || !mobileNumber || !shippingAddress}
                  className={`py-3 px-6 rounded-md transition-all duration-200 ${
                    !firstName || !lastName || !mobileNumber || !shippingAddress
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#F05454] text-white hover:bg-[#D64545]'
                  }`}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        );
      case 2: // Payment Details
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#F05454] mb-6">Payment Method</h2>
            
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  className={`pb-2 px-4 font-medium ${paymentMethod === 'card' ? 'text-[#F05454] border-b-2 border-[#F05454]' : 'text-gray-500'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  Credit/Debit Card
                </button>
                <button
                  className={`pb-2 px-4 font-medium ${paymentMethod === 'upi' ? 'text-[#F05454] border-b-2 border-[#F05454]' : 'text-gray-500'}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  UPI
                </button>
              </div>
            </div>
            
            {paymentMethod === 'card' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g., yourname@upi)"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F05454]"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-6">
              <button
                onClick={prevStep}
                className="py-3 px-6 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-200"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="py-3 px-6 bg-[#F05454] text-white rounded-md hover:bg-[#D64545] transition-all duration-200"
              >
                Review Order
              </button>
            </div>
          </div>
        );
      case 3: // Review Order
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#F05454] mb-6">Review Your Order</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Shipping Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">{firstName} {lastName}</p>
                <p className="text-gray-700">{mobileNumber}</p>
                <p className="text-gray-700">{shippingAddress}</p>
                {billingAddress && <p className="text-gray-700">Billing: {billingAddress}</p>}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">{paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI'}</p>
                {paymentMethod === 'card' && (
                  <p className="text-gray-700">Card ending in ****{cardNumber.slice(-4)}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                onClick={prevStep}
                className="py-3 px-6 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-200"
              >
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className={`py-3 px-6 rounded-md transition-all duration-200 ${
                  isProcessing 
                    ? 'bg-gray-400 text-gray-700' 
                    : 'bg-[#F05454] text-white hover:bg-[#D64545]'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
        <h1 className="text-3xl font-bold text-[#F05454] mb-8">Checkout</h1>
        
        {/* Progress Indicator */}
        <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#F05454] text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <span className={`mt-2 text-sm ${currentStep >= 1 ? 'text-[#F05454] font-medium' : 'text-gray-500'}`}>Shipping</span>
          </div>
          <div className="flex-grow h-1 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#F05454] text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <span className={`mt-2 text-sm ${currentStep >= 2 ? 'text-[#F05454] font-medium' : 'text-gray-500'}`}>Payment</span>
          </div>
          <div className="flex-grow h-1 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-[#F05454] text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
            <span className={`mt-2 text-sm ${currentStep >= 3 ? 'text-[#F05454] font-medium' : 'text-gray-500'}`}>Review</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#F05454] mb-4">Order Summary</h2>
                
                <div className="divide-y divide-gray-200">
                  {products.map((product) => {
                    const quantity = cart[product.id] || 0;
                    if (quantity === 0) return null;
                    
                    return (
                      <div key={product.id} className="py-4 flex items-center">
                        <div className="flex-shrink-0 mr-4">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.jpg';
                                }}
                              />
                            ) : (
                              <span className="text-gray-500">Image</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold text-[#F05454]">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.category}</p>
                          <p className="text-sm text-gray-600">Qty: {quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#F05454] font-bold">${(Number(product.price) * quantity).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">${Number(product.price).toFixed(2)} × {quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">$0.00</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">${(getTotalPrice() * 0.08).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold text-[#F05454] pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>${(getTotalPrice() * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step Content - Right Column */}
          <div className="lg:col-span-1">
            {renderStepContent()}
          </div>
        </div>
        
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