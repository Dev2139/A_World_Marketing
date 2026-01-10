'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  commissionPercentage: number;
  image: string;
  category: string;
  allImages?: string[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    commissionPercentage: '',
    category: '',
    images: ['']
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const mappedProduct = {
            ...data,
            stockQuantity: data.stockQuantity || data.stock
          };
          
          setProduct(mappedProduct);
          
          // Set form data with product values
          setFormData({
            name: mappedProduct.name || '',
            description: mappedProduct.description || '',
            price: mappedProduct.price ? mappedProduct.price.toString() : '',
            stockQuantity: mappedProduct.stockQuantity ? mappedProduct.stockQuantity.toString() : '',
            commissionPercentage: mappedProduct.commissionPercentage ? mappedProduct.commissionPercentage.toString() : '',
            category: mappedProduct.category || '',
            images: mappedProduct.allImages && mappedProduct.allImages.length > 0 
              ? [...mappedProduct.allImages] 
              : [mappedProduct.image || '']
          });
        } else if (response.status === 401 || response.status === 403) {
          // Unauthorized - redirect to login
          router.push('/login');
        } else if (response.status === 404) {
          // Product not found - redirect to products list with error
          const errorText = await response.text();
          console.error('Product not found:', errorText);
          alert(`Product not found. It may have been deleted. Error: ${errorText}`);
          router.push('/admin/products');
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch product:', errorText);
          alert(`Failed to fetch product: ${errorText}`);
          router.push('/admin/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredImages = formData.images.filter(img => img.trim() !== '');
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity),
          commissionPercentage: parseFloat(formData.commissionPercentage),
          image: filteredImages[0] || '',
          category: formData.category,
          images: filteredImages
        }),
      });

      if (response.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        const errorText = await response.text();
        console.error('Error updating product:', errorText);
        alert(`Error updating product: ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error updating product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-main flex items-center justify-center">
        <div className="text-lg text-dark-text">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-main flex items-center justify-center">
        <div className="text-lg text-dark-text">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-main">
      <main className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gold-text">Edit Product</h2>
          </div>

          <div className="bg-dark-card shadow-md rounded-lg p-6 border border-dark-700">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-dark-text">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-dark-input text-dark-text bg-dark-card rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-text focus:border-gold-text sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-dark-text">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full border border-dark-input text-dark-text bg-dark-card rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-text focus:border-gold-text sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="stockQuantity" className="block text-sm font-medium text-dark-text">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    id="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="mt-1 block w-full border border-dark-input text-dark-text bg-dark-card rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-text focus:border-gold-text sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="commissionPercentage" className="block text-sm font-medium text-dark-text">
                    Commission %
                  </label>
                  <input
                    type="number"
                    name="commissionPercentage"
                    id="commissionPercentage"
                    value={formData.commissionPercentage}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    max="100"
                    className="mt-1 block w-full border border-dark-input text-dark-text bg-dark-card rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-text focus:border-gold-text sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-dark-text">
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-dark-input text-dark-text bg-dark-card rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-text focus:border-gold-text sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {predefinedCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Product Images
                  </label>
                  
                  <div className="space-y-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder={`Image URL ${index + 1}`}
                          className="flex-grow border border-dark-input text-dark-text bg-dark-card rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-text focus:border-gold-text text-sm"
                        />
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="ml-2 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addImageField}
                      className="mt-2 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add Another Image
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-dark-text">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-dark-input text-dark-text bg-dark-card rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold-text focus:border-gold-text sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin/products')}
                  className="px-6 py-2 text-sm font-medium text-dark-text bg-dark-input rounded-md hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 text-sm font-medium text-dark-main bg-gold-text rounded-md hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-text ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}