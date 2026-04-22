import React, { useCallback, useRef, useState } from 'react';

import { Listing } from '../types/Listing';

interface AddListingFormProps {
  onSubmit: (listing: Omit<Listing, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const furnitureTypeSet = [
  'Bed',
  'Chair',
  'Couch',
  'Desk',
  'Lamp',
  'Sofa',
  'Table',
  'Other',
];

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

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFieldInvalid = (field: string) => {
    if (!submitAttempted && !touched[field]) return false;
    switch (field) {
      case 'title':
        return !formData.title.trim();
      case 'description':
        return !formData.description.trim();
      case 'furnitureType':
        return !formData.furnitureType.trim();
      case 'location':
        return !formData.location.trim();
      case 'sellerContact':
        return !formData.sellerContact.trim();
      default:
        return false;
    }
  };

  const errorBorder = (field: string) =>
    isFieldInvalid(field) ? '1.5px solid #dc2626' : undefined;

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (name === 'price') {
      const numValue = Number(value);
      if (value === '') {
        setFormData((prev) => ({ ...prev, [name]: 0 }));
        setPriceError(null);
        return;
      }
      if (isNaN(numValue)) {
        setPriceError('Price must be a valid number');
        return;
      }
      if (numValue < 0 || numValue > 9999) {
        setPriceError('Price must be between $0 and $9999');
        return;
      }
      const decimalPlaces = value.split('.')[1]?.length || 0;
      if (decimalPlaces > 2) {
        setPriceError('Price can have at most 2 decimal places');
        return;
      }
      setPriceError(null);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePriceFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (formData.price === 0) e.currentTarget.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const hasEmptyFields =
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.furnitureType.trim() ||
      !formData.location.trim() ||
      !formData.sellerContact.trim();

    if (hasEmptyFields || priceError || formData.price < 0 || formData.price > 9999) {
      return;
    }

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
          <form onSubmit={handleSubmit} noValidate>
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
                onBlur={() => handleBlur('title')}
                className="form-input"
                placeholder="e.g., Office Chair with Lumbar Support"
                style={{ border: errorBorder('title') }}
              />
              {isFieldInvalid('title') && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Title is required
                </p>
              )}
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
                onBlur={() => handleBlur('description')}
                rows={3}
                className="form-textarea"
                placeholder="Describe the furniture item in detail..."
                style={{ border: errorBorder('description') }}
              />
              {isFieldInvalid('description') && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Description is required
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="image-upload" className="form-label">
                Image{' '}
                <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
              </label>
              {imagePreview ? (
                <div
                  style={{ position: 'relative', display: 'inline-block', width: '100%' }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      lineHeight: '28px',
                      textAlign: 'center',
                    }}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                  }}
                  style={{
                    border: `2px dashed ${isDragging ? '#6366f1' : '#d1d5db'}`,
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? '#eef2ff' : '#f9fafb',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    fill="none"
                    stroke={isDragging ? '#6366f1' : '#9ca3af'}
                    viewBox="0 0 24 24"
                    style={{ margin: '0 auto 0.5rem' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p
                    style={{
                      margin: 0,
                      color: isDragging ? '#6366f1' : '#6b7280',
                      fontWeight: 500,
                    }}
                  >
                    {isDragging
                      ? 'Drop your image here'
                      : 'Drag & drop or click to upload'}
                  </p>
                  <p
                    style={{
                      margin: '0.25rem 0 0',
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                    }}
                  >
                    PNG, JPG, GIF, WEBP
                  </p>
                </div>
              )}
              <input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
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
                  onFocus={handlePriceFocus}
                  className="form-input"
                  min="0"
                  max="9999"
                  step="1"
                  placeholder="0.00"
                />
                {priceError && (
                  <p
                    style={{
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {priceError}
                  </p>
                )}
                <p
                  style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}
                >
                  $0 – $9999
                </p>
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
                <select
                  id="furnitureType"
                  name="furnitureType"
                  value={formData.furnitureType}
                  onChange={handleChange}
                  onBlur={() => handleBlur('furnitureType')}
                  className="form-input"
                  style={{ border: errorBorder('furnitureType') }}
                >
                  <option value="">Select Furniture Type</option>
                  {furnitureTypeSet.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {isFieldInvalid('furnitureType') && (
                  <p
                    style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}
                  >
                    Furniture type is required
                  </p>
                )}
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
                  onBlur={() => handleBlur('location')}
                  className="form-input"
                  placeholder="e.g., Downtown, Campus"
                  style={{ border: errorBorder('location') }}
                />
                {isFieldInvalid('location') && (
                  <p
                    style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}
                  >
                    Location is required
                  </p>
                )}
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
                onBlur={() => handleBlur('sellerContact')}
                className="form-input"
                placeholder="your.email@u.northwestern.edu"
                style={{ border: errorBorder('sellerContact') }}
              />
              {isFieldInvalid('sellerContact') && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Contact email is required
                </p>
              )}
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
