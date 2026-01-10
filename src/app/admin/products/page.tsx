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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
            <div className="space-x-2">
              <a href="/admin/products/add"
                className="px-4 py-2 text-sm font-medium text-white bg-[#F05454] rounded-md hover:bg-[#D64545] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F05454]"
              >
                Add Product
              </a>
            </div>
          </div>

          {showImageUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="relative top-20 mx-auto p-5 border border-gray-300 w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add Multiple Images to Product</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleImageUpload();
                  }}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Select Product</label>
                      <select
                        value={imageUploadData.productId}
                        onChange={(e) => setImageUploadData({...imageUploadData, productId: e.target.value})}
                        required
                        className="mt-1 block w-full border border-gray-300 text-gray-900 bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] sm:text-sm"
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs</label>
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
                            className="flex-grow border border-gray-300 text-gray-900 bg-white rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-[#F05454] focus:border-[#F05454] text-sm"
                          />
                          {imageUploadData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = imageUploadData.images.filter((_, i) => i !== index);
                                setImageUploadData({...imageUploadData, images: newImages});
                              }}
                              className="ml-2 px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setImageUploadData({...imageUploadData, images: [...imageUploadData.images, '']})}
                        className="mt-2 px-3 py-1 text-sm bg-[#F05454] text-white rounded hover:bg-[#D64545]"
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
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F05454] mr-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-[#F05454] rounded-md hover:bg-[#D64545] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F05454]"
                      >
                        Upload Images
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li key={product.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <div className="ml-2 inline-flex items-center">
                          {product.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>${product.price} • Stock: {product.stockQuantity} • Comm: {product.commissionPercentage}%</p>
                        <p>Category: {product.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {product.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <button
                          onClick={() => toggleProductStatus(product.id, product.isActive)}
                          className={`ml-4 px-3 py-1 text-xs font-medium rounded-full ${
                            product.isActive 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <a
                          href={`/admin/products/edit/${product.id}`}
                          className="ml-2 px-3 py-1 text-xs font-medium text-white bg-[#F05454] rounded-full hover:bg-[#D64545]"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => deleteProduct(product.id, product.name)}
                          className="ml-2 px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full hover:bg-red-600"
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