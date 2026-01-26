import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, Tag, Calendar, Plus, AlertCircle } from 'lucide-react';
import { itemsService } from '../services/items';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, ITEM_TYPES } from '../utils/constants';
import { validateImage } from '../utils/validators';

const SubmitItem = () => {
  const [itemType, setItemType] = useState(ITEM_TYPES.LOST);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    time: '',
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = [];
    const newErrors = {};

    files.forEach(file => {
      const validation = validateImage(file);
      if (validation.isValid) {
        validImages.push(file);
      } else {
        newErrors.images = validation.error;
      }
    });

    setImages(prev => [...prev, ...validImages].slice(0, 5));
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const uploadedImages = [];
      for (const image of images) {
        const response = await itemsService.uploadImage(image);
        uploadedImages.push(response.url);
      }

      const itemData = {
        ...formData,
        type: itemType,
        images: uploadedImages,
      };

      const submitFunction = itemType === ITEM_TYPES.LOST 
        ? itemsService.submitLostItem 
        : itemsService.submitFoundItem;
      
      const response = await submitFunction(itemData);
      
      navigate('/my-requests');
    } catch (error) {
      setErrors({ general: error.message || 'Failed to submit item' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Submit Item</h1>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        {/* Item Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What would you like to report?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setItemType(ITEM_TYPES.LOST)}
              className={`p-4 border-2 rounded-lg font-medium transition-colors ${
                itemType === ITEM_TYPES.LOST
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-red-300'
              }`}
            >
              Lost Item
            </button>
            <button
              type="button"
              onClick={() => setItemType(ITEM_TYPES.FOUND)}
              className={`p-4 border-2 rounded-lg font-medium transition-colors ${
                itemType === ITEM_TYPES.FOUND
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-green-300'
              }`}
            >
              Found Item
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Black Leather Wallet"
            className={`input-field ${errors.title ? 'border-red-500' : ''}`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Provide detailed description including brand, color, distinctive features..."
            className={`input-field ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Category and Location */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`input-field ${errors.category ? 'border-red-500' : ''}`}
            >
              <option value="">Select category</option>
              {ITEM_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`input-field ${errors.location ? 'border-red-500' : ''}`}
            >
              <option value="">Select location</option>
              {CAMPUS_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`input-field ${errors.date ? 'border-red-500' : ''}`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approximate Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (Max 5)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-1">Click to upload images</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 5MB each</p>
            </label>
          </div>
          {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">
                AI-Powered Matching
              </p>
              <p className="text-sm text-blue-700">
                Our AI will automatically search for similar items and notify you of potential matches.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-lg"
          >
            <Plus size={20} />
            <span>{loading ? 'Submitting...' : 'Submit Item'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary px-8"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitItem;