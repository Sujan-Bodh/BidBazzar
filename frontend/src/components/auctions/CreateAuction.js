import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Collectibles',
  'Art',
  'Automotive',
  'Books',
  'Jewelry',
  'Other',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const CreateAuction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    condition: 'Good',
    startingBid: '',
    minimumIncrement: '1',
    reservePrice: '',
    buyNowPrice: '',
    endTime: '',
    shippingCost: '0',
    location: {
      city: '',
      state: '',
      country: '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (parseFloat(formData.startingBid) <= 0) {
      toast.error('Starting bid must be greater than 0');
      return;
    }

    const endTime = new Date(formData.endTime);
    if (endTime <= new Date()) {
      toast.error('End time must be in the future');
      return;
    }

    if (formData.buyNowPrice && parseFloat(formData.buyNowPrice) <= parseFloat(formData.startingBid)) {
      toast.error('Buy now price must be greater than starting bid');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('startingBid', formData.startingBid);
      data.append('minimumIncrement', formData.minimumIncrement);
      if (formData.reservePrice) {
        data.append('reservePrice', formData.reservePrice);
      }
      data.append('endTime', formData.endTime);
      data.append('shippingCost', formData.shippingCost);
      data.append('location', JSON.stringify(formData.location));

      if (formData.buyNowPrice) {
        data.append('buyNowPrice', formData.buyNowPrice);
      }

      images.forEach((image) => {
        data.append('images', image);
      });

      const response = await auctionAPI.createAuction(data);
      toast.success('Auction created successfully!');
      navigate(`/auction/${response.data._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create auction';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum end time (at least 1 hour from now)
  const getMinEndTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Auction</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                maxLength="100"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter a descriptive title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows="6"
                maxLength="2000"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                placeholder="Describe your item in detail"
              ></textarea>
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="input-field"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Bid (₹) *
                </label>
                <input
                  type="number"
                  name="startingBid"
                  required
                  step="0.01"
                  min="0.01"
                  value={formData.startingBid}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Increment (₹) *
                </label>
                <input
                  type="number"
                  name="minimumIncrement"
                  required
                  step="0.01"
                  min="0.01"
                  value={formData.minimumIncrement}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="1.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reserve Price (₹)
                </label>
                <input
                  type="number"
                  name="reservePrice"
                  step="0.01"
                  min="0"
                  value={formData.reservePrice}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buy Now Price (₹)
                </label>
                <input
                  type="number"
                  name="buyNowPrice"
                  step="0.01"
                  min="0.01"
                  value={formData.buyNowPrice}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* End Time and Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auction End Time *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  required
                  min={getMinEndTime()}
                  value={formData.endTime}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  name="shippingCost"
                  step="0.01"
                  min="0"
                  value={formData.shippingCost}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="City"
                />
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="State"
                />
                <input
                  type="text"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Country"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Max 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="input-field"
              />

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Creating...' : 'Create Auction'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;
