'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  const predefinedCategories = [
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
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    commissionPercentage: '',
    image: '',
    category: ''
  });

  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadData, setImageUploadData] = useState({
    productId: '',
    images: ['']
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'ADMIN') {
            router.push('/login');
            return;
          }
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchProducts();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Redirect to the add product page
    window.location.href = '/admin/products/add';
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setProducts(products.map(product => 
          product.id === productId 
            ? { ...product, isActive: !currentStatus } 
            : product
        ));
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete the product "${productName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove the product from the state
        setProducts(products.filter(product => product.id !== productId));
        alert('Product deleted successfully');
      } else {
        const errorText = await response.text();
        console.error('Error deleting product:', errorText);
        alert(`Error deleting product: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleImageUpload = async () => {
    if (!imageUploadData.productId || imageUploadData.images.length === 0) {
      alert('Please select a product and add at least one image URL');
      return;
    }
    
    // Filter out empty image URLs
    const filteredImages = imageUploadData.images.filter(img => img.trim() !== '');
    
    try {
      const response = await fetch(`/api/admin/products/${imageUploadData.productId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: imageUploadData.productId,
          images: filteredImages
        }),
      });

      if (response.ok) {
        alert('Multiple images uploaded successfully!');
        // Refresh products list
        const updatedResponse = await fetch('/api/admin/products', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setProducts(data);
        }
        
        // Reset form
        setShowImageUpload(false);
        setImageUploadData({productId: '', images: ['']});
      } else {
        console.error('Error uploading images');
        alert('Error uploading images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="text-lg text-white font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      
      <main className="py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400">Products Management</h2>
            <div className="space-x-2">
              <a href="/admin/products/add"
                className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 shadow-lg shadow-pink-500/30 transition-all duration-300 transform hover:scale-105"
              >
                Add Product
              </a>
            </div>
          </div>

          {showImageUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="relative top-20 mx-auto p-5 border border-purple-500/50 w-96 shadow-2xl rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-purple-200 mb-4">Add Multiple Images to Product</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleImageUpload();
                  }}>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-purple-300 mb-2">Select Product</label>
                      <select
                        value={imageUploadData.productId}
                        onChange={(e) => setImageUploadData({...imageUploadData, productId: e.target.value})}
                        required
                        className="mt-1 block w-full border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-purple-300 mb-2">Image URLs</label>
                      {imageUploadData.images.map((img, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={img}
                            onChange={(e) => {
                              const newImages = [...imageUploadData.images];
                              newImages[index] = e.target.value;
                              setImageUploadData({...imageUploadData, images: newImages});
                            }}
                            placeholder={`Image URL ${index + 1}`}
                            className="flex-grow border-2 border-purple-500/50 bg-gray-700 text-white rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30"
                          />
                          {imageUploadData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = imageUploadData.images.filter((_, i) => i !== index);
                                setImageUploadData({...imageUploadData, images: newImages});
                              }}
                              className="ml-2 px-3 py-2 text-sm bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setImageUploadData({...imageUploadData, images: [...imageUploadData.images, '']})}
                        className="mt-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
                      >
                        Add More Images
                      </button>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowImageUpload(false);
                          setImageUploadData({productId: '', images: ['']});
                        }}
                        className="px-4 py-2 text-sm font-bold text-purple-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 mr-2 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-300"
                      >
                        Upload Images
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl overflow-hidden sm:rounded-2xl border border-purple-500/30 glowing transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <ul className="divide-y divide-purple-500/30">
              {products.map((product) => (
                <li key={product.id} className="transition-all duration-300 hover:bg-gray-700/30">
                  <div className="px-6 py-6 sm:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-bold text-white truncate">
                          {product.name}
                        </p>
                        <div className="ml-4 inline-flex items-center">
                          {product.isActive ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-purple-300">
                        <p>${product.price} • Stock: {product.stockQuantity} • Comm: {product.commissionPercentage}%</p>
                        <p>Category: {product.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-purple-300">
                          {product.description}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center text-sm sm:mt-0">
                        <button
                          onClick={() => toggleProductStatus(product.id, product.isActive)}
                          className={`ml-4 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${
                            product.isActive 
                              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20 hover:from-red-700 hover:to-pink-700' 
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20 hover:from-green-700 hover:to-emerald-700'
                          }`}
                        >
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <a
                          href={`/admin/products/edit/${product.id}`}
                          className="ml-3 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-pink-500/20"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => deleteProduct(product.id, product.name)}
                          className="ml-3 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-full hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}