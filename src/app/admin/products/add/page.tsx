'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    commissionPercentage: '',
    category: '',
    images: ['']
  });
  const [loading, setLoading] = useState(false);

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
      // First, create the product
      const productResponse = await fetch('/api/admin/products', {
        method: 'POST',
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
          category: formData.category,
          // Use the first image as the main product image
          image: formData.images[0] || ''
        }),
      });

      if (productResponse.ok) {
        const newProduct = await productResponse.json();
        console.log('Product created successfully:', newProduct);

        // Upload all images to the productImages table
        const filteredImages = formData.images.filter(img => img.trim() !== '');
        
        if (filteredImages.length > 0) {
          const imageResponse = await fetch(`/api/admin/products/${newProduct.id}/images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              productId: newProduct.id,
              images: filteredImages
            }),
          });

          if (!imageResponse.ok) {
            console.error('Error uploading images:', await imageResponse.text());
          }
        }

        // Redirect to products page after successful creation
        router.push('/admin/products');
        router.refresh();
      } else {
        const errorText = await productResponse.text();
        console.error('Error creating product:', errorText);
        alert(`Error creating product: ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-main">
      <main className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gold-text">Add New Product</h2>
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
                  {loading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}