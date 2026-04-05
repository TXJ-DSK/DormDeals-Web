import React, { useState } from 'react';

import { Listing } from '../types/Listing';

interface AddListingFormProps {
  onSubmit: (listing: Omit<Listing, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const AddListingForm: React.FC<AddListingFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    price: 0,
    furnitureType: '',
    condition: 'Good' as const,
    location: '',
    deliveryMethod: 'Both' as const,
    sellerContact: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as Omit<Listing, 'id' | 'userId' | 'createdAt'>);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add New Listing</h2>
          <button onClick={onCancel} className="modal-close">
            <svg
              style={{ width: '1.5rem', height: '1.5rem' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Office Chair with Lumbar Support"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="form-textarea"
                placeholder="Describe the furniture item in detail..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">
                Image URL
              </label>
              <input
                id="image"
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="condition" className="form-label">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="furnitureType" className="form-label">
                  Furniture Type
                </label>
                <input
                  id="furnitureType"
                  type="text"
                  name="furnitureType"
                  value={formData.furnitureType}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Chair, Desk, Bookshelf"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Downtown, Campus"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deliveryMethod" className="form-label">
                Delivery Method
              </label>
              <select
                id="deliveryMethod"
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Pickup">Pickup Only</option>
                <option value="Delivery">Delivery Only</option>
                <option value="Both">Pickup or Delivery</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sellerContact" className="form-label">
                Your Contact Email
              </label>
              <input
                id="sellerContact"
                type="email"
                name="sellerContact"
                value={formData.sellerContact}
                onChange={handleChange}
                className="form-input"
                placeholder="your.email@u.northwestern.edu"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListingForm;
